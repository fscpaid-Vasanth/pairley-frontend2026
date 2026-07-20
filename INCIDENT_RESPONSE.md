# Incident Response Guide

What to do when a monitoring alert fires. For step-by-step recovery
procedures for specific outage types, see [RUNBOOK.md](./RUNBOOK.md); this
document is about triage — figuring out what's actually wrong and how
urgently to act, before you get into fixing it.

## Alert sources and what they mean

| Alert | Source | What it means |
|---|---|---|
| Uptime monitor "down" | UptimeRobot email | `/api/health` returned non-200 (or timed out) on at least one check — almost always a database outage (see `checks.database` in the health payload the monitor logged), since that's the only thing that makes the endpoint fail its HTTP status rather than just report "degraded". |
| Sentry new issue | Sentry email | An unhandled exception occurred in production (backend or frontend, depending which project). Volume matters more than any single occurrence — one instance of a rare edge case is very different from a spike. |
| Sentry issue spike | Sentry email (if the rate rule from MONITORING_SETUP.md §6 is configured) | The same error is recurring rapidly — usually means something structural broke (a bad deploy, an upstream dependency outage), not a one-off user edge case. |

## Severity levels

- **SEV1 — Site down / data at risk.** The backend is unreachable, the
  database is down, or you suspect data loss/corruption. Act immediately.
- **SEV2 — Degraded but functional.** Storage (S3) is unreachable so uploads
  fail but the core marketplace flow (browse/search/save/lead) still works;
  a Sentry spike affecting one feature, not the whole app.
- **SEV3 — Isolated/low-impact.** A single Sentry issue with low occurrence
  count, no user-visible pattern yet. Investigate during normal working
  hours, not urgently.

## Triage steps (do this first, every time)

1. **Check `/api/health` directly**: `curl https://<backend>/api/health`.
   The `status`/`checks` fields tell you immediately whether this is a
   database problem (`status: "down"`), a storage problem
   (`status: "degraded"`), or something not captured by health checks at
   all (backend responds 200/healthy but users still report errors — check
   Sentry instead).
2. **Check the admin System Health tile** (`/admin`, Overview tab) for the
   same information plus the currently-deployed release SHA — useful to
   confirm whether a recent deploy correlates with the incident.
3. **Check Render's dashboard** (service status, recent deploy events, CPU/
   memory graphs) and **Vercel's dashboard** (recent deployments, build
   status) for anything obviously wrong independent of the app itself.
4. **Check Sentry** for the specific error(s), noting: how many users
   affected (not just event count — check unique user/session count),
   whether it started at a specific time (correlates with a deploy?), and
   the `correlationId` tag if present (cross-reference against Render's
   logs for the exact failing request).
5. **Classify severity** using the table above, then go to
   [RUNBOOK.md](./RUNBOOK.md) for the matching scenario if it's
   infrastructure-shaped (DB/S3/Render/Vercel/Sentry-itself/WhatsApp), or
   [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if it's an application-level
   symptom (specific endpoint failing, slow responses, auth issues, etc.).

## During the incident

- Prefer a fix that restores service first, root-causes second. A rollback
  (Vercel) or redeploy of the last-known-good commit (Render) is usually
  faster and safer than debugging live in production.
- Structured logs are in Render's log viewer, filterable by the
  `correlationId`/`req.id` from a Sentry event to find the exact failing
  request's full context (method, URL, status, response time — headers/
  bodies are deliberately not logged, see MONITORING_SETUP.md).
- Don't disable alerting to "reduce noise" during an active incident —
  that's exactly when you need it confirming whether your fix worked.

## After the incident

1. Confirm resolution: `/api/health` back to `"ok"`, Sentry issue rate back
   to baseline, uptime monitor back to "up".
2. Write a short note (even a few sentences) covering: what broke, when,
   why, what fixed it, and whether it's a one-off or needs a follow-up fix
   to prevent recurrence. This project doesn't have a formal postmortem
   process yet — a paragraph in the relevant CHANGELOG.md entry or a commit
   message is enough at this stage; don't let this step become the
   bottleneck to actually closing out the incident.
3. If the fix was a rollback/redeploy rather than a real fix, track the
   underlying bug as a follow-up — don't let "we rolled back" quietly
   become "it's fixed."
