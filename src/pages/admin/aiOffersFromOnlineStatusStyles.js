// Shared by AiOffersFromOnlinePanel (the grid) and
// AiOfferFromOnlineDetailModal so both render the exact same status pill —
// same split rationale as claimStatusStyles.js.
export const AI_OFFER_STATUS_STYLES = {
  PENDING_ADMIN_REVIEW: 'bg-orange-50 border-orange-200 text-orange-700',
  MERCHANT_MATCHED: 'bg-indigo-50 border-indigo-200 text-[#5B12D6]',
  READY_TO_PUBLISH: 'bg-sky-50 border-sky-200 text-sky-700',
  PUBLISHED: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  FAILED: 'bg-rose-50 border-rose-200 text-rose-700',
  REJECTED: 'bg-slate-100 border-slate-300 text-slate-600',
};

export const AI_OFFER_STATUS_LABELS = {
  PENDING_ADMIN_REVIEW: 'Pending Review',
  MERCHANT_MATCHED: 'Merchant Matched',
  READY_TO_PUBLISH: 'Ready to Publish',
  PUBLISHED: 'Published',
  FAILED: 'Failed',
  REJECTED: 'Rejected',
};
