# Changelog

Tracks Pairley MVP module deliveries, per [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Each entry covers both repos (frontend + [`pairley-backend2026`](https://github.com/fscpaid-Vasanth/pairley-backend2026)).

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
