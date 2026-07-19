# Changelog

Tracks Pairley MVP module deliveries, per [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Each entry covers both repos (frontend + [`pairley-backend2026`](https://github.com/fscpaid-Vasanth/pairley-backend2026)).

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
