// Module 13 — small pure helpers pulled out of InterestButton/LeadsPage so
// the fragile bits (a string-matching contract with the backend's exact
// error text, and the lead-status-to-copy mapping) are unit-testable
// without needing a component-rendering test setup (this repo only has
// vitest/jsdom, no @testing-library/react).

// Mirrors the exact message OfferService.createLead throws when
// Lead's @@unique([customer_id, offer_id]) rejects a second interest (see
// offer.service.ts). If that message ever changes on the backend without a
// matching change here, a genuine duplicate-interest error would fall
// through to the generic "Failed to send interest" toast instead of
// triggering a resync — this test exists to catch that drift.
export function isDuplicateInterestError(message) {
  return (message || '').toLowerCase().includes('already expressed interest');
}

export const LEAD_STATUS_LABEL = {
  NEW: 'Waiting for Merchant Response',
  CONTACTED: 'Merchant Has Responded',
  CONVERTED: 'Merchant Has Responded',
  NOT_INTERESTED: 'Merchant Marked This Not Interested',
};

export function formatLeadStatusLabel(status) {
  return LEAD_STATUS_LABEL[status] || 'Waiting for Merchant Response';
}
