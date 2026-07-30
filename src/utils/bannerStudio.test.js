import { describe, it, expect } from 'vitest';
import {
  changeTypeLabel,
  suitabilityBand,
  nextWatermarkState,
  watermarkStateLabel,
  buildWatermarkFlags,
  formatFileSize,
  formatDimensions,
} from './bannerStudio';

describe('changeTypeLabel', () => {
  it('labels every known change type', () => {
    expect(changeTypeLabel('BANNER_GENERATED')).toBe('Generated');
    expect(changeTypeLabel('BANNER_TEMPLATE_CHANGED')).toBe('Template changed');
    expect(changeTypeLabel('BANNER_IMAGE_REPLACED')).toBe('Image replaced');
    expect(changeTypeLabel('BANNER_REGENERATED')).toBe('Regenerated');
  });

  it('falls back to the raw value for an unknown type, never to a blank label', () => {
    expect(changeTypeLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });

  it('falls back to a generic label for nothing at all', () => {
    expect(changeTypeLabel(null)).toBe('Updated');
    expect(changeTypeLabel(undefined)).toBe('Updated');
  });
});

describe('suitabilityBand', () => {
  it.each([
    [100, 'HIGH'],
    [70, 'HIGH'],
    [69, 'MEDIUM'],
    [40, 'MEDIUM'],
    [39, 'LOW'],
    [0, 'LOW'],
  ])('bands %s as %s', (score, expected) => {
    expect(suitabilityBand(score)).toBe(expected);
  });

  it('treats a missing score as weak, never as good', () => {
    expect(suitabilityBand(null)).toBe('LOW');
    expect(suitabilityBand(undefined)).toBe('LOW');
  });
});

describe('nextWatermarkState (tri-state cycle)', () => {
  it('cycles not-assessed -> flagged -> confirmed-clean -> not-assessed', () => {
    expect(nextWatermarkState(null)).toBe(true);
    expect(nextWatermarkState(true)).toBe(false);
    expect(nextWatermarkState(false)).toBe(null);
  });

  it('treats undefined the same as null — both mean "not assessed"', () => {
    expect(nextWatermarkState(undefined)).toBe(true);
  });
});

describe('watermarkStateLabel', () => {
  it('labels every state', () => {
    expect(watermarkStateLabel(true)).toBe('Watermark flagged');
    expect(watermarkStateLabel(false)).toBe('Confirmed clean');
    expect(watermarkStateLabel(null)).toBe('Not assessed');
    expect(watermarkStateLabel(undefined)).toBe('Not assessed');
  });
});

describe('buildWatermarkFlags', () => {
  it('converts a url->boolean map into the API flag list', () => {
    expect(
      buildWatermarkFlags({ 'https://x/a.jpg': true, 'https://x/b.jpg': false }),
    ).toEqual([
      { url: 'https://x/a.jpg', watermarkSuspected: true },
      { url: 'https://x/b.jpg', watermarkSuspected: false },
    ]);
  });

  // "Not assessed" is the absence of an entry, not a stored null — sending
  // one would falsely claim the admin looked and had no opinion, versus
  // never having looked at all.
  it('omits entries with no opinion (null) rather than sending them', () => {
    expect(buildWatermarkFlags({ 'https://x/a.jpg': null })).toEqual([]);
  });

  it('handles an empty or missing map', () => {
    expect(buildWatermarkFlags({})).toEqual([]);
    expect(buildWatermarkFlags(undefined)).toEqual([]);
  });
});

describe('formatFileSize', () => {
  it('formats bytes, KB and MB appropriately', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('returns an empty string for nothing usable', () => {
    expect(formatFileSize(0)).toBe('');
    expect(formatFileSize(null)).toBe('');
    expect(formatFileSize(NaN)).toBe('');
  });
});

describe('formatDimensions', () => {
  it('formats width and height', () => {
    expect(formatDimensions(1600, 900)).toBe('1600×900');
  });

  it('returns null when either dimension is missing', () => {
    expect(formatDimensions(null, 900)).toBeNull();
    expect(formatDimensions(1600, null)).toBeNull();
    expect(formatDimensions(0, 0)).toBeNull();
  });
});
