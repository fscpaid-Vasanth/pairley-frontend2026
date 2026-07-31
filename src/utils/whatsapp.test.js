import { describe, it, expect } from 'vitest';
import { buildWaLink, buildCustomerInquiryMessage } from './whatsapp';

// Bulk-import revision — buildCustomerInquiryMessage is the new addition
// (buildWaLink/buildContactLeadMessage predate this and are exercised
// indirectly via LeadsPage today).
describe('buildCustomerInquiryMessage', () => {
  it('names the offer and the shop', () => {
    const message = buildCustomerInquiryMessage({
      offerName: 'Weekend Family Buffet',
      shopName: 'The Big Barbeque',
    });
    expect(message).toContain('Weekend Family Buffet');
    expect(message).toContain('The Big Barbeque');
  });

  it('falls back gracefully when the shop name is missing', () => {
    const message = buildCustomerInquiryMessage({ offerName: 'Some Deal' });
    expect(message).toContain('Some Deal');
    expect(message).not.toContain('undefined');
  });

  it('produces a usable wa.me link when combined with buildWaLink', () => {
    const message = buildCustomerInquiryMessage({
      offerName: 'BOGO Deal',
      shopName: 'Spec Gym',
    });
    const link = buildWaLink('9876543210', message);
    expect(link).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
    expect(decodeURIComponent(link.split('text=')[1])).toBe(message);
  });
});
