# Production Troubleshooting Guide

Common production symptoms and how to diagnose them using the Module 7
monitoring stack. For infrastructure outages (DB/S3/Render/Vercel down
entirely), see [RUNBOOK.md](./RUNBOOK.md). For the overall triage process,
see [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md).

## Reading `/api/health`

```json
{
  "status": "ok" | "degraded" | "down",
  "checks": { "database": "ok" | "down", "storage": "ok" | "unreachable" },
  "release": "<git sha or 'unknown'>",
  "environment": "production" | "development",
  "serverTime": "<ISO timestamp>",
  "processUptimeSeconds": 1234
}
```

- `status: "down"` (HTTP 503) — database is unreachable. See RUNBOOK §
  Database Outage.
- `status: "degraded"` (HTTP 200) — database is fine, S3/storage isn't. See
  RUNBOOK § S3 Outage. The core marketplace (browse, search, leads) is
  unaffected; only image uploads/downloads are.
- `release: "unknown"` — `RENDER_GIT_COMMIT` isn't set in the environment.
  Shouldn't happen on Render (it's automatic), but would mean release
  tagging in Sentry is also broken — check the Render service's environment
  tab.
- `processUptimeSeconds` unexpectedly low — the process restarted recently.
  Check Render's deploy history for an unplanned restart (crash) vs. an
  intentional deploy.

## "Users report errors but `/api/health` says everything's fine"

Health checks only cover DB and S3 connectivity — they can't see
application-level bugs (a bad code path, a third-party API misbehaving,
a bug only triggered by specific input). Go straight to Sentry:

1. Filter by time range matching when reports started.
2. Look for the error's `correlationId` tag (set by both `api.js` on the
   frontend and echoed by the backend's `x-request-id`) to find the exact
   request in Render's logs.
3. If nothing's in Sentry: the error may be happening client-side before
   Sentry's SDK initializes (very early boot error), or `VITE_SENTRY_DSN`
   isn't set in the deployed build — check the deployed bundle's network
   tab for a request to `*.sentry.io` on page load.

## A specific endpoint is slow or timing out

- Structured logs include `responseTime` (ms) per request — filter Render's
  log stream by the endpoint path to see if it's consistently slow or an
  intermittent spike.
- Consistently slow: likely a missing index or an N+1 query pattern in that
  endpoint's Prisma calls. Consistently slow *only* on endpoints touching
  `OfferInterest`/`Offer` joins is a known area to check first (see
  `app.controller.ts`'s `getPublicStats()` for an example of a query doing
  a `findMany` + in-memory aggregation that doesn't scale — same pattern
  may exist elsewhere).
- Intermittent spike: check Neon's dashboard for compute/connection-pool
  exhaustion (this happened once before, during Module 3 verification —
  see ROADMAP.md's Module 3 note) — usually a plan/quota issue, not a code
  regression.

## Auth failures (401s) that shouldn't be happening

- Confirm it's not a client-side stale-token issue first: check whether the
  user's `pairley_token` in localStorage is actually present/valid — most
  "random 401" reports are an expired JWT the frontend didn't refresh, not
  a backend problem.
- If it's affecting many users simultaneously: check `JWT_SECRET` wasn't
  accidentally changed/rotated on Render (would invalidate every existing
  token at once) — check the Render environment tab's recent change
  history if available, otherwise ask whoever last touched env vars.

## Frontend shows the "Something went wrong" fallback screen

This is `Sentry.ErrorBoundary`'s fallback (`src/components/ErrorFallback.jsx`)
— it only renders on an uncaught **render-time** error in the React tree
(not on API errors, which are handled locally per-page with toasts). The
corresponding Sentry event will have the full component stack. Since this
is the only thing that can trigger this screen, treat it as SEV2 at least —
it fully blocks whatever page it happened on for that user.

## Correlation ID reference

Every API request carries an `X-Request-Id` header (generated client-side
in `src/utils/api.js`'s `generateCorrelationId()`, or by the backend itself
if a request arrives without one — e.g. direct `curl`/uptime-monitor
traffic). It shows up in three places for the same request:

1. The response header `x-request-id` (visible in browser devtools' Network
   tab).
2. Render's structured logs, as `req.id`.
3. Sentry, as the `correlationId` tag, if the request resulted in a thrown
   error that got reported.

Use it to jump between "what did the user see" (Sentry) and "what actually
happened server-side" (Render logs) for the same request.

## Deployment/build issues

- **Backend won't boot after a deploy**: check Render's deploy logs for a
  Prisma migration or `nest build` failure before assuming it's a runtime
  bug — both run as part of the build step, not after boot.
- **Frontend build fails referencing `@sentry/vite-plugin`**: the plugin
  no-ops (doesn't fail the build) when `SENTRY_AUTH_TOKEN` is unset — if the
  build is actually failing on it, check the token has the right scopes
  (`project:releases`, `project:write`) rather than assuming it's optional
  in every failure mode.
- **Source maps missing in Sentry / stack traces unreadable**: confirm
  `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` are all set as
  **build-time** Vercel env vars (not just runtime) — Vite plugins run
  during `vite build`, before the app ships.
