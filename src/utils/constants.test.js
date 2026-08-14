import { describe, it, expect } from 'vitest';
import { calculateSavings } from './constants';

// 2026-08-14 — pairleyPrice is 0 for a deal with no verified numeric price
// (BOGO/percentage/couple/group offers are all valid Pairley deals without
// one — see ai-offers-from-online.service.ts). A naive (original - 0)
// calculation would report "100% OFF", which is actively wrong; this must
// return no savings figure at all instead.
describe('calculateSavings', () => {
  it('computes real savings for a genuinely priced deal', () => {
    expect(calculateSavings(2000, 999)).toEqual({ saved: 1001, percentage: 50 });
  });

  it('returns no savings for a 0 (no verified price) pairleyPrice — never "100% OFF"', () => {
    expect(calculateSavings(2000, 0)).toEqual({ saved: null, percentage: null });
  });

  it('returns no savings for a null/undefined pairleyPrice', () => {
    expect(calculateSavings(2000, null)).toEqual({ saved: null, percentage: null });
    expect(calculateSavings(2000, undefined)).toEqual({ saved: null, percentage: null });
  });

  it('returns no savings when originalPrice itself is 0/missing — never a divide-by-zero percentage', () => {
    expect(calculateSavings(0, 500)).toEqual({ saved: null, percentage: null });
    expect(calculateSavings(null, 500)).toEqual({ saved: null, percentage: null });
  });
});
