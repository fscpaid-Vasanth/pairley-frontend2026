// The one badge a customer ever sees for an offer's origin — computed
// server-side (see offer.service.ts's computeOfferBadge) and passed through
// as `deal.badge`. Never derive this client-side: the raw fields driving it
// (merchant_verified/is_pairley_exclusive/source) are intentionally never
// sent to the client. This file only knows how to *display* the value the
// backend already decided.

const BADGE_META = {
  verified: { label: 'Verified Merchant', icon: '✅' },
  exclusive: { label: 'Pairley Exclusive', icon: '⭐' },
  imported: { label: 'Imported from Public Information', icon: '🌐' },
};

export function getOfferBadgeMeta(badge) {
  return BADGE_META[badge] || null;
}
