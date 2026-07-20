# Changelog

Tracks Pairley MVP module deliveries, per [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Each entry covers both repos (frontend + [`pairley-backend2026`](https://github.com/fscpaid-Vasanth/pairley-backend2026)).

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
