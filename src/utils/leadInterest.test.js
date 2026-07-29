import { describe, it, expect } from 'vitest';
import { isDuplicateInterestError, formatLeadStatusLabel } from './leadInterest';

// Module 13 — isDuplicateInterestError is a string-matching contract with
// the backend's exact error text (OfferService.createLead's
// BadRequestException message when Lead's @@unique([customer_id, offer_id])
// rejects a repeat interest). If the wording ever drifts on either side
// without the other changing, a real duplicate-interest error silently
// falls through to the generic "failed to send interest" error toast
// instead of resyncing InterestButton from the backend — these tests pin
// the exact string both sides currently agree on.
describe('isDuplicateInterestError', () => {
  it('matches the exact backend duplicate-lead message', () => {
    expect(isDuplicateInterestError('You have already expressed interest in this deal.')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isDuplicateInterestError('YOU HAVE ALREADY EXPRESSED INTEREST IN THIS DEAL.')).toBe(true);
  });

  it('does not match an unrelated error message', () => {
    expect(isDuplicateInterestError('Offer not found')).toBe(false);
    expect(isDuplicateInterestError('Network request failed')).toBe(false);
  });

  it('handles missing/empty input without throwing', () => {
    expect(isDuplicateInterestError(undefined)).toBe(false);
    expect(isDuplicateInterestError(null)).toBe(false);
    expect(isDuplicateInterestError('')).toBe(false);
  });
});

describe('formatLeadStatusLabel', () => {
  it('maps every known Lead status to a customer-facing label', () => {
    expect(formatLeadStatusLabel('NEW')).toBe('Waiting for Merchant Response');
    expect(formatLeadStatusLabel('CONTACTED')).toBe('Merchant Has Responded');
    expect(formatLeadStatusLabel('CONVERTED')).toBe('Merchant Has Responded');
    expect(formatLeadStatusLabel('NOT_INTERESTED')).toBe('Merchant Marked This Not Interested');
  });

  it('falls back to the waiting label for an unknown/missing status', () => {
    expect(formatLeadStatusLabel('SOMETHING_NEW')).toBe('Waiting for Merchant Response');
    expect(formatLeadStatusLabel(undefined)).toBe('Waiting for Merchant Response');
  });
});
