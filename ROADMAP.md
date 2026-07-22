# Pairley Roadmap

## Project Name
Pairley

## Vision
Build India's smartest Hyperlocal Commerce Platform that evolves from a traditional Offer Marketplace into an AI-powered Demand Intelligence Marketplace.

The platform is designed in two phases.

---

## Delivery Status

Tracks module-level delivery against [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Updated as each module ships.

| Module | Status |
|---|---|
| Group A — Module 1: Identity & Business Onboarding Foundation | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module1-complete`. |
| Group A — Module 2: Merchant Business Profile | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module2-complete`. See [CHANGELOG.md](./CHANGELOG.md). |
| Group A — Module 3: Offer Management | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module3-complete`. See [CHANGELOG.md](./CHANGELOG.md). |
| Group A — Module 4: Customer Discovery | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module4-complete`. See [CHANGELOG.md](./CHANGELOG.md). |
| Group A — Module 5: Lead Management | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module5-complete`. See [CHANGELOG.md](./CHANGELOG.md). |
| Group A — Module 6: Customer Profile & Saved Offers | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module6-complete`. See [CHANGELOG.md](./CHANGELOG.md). |
| Group A — Module 7: Monitoring & Observability | ✅ **COMPLETE** — application code deployed to production and verified (no schema changes this module). Tag: `pairley-module7-complete`. See [CHANGELOG.md](./CHANGELOG.md). Two items intentionally deferred as post-launch operational tasks, not code work — see notes below. |
| Group A — Module 8: WhatsApp Business API Integration | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module8-complete`. See [CHANGELOG.md](./CHANGELOG.md). Scope was A8 only (lead alerts to verified, opted-in merchants) — B7's cold-outreach flow to unclaimed businesses remains part of the deprioritized Group B. |
| Group B — Module 9: AI Offer Discovery Engine (foundation) | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module9-complete`. See [CHANGELOG.md](./CHANGELOG.md). A deliberately scoped vertical slice of Group B: website-URL import (deterministic extraction, no AI/LLM), admin review queue, and admin-assisted merchant claim flow. Instagram/Facebook import, poster OCR, and LLM-based standardization are explicitly out of scope, proposed for later modules once Meta Graph API App Review and an OCR/LLM provider decision land. |
| Group B — Module 10: Poster OCR + AI Offer Standardization | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module10-complete`. See [CHANGELOG.md](./CHANGELOG.md). Extends Module 9's discovery pipeline with poster/flyer/menu image and text-layer PDF import via `tesseract.js` OCR (kept behind a swappable `OcrService` interface), feeding the same review-queue/approval/public-visibility workflow. Instagram/Facebook import and LLM-based standardization remain out of scope, pending Meta Business Verification. |
| Group B — Module 11: AI Offer Standardization & Enrichment | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module11-complete`. See [CHANGELOG.md](./CHANGELOG.md). Adds deterministic price/offer-type normalization, duplicate detection (offer- and business-level, recommendation-only), rule-based AI enrichment (category/merchant-type/tags/keywords via a provider-agnostic `EnrichmentProvider`, no LLM yet), and an AI-assisted review workflow (Accept/Edit/Reject per suggestion, atomic approve-with-overrides). Canonical fields (`category`, `offer_type`, `business_type`) are never auto-modified by enrichment — only an explicit admin acceptance changes them. |
| Group B — Module 12: Merchant Self-Service Claim & Management | ✅ **COMPLETE** — database migrated, application code deployed to production and verified. Tag: `pairley-module12-complete`. See [CHANGELOG.md](./CHANGELOG.md). Turns Module 9's admin-assisted claim flow into merchant self-service: evidence-backed claim submission, an admin evidence-review UI (claimant info, evidence gallery, duplicate-awareness banner), and an admin-only business duplicate consolidation workflow that acts on Module 11's duplicate signals (atomic offer reassignment, soft-remove with full audit trail, four independent safety guards). Admin approval and OTP-gated ownership transfer remain mandatory throughout — nothing here bypasses human review. |

**Note:** during Module 1 verification, an unrelated pre-existing issue was found — AWS flagged the backend's S3 credentials as compromised (`AWSCompromisedKeyQuarantineV3`), blocking file reads (e.g. KYC document retrieval). This does not affect any Module 1 code and does not block Module 1's completion, but needs credential rotation independently — tracked separately, not part of this roadmap's feature scope.

**Note:** during Module 3 verification, the Neon Postgres project temporarily exhausted its free-tier compute-time quota mid-verification, causing brief production 500s on database-backed endpoints. Resolved by upgrading the Neon plan (Launch tier). Unrelated to Module 3's code — flagged here since it's an infra/billing concern worth tracking, not a code defect.

**Note:** Module 7 built `/api/health`'s S3 reachability check, which immediately surfaced that the Module 1 `AWSCompromisedKeyQuarantineV3` issue above never actually cleared — the IAM user is still under an active quarantine even after a full credential rotation (new access key created, applied to Render, verified in use). A new AWS Support case is open (Case ID `178454777500456`) requesting removal of the quarantine policy. Concretely, this means `GetObject` is denied (admin KYC document preview/download is broken) while `PutObject` still works (uploads and normal browsing are unaffected). **Status: Pending AWS Support — external dependency, not a Module 7 or Module 1 code defect.** Re-confirmed still active during Module 12 Phase 3 (2026-07-22) — `GetObject` still denied with the same `AWSCompromisedKeyQuarantineV3` explicit-deny error, upload paths still unaffected. See the Module 12 note below for the related frontend fix.

**Note:** Module 8's outbound lead-alert WhatsApp sends require a Meta-approved message template (`new_lead_alert`) — business-initiated messages outside a 24h customer session window can't use freeform text, per WhatsApp Business Messaging Policy. Production verification confirmed the entire pipeline (number resolution, send, retry, `WhatsAppMessage` logging, leads-list status) is correct, correctly logging `whatsappStatus: "FAILED"` with Meta's real error (`template does not exist`) until the template is submitted and approved (3-10 day Meta review). **Status: Pending Meta template approval — external dependency, not a Module 8 code defect.** Every lead alert will start succeeding the moment approval lands, with no code changes required. Module 9 production verification (below) re-confirmed this exact same known state — not a new or Module 9-caused issue.

**Note:** Module 9's `UrlFetchService` has one documented, accepted security limitation: it resolves and validates the target hostname before fetching, but does not re-validate on the actual connection, so a theoretical DNS-rebinding attack (the hostname resolves to a public IP at check-time, then to a private/internal IP at connect-time) isn't fully closed. Acceptable for an admin-only v1 (reviewed and accepted at Phase 2 approval) — tracked as a Tier 2 hardening item if this feature ever becomes accessible to non-admin users.

**Note:** Module 9's merchant claim flow (`/claim/:businessId`) is reachable but has no discovery entry point yet — no "Is this your business?" prompt exists on any public offer/business page. Deliberately deferred to keep zero touches to customer-facing code in this module; revisit once the flow has real-world admin-assisted usage to learn from.

**Note:** Module 11's AI enrichment is deliberately rule-based/deterministic for v1 (Decision 1's staged approach) — no LLM provider is wired up yet. The `EnrichmentProvider` abstraction is already provider-agnostic, so a future OpenAI-backed implementation (the stated preferred provider, given existing OpenAI integration experience elsewhere in the platform) plugs in behind the same interface with no changes to the surrounding pipeline.

