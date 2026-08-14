// Shared by AiOffersFromOnlinePanel (the grid) and
// AiOfferFromOnlineDetailModal so both render the exact same status pill —
// same split rationale as claimStatusStyles.js.
export const AI_OFFER_STATUS_STYLES = {
  PENDING_ADMIN_REVIEW: 'bg-orange-50 border-orange-200 text-orange-700',
  MERCHANT_MATCHED: 'bg-indigo-50 border-indigo-200 text-[#5B12D6]',
  // 2026-08-13 — split out of FAILED: these are expected, admin-correctable
  // review states, not processing bugs, so they get their own amber
  // "needs a decision" treatment rather than FAILED's red.
  PRICE_REQUIRED: 'bg-amber-50 border-amber-200 text-amber-700',
  CATEGORY_REQUIRED: 'bg-amber-50 border-amber-200 text-amber-700',
  EXPIRED: 'bg-slate-100 border-slate-300 text-slate-500',
  READY_TO_PUBLISH: 'bg-sky-50 border-sky-200 text-sky-700',
  PUBLISHED: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  FAILED: 'bg-rose-50 border-rose-200 text-rose-700',
  REJECTED: 'bg-slate-100 border-slate-300 text-slate-600',
  DUPLICATE_SUPPRESSED: 'bg-amber-50 border-amber-200 text-amber-700',
};

export const AI_OFFER_STATUS_LABELS = {
  PENDING_ADMIN_REVIEW: 'Pending Review',
  MERCHANT_MATCHED: 'Merchant Matched',
  PRICE_REQUIRED: 'Price Required',
  CATEGORY_REQUIRED: 'Category Required',
  EXPIRED: 'Expired',
  READY_TO_PUBLISH: 'Ready to Publish',
  PUBLISHED: 'Published',
  FAILED: 'Failed',
  REJECTED: 'Rejected',
  DUPLICATE_SUPPRESSED: 'Duplicate',
};
