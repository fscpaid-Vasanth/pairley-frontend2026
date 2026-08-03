import { describe, it, expect } from 'vitest';
import {
  stripGeneratedBlock,
  dealEntry,
  GENERATED_START,
  GENERATED_END,
} from './generate-sitemap.js';

// Regression coverage for a real bug found while testing this script:
// stripGeneratedBlock originally built a RegExp directly from the marker
// strings (`new RegExp(GENERATED_START + '...' + GENERATED_END)`). The
// marker text contains regex metacharacters — parentheses and a dot, from
// "(scripts/generate-sitemap.js)" — which a naive interpolation never
// escapes. The regex silently matched nothing, so a second run of the
// script appended a second generated block instead of replacing the
// first, duplicating every deal URL. Confirmed manually (three
// consecutive runs against the live sitemap) before rewriting this as a
// plain indexOf/slice, which has no metacharacter-escaping problem to get
// wrong in the first place.
describe('stripGeneratedBlock', () => {
  const staticSitemap = [
    '<?xml version="1.0"?>',
    '<urlset>',
    '  <url><loc>https://www.pairley.com/</loc></url>',
    '</urlset>',
  ].join('\n');

  const withOneGeneratedBlock = [
    '<?xml version="1.0"?>',
    '<urlset>',
    '  <url><loc>https://www.pairley.com/</loc></url>',
    GENERATED_START,
    '  <url><loc>https://www.pairley.com/deals/abc</loc></url>',
    GENERATED_END,
    '</urlset>',
  ].join('\n');

  it('leaves a sitemap with no generated block untouched (first-ever run)', () => {
    expect(stripGeneratedBlock(staticSitemap)).toBe(staticSitemap.trim());
  });

  it('removes exactly one previously-generated block', () => {
    const result = stripGeneratedBlock(withOneGeneratedBlock);
    expect(result).not.toContain(GENERATED_START);
    expect(result).not.toContain('deals/abc');
    expect(result).toContain('https://www.pairley.com/');
  });

  // The actual bug: running strip -> regenerate -> strip again must return
  // to exactly the static baseline, not accumulate a second block.
  it('is idempotent across repeated strip/regenerate cycles', () => {
    const afterFirstStrip = stripGeneratedBlock(withOneGeneratedBlock);
    const regenerated =
      afterFirstStrip.replace(
        '</urlset>',
        `\n${GENERATED_START}\n  <url><loc>https://www.pairley.com/deals/xyz</loc></url>\n${GENERATED_END}\n\n</urlset>`,
      );
    const afterSecondStrip = stripGeneratedBlock(regenerated);

    expect(afterSecondStrip).not.toContain(GENERATED_START);
    expect(afterSecondStrip).not.toContain('deals/xyz');
    // Exactly one <url> left — the static one. A duplicated block (the
    // actual historical bug) would leave this at 2 or more.
    expect((afterSecondStrip.match(/<url>/g) || []).length).toBe(1);
  });
});

describe('dealEntry', () => {
  it('escapes XML-unsafe characters in the offer title', () => {
    const xml = dealEntry({
      id: 'offer-1',
      title: 'Buy 2 & Get 1 <Free>',
      cover_image: 'https://example.com/cover.jpg',
      updated_at: '2026-08-01T00:00:00.000Z',
    });
    expect(xml).toContain('Buy 2 &amp; Get 1 &lt;Free&gt;');
    expect(xml).not.toContain('<Free>');
  });

  it('omits the image block entirely when the offer has no cover image', () => {
    const xml = dealEntry({
      id: 'offer-2',
      title: 'No Image Offer',
      updated_at: '2026-08-01T00:00:00.000Z',
    });
    expect(xml).not.toContain('<image:image>');
    expect(xml).toContain('deals/offer-2');
  });

  it('falls back to offer_image when cover_image is absent', () => {
    const xml = dealEntry({
      id: 'offer-3',
      title: 'Legacy Offer',
      offer_image: 'https://example.com/legacy.jpg',
      updated_at: '2026-08-01T00:00:00.000Z',
    });
    expect(xml).toContain('legacy.jpg');
  });
});
