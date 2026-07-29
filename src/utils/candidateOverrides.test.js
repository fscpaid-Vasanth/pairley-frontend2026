import { describe, it, expect } from 'vitest';
import {
  buildCandidateOverrides,
  hasCandidateEdits,
  validateCandidateEdits,
  fieldValue,
} from './candidateOverrides';

describe('buildCandidateOverrides', () => {
  it('passes text fields through, trimmed', () => {
    expect(buildCandidateOverrides({ title: '  Spec Gym Offer  ' })).toEqual({
      title: 'Spec Gym Offer',
    });
  });

  it('converts numeric fields from the strings inputs produce', () => {
    expect(
      buildCandidateOverrides({
        originalPrice: '30000',
        offerPrice: '6000',
        requiredPeople: '5',
      }),
    ).toEqual({ originalPrice: 30000, offerPrice: 6000, requiredPeople: 5 });
  });

  it('converts date inputs to ISO strings', () => {
    const result = buildCandidateOverrides({ startDate: '2026-08-01' });
    expect(result.startDate).toMatch(/^2026-08-01T/);
  });

  // The backend contract is "omitted means unchanged", so an untouched or
  // cleared field must not appear in the payload at all.
  it('drops empty values rather than sending them', () => {
    expect(
      buildCandidateOverrides({
        title: '',
        originalPrice: '',
        startDate: '',
        description: null,
        subtitle: undefined,
      }),
    ).toEqual({});
  });

  it('drops a non-numeric value in a numeric field instead of sending NaN', () => {
    expect(buildCandidateOverrides({ originalPrice: 'abc' })).toEqual({});
  });

  it('drops a negative price', () => {
    expect(buildCandidateOverrides({ offerPrice: '-100' })).toEqual({});
  });

  it('drops an unparseable date instead of sending Invalid Date', () => {
    expect(buildCandidateOverrides({ endDate: 'not-a-date' })).toEqual({});
  });

  it('keeps a legitimate zero price', () => {
    expect(buildCandidateOverrides({ offerPrice: '0' })).toEqual({
      offerPrice: 0,
    });
  });

  it('returns an empty payload for no edits', () => {
    expect(buildCandidateOverrides({})).toEqual({});
    expect(buildCandidateOverrides(undefined)).toEqual({});
  });

  it('carries business fields alongside offer fields', () => {
    expect(
      buildCandidateOverrides({
        title: 'Offer',
        businessName: 'Spec Gym',
        businessMobile: '9876543210',
      }),
    ).toEqual({
      title: 'Offer',
      businessName: 'Spec Gym',
      businessMobile: '9876543210',
    });
  });
});

describe('hasCandidateEdits', () => {
  it('is false when every edit resolves to nothing sendable', () => {
    expect(hasCandidateEdits({})).toBe(false);
    expect(hasCandidateEdits({ title: '', originalPrice: 'abc' })).toBe(false);
  });

  it('is true once one real edit exists', () => {
    expect(hasCandidateEdits({ title: 'x' })).toBe(true);
  });
});

describe('validateCandidateEdits', () => {
  const candidate = {
    original_price: 30000,
    offer_price: 6000,
    start_date: '2026-01-01T00:00:00.000Z',
    end_date: '2026-06-01T00:00:00.000Z',
  };

  it('accepts an untouched candidate', () => {
    expect(validateCandidateEdits({}, candidate)).toBeNull();
  });

  it('rejects an offer price above the original price', () => {
    expect(
      validateCandidateEdits(
        { originalPrice: '1000', offerPrice: '2000' },
        candidate,
      ),
    ).toMatch(/cannot be higher/);
  });

  // Editing one side of a pair is the common case — the check has to use
  // the stored value for the side that wasn't touched.
  it('compares a single edited price against the stored one', () => {
    expect(validateCandidateEdits({ offerPrice: '40000' }, candidate)).toMatch(
      /cannot be higher/,
    );
    expect(validateCandidateEdits({ originalPrice: '3000' }, candidate)).toMatch(
      /cannot be higher/,
    );
  });

  it('accepts equal prices, which is a legitimate no-discount offer', () => {
    expect(
      validateCandidateEdits(
        { originalPrice: '5000', offerPrice: '5000' },
        candidate,
      ),
    ).toBeNull();
  });

  it('rejects an end date on or before the start date', () => {
    expect(
      validateCandidateEdits(
        { startDate: '2026-05-01', endDate: '2026-04-01' },
        candidate,
      ),
    ).toMatch(/End date/);
    expect(
      validateCandidateEdits(
        { startDate: '2026-05-01', endDate: '2026-05-01' },
        candidate,
      ),
    ).toMatch(/End date/);
  });

  it('compares a single edited date against the stored one', () => {
    expect(validateCandidateEdits({ endDate: '2025-01-01' }, candidate)).toMatch(
      /End date/,
    );
  });

  it('does not invent errors when the candidate has no stored values yet', () => {
    expect(validateCandidateEdits({ title: 'x' }, {})).toBeNull();
    expect(validateCandidateEdits({ title: 'x' }, undefined)).toBeNull();
  });
});

describe('fieldValue', () => {
  it('shows the extracted value until the admin edits the field', () => {
    expect(fieldValue({}, 'title', 'Extracted Title')).toBe('Extracted Title');
  });

  it('shows the admin’s edit once one exists', () => {
    expect(fieldValue({ title: 'Mine' }, 'title', 'Extracted')).toBe('Mine');
  });

  // Distinguishing "edited to empty" from "never touched" is the whole point
  // of tracking edits separately from extracted values.
  it('respects an edit that cleared the field', () => {
    expect(fieldValue({ title: '' }, 'title', 'Extracted')).toBe('');
  });

  it('falls back to an empty string when nothing was extracted', () => {
    expect(fieldValue({}, 'subtitle', null)).toBe('');
    expect(fieldValue({}, 'subtitle', undefined)).toBe('');
  });
});
