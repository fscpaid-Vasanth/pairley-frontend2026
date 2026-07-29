// Module 14 Phase 1 — turning the candidate review form into the payload
// the backend's CandidateOverrides contract expects.
//
// The contract is "an omitted field means unchanged", so the form tracks
// only what the admin actually touched. This module is what converts those
// raw input strings into typed values, and it is deliberately separate from
// the modal so the conversion rules are unit-testable on their own.

const NUMERIC_FIELDS = new Set(['originalPrice', 'offerPrice', 'requiredPeople']);
const DATE_FIELDS = new Set(['startDate', 'endDate']);

/**
 * Builds the API payload from the admin's edits.
 *
 * A field the admin cleared to an empty string is dropped rather than sent
 * as `""` — for a price or date that would be meaningless, and for text it
 * would silently blank a field the admin more likely just tabbed through.
 * Clearing a value deliberately isn't something this form offers.
 */
export function buildCandidateOverrides(edits) {
  const payload = {};

  Object.entries(edits || {}).forEach(([key, raw]) => {
    if (raw === undefined || raw === null || raw === '') return;

    if (NUMERIC_FIELDS.has(key)) {
      const numeric = Number(raw);
      if (!Number.isFinite(numeric) || numeric < 0) return;
      payload[key] = numeric;
      return;
    }

    if (DATE_FIELDS.has(key)) {
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return;
      payload[key] = date.toISOString();
      return;
    }

    payload[key] = typeof raw === 'string' ? raw.trim() : raw;
  });

  return payload;
}

export function hasCandidateEdits(edits) {
  return Object.keys(buildCandidateOverrides(edits)).length > 0;
}

/**
 * Client-side mirror of the backend's coherence checks, run against the
 * *effective* values — an admin who edits only one side of a pair still has
 * to end up with a coherent offer. This exists for immediate feedback, not
 * as the enforcement point: the backend rejects the same cases regardless of
 * what this returns.
 *
 * @returns {string|null} an error message, or null when the edit is fine
 */
export function validateCandidateEdits(edits, candidate) {
  const overrides = buildCandidateOverrides(edits);

  const originalPrice = overrides.originalPrice ?? candidate?.original_price;
  const offerPrice = overrides.offerPrice ?? candidate?.offer_price;
  if (
    typeof originalPrice === 'number' &&
    typeof offerPrice === 'number' &&
    offerPrice > originalPrice
  ) {
    return 'Offer price cannot be higher than the original price.';
  }

  const startDate = overrides.startDate ?? candidate?.start_date;
  const endDate = overrides.endDate ?? candidate?.end_date;
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    return 'End date must be after the start date.';
  }

  return null;
}

/**
 * The value to show in a form field: the admin's edit if they've made one,
 * otherwise what was extracted. Keeps every input controlled without having
 * to seed the whole form into state on load — which matters because seeding
 * would make every field look "edited" and send the entire record back on
 * save.
 */
export function fieldValue(edits, name, extracted) {
  return Object.prototype.hasOwnProperty.call(edits || {}, name)
    ? edits[name]
    : (extracted ?? '');
}
