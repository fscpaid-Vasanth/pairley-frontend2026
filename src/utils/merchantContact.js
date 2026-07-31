// Module 14 Phase 3A — how the customer-facing UI presents merchant contact
// details (or their absence).
//
// Lead-generation revision: Pairley never hands merchant contact fields
// (mobile/whatsapp/address) to a customer through the offer detail page at
// all anymore — see offerVisibility.ts's resolveContactAccess. The only
// thing left for this module to display is the merchant's own published
// website, which was always public independent of the contact-reveal
// policy (it's the merchant's own front door, not something Pairley
// gates). It never reconstructs or infers a hidden value.

export const CONTACT_MODES = {
  /** The business has a published website — link to it. */
  WEBSITE: 'WEBSITE',
  /** No website to show. */
  NONE: 'NONE',
};

/**
 * @param business the `business` object from GET /offers/details/:id
 * @returns {{mode: string, website: string|null}}
 */
export function resolveContactDisplay(business) {
  const website = normalizeWebsite(business?.website);
  return { mode: website ? CONTACT_MODES.WEBSITE : CONTACT_MODES.NONE, website };
}

/**
 * Merchants type websites inconsistently ("specgym.in", "www.specgym.in").
 * Assume https when no scheme is given, and refuse anything that isn't a
 * plain web address so the value can never become a javascript: or data:
 * URL in an href.
 */
export function normalizeWebsite(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Short, human label for a website button. */
export function websiteLabel(website) {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
