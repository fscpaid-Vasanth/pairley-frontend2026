# Production Runbook

Step-by-step recovery procedures for specific outage scenarios. Start at
[INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) to triage and classify
severity first if you haven't already; come here once you know which
scenario you're in.

---

## Database Outage (Neon Postgres unreachable)

**How you'll know**: `/api/health` returns HTTP 503 with
`checks.database: "down"`. The uptime monitor alerts. Almost every
authenticated endpoint will also start failing since nearly all of them hit
Prisma.

**Steps**:
1. Check [Neon's status page](https://neonstatus.com) and your Neon project
   dashboard first — this has happened before during Module 3 verification
   due to free-tier compute-time quota exhaustion (resolved by upgrading to
   the Launch tier), not a code issue. Check quota/billing status before
   anything else.
2. If it's a Neon-side outage: there's nothing to fix on our end — monitor
   their status page, `/api/health` will recover automatically once they're
   back (no redeploy needed, Prisma reconnects on its own).
3. If it's a quota/billing issue: resolve in the Neon dashboard (upgrade
   plan or clear whatever's consuming compute time).
4. If Neon reports healthy but we still can't connect: check `DATABASE_URL`
   on Render hasn't changed/expired (Neon connection strings can rotate on
   certain plan changes) — compare against the current value in Neon's
   dashboard.
5. Once resolved, confirm via `curl https://<backend>/api/health` — expect
   `checks.database: "ok"` and HTTP 200.

**What's NOT affected**: nothing — this is the one hard-fail check
`/api/health` has (see `src/app.controller.ts`), because nearly everything
in the app needs the database.

---

## S3 Outage (AWS storage unreachable)

**How you'll know**: `/api/health` returns HTTP 200 with
`status: "degraded"` and `checks.storage: "unreachable"`. Image uploads
(business docs, offer photos, gallery) will fail; everything else (browse,
search, leads, auth) keeps working.

**Steps**:
1. Check the [AWS Service Health Dashboard](https://health.aws.amazon.com/health/status)
   for the configured region (`AWS_REGION` on Render, default `ap-south-1`).
2. If AWS-side: nothing to fix, wait it out — `/api/health` recovers
   automatically, no redeploy needed.
3. If AWS reports healthy but we still can't reach it: check
   `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` on Render haven't been
   flagged/rotated. This happened once before (Module 1 verification — AWS
   flagged the original keys as compromised via
   `AWSCompromisedKeyQuarantineV3`, since resolved by rotating credentials
   and disabling the old ones) — check the AWS IAM console for a similar
   flag on the current keys before assuming it's a transient network issue.
4. Confirm the bucket itself (`AWS_S3_BUCKET_NAME`) still exists and hasn't
   had its policy changed.
5. Once resolved, confirm via `/api/health` — expect `checks.storage: "ok"`.

**Fallback**: `USE_MOCK_STORAGE=true` switches to local-filesystem storage
(see `src/common/services/storage.service.ts`) — this is a **local disk**
on the Render instance, not persistent/shared storage, so it's a stopgap
for keeping the app *functionally usable* during a prolonged S3 outage, not
a real fix. Files written this way will be lost on the next deploy/restart.
Only use this as a last resort and switch back to real S3 as soon as it's
available.

---

## Render Deployment Failure (backend)

**How you'll know**: Render's dashboard shows the deploy as failed, or the
new deploy "succeeds" but `/api/health` never comes back / the service
keeps restarting.

**Steps**:
1. Check Render's deploy logs first — `npm run build` runs `prisma generate`
   then `nest build`; most failures are a TypeScript compile error or a
   Prisma schema issue, both visible directly in that log.
2. If the build succeeded but the app won't boot: check the runtime logs
   for a startup exception (missing required env var, DB connection
   refused at boot, etc.) — nestjs-pino's structured JSON logs will show
   the actual error with a stack trace.
3. If a bad deploy is confirmed and needs to be reverted fast: Render
   dashboard → the service → Deploys tab → find the last known-good deploy
   → "Redeploy". This is faster than debugging live.
4. If the failure is a Prisma migration issue specifically: check whether
   `prisma db push` (the actual schema-apply mechanism used in this
   project — see the `.sql` files under `prisma/migrations/` are
   documentation only, not auto-applied) needs to be re-run manually
   against the production database before the new code will work — this is
   a manual step for every module here, not automated in the build.
5. Confirm recovery via `/api/health`.

---

## Vercel Rollback (frontend)

**How you'll know**: a deploy went out with a bug (build succeeded, but
the shipped code is broken) — Sentry frontend issues spike right after a
deploy, or manual testing catches it first.