**Note:** Module 11's `tags`/`keywords` fields are populated directly by enrichment at import time rather than gated behind admin acceptance the way `category`/`offer_type`/`merchant_type` suggestions are — "Reject" on those two fields in the review UI leaves them as enrichment set them rather than reverting to empty. Documented, accepted behavior; revisit only if merchant/admin feedback indicates a need for manual tag management.

**Note:** Module 10's poster/PDF import is scoped to JPEG, PNG, WebP, and text-layer PDFs only — scanned/image-only PDFs fail gracefully with a clear `UNSUPPORTED_SCANNED_PDF` reason rather than silently producing junk. Tesseract.js was chosen as the OCR provider (free, no new infra) behind a swappable `OcrService` interface; a future move to AWS Textract or another provider only requires reimplementing that one service. The first OCR call in any given backend process incurs a one-time ~5MB language-model download — see RUNBOOK.md.

**Note:** Module 10's poster/PDF thumbnail previews reuse the same `document-preview` proxy as KYC document previews, so they inherit the exact same pre-existing `AWSCompromisedKeyQuarantineV3` `GetObject` limitation described above (Case `178454777500456`) when that quarantine is active — not a new or Module 10-caused issue.

**Note:** Module 12 Phase 3 found and fixed a real (pre-existing, not
Module-12-caused) frontend bug while building the claim-evidence viewer:
`adminFilePreview.js`'s `getDocumentPreviewUrl`/`getDocumentDownloadUrl`
were passing any `https://` URL straight through unproxied, including
private S3 URLs, which 403 in the browser independent of the
`AWSCompromisedKeyQuarantineV3` quarantine above. Fixed to route S3 URLs
through the authenticated `document-preview` proxy. However, the
quarantine itself (still open, Case `178454777500456`) means live
image/PDF preview rendering could not be given a final end-to-end
browser confirmation as of Module 12 — the proxy-routing fix is verified
correct up to the point the backend's AWS SDK `GetObject` call is denied.
**Action once AWS clears the quarantine:** re-verify KYC, Module 10
poster/PDF, and Module 12 claim-evidence previews all render correctly
through the proxy.

