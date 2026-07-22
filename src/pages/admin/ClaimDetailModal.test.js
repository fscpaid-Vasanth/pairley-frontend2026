import { describe, it, expect } from 'vitest';
import { isPdfEvidence } from './ClaimDetailModal';

// Module 12 Phase 3 — evidence has no stored content-type, so the evidence
// viewer decides image-vs-PDF purely from the URL extension that
// ClaimRequestService's evidence-N.<ext> naming produces.
describe('isPdfEvidence', () => {
  it('detects a .pdf URL', () => {
    expect(isPdfEvidence('https://pairley-storage.s3.ap-south-1.amazonaws.com/claim-evidence/1-evidence-2.pdf')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isPdfEvidence('https://example.com/evidence-2.PDF')).toBe(true);
  });

  it('returns false for image extensions', () => {
    expect(isPdfEvidence('https://example.com/evidence-1.png')).toBe(false);
    expect(isPdfEvidence('https://example.com/evidence-1.jpeg')).toBe(false);
    expect(isPdfEvidence('https://example.com/evidence-1.webp')).toBe(false);
  });
});