**Steps**:
1. Vercel dashboard → the project → Deployments tab.
2. Find the last known-good deployment (check the commit SHA against
   ROADMAP.md/CHANGELOG.md if unsure which one was actually stable).
3. Click the three-dot menu on that deployment → "Promote to Production".
   This is instant — no rebuild — and is the fastest path back to a working
   site.
4. Confirm via the live site and check Sentry for the issue rate dropping
   back to baseline.
5. Fix the actual bug separately, on its own branch/deploy, rather than
   trying to hotfix forward under pressure.

**Note**: Vercel deploys can occasionally trigger a bot-challenge
(`X-Vercel-Mitigated: challenge`) if hit with aggressive automated polling
right after a deploy — this was seen during Module 4's deployment
verification. If you're scripting a post-deploy check, use a realistic
`User-Agent` and don't poll tightly.

---

## Sentry Incident (Sentry itself is down or misbehaving)

**How you'll know**: no new Sentry events despite known errors happening
(check Render/Vercel logs directly to confirm errors are actually
occurring), or the Sentry dashboard itself is unreachable.

**Steps**:
1. Check [Sentry's status page](https://status.sentry.io).
2. If Sentry is down: this does **not** affect the application itself —
   both `instrument.ts` (backend) and `instrument.js` (frontend) only add
   error *reporting*, not error *handling*. The app continues to function
   and fail the same way it would without Sentry; you just temporarily lose
   visibility into new errors via that channel.
3. Fall back to direct log inspection during the outage: Render's log
   viewer for backend errors (structured JSON, includes stack traces via
   nestjs-pino), and ask affected users for browser console screenshots for
   frontend errors if needed.
4. Once Sentry recovers, no action needed on our side — new events resume
   automatically, nothing was lost from before the outage (events during
   the outage window are simply never captured, not queued).

---

## WhatsApp API Outage (Meta Graph API unreachable or erroring)

**How you'll know**: merchants report not receiving WhatsApp lead alerts.
Check `WhatsAppMessage` rows (`whatsapp_messages` table, Module 8) for the
affected business — `status: "FAILED"` with an `error` field containing
Meta's actual response is the fastest way to see what's actually wrong,
faster than digging through Render's logs.

**Steps**:
1. Check the [Meta for Developers status page](https://developers.facebook.com/status/)
   for the WhatsApp Cloud API / Graph API.
2. Query recent `WhatsAppMessage` rows with `status: "FAILED"` — the
   `error` field is Meta's raw error response and almost always says
   exactly what's wrong. Two error codes to recognize immediately, since
   they're **not** outages:
   - `(#132001) Template name does not exist` — the `new_lead_alert`
     template hasn't been created/approved yet in Meta Business Manager
     (a real WhatsApp Business Messaging Policy requirement, not a bug —
     business-initiated messages outside a 24h customer session window
     require a pre-approved template). Every lead alert will fail with
     this until the template is submitted and approved (3-10 day Meta
     review). Check whether this has been done before assuming an outage.
   - `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_API_TOKEN` expired — these tokens
     have a limited lifetime and need periodic renewal in Meta's dashboard.
3. If neither of those, check Render's logs for `Failed to send WhatsApp
   message` / `Failed to send template` entries
   (`src/whatsapp/whatsapp.service.ts`) for more context.
4. **Important**: WhatsApp send failures are fail-open by design —
   `sendTextMessage()`/`sendTemplateMessage()` never throw, and
   `createLead()` (`offer.service.ts`) fires the alert fire-and-forget
   with one retry, then logs and moves on regardless of outcome. A
   WhatsApp outage **cannot** break lead creation or any other core flow.
   If you're seeing core flows fail during a WhatsApp issue, that's a
   separate bug, not this outage.
5. If the webhook itself seems to have stopped receiving events (inbound
   bot replies not firing), check that `WHATSAPP_APP_SECRET` is still
   correctly set — an incorrect value would cause every inbound webhook
   POST to be rejected with a 403 (signature verification, Module 8). An
   *unset* value fails open with a logged warning instead, so this is only
   a concern if the secret was set and then changed incorrectly.
6. No user-facing fallback needed for the lead-alert failure case — the
   existing DB/push notification (`Notification` model) is a separate,
   unaffected channel a merchant still sees in the dashboard.
