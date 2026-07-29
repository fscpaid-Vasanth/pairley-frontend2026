// Module 14 Phase 3A — how the customer-facing UI presents merchant contact
// details (or their absence).
//
// The backend decides entitlement and simply does not send protected values
// to a viewer who isn't entitled to them — see offerVisibility.ts. This
// module only decides what to *say* in each case. It never reconstructs or
// infers a hidden value, and it must not: if a field isn't in the payload,
// it isn't available, full stop.

export const CONTACT_MODES = {
  /** Backend sent the real details. */
  AVAILABLE: 'AVAILABLE',
  /** Anonymous viewer — signing up unlocks contact. */
  SIGN_UP: 'SIGN_UP',
  /**
   * The merchant hasn't claimed their Pairley listing, so Pairley doesn't
   * present itself as the route to them. Point at their own site instead.
   */
  WEBSITE: 'WEBSITE',
  /** Nothing to show and nowhere to send them. */
  NONE: 'NONE',
};

const SIGN_UP_LABELS = {
  phone: '📞 Contact available after free signup',
  whatsapp: 'WhatsApp available after signup',
  email: 'Available after signup',
};

/**
 * @param business the `business` object from GET /offers/details/:id
 * @returns {{mode: string, labels: object, website: string|null}}
 */
export function resolveContactDisplay(business) {
  if (!business) {
    return { mode: CONTACT_MODES.NONE, labels: {}, website: null };
  }

  const website = normalizeWebsite(business.website);

  if (business.contact_available) {
    return { mode: CONTACT_MODES.AVAILABLE, labels: {}, website };
  }

  if (business.contact_notice === 'USE_OFFICIAL_WEBSITE') {
    // Without a website there is genuinely nowhere to send the customer, so
    // don't render a dead affordance — Show Interest is the path instead.
    return {
      mode: website ? CONTACT_MODES.WEBSITE : CONTACT_MODES.NONE,
      labels: {},
      website,
    };
  }

  if (business.contact_notice === 'SIGN_UP_REQUIRED') {
    return { mode: CONTACT_MODES.SIGN_UP, labels: SIGN_UP_LABELS, website };
  }

  return { mode: CONTACT_MODES.NONE, labels: {}, website };
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
