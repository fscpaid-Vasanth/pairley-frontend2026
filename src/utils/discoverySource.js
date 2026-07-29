// Module 14 Phase 1 — shared logic for the AI Offer Discovery screen.
//
// Pure functions only, deliberately: this is the part worth unit-testing,
// and keeping it out of the components means PosterUploadCard and
// AiOfferDiscoveryPanel read the same failure-message table instead of
// drifting into two slightly different ones.

/**
 * The four ways an admin can start an import. All of them feed the same
 * backend pipeline — `endpoint` is what actually differs, and Screenshot is
 * deliberately the same endpoint and accepted types as Poster. It exists as
 * its own choice because "screenshot of a social post" is a distinct thing
 * in the admin's head even though it's an image like any other, and naming
 * it is what makes the social-media path discoverable without us pretending
 * to support authenticated Instagram/Facebook imports.
 */
export const DISCOVERY_SOURCES = [
  {
    id: 'website',
    label: 'Website',
    kind: 'url',
    endpoint: '/discovery/import',
    hint: 'Public pages only. We honour robots.txt and never access content behind a login.',
    placeholder: 'https://example.com/offers',
  },
  {
    id: 'poster',
    label: 'Poster',
    kind: 'file',
    endpoint: '/discovery/import-file',
    accept: 'image/jpeg,image/png,image/webp',
    hint: 'JPEG, PNG, or WebP poster/flyer/menu — up to 15MB. Read via OCR.',
  },
  {
    id: 'pdf',
    label: 'PDF',
    kind: 'file',
    endpoint: '/discovery/import-file',
    accept: 'application/pdf',
    hint: 'Text-based PDF brochures — up to 15MB. Scanned/image-only PDFs are not supported.',
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    kind: 'file',
    endpoint: '/discovery/import-file',
    accept: 'image/jpeg,image/png,image/webp',
    hint: 'A screenshot of a public post or offer. Use this when a link can’t be read directly.',
  },
];

export function getSourceById(id) {
  return DISCOVERY_SOURCES.find((source) => source.id === id) || null;
}

// Maps the backend's machine-readable failure reasons (UrlFetchError and
// FileImportError `reason` codes) to language an admin — not a developer —
// can act on. Anything unmapped falls through to the raw text rather than
// being hidden, so a newly added backend reason is visible rather than
// silently swallowed while this table catches up.
export const FAILURE_MESSAGES = {
  // Website import (Module 9)
  INVALID_URL: 'That doesn’t look like a valid web address.',
  INVALID_SCHEME: 'Only http and https addresses can be imported.',
  SSRF_BLOCKED: 'That address points to a private network and can’t be imported.',
  DNS_ERROR: 'Couldn’t find that domain — check the address for typos.',
  TIMEOUT: 'The site took too long to respond. Try again, or upload a screenshot instead.',
  NETWORK_ERROR: 'Couldn’t reach that site. Try again, or upload a screenshot instead.',
  HTTP_ERROR: 'The site returned an error. It may be down or the page may have moved.',
  UNSUPPORTED_CONTENT_TYPE: 'That link isn’t a web page. Paste the offer page’s address instead.',
  RESPONSE_TOO_LARGE: 'That page is too large to import.',
  REDIRECT_LIMIT: 'That address redirects too many times.',
  REDIRECT_INVALID: 'That address redirects somewhere we can’t follow.',
  // Compliance (Module 14 Phase 1)
  ROBOTS_DISALLOWED:
    'This site’s robots.txt asks us not to crawl that page, so we haven’t. Upload a poster, PDF, or screenshot of the offer instead.',
  // File import (Module 10)
  INVALID_FILE_TYPE: 'Unsupported file type — use JPEG, PNG, WebP, or a text-based PDF.',
  FILE_TOO_LARGE: 'File is too large (15MB limit).',
  INVALID_FILE_SIGNATURE: "File content doesn't match a supported image/PDF format.",
  FILE_TYPE_MISMATCH: 'File extension does not match its actual content — re-export and retry.',
  STORAGE_FAILED: 'Upload storage error — please retry in a moment.',
  PDF_PARSE_FAILED: 'Could not parse this PDF — it may be corrupted.',
  UNSUPPORTED_SCANNED_PDF: 'This PDF appears to be scanned/image-only — text-layer PDFs only.',
  OCR_FAILED: 'Text recognition failed on this image — try a clearer photo.',
};

/**
 * ImportJob.error is stored as "REASON: detail". Splits off the reason code
 * and looks it up; falls back to the raw string so nothing is ever hidden
 * from the admin just because this table doesn't know the code yet.
 */
export function getFailureMessage(error) {
  if (!error) return '';
  const reason = String(error).split(':')[0].trim();
  return FAILURE_MESSAGES[reason] || String(error);
}

/**
 * Normalizes what an admin types into something importable. Accepts a bare
 * domain (people paste "specgym.in" far more often than the full URL) and
 * assumes https, which is what a bare domain almost always means today.
 */
export function normalizeSourceUrl(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return { valid: false, error: 'Enter a website address.' };

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { valid: false, error: 'That doesn’t look like a valid web address.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only http and https addresses can be imported.' };
  }

  // A hostname with no dot is a local/intranet name. The backend's SSRF
  // guard would reject it anyway; catching it here turns a failed job into
  // immediate feedback while the admin still has the field in front of them.
  if (!parsed.hostname.includes('.')) {
    return { valid: false, error: 'Enter a full public web address, e.g. https://example.com/offers' };
  }

  return { valid: true, url: parsed.toString() };
}

export const CONFIDENCE_BANDS = {
  HIGH: { label: 'High', minimum: 0.7 },
  MEDIUM: { label: 'Medium', minimum: 0.4 },
  LOW: { label: 'Low', minimum: 0 },
};

/**
 * Thresholds match the existing ConfidenceBadge in DiscoveredOffersPanel, so
 * the whole module speaks one visual language about how sure it is.
 */
export function confidenceBand(score) {
  const value = typeof score === 'number' ? score : 0;
  if (value >= CONFIDENCE_BANDS.HIGH.minimum) return 'HIGH';
  if (value >= CONFIDENCE_BANDS.MEDIUM.minimum) return 'MEDIUM';
  return 'LOW';
}

const TERMINAL_JOB_STATUSES = new Set(['DONE', 'FAILED']);

export function isJobTerminal(job) {
  return TERMINAL_JOB_STATUSES.has(job?.status);
}

export function hasActiveJob(jobs) {
  return (jobs || []).some((job) => !isJobTerminal(job));
}

/**
 * A DONE job only produced something reviewable if extraction found enough
 * to build a candidate from. A job that succeeded technically but yielded no
 * candidate is a distinct, common outcome (the page had no readable title)
 * and the admin needs to be told that rather than being sent to an empty
 * review queue.
 */
export function jobProducedCandidate(job) {
  if (job?.status !== 'DONE') return false;
  return Boolean(job.created_offer_id);
}
