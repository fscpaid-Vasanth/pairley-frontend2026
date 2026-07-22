import { describe, it, expect } from 'vitest';
import { resolveDuplicateToRemove } from './BusinessConsolidateModal';

// Module 12 Phase 4 — the admin can pick either side as the survivor, so
// this is the one piece of branching logic worth pinning down: whichever
// business id was NOT selected as canonical is the one that gets removed.
describe('resolveDuplicateToRemove', () => {
  const detail = { id: 'flagged-1', duplicate_of: { id: 'canonical-1' } };

  it('removes the suggested canonical when the admin keeps the flagged business instead', () => {
    expect(resolveDuplicateToRemove(detail, 'flagged-1')).toBe('canonical-1');
  });

  it('removes the flagged business when the admin keeps the suggested canonical (default)', () => {
    expect(resolveDuplicateToRemove(detail, 'canonical-1')).toBe('flagged-1');
  });
});
