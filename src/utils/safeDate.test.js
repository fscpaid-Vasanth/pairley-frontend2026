import { describe, it, expect } from 'vitest';
import { isValidDate, toDateOnly, toIsoOrNull, toDisplayDate } from './safeDate';

// Regression coverage for the production crash: customer order history failed
// entirely with "RangeError: Invalid time value" because offer_interests has no
// updated_at column, so item.updated_at was undefined and toISOString() threw
// mid-.map(), taking the whole list with it.

describe('safeDate', () => {
  describe('the exact production failure', () => {
    it('does not throw on undefined — the offer_interests.updated_at case', () => {
      expect(() => toDateOnly(undefined)).not.toThrow();
      expect(toDateOnly(undefined)).toBeNull();
    });

    it('survives mapping a list where one row has a missing date', () => {
      // Previously one bad row failed the entire history load.
      const rows = [
        { created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-02T10:00:00Z' },
        { created_at: '2026-07-03T10:00:00Z', updated_at: undefined },
        { created_at: '2026-07-04T10:00:00Z', updated_at: null },
      ];
      const mapped = rows.map((r) => ({
        date: toDateOnly(r.created_at),
        matchDate: toDateOnly(r.updated_at),
      }));

      expect(mapped).toHaveLength(3);
      expect(mapped[0].matchDate).toBe('2026-07-02');
      expect(mapped[1].matchDate).toBeNull();
      expect(mapped[2].matchDate).toBeNull();
    });
  });

  describe('toDateOnly', () => {
    it('formats a valid ISO string as YYYY-MM-DD', () => {
      expect(toDateOnly('2026-07-31T18:30:00.000Z')).toBe('2026-07-31');
    });

    it('accepts a Date instance', () => {
      expect(toDateOnly(new Date('2026-07-31T00:00:00Z'))).toBe('2026-07-31');
    });

    it('returns the fallback for null, undefined and empty string', () => {
      expect(toDateOnly(null)).toBeNull();
      expect(toDateOnly(undefined)).toBeNull();
      expect(toDateOnly('')).toBeNull();
      expect(toDateOnly('', '')).toBe('');
    });

    it('returns the fallback for an unparseable non-empty string', () => {
      // The old `d ? new Date(d).toISOString()` guard let this through.
      expect(toDateOnly('not-a-date')).toBeNull();
      expect(toDateOnly('not-a-date', '')).toBe('');
    });
  });

  describe('toIsoOrNull', () => {
    it('returns a full ISO string for valid input', () => {
      expect(toIsoOrNull('2026-07-31T18:30:00.000Z')).toBe('2026-07-31T18:30:00.000Z');
    });

    it('returns the fallback rather than throwing on bad input', () => {
      expect(toIsoOrNull(undefined)).toBeNull();
      expect(toIsoOrNull('garbage')).toBeNull();
    });
  });

  describe('toDisplayDate', () => {
    it('renders a human date for valid input', () => {
      expect(toDisplayDate('2026-11-15T00:00:00Z')).toMatch(/2026/);
    });

    it('renders the em-dash placeholder rather than throwing', () => {
      expect(toDisplayDate(undefined)).toBe('—');
      expect(toDisplayDate('garbage')).toBe('—');
    });
  });

  describe('isValidDate', () => {
    it('distinguishes parseable from unparseable values', () => {
      expect(isValidDate('2026-07-31')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate('nope')).toBe(false);
      expect(isValidDate(new Date('nope'))).toBe(false);
    });
  });
});