**Note:** Module 12 Phase 4's business duplicate consolidation only ever
operates on `UNCLAIMED` businesses (matching Module 11 Phase 2's
duplicate detector, which only ever compares within that pool) — it can
never reassign or remove a real merchant's claimed business. The
"suspected canonical business" reference in the admin review banner shows
the candidate's raw ID rather than a resolved name (no admin
single-business-by-id lookup endpoint exists yet — the same limitation
Module 11's business-duplicate banner already had), and there is no
"not a duplicate" dismissal action yet (a false-positive flag is simply
inert if left alone). Both are minor, deferred enhancements, not
blockers.

**Sentry / uptime monitoring status (Module 7):**
- **Backend error tracking (Sentry):** ✅ Completed and verified — a test exception was confirmed delivered to the `pairley-backend` Sentry project.
- **Web frontend error tracking (Sentry):** ✅ Completed and verified — a test exception was confirmed delivered to the `pairley-frontend` Sentry project.
- **Android error tracking (Sentry):** ⏸ **Deferred** — verification postponed until the Android release is finalized. The same `@sentry/react` initialization ships in the Capacitor build; only the Android-specific release/build verification is outstanding, not a missing integration.
- **External uptime monitoring (UptimeRobot or equivalent):** ⏸ **Deferred** — planned alongside an upcoming Render paid-plan upgrade. `/api/health` is live and ready to be polled; standing up the external monitor is being treated as a post-launch operational task rather than a Module 7 coding blocker, per explicit direction.

---

## PHASE 1 — Pairley 1.0

### Objective
Build a hyperlocal marketplace where local businesses can easily promote offers and nearby customers can discover them. The focus is rapid merchant onboarding and customer acquisition.

### Merchant Features
- Merchant Registration
- OTP Verification
- Merchant Dashboard
- Create Offer
- Edit Offer
- Delete Offer
- Categories
  - BOGO Offers
  - Combo Deals
  - Seasonal Offers
  - Flat Discounts
  - Cashback Offers
- Publish Offer
- Offer Analytics
- WhatsApp Notifications
- Business Profile
- Gallery
- Store Timing
- Location

### Customer Features
- Registration
- Google Login
- Discover Nearby Offers
- Category Search
- Location Filter
- Offer Details
- Show Interest
- Save Offer
- Share Offer
- Notifications
- Profile

