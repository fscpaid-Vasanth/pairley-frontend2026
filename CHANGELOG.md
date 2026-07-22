# Changelog

Tracks Pairley MVP module deliveries, per [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Each entry covers both repos (frontend + [`pairley-backend2026`](https://github.com/fscpaid-Vasanth/pairley-backend2026)).

## [pairley-module12-complete] — 2026-07-22

### Module 12 — Merchant Self-Service Claim & Management

Scope: turns Module 9's admin-assisted claim flow into a merchant
self-service workflow backed by real evidence, gives admins a proper
surface to review that evidence and act on Module 11's duplicate signals,
and closes the loop with an admin-only, fully-audited business
consolidation workflow. The underlying claim state machine
(`PENDING_ADMIN_REVIEW → ADMIN_APPROVED → COMPLETED`, admin approval always
required, OTP-gated ownership transfer) is unchanged from Module 9 —
nothing here bypasses admin review. Built in 4 phases, each independently
reviewed/approved/deployed-verified.

**Phase 1 — Schema & Evidence-Based Claim Backend**
- `ClaimRequest` gains `claimant_name` and `evidence_urls: String[]`, both
  optional/additive — a claim submitted with neither still works exactly
  as it did pre-Module-12
- Evidence (up to 5 files) is validated with the same magic-byte/mimetype/
  size checks Module 10's `FileValidationService` already established
  (reject-before-processing — a malformed batch never partially uploads),
  then stored via the existing generic `StorageService.uploadBase64`
- `@nestjs/throttler` added, scoped to just `POST claim/request` (5/10min)
  and `POST claim/otp/send` (3/10min, real per-send SMS cost) — not a
  global guard, since every other route already sits behind
  `JwtAuthGuard`/`RolesGuard`
- Maintenance fix (found during the Phase 1 audit, unrelated to the
  evidence feature itself): `BusinessService.uploadDocuments()` was
  writing uploaded aadhaar/PAN file URLs into `aadhaar_number`/`pan_number`
  (the text ID-number fields) instead of `aadhaar_photo`/`pan_photo` (the
  document-image fields) — corrected, covered by regression tests

**Phase 2 — Merchant Self-Service UI**
- An unobtrusive "Is this your business? Claim it." prompt on the public
  deal page, shown only when the offer's business is still `UNCLAIMED`
- `ClaimBusinessPage` extended with a claimant-name field and an optional
  multi-file evidence uploader (client-side count/size guardrails ahead of
  the same server-side limits), styled after the existing KYC upload
  components

**Phase 3 — Admin Evidence Review UI**
- A new claim-detail modal — claimant name/mobile/timestamps, an evidence
  gallery (images inline, PDFs open in a new tab), and a duplicate-business
  awareness banner (Module 11's `duplicate_of_business_id`/`score`/
  `reasons`) — all read-only context feeding the same unchanged
  Approve/Reject actions
- Maintenance fix, benefits every admin document-preview surface (KYC,
  Module 10 poster/PDF, and this phase's claim evidence): the shared
  `adminFilePreview.js` helper was passing private S3 URLs straight
  through to `<img src>`/`<a href>` instead of routing them through the
  authenticated `document-preview` proxy, so they 403'd in the browser.
  Fixed to only pass through genuinely external URLs
- Vitest introduced as this repo's first frontend test runner, scoped to
  this phase's pure-logic units (URL routing, PDF-vs-image detection)

**Phase 4 — Business Duplicate Consolidation**
- The first thing that ever acts on Module 11 Phase 2's advisory
  `duplicate_of_business_id`/`duplicate_score`/`duplicate_reasons`: an
  admin-only "Business Duplicates" panel lists flagged pairs, and a
  consolidation modal lets the admin pick which of the two to keep —
  including overriding the AI's suggested direction
- Consolidating reassigns every `Offer.business_id` off the losing
  business and soft-removes it (`business_status: REMOVED`) — never a
  hard delete, so `Subscription`/`Rating`/`ClaimRequest` history stays
  intact. A separate audit trail (`consolidated_into_business_id`/
  `consolidated_at`/`consolidated_by`) keeps that distinct from the
  original, possibly-never-acted-on AI suggestion
- Safety guards: refuses to consolidate a business that isn't
  `UNCLAIMED` (can never touch a real merchant's claimed listing — matches
  the duplicate detector's own UNCLAIMED-only comparison pool), refuses to
  consolidate into an already-removed business, and refuses while a claim
  request is pending on either side, per the STEP 1-approved decision

**Verified in production (Phase 5)**
- Full merchant lifecycle against the live Render/Vercel deployment:
  discover an UNCLAIMED business → submit a claim with claimant name and
  evidence → admin reviews the evidence in the new detail modal → approve
  → OTP send/verify (real MSG91 send, code read back from the database for
  a disposable test mobile) → atomic ownership transfer
  (`business_status: CLAIMED`, JWT issued only post-commit) → the newly
  claimed business's own dashboard correctly shows its offer and profile
- Business duplicate consolidation re-confirmed end to end: offer
  reassignment, soft-remove, all four safety guards, idempotency, and
  public-visibility filtering all correct against disposable data
- Regression: Module 9 website import, Module 10 OCR/PDF pipeline, and
  Module 11 normalization/duplicate-detection/enrichment are all
  untouched by any Module 12 code path (zero files in those pipelines were
  modified this module); merchant-created (`MANUAL`) offers, the public
  discovery feed, and the admin Shop Onboardings list all confirmed
  working correctly against live production data; WhatsApp lead-alert
  code path confirmed untouched by inspection (Module 12 only modified
  `offer.service.ts`'s two read queries, not the lead/notification write
  path)
- 275 backend unit tests (274 passing — 1 pre-existing, previously-flagged
  `app.controller.spec.ts` failure unrelated to Module 12, see Module
  1/7 notes in ROADMAP.md), 16 frontend unit tests (new this module); both
  repos build clean
- All test data (businesses, offers, claims, OTPs) created during Phase
  1-5 verification fully deleted; production DB confirmed back to its
  exact pre-verification baseline after every phase

**Known, expected, external/deferred**
- Live evidence-preview rendering (images/PDFs actually loading through
  the browser) could not be given a final live-browser confirmation this
  module — the backend's S3 `GetObject` calls are currently denied by the
  same `AWSCompromisedKeyQuarantineV3` IAM quarantine first documented at
  Module 1 and still open as of Module 7 (AWS Support Case
  `178454777500456`). The Phase 3 proxy-routing fix is verified correct up
  to the point the AWS SDK call itself is denied; this is an external AWS
  infrastructure issue, not a Module 12 code defect. **Action once AWS
  clears the quarantine**: re-run image/PDF preview verification for KYC
  documents, Module 10 poster/PDF imports, and claim evidence through the
  `document-preview` proxy.
- The "suspected canonical business" reference in the duplicate-review
  banner shows the candidate business's own ID rather than resolving a
  friendly name — no admin single-business-by-id lookup endpoint exists
  yet (the same limitation Module 11's business-duplicate banner already
  had). A minor future enhancement, not a blocker.
- A "not a duplicate" dismissal action does not exist yet — a false-
  positive duplicate flag simply has no admin-facing effect if left alone
  (it's advisory only), but there's no way to explicitly clear it from the
  Business Duplicates panel today. Deferred; add if false positives turn
  out to be common enough to need it.

## [pairley-module11-complete] — 2026-07-22

### Module 11 — AI Offer Standardization & Enrichment

Scope: transforms every imported offer (Website, Poster, PDF — and,
source-agnostically, whatever Instagram/Facebook eventually feed in) into
a consistent, searchable, explainable canonical shape, while preserving
the review-first principle every module since Module 9 has held to: AI
suggests, administrators decide. Built in 4 phases, each independently
reviewed/approved/deployed-verified.

**Phase 1 — Canonical Schema + Normalization Foundation**
- `Offer` gains `subtitle`, `tags`, `keywords`, an enrichment audit trail
  (`enrichment_status`/`enrichment_confidence`/`enrichment_metadata`), and
  duplicate-tracking fields; `Business` gains `suggested_merchant_type` —
  all additive, nullable/defaulted
- `NormalizationService` — deterministic (no AI/LLM) discount-split
  parsing ("was X now Y", "X% off", "flat X off"), offer_type
  classification against the real 17-value enum, best-effort
  validity-end-date extraction. Before this phase, `original_price`
  always equaled `offer_price` and `offer_type` was always `STANDARD` —
  neither was ever actually computed

**Phase 2 — Duplicate Detection**
- `DuplicateDetectionService` — deterministic, weighted-scoring
  comparison (title similarity, offer type, price proximity, category,
  merchant-name similarity for offers; name similarity, mobile, geo for
  businesses) against a bounded, recency-ordered candidate pool.
  Recommendation only — nothing is ever auto-merged, auto-rejected, or
  blocked
- Two real false-positive risks found and fixed during live testing:
  category and generic per-source-type business labels (e.g. "Poster
  Import") were being credited as genuine matches purely because every
  AI-imported candidate shared the same unclassified placeholder — both
  now excluded from scoring unless genuinely differentiated

**Phase 3 — AI Enrichment Layer (rule-based)**
- A provider-agnostic `EnrichmentProvider` abstraction, bound via NestJS
  DI to `RuleBasedEnrichmentProvider` — deterministic keyword matching,
  no AI/LLM. A future real-LLM provider (OpenAI, per explicit preference)
  plugs in behind the identical `EnrichmentResult` contract by changing
  one line in `discovery.module.ts`
- Suggests category, merchant type, tags, and keywords; restates
  Phase 1's offer_type decision inside the same result for one unified
  audit trail. Every suggestion carries `{suggested, original,
  confidence, rationale}`
- Critically: only the dedicated enrichment fields are ever written —
  `Offer.category`, `Offer.offer_type`, and `Business.business_type`
  stay exactly as extraction/normalization left them until an admin
  explicitly accepts a suggestion

**Phase 4 — Review Integration**
- `PUT /discovery/candidates/:id/approve` accepts an optional
  `overrides` payload (category/offerType/merchantType/tags/keywords),
  applied atomically — in one transaction alongside the approval, audit
  log, and any Business.business_type update. Every field independently
  optional; omitted fields keep exactly what extraction/normalization
  already set
- `AiSuggestionsPanel` in the admin review modal — Accept/Edit/Reject per
  field, high-confidence suggestions defaulting to accepted, low-confidence
  ones to rejected, so the admin only has to act where they disagree
- `enrichment_metadata` is never touched by applying an override — it
  stays a frozen record of the original suggestion, so comparing it
  against the live offer fields after approval is itself the audit trail
  of what was accepted, edited, or rejected

**Verified in production**
- Full lifecycle against the live Render/Vercel deployment: poster/PDF/
  website import → normalization (real discount splits, offer_type
  classification) → duplicate detection (a near-duplicate poster
  correctly flagged, an unrelated one correctly not) → rule-based
  enrichment → admin accepts one suggestion and edits another to a value
  different from what was suggested → atomic approve-with-overrides →
  confirmed live on `GET /offers/list` → takedown → re-approval
  (confirmed restored)
- `enrichment_metadata` confirmed unchanged after approval while the live
  offer fields reflected the admin's decisions — the audit trail working
  exactly as designed
- Regression: Module 9 website import, Module 10 OCR/PDF pipeline,
  merchant self-service offer creation (confirmed untouched by any
  Module 11 code path — `enrichment_status: NOT_ENRICHED` as expected),
  lead creation (WhatsApp code path), admin dashboard, claim-flow
  endpoints, bulk-approve (no-overrides path) — all confirmed working
  unmodified on the deployed build
- All test data cleaned up after verification; production DB confirmed
  back to its exact pre-verification baseline
- 246 backend unit tests (0 at Module 11's start); lint clean; both repos
  build clean

**Known, expected, external/deferred**
- Tags/keywords are populated directly by enrichment at import time
  (not gated behind admin acceptance the way category/offerType/
  merchantType are) — "Reject" on those two fields in the review UI
  leaves them as enrichment already set them rather than reverting to
  empty. Not a bug; documented behavior, revisit only if merchant/admin
  feedback asks for manual tag management
- No real LLM provider is wired up yet — `RuleBasedEnrichmentProvider`
  is deterministic keyword matching only, by design (Decision 1's staged
  approach). OpenAI integration remains a clearly-scoped future addition
  behind the existing `EnrichmentProvider` interface
- Instagram/Facebook import remains fully unbuilt, pending Meta Business
  Verification

## [pairley-module10-complete] — 2026-07-22

### Module 10 — Poster OCR + AI Offer Standardization

Scope: extends the Module 9 discovery pipeline with a second import
source — poster/flyer/menu images and text-layer PDFs — feeding the exact
same review-queue → admin-approval → public-visibility workflow. No new
pipeline was built; the existing one was generalized. Instagram/Facebook
import and LLM-based standardization remain deferred (Meta Business
Verification still pending). Built in 3 phases, each independently
reviewed/approved/deployed-verified.

**Phase 1 — OCR Service Foundation + Module 9 Refactor**
- `OcrService` — a single-method `extractText(buffer)` wrapper around
  `tesseract.js`, deliberately kept behind a narrow interface so a future
  swap to AWS Textract (or any other provider) touches one file
- `TextExtractionService` — plain-text sibling of `ContentExtractionService`
  (title/description/price from raw OCR/PDF text instead of HTML)
- `ConfidenceScoringService` extended with an optional OCR-confidence
  blend (70% field-completeness / 30% OCR confidence) — additive, website
  imports are scored exactly as before
- Module 9's hardcoded `Source.WEBSITE` refactored into an explicit,
  optional `sourceType` parameter through `CandidateOfferService` and
  `ImportOrchestrationService` — defaults preserve byte-for-byte identical
  website-import behavior (verified live)

**Phase 2 — File Upload + Async Import Pipeline**
- `FileValidationService` — mimetype allowlist, magic-byte signature
  checks (JPEG/PNG/WebP/PDF — never trusts the client-declared
  Content-Type), a 15MB soft limit distinct from Multer's 20MB hard
  transport ceiling (the 15–20MB gap produces a real `FAILED` `ImportJob`
  instead of a bare transport error), filename sanitization
- `PdfTextService` (`pdf-parse` v1.1.1) — text-layer PDFs only; a PDF
  with no extractable text is treated as scanned/image-only and fails
  with a clear, distinct reason rather than silently producing junk
- `ImagePreprocessingService` (`sharp`) — resizes to a 2000px max
  dimension before OCR, falls back to the original buffer if the image
  can't be read
- `POST /discovery/import-file` — `202 Accepted`; validation/upload run
  synchronously (fast, always produces a job record even on rejection),
  OCR/PDF-extraction continues asynchronously against the same
  `QUEUED → PROCESSING → DONE/FAILED` `ImportJob` lifecycle Module 9
  already had, no new queue infrastructure introduced
- **Bug found and fixed during live testing**: PDF uploads kept the
  job's initial `POSTER` placeholder `source_type` instead of correcting
  it once the real mimetype was known — fixed, regression-tested

**Phase 3 — Review Queue Integration & Admin Upload UI**
- Candidate summaries extended with `description` and `source_file_url`
  (the original poster/PDF's storage location) — additive fields only
- `ImportJobRepository.findJobs()` gains a bounded `limit` (clamped
  1–100, default 20) so the new admin polling UI stays lightweight
  regardless of total import volume
- `PosterUploadCard.jsx` — upload control plus a self-stopping "Recent
  Imports" list (polls only while a job is non-terminal)
- `CandidateReviewModal.jsx` — the original poster/PDF/source-page
  preview shown side-by-side with extracted title/description/price/
  confidence, so an admin can compare before approving
- Thumbnail column added to the existing Discovered Offers table; reuses
  the same admin-gated `document-preview` proxy already used for KYC
  document previews (`adminFilePreview.js` extracted for shared reuse)
- **Bug found and fixed during live testing**: the failure-message
  lookup matched on the full `"REASON: message"` string the backend
  stores instead of just the reason code — fixed, re-verified against a
  real `INVALID_FILE_SIGNATURE` failure

**Verified in production**
- Full lifecycle against the live Render/Vercel deployment: poster
  upload → OCR (94–95% confidence on synthetic test posters) →
  confidence scoring → review queue (thumbnail/description fields
  present) → approve → confirmed live on `GET /offers/list` → takedown
  (confirmed removed from public listing) → re-approval (confirmed back)
- PDF upload → text extraction → review queue → same lifecycle, correct
  `source_type: "PDF"` throughout (confirms the Phase 2 bug-fix holds)
- Regression: Module 9 website import, offer creation (business
  approval + active-subscription guards both correctly enforced, then a
  real offer created once both were satisfied), lead creation (the
  WhatsApp-notification code path executes without error), admin
  dashboard, existing discovery APIs — all confirmed unmodified on the
  deployed build. Auth/claim-flow regression covered via the full
  backend test suite plus endpoint-level checks (send-otp/login/google/
  claim-status all return correct, sane error responses against
  production) rather than new live SMS-based registrations, since Module
  10 touched no auth/claim code and the prior module's guidance was to
  minimize real SMS-provider spend where practical
- All test data (businesses, offers, leads, subscriptions, import jobs)
  cleaned up after verification; production DB confirmed back to its
  exact pre-verification baseline
- 144 backend unit tests (138 at Module 10 Phase 2's end); lint clean;
  both repos build clean

**Known, expected, external/deferred**
- Tesseract's ~5MB English language model downloads lazily on the first
  OCR call in any given backend process — a one-time per-process
  cold-start cost, documented in RUNBOOK.md. Not observed as a
  noticeable delay during production verification (first real request
  completed in ~7s including OCR)
- Poster/PDF thumbnail previews are served through the same
  `document-preview` proxy as KYC documents, so they're subject to the
  same pre-existing `AWSCompromisedKeyQuarantineV3` `GetObject` block
  (Case `178454777500456`) if/when that quarantine is active — not a new
  or Module 10-caused issue
- Instagram/Facebook import and LLM-based standardization remain fully
  unbuilt, pending Meta Business Verification

## [pairley-module9-complete] — 2026-07-22

### Module 9 — AI Offer Discovery Engine (Group B foundation)

Scope: a vertical slice of Group B proving the full pipeline end to end via
the lowest-risk import source (website URL) — deterministic rule-based
extraction only, no LLM/AI inference. Instagram/Facebook import (blocked on
Meta Graph API App Review), poster OCR, and LLM-based standardization are
explicitly deferred to later modules. Built in 4 phases, each independently
reviewed/approved/deployed-verified.

**Phase 1 — Schema & Repository Foundation**
- `Business.mobile` made nullable (additive) — an AI-imported `UNCLAIMED`
  business may have no verified phone number yet. 8 call sites across
  auth/business/whatsapp/offer services widened accordingly; zero behavior
  change for any of the 10 existing (always-`CLAIMED`) production businesses
- New `ImportJob` model + `ImportJobStatus` enum — one row per import attempt
- `src/discovery/` module scaffold (repository layer only)

**Phase 2 — Website Import + SSRF-Safe Fetch Service**
- `UrlFetchService` — multi-layer SSRF protection: rejects localhost/
  loopback/private/link-local IP ranges (resolved, not just string-matched,
  so DNS-based bypasses are caught), limits redirects, enforces a hard
  timeout and max response size, rejects non-HTML content types. Documented
  limitation: no protection against DNS rebinding between the initial
  resolve and the actual connection — acceptable for an admin-only v1,
  flagged for future hardening if this ever becomes less trusted
- `ContentExtractionService` — deterministic regex-based extraction (title,
  meta description, og:image, ₹/Rs/INR price patterns). No LLM anywhere
- `ConfidenceScoringService` — rule-based heuristic (field-completeness),
  not ML
- `ImportOrchestrationService` — coordinates `QUEUED → PROCESSING →
  DONE/FAILED`; known/expected failures (bad URL, SSRF-blocked, timeout)
  logged only, unexpected errors explicitly `Sentry.captureException()` +
  `flush()`'d (the Module 7 fire-and-forget lesson applied here too)
- `POST /discovery/import`, `GET /discovery/jobs`, `GET /discovery/jobs/:id`
  (all `Role.ADMIN`)

**Phase 3 — Admin Review Queue**
- `CandidateOfferService` — a successful import (with at least a title)
  materializes a real `UNCLAIMED` `Business` + `DRAFT`, `review_required:
  true` `Offer`. `DRAFT` status alone keeps it out of every customer-facing
  query (`listOffers`/`getDetails` both already gate on `status === ACTIVE`)
  — zero changes needed to any existing customer/merchant code path.
  Missing fields get sensible placeholders (category defaults to
  "Shopping", price to ₹0), each one surfaced as an explicit warning
- `ReviewQueueService` — search/paginate/filter, `approve`/`reject`/
  `takedown` as reversible status transitions (nothing hard-deleted), full
  audit trail via the existing append-only `OfferVersion` model (real admin
  id via `@CurrentUser`, not the null placeholder the pre-existing
  `ADMIN_MODERATION` precedent elsewhere in this codebase used), bulk
  approve/reject with per-id partial-failure reporting
- `GET/PUT discovery/candidates/*`, `POST discovery/candidates/bulk-*`
- `DiscoveredOffersPanel.jsx` — new `AdminDashboard` tab: search, status
  filter, confidence/source badges, extraction warnings, multi-select bulk
  actions, server-side pagination

**Phase 4 — Merchant Claim Flow (admin-assisted, not self-service)**
- New `ClaimRequest` model + `ClaimRequestStatus` enum. Flow: merchant
  requests → admin reviews → OTP verification → atomic ownership transfer →
  dashboard access. No self-service auto-approval path exists anywhere
- Non-guessable tokens (`crypto.randomBytes(32)`), single-use/replay
  protection (a token is permanently inert once it leaves `ADMIN_APPROVED`),
  7-day token expiry, 5-attempt OTP retry limit (auto-expires the claim),
  mobile-conflict protection (checked at request time and again immediately
  before transfer)
- Ownership transfer is one atomic `$transaction` (Business status/mobile/
  claimed_at/claimed_by + ClaimRequest → `COMPLETED` + OTP cleanup,
  all-or-nothing); JWT issued only after it commits. Offers/leads/analytics
  need zero code changes — they're keyed by `business_id`, which never
  changes during a claim
- Reuses the existing `OtpVerification` table/`OtpService`/`JwtService` —
  zero changes to `auth.service.ts`/`auth.controller.ts`, so normal
  registration/login have no regression surface from this phase by
  construction
- `POST/GET business/claim/*` (public), `GET/PUT business/claim/requests/*`
  (`Role.ADMIN`)
- `ClaimBusinessPage.jsx` (new public route `/claim/:businessId`) and
  `ClaimRequestsPanel.jsx` (new `AdminDashboard` tab)

**Verified in production**
- Full 8-step lifecycle against the live Render deployment (real HTTP, real
  JWTs, disposable admin/test accounts): website import → review queue →
  approve → confirmed live in the real `GET /offers/list` with the existing
  `imported` badge auto-applied → merchant claim (request → admin approve →
  OTP → atomic transfer → new JWT confirmed working) → existing admin
  offer-moderation endpoint (regression) → takedown (confirmed removed from
  public listing, soft state) → re-approval (confirmed back)
- Regression: customer registration, merchant registration, OTP-based login,
  offer creation, offer discovery (list + category), admin dashboard
  metrics, existing admin login, and the Module 8 WhatsApp lead-alert
  pipeline (correctly attempted and logged `FAILED` with Meta's real
  `template does not exist` error — same known, expected, external
  dependency as Module 8, not a regression) — all verified working
  unmodified on the deployed build
- All test data (businesses, offers, leads, claim requests, import jobs,
  customers, admins, OTP rows) cleaned up after verification; production
  DB confirmed back to its exact pre-verification baseline each time
- 89 backend unit tests (0 at Module 9's start) across the `discovery`
  module; lint clean; both repos build clean

**Known, expected, external/deferred**
- OTP sends during Phase 4/Phase 5 verification used the real MSG91 API
  (`USE_MOCK_OTP=false` in this environment), consuming a small number of
  real SMS-provider credits against fabricated test numbers — same
  real-provider tradeoff already accepted for Module 8's WhatsApp testing
- No "Is this your business?" entry point exists yet on public offer pages
  — `/claim/:businessId` is reachable but not yet linked from anywhere
  customer-facing, a deliberate choice to keep zero touches to
  customer-facing code this module
- Instagram/Facebook import, poster OCR, and LLM-based standardization
  remain fully unbuilt — proposed as later modules once Meta Graph API App
  Review and an OCR/LLM provider decision are in place

## [pairley-module8-complete] — 2026-07-21

### Module 8 — WhatsApp Business API Integration

Scope: A8 only (lead alerts to verified, opted-in merchants). B7's cold-outreach
flow to unclaimed/AI-imported businesses remains part of the deprioritized
Group B, per the approved STEP 1 scope decision.

**Added**
- `Business.lead_whatsapp_number`/`lead_whatsapp_verified`/`notify_whatsapp` and
  a new `WhatsAppMessage` log model — additive schema, applied via `prisma db
  push`, verified against production (10 businesses intact before/after)
- `X-Hub-Signature-256` verification on `POST /whatsapp/webhook` (HMACs the raw
  request bytes against `WHATSAPP_APP_SECRET`; fails open with a logged
  warning until that env var is set, so it doesn't take the live webhook down)
- `GET /whatsapp/health` now `Role.ADMIN`-gated — previously leaked whether
  secrets were configured to any caller
- `GET /business/whatsapp-status`, `PUT /business/whatsapp-number`,
  `POST /business/whatsapp-number/verify` — defaults to the already
  OTP-verified `Business.mobile` (treated as verified automatically); an
  explicit override requires a fresh code, delivered via WhatsApp itself
  rather than SMS since WhatsApp reachability is the property being verified
- `sendLeadWhatsappAlert()` wired into `createLead()` (`offer.service.ts`) —
  fire-and-forget alongside the existing DB/push notification (an additional
  channel, not a replacement), one retry on failure, logs every attempt to
  `WhatsAppMessage`
- `GET /leads` now attaches `whatsappStatus` per lead (batched query, no
  `@relation` — `Lead` and `WhatsAppMessage` are both standalone logs by
  design)
- `WhatsappLeadAlertsCard` (Business Settings) and a "WA Sent"/"WA Failed"
  badge on the Leads list (frontend)

**Verified in production**
- Full lead-notification flow, twice (once during STEP 2 build, once after
  acceptance with a fresh test customer): lead creation succeeds, the
  existing DB/push notification is unaffected, the WhatsApp send is
  correctly attempted and logged
- Admin-gating, webhook signature verification (valid/invalid/missing/
  unconfigured-fail-open — all four cases), correlation IDs, no regressions
  across Modules 3–7

**Known, expected, external dependency**
- Every WhatsApp send currently logs `status: "FAILED"` with Meta's real
  error, `(#132001) Template name does not exist` — the `new_lead_alert`
  template hasn't been submitted/approved in Meta Business Manager yet.
  This proves the pipeline is correct, not broken; it will start succeeding
  the moment the template is approved, with no code changes required.

## [pairley-module7-complete] — 2026-07-21

### Module 7 — Monitoring & Observability

**Added**
- `GET /api/health` extended with `@nestjs/terminus`'s built-in `PrismaHealthIndicator`, a best-effort S3 reachability check, and `release`/`environment`/`serverTime`/`processUptimeSeconds` fields — DB failure remains a hard 503, storage failure only downgrades to `"degraded"` (200)
- `SystemHealthService` (in the global `CommonModule`) — extracted so `/api/health` and the new admin-gated `GET /api/admin/system-health` run the identical check instead of two copies that could drift
- `@sentry/nestjs` (backend) and `@sentry/react` + `@sentry/vite-plugin` (frontend) — error tracking with release tagging, hidden source maps (uploaded then stripped from the shipped bundle), and a shared `redactSensitive()` utility scrubbing auth tokens/KYC fields/customer PII/third-party credentials before anything leaves the process
- `nestjs-pino` structured JSON logging, replacing Nest's default logger app-wide with zero per-file changes; per-request correlation IDs (`x-request-id`, generated client-side in `api.js` or server-side if absent, always echoed back) traceable across frontend Sentry events, backend logs, and backend Sentry events
- `Sentry.ErrorBoundary` around `<App />` with a themed fallback screen, so a render crash shows a recoverable UI instead of a blank page
- `SystemHealthTile` on `AdminDashboard`'s overview tab — live status pills, release version, links to Sentry/uptime dashboards
- `MONITORING_SETUP.md`, `INCIDENT_RESPONSE.md`, `TROUBLESHOOTING.md`, `RUNBOOK.md` — written last, against the actual configuration, grounded in this project's real prior incidents (Neon quota exhaustion, AWS key compromise) rather than generic guidance

**Verified in production**
- `/api/health` and `/api/admin/system-health`: correct shape, correct DB-hard-fail/storage-soft-fail behavior, release SHA matches deployed commit
- Correlation IDs: custom ID echoed back, omitted ID auto-generated, confirmed live against the deployed backend
- Redaction: a real `Authorization` header confirmed redacted to `[REDACTED]` in the emitted log line
- Backend Sentry: a controlled test exception confirmed delivered to the `pairley-backend` Sentry project (required switching from fire-and-forget capture to an explicit `Sentry.captureException()` + `await Sentry.flush()` — the global exception filter's default async capture was losing events before the process moved on to the next request)
- Web frontend Sentry: a controlled test exception confirmed delivered to the `pairley-frontend` Sentry project, using the same explicit flush pattern
- Regression: Module 3 (offer lifecycle), Module 4 (discovery/category counts/public stats), Module 5 (lead ownership/role guards), Module 6 (admin dashboard metrics) all unaffected by the `DashboardController`/`CommonModule` refactor

**Deferred (explicitly, as post-launch operational tasks — not incomplete code)**
- Android Sentry verification — the same `@sentry/react` init ships in the Capacitor build; only the Android-specific release build verification is outstanding, postponed until the Android release is finalized
- External uptime monitoring (UptimeRobot or equivalent polling `/api/health`) — planned alongside an upcoming Render paid-plan upgrade

**Found, not caused by Module 7**
- The Module 1 AWS `AWSCompromisedKeyQuarantineV3` issue never actually cleared — Module 7's new S3 health check surfaced that the IAM user is still under an active quarantine even after a full credential rotation. `GetObject` is denied (admin KYC document preview/download is currently broken); `PutObject` still works (uploads/browsing unaffected). AWS Support case open (`178454777500456`) — pending AWS, not a code fix

## [pairley-module6-complete] — 2026-07-20

### Module 6 — Customer Profile & Saved Offers

**Added**
- `UpdateCustomerProfileDto` — `PUT customers/profile` previously took `@Body() body: any` with only a 5-field deny-list at the service layer, the weakest-guarded profile-update endpoint in the codebase; now whitelisted (name/email/city/state/address/pincode/profile_photo/gender/date_of_birth/age/notify_email/notify_push/notify_matching)
- `notify_email`/`notify_push`/`notify_matching` columns on `Customer`, persisted via the existing `PUT customers/profile` — save/retrieve only, `notificationService` doesn't yet consult these on any send path (deliberately deferred to a future module)
- Real save/unsave on `DealCard.jsx` — the wishlist heart was pure local `useState`, always `false` on mount, reset on every reload; now controlled via `isSaved`/`onToggleSave` props backed by the already-existing (but previously unused) `customers/save-offer` endpoints
- `src/hooks/useSavedOffers.js` — fetches the customer's saved offers once per page, shared by `DealsPage.jsx`, `DealDetailPage.jsx`'s similar-deals grid, and the new Saved Offers page
- `SavedOffersPage.jsx` (new route, new `CustomerNav` entry) — expired/archived/paused offers stay visible with a clear "Expired"/"No Longer Available"/"Paused" badge rather than disappearing, per the approved UX decision

**Changed**
- `CustomerProfile.jsx`'s Notifications toggles now persist to the real backend instead of `localStorage`
- `CustomerProfile.jsx`'s phone number field was shown as editable (`disabled={!editMode}`) but silently discarded on save (mobile is deny-listed server-side, OTP-verified) — now always disabled with a note explaining why, instead of misleadingly looking editable

**Fixed**
- Caught during my own Phase 4 draft, before committing: an early version double-fetched `GET customers/saved-offers` (once in the hook, once in the page) with a broken filter-on-unsave effect — reworked `useSavedOffers.js` to serve both the id-set and full offer list from a single fetch

**Verified in production**
- Save/unsave persists across a fresh fetch (not just within a session)
- Two-customer isolation on saved offers and profile updates
- An archived offer stays visible in Saved Offers with the correct badge after the merchant archives it
- `UpdateCustomerProfileDto` rejects a non-whitelisted field (400) and accepts whitelisted fields including notification prefs
- No regressions in Module 3 (offer lifecycle, version history), Module 4 (discovery, category counts, PII protection), or Module 5 (lead creation/workflow/ownership, legacy `OfferInterest` compatibility)

## [pairley-module5-complete] — 2026-07-20

### Module 5 — Lead Management

**Added**
- `GET /leads` (optional `?offerId=&status=` filters), `GET /leads/:id`, `PUT /leads/:id/status` — the first read/update surface the `Lead` table has ever had (Module 3 only ever wrote to it)
- `LeadStatus` enum (`NEW`/`CONTACTED`/`CONVERTED`/`NOT_INTERESTED`) replacing `Lead.status`'s previous unconstrained free-text field
- Server-side lead notification — `createLead()` now writes a `Notification` row (and sends an FCM push if a token exists) when a lead comes in, independent of whether the customer's own `wa.me` popups fired successfully
- `LeadsPage.jsx` — the first merchant-facing surface for leads, ever: filter by status, search, per-lead status dropdown, one-click "Contact" via WhatsApp (auto-advances NEW → CONTACTED). New nav entry between Deals Manager and Fulfillment & Orders
- `src/utils/whatsapp.js` — shared WhatsApp deep-link helper, extracted from `InterestButton.jsx`'s previously-duplicated inline logic
- "New Leads" stat card on `BusinessDashboard.jsx`, clickable through to the Leads page

**Changed**
- `BusinessOrdersPage.jsx`'s "Leads to Contact" tab (and "Direct Lead Coordination" note) relabeled "Matches to Contact" / "Direct Match Coordination" — that page is `OfferInterest`-based (legacy Pair/Group matching only), not `Lead`-based, and predates the real Lead model; disambiguated now that a real Leads page exists

**Fixed**
- Deployment-time catch: `Lead.updated_at`'s initial migration used `@updatedAt` alone, which has no SQL-level default — `prisma db push` correctly refused to apply it against the 7 existing production leads rather than fail. Fixed with `@default(now()) @updatedAt` before re-applying; zero data touched by the aborted attempt

**Verified in production**
- Lead creation via Show Interest, full status workflow (NEW → CONTACTED → CONVERTED, invalid status rejected with 400)
- Ownership enforcement: a second merchant's account correctly got 403 on both the leads list and direct fetch/status-update of the first merchant's lead
- Server-side `Notification` row confirmed created on lead creation
- Filtering by status and offer, "New Leads" dashboard count accuracy
- No regressions in Module 3 (offer lifecycle, version snapshots, legacy `OfferInterest` flow) or Module 4 (PII protection, field-exposure discipline, `status=ALL` lockdown, category counts)

## [pairley-module4-complete] — 2026-07-20

### Module 4 — Customer Discovery

**Added**
- `GET /offers/list` accepts `lat`/`lng`/`radiusKm` — server-side Haversine radius filtering and nearest-first sorting, resolving each offer's effective location (its own `geo_lat`/`geo_lng` if set, else its business's)
- `category` validated against the real 12-value allowlist on `/offers/list` and `/offers/category/:category` — unknown category now 400s instead of silently returning nothing
- `end_date >= NOW()` added to `listOffers()`'s default `ACTIVE` view — defensive complement to Module 3's hourly expiry scheduler
- `GET /offers/category-counts` — backs `SearchOverlay`'s category tiles with real counts (was reading a field that never existed)
- Server-computed offer origin badge (`verified` / `exclusive` / `imported` / `null`, fixed priority Verified Merchant > Pairley Exclusive > Imported from Public Information) — raw provenance fields never reach the client, same discipline as `PUBLIC_OFFER_FIELDS`
- `PUT admin/offers/:id/exclusive` — admin-only, versioned, dormant (no frontend UI yet — capability only, ahead of a future admin-tools module)
- `(geo_lat, geo_lng)` index on `offers`
- `src/utils/offerBadges.js` (frontend) — display-only badge helper, `DealCard`/`DealDetailPage` now render it
- `SearchOverlay.jsx` wired to the real backend (was entirely mock-data-driven against a permanently empty catalog — search always returned zero results)
- Real "Similar Deals" on `DealDetailPage.jsx` (was reading the same empty mock catalog, so the section never rendered)
- `src/hooks/useNearbyDeals.js` adopted as the single distance/radius calculation source, replacing duplicated inline Haversine logic in `NearbyDealsSection.jsx`

**Changed**
- `DealsPage.jsx` now sends real coordinates to the backend and uses server-computed `distanceKm` for the "Nearest First" sort and card distance badge

**Fixed**
- `GET /offers/details/:id` was fully unauthenticated and returned every interested customer's name/mobile/email/address to any caller who knew/guessed an offer id — confirmed live against a real production offer, patched as a standalone security fix ahead of the rest of this module (same "security fixes never wait" discipline as the Module 1 KYC-preview guard)
- `GET /offers/list` accepted `status=ALL` (surfacing draft/pending/rejected/archived offers) from any unauthenticated caller — now requires authentication for any non-default status
- `GET /offers/details/:id` returned full offer content for non-`ACTIVE` offers to anyone who knew the id — now 404s for anyone except the owning business or an admin
- `DealsPage.jsx`'s radius selector and "Nearest First" sort were no-ops against live data — they read `deal.latitude`/`deal.longitude`, fields that never existed on API-backed deal objects (only `geo_lat`/`geo_lng` did)
- `CustomerDashboard.jsx`'s "Deals Near You" section had the same field-name bug, plus a second bug where every card read `deal._id` (always `undefined`) instead of `deal.id`, so every card linked to `/deals/undefined`
- `LocationBar.jsx` destructured `status`/`requestLocation` from `useLocationContext()`, neither of which the context exposes (it provides `permissionStatus`/`isLoading` and `refreshLocation`/`requestPermission`) — the location-enable button and status display never worked
- `DealsPage.jsx`'s `DealTypeToggle` usage passed `activeType`/`onTypeChange`; the component consumes `selected`/`onChange` — the toggle never reflected the active filter

## [pairley-module3-complete] — 2026-07-19

### Module 3 — Offer Management

**Added**
- 11 new `OfferType` values (`STANDARD`, `BUY_X_GET_Y`, `FLAT_DISCOUNT`, `PERCENTAGE_DISCOUNT`, `CASHBACK`, `COMBO`, `SEASONAL`, `FESTIVAL`, `FLASH_DEAL`, `LIMITED_QUANTITY`, `LIMITED_TIME`) alongside all 6 legacy types (`BOGO`/`BOGT`/`GROUP_DISCOUNT`/`BULK_PURCHASE`/`MEMBERSHIP_CAMPAIGN`/`PACKAGE_DEAL`, kept working unchanged as "Legacy Matching Type")
- `PAUSED`/`ARCHIVED` added to `OfferStatus`
- Module 3 media model — `cover_image`, `gallery_images[]` — plus `POST /offers/:id/media` and `DELETE /offers/:id/media/gallery`; legacy `offer_image`/`facility_images` kept for backward compatibility and one-time-backfilled into the new fields
- Offer location override — `geo_lat`/`geo_lng` on the offer itself, falling back to the business's location when unset
- `OfferVersion` model + `offer_versions` table — a full snapshot is created on every offer create, merchant edit, status change, archive, and system expiry
- Pairley 2.0 prep fields (`confidence_score`, `imported_at`, `review_required`, `original_import_url`, `original_import_source`, `merchant_verified`, `is_pairley_exclusive`, `original_poster`, `generated_offer_card`) — schema-only, zero logic, verified untouched by any current code path
- `PUT /offers/:id/status` — dedicated merchant status endpoint (`ACTIVE`/`PAUSED`/`DRAFT`), replacing the prior misuse of the generic update endpoint with a semantically-wrong `DRAFT` value for "paused"
- `DELETE admin/offers/:id/permanent` — real hard-delete, admin-only (no separate Super Admin tier exists yet; gated behind the existing `Role.ADMIN`)
- Hourly expiry sweep (`OfferExpiryScheduler`, `@nestjs/schedule`) — flips `ACTIVE`/`PAUSED` offers past `end_date` to `EXPIRED`, one `OfferVersion` snapshot per offer
- `src/utils/offerTypes.js` (frontend) — single source of truth for offer-type labels/icons and legacy-mechanic detection, replacing duplicated inline `offer_type` switch statements across 9 files (`DealCard`, `InterestButton`, `DealsPage`, `DealDetailPage`, `ManageDealsPage`, `BusinessDashboard`, `BusinessOrdersPage`, `CustomerDashboard`, `CreateDealPage`)
- `CreateDealPage.jsx` now defaults to "Standard Offer" (Show Interest → Lead → merchant follow-up, no chat/matching/waiting) with a picker across all 11 new types; Pair/Group demoted to a collapsed, opt-in "Advanced: Legacy Matching Type" section
- Archive button in `ManageDealsPage.jsx` (the underlying `handleDelete`/undo-toast logic already existed but had no UI entry point)

**Changed**
- Merchant "delete" now archives (`status: ARCHIVED` + version snapshot) instead of physically deleting the row — offers with real customer `Lead`/`OfferInterest` history are never destroyed by a merchant accidentally clicking delete
- `createLead()` only creates `OfferInterest`/capacity-tracking records for the 6 legacy matching types; every other offer type creates a `Lead` only — no chat, no matching, no waiting, per the Show Interest → Lead → Merchant Dashboard flow
- `GET /offers/list` and `GET /offers/details/:id` (both unauthenticated) now `select` an explicit field whitelist instead of returning every `Offer` column

**Fixed**
- `GET /offers/list`/`GET /offers/details/:id` were returning `confidence_score`, `source`, `review_required`, `original_import_url`, `original_import_source`, `merchant_verified`, `is_pairley_exclusive`, `imported_at`, `original_poster`, and `generated_offer_card` to any anonymous caller — closing the gap the schema comment already flagged ("enforced at the API response layer, not here") but that was never implemented until now
- Pause/Resume was calling `PUT /offers/update/:id` with `status: 'DRAFT'` to mean "paused" — now calls the dedicated status endpoint with the real `PAUSED` value

**Verified in production**
- Full offer lifecycle (Create → Edit → Pause → Resume → Archive) for Standard, BOGO, Percentage Discount, Combo, and legacy Group offers, each producing the correct `OfferVersion` audit trail
- Legacy Pair/Group Show Interest still creates `OfferInterest` + capacity tracking; new-type Show Interest correctly does not
- Cover + gallery image upload to S3
- Offer location update via `geo_lat`/`geo_lng`
- Hourly expiry scheduler — already caught and correctly expired 7 real production offers past their `end_date` before this verification pass began, each with a `SYSTEM_EXPIRED` version snapshot
- No Pairley 2.0/AI metadata exposed in any public API response

## [pairley-module2-complete] — 2026-07-19

### Module 2 — Merchant Business Profile

**Added**
- Business Media: logo, cover image, gallery (up to 10 images) — `POST /business/media`, `DELETE /business/media/gallery`
- Store Hours: per-day open/close/closed (`store_timing`, JSON), replacing the old single hardcoded dropdown pair that never persisted
- Location: GPS-detect + reverse-geocode (reusing the existing `getUserLocation`/`reverseGeocode` utilities), storing `geo_lat`/`geo_lng` + address — no geohash yet
- "Lead Acceptance" (Manual / Automatic) — replaces the old "Auto-confirm" checkbox, which never actually saved
- New profile fields: description, website, Instagram, Facebook, WhatsApp, support number
- Profile Completion indicator — calculated client-side from the existing profile data, no new backend field

**Changed**
- Email is now editable on `PUT /business/profile` (previously always silently discarded)
- `PUT /business/profile` now validated by a real DTO — the global `ValidationPipe`'s `forbidNonWhitelisted` rejects any attempt to set restricted fields (`business_status`, `source`, `mobile`, etc.) at the validation layer

**Fixed**
- `business.service.ts`'s `updateProfile()` didn't block `business_status`/`source`/`created_by_ai`/`claimed_at`/`claimed_by` self-updates (same class of gap already fixed in `auth.service.ts` during Module 1, found in this second write path while starting Module 2's research)
- Email uniqueness on profile update only checked the `Business` table, allowing a collision with an existing `Admin` or `Customer` account (found during Module 2's production smoke test) — now checks all three

**Removed**
- The "Email dispatch alerts" checkbox — rendered but never persisted, no backing field, did nothing

## [pairley-module1-complete] — 2026-07-19

### Module 1 — Identity & Business Onboarding Foundation

**Added**
- `BusinessStatus` enum (`UNCLAIMED`/`CLAIMED`/`VERIFIED`/`SUSPENDED`/`REMOVED`) and `Source` enum (`MANUAL`/`WEBSITE`/`INSTAGRAM`/`FACEBOOK`/`GOOGLE`/`PDF`/`POSTER`/`ADMIN`) — schema preparation for Pairley 2.0's AI import pipeline, not yet populated by any AI logic
- `Business.created_by_ai`, `claimed_at`, `claimed_by` — reserved for the future Merchant Claim Flow
- Regression test (`auth.service.spec.ts`) for OTP verification

**Fixed**
- `OtpService.generateOtp()` returned the hardcoded literal `'123456'` for every OTP, always — now a real random 6-digit code
- `AuthService.verifyOtp()` had an unconditional bypass accepting `'123456'`/`'1234'` for any mobile number — removed
- `JWT_SECRET` silently fell back to a hardcoded string if unset — now fails startup loudly instead
- `RegisterDto`/`GoogleAuthDto`'s `role` field wasn't validated against an enum
- `AuthService.updateProfile()` didn't block self-updates to the new claim/verification fields
- `business.controller.ts`'s `/business/document-preview` KYC document proxy had no auth guard at all — now admin-only, with a query-param token fallback for `<img src>`/`<a href>` consumption

**Changed**
- `Business.email` is now nullable (was required) — normal registration now only requires mobile (OTP-verified) + business name; email is optional
