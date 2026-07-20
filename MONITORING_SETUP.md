# Monitoring Setup Guide

Covers the Module 7 monitoring stack: error tracking (Sentry), health checks,
structured logging, and uptime monitoring. Everything on the code side is
already deployed — this guide is the remaining **account-side** setup: creating
the Sentry projects, the uptime monitor, and wiring their env vars into
Render/Vercel.

## 1. What's already built (code side)

| Piece | Where | Notes |
|---|---|---|
| Public health check | `GET /api/health` | Backend repo, `src/app.controller.ts`. Unauthenticated, DB failure → 503, storage failure → 200 `"degraded"`. This is what the uptime monitor polls. |
| Admin health check | `GET /api/admin/system-health` | Backend repo, `src/dashboard/dashboard.controller.ts`. Same checks, ADMIN-gated, always 200. Backs the dashboard tile. |
| Backend error tracking | `src/instrument.ts` | `@sentry/nestjs`. No-ops until `SENTRY_DSN` is set. |
| Backend structured logs | `src/common/config/logger.config.ts` | `nestjs-pino`. JSON to stdout, `x-request-id` correlation, sensitive fields redacted. Always on, no env var needed. |
| Frontend error tracking | `src/instrument.js` | `@sentry/react`. No-ops until `VITE_SENTRY_DSN` is set. |
| Frontend source maps | `vite.config.js` | `@sentry/vite-plugin`. No-ops until `SENTRY_AUTH_TOKEN` is set in the build env. |
| Dashboard tile | `src/pages/admin/SystemHealthTile.jsx` | Polls `/admin/system-health` every 60s. |

Until the env vars below are set, the app runs exactly as it did before Module
7 — health checks and structured logs work immediately with zero
configuration, but Sentry captures nothing and there's no uptime alerting.

## 2. Create the Sentry projects

1. Create (or use an existing) Sentry organization.
2. Create **two** projects: one platform "Node.js/NestJS" (backend), one
   platform "React" (frontend). Two projects keep backend and frontend
   issues from mixing in one stream.
3. Note each project's DSN (Settings → Client Keys).
4. For source map uploads, create an **auth token** (Settings → Auth Tokens)
   with `project:releases` and `project:write` scopes, scoped to the
   frontend project's org.

## 3. Backend env vars (Render)

Set these on the Render service (Dashboard → Environment):

| Var | Value | Required? |
|---|---|---|
| `SENTRY_DSN` | The backend project's DSN | Yes, to enable error tracking |
| `NODE_ENV` | `production` | Should already be set |

`RELEASE_SHA` is not needed manually — Render automatically sets
`RENDER_GIT_COMMIT`, which `getRelease()` (`src/common/utils/release.util.ts`)
already falls back to. Redeploy after setting `SENTRY_DSN` for it to take
effect (it's read once at process start in `instrument.ts`).

## 4. Frontend env vars (Vercel)

Set these on the Vercel project (Settings → Environment Variables, Production
+ Preview):

| Var | Value | Required? |
|---|---|---|
| `VITE_SENTRY_DSN` | The frontend project's DSN | Yes, to enable error tracking |
| `SENTRY_ORG` | Your Sentry org slug | Yes, to enable source map upload |
| `SENTRY_PROJECT` | The frontend project's slug | Yes, to enable source map upload |
| `SENTRY_AUTH_TOKEN` | The auth token from step 2.4 | Yes, to enable source map upload |
| `VITE_SENTRY_DASHBOARD_URL` | Direct link to the frontend project's Sentry dashboard | Optional — improves the AdminDashboard tile's link |
| `VITE_UPTIME_DASHBOARD_URL` | Direct link to your uptime monitor dashboard | Optional — same |

`VITE_RELEASE_SHA` is not needed manually — `vite.config.js` reads Vercel's
own `VERCEL_GIT_COMMIT_SHA` at build time and injects it. Redeploy (a new
build) after setting these for them to take effect.

Note `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` are **build-time**
(read in `vite.config.js`, a Node context), while `VITE_SENTRY_DSN` is
**client-time** (bundled into the shipped JS, as with any `VITE_`-prefixed
var) — both need to be present at build time either way, since Vite bakes
`VITE_*` vars into the build.

## 5. Set up the uptime monitor

Any managed service works (UptimeRobot is the reference choice — free tier
is sufficient). Steps for UptimeRobot:

1. Create a monitor: type **HTTP(s)**, URL `https://<your-render-service>.onrender.com/api/health`.
2. Interval: **5 minutes**.
3. Alert contact: your team's email.
4. Under "Advanced" — do **not** enable keyword matching on `"status":"ok"`
   only; `/api/health` returns HTTP 200 for both `"ok"` and `"degraded"` (by
   design — storage issues shouldn't page anyone at 3am) and HTTP **503**
   only for a real DB outage. Alert on the HTTP status code, not response
   body content, so this matches that contract.
5. Save, then use "Test alert contacts" to confirm the email actually
   arrives before relying on it.

## 6. Configure Sentry alert rules

By default Sentry emails project members on new issues, but it's worth
confirming:

1. Each project → Alerts → create/verify an alert rule: "A new issue is
   created" → notify via email.
2. Optional: add a rate-based rule (e.g. "an issue is seen more than 10
   times in 1 hour") to catch a spike distinct from a single new error.

## 7. Verify everything end-to-end

1. **Health check**: `curl https://<backend>/api/health` → expect 200 and a
   JSON body with `status`, `checks`, `release`, `environment`.
2. **Backend Sentry**: temporarily throw in a low-traffic endpoint (or use
   Sentry's own "Send test event" from the project setup page), confirm the
   event appears in the Sentry project with the correct `release` tag.
3. **Frontend Sentry**: open the deployed site's devtools console and run
   `Sentry.captureException(new Error('test'))` (window global if
   `@sentry/react` initialized), confirm it appears with a **readable stack
   trace** (proves source maps uploaded correctly, not just that Sentry
   received the event).
4. **Correlation IDs**: trigger a failing request from the UI, note the
   `correlationId` tag on the resulting Sentry event, grep Render's logs for
   that same ID as `req.id` — should find the matching backend log line.
5. **Uptime alert**: use UptimeRobot's "Test alert contacts" (step 5.5) — do
   not actually take the backend down to test this in production.
6. **Dashboard tile**: log in as an admin, confirm the System Health tile on
   the Overview tab shows live data.

## 8. Ongoing cost/complexity notes

- Sentry, UptimeRobot: both have free tiers sufficient for this stage. No new
  infrastructure to operate — this was a deliberate constraint for Module 7
  (see the Release Plan's monitoring recommendation).
- No self-hosted log aggregation was added. Render's own log viewer
  (`render.com` dashboard → service → Logs) is the primary place to read the
  structured JSON logs `nestjs-pino` emits; `grep`/`jq` work fine on
  Render's log stream for now given current traffic volume. Revisit if/when
  volume makes that impractical.
