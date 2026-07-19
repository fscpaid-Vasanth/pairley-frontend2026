// Single source of truth for how an offer's `offer_type` is interpreted and
// displayed across the app. Every page that used to inline-map offer_type
// to a label/icon/pair-vs-group decision should import from here instead.

// Pairley 1.0 legacy matching mechanics — kept working exactly as before,
// now presented to merchants as an "Advanced: Legacy Matching Type" option
// rather than the default creation flow. Must never be removed.
export const LEGACY_OFFER_TYPES = [
  'BOGO',
  'BOGT',
  'GROUP_DISCOUNT',
  'BULK_PURCHASE',
  'MEMBERSHIP_CAMPAIGN',
  'PACKAGE_DEAL',
];

// Pairley 1.0 new/simplified offer types — Show Interest -> Lead ->
// Merchant Dashboard flow, no chat/matching/waiting.
export const STANDARD_OFFER_TYPES = [
  'STANDARD',
  'BUY_X_GET_Y',
  'FLAT_DISCOUNT',
  'PERCENTAGE_DISCOUNT',
  'CASHBACK',
  'COMBO',
  'SEASONAL',
  'FESTIVAL',
  'FLASH_DEAL',
  'LIMITED_QUANTITY',
  'LIMITED_TIME',
];

const OFFER_TYPE_META = {
  STANDARD: { label: 'Standard Offer', shortLabel: 'Offer', icon: '🏷️' },
  BOGO: { label: 'Pair Deal (BOGO)', shortLabel: 'Pair', icon: '🤝' },
  BOGT: { label: 'Buy One Get One (Tiered)', shortLabel: 'Pair', icon: '🤝' },
  GROUP_DISCOUNT: { label: 'Group Deal', shortLabel: 'Group', icon: '👥' },
  BULK_PURCHASE: { label: 'Bulk Purchase', shortLabel: 'Group', icon: '👥' },
  MEMBERSHIP_CAMPAIGN: { label: 'Membership Campaign', shortLabel: 'Group', icon: '👥' },
  PACKAGE_DEAL: { label: 'Package Deal', shortLabel: 'Group', icon: '👥' },
  BUY_X_GET_Y: { label: 'Buy X Get Y', shortLabel: 'Buy X Get Y', icon: '➕' },
  FLAT_DISCOUNT: { label: 'Flat Discount', shortLabel: 'Flat Discount', icon: '💰' },
  PERCENTAGE_DISCOUNT: { label: 'Percentage Off', shortLabel: '% Off', icon: '📉' },
  CASHBACK: { label: 'Cashback', shortLabel: 'Cashback', icon: '↩️' },
  COMBO: { label: 'Combo Offer', shortLabel: 'Combo', icon: '🍱' },
  SEASONAL: { label: 'Seasonal Offer', shortLabel: 'Seasonal', icon: '🍂' },
  FESTIVAL: { label: 'Festival Offer', shortLabel: 'Festival', icon: '🎉' },
  FLASH_DEAL: { label: 'Flash Deal', shortLabel: 'Flash Deal', icon: '⚡' },
  LIMITED_QUANTITY: { label: 'Limited Quantity', shortLabel: 'Limited Qty', icon: '⏳' },
  LIMITED_TIME: { label: 'Limited Time', shortLabel: 'Limited Time', icon: '⏰' },
};

const normalize = (offerType) => (offerType || 'STANDARD').toString().toUpperCase();

export function getOfferTypeMeta(offerType) {
  const key = normalize(offerType);
  return OFFER_TYPE_META[key] || OFFER_TYPE_META.STANDARD;
}

export function getOfferTypeLabel(offerType) {
  return getOfferTypeMeta(offerType).label;
}

export function getOfferTypeIcon(offerType) {
  return getOfferTypeMeta(offerType).icon;
}

// True for the legacy matching mechanics (BOGO, BOGT, GROUP_DISCOUNT,
// BULK_PURCHASE, MEMBERSHIP_CAMPAIGN, PACKAGE_DEAL) — the only types that
// still use OfferInterest/capacity tracking/matching instead of the
// simplified Show Interest -> Lead flow.
export function isLegacyMatchingType(offerType) {
  return LEGACY_OFFER_TYPES.includes(normalize(offerType));
}

// True for the two-person "pair" mechanics (BOGO/BOGT) specifically, as
// opposed to the multi-person "group" mechanics — used by pages that show
// a pair/group binary badge or icon.
export function isPairMechanic(offerType) {
  const key = normalize(offerType);
  return key === 'BOGO' || key === 'BOGT';
}

// True for the multi-person "group" legacy mechanics.
export function isGroupMechanic(offerType) {
  return isLegacyMatchingType(offerType) && !isPairMechanic(offerType);
}

// Derives the local pair/group/standard mode a deal object should use for
// display. Prefers an already-computed `mode` field (used by mock/legacy
// data that never carried a real offer_type), otherwise derives it from
// `offer_type`.
export function getDealMode(offerTypeOrDeal) {
  if (typeof offerTypeOrDeal === 'string') {
    return isLegacyMatchingType(offerTypeOrDeal) ? (isPairMechanic(offerTypeOrDeal) ? 'pair' : 'group') : 'standard';
  }
  const deal = offerTypeOrDeal || {};
  if (deal.offer_type) {
    return isLegacyMatchingType(deal.offer_type) ? (isPairMechanic(deal.offer_type) ? 'pair' : 'group') : 'standard';
  }
  if (deal.mode === 'pair' || deal.mode === 'group') return deal.mode;
  return 'standard';
}