### Admin Features
- Merchant Approval
- Offer Moderation
- Categories
- Analytics
- Reports
- Customer Management
- Merchant Management

### Business Flow
Merchant Registers → Publishes Offer → Customer Discovers Offer → Customer Shows Interest → Merchant Receives Notification → Customer Visits Store

### Objective
Acquire: Merchants, Customers, Offers — create marketplace liquidity.

---

## PHASE 2 — Pairley 2.0

### Objective
Transform Pairley into an AI-powered Demand Intelligence Marketplace. Instead of waiting for merchants to publish offers, Pairley discovers offers automatically using AI.

### AI Offer Engine
AI imports public offers from:
- Business Website
- Instagram
- Facebook
- Offer Posters
- PDFs
- Images
- WhatsApp Flyers

AI extracts:
- Business Name
- Offer Title
- Category
- Original Price
- Discount
- Validity
- Images
- Location
- Contact Number

AI converts them into Pairley's standard offer format.

### AI Confidence Score
Every imported offer should have:
- Confidence %
- Needs Review
- Auto Approved
- Pending Merchant Verification

### Customer Demand Engine
Instead of simply viewing offers, customers can express purchase intent. Each offer includes:
- Show Interest
- Preferred Price Selection (within merchant-defined limits)
- Save Offer
- Notify Me

Store: Customer, Location, Preferred Price, Timestamp

### Merchant Demand Notification
When customers show interest, automatically notify the merchant via WhatsApp.

Example:
> Great news! 42 nearby customers have shown interest in your Summer Sale. Claim your FREE Pairley Merchant Account to view customer insights and manage your offers.

### Merchant Claim Flow
Merchant receives WhatsApp → Clicks Claim Business → OTP Verification → Merchant Dashboard → Views interested customers → Accepts or rejects customer demand.

### AI Features
- **AI Offer Import** — Automatically import public offers.
- **AI OCR** — Read posters, banners, brochures.
- **AI Offer Generator** — Convert posters into beautiful Pairley cards.
- **AI Deal Optimizer** — Suggest better headlines, images, pricing, validity.
- **AI Demand Prediction** — Predict best offer price, expected customer demand, peak shopping hours, popular locations.
- **AI Merchant Assistant** — Chatbot for merchants (e.g. "Create Diwali Offer", "Generate BOGO", "Suggest Weekend Offer", "Improve my conversion").
- **AI Customer Assistant** — Recommend nearby offers, personalized deals, trending offers, favorite categories.

### Public Offer Discovery Engine
Automatically discover public offers from:
- Website
- Instagram
- Facebook
- Google Business
- Digital Posters
- Mall Screens
- Public Advertisements
- Retail Catalogues
- Merchant Flyers

Convert into Pairley Standard Offer Cards.

### Pairley Intelligence Layer
Track:
- Interested Customers
- Price Distribution
- Popular Categories
- Conversion Rate
- Merchant Performance
- Trending Offers
- Local Demand
- Shopping Heatmaps

---

## Long-Term Vision

Pairley evolves through four stages:

1. **Marketplace** — Merchants publish offers.
2. **AI Marketplace** — AI imports public offers.
3. **Demand Intelligence** — Customers express intent; businesses receive qualified demand.
4. **Autonomous Commerce** — AI recommends offers, predicts demand, automates campaigns, optimizes pricing, and provides real-time business insights.

---

## UI Theme
Premium SaaS — inspired by Apple, Stripe, Linear, Notion.
- Glassmorphism
- Purple, Green, White
- Responsive
- PWA
- Capacitor Compatible
- Mobile First

---

## Final Goal
Create the most intelligent hyperlocal commerce platform in India where:
- Customers discover the best local offers.
- Merchants attract nearby customers with minimal effort.
- AI continuously imports and enriches public offers.
- Demand insights help businesses make smarter decisions.
- Pairley becomes the bridge between public offers, customer demand, and merchant growth.
