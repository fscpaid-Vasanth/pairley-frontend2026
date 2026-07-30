// Module 14 Phase 3C — pure helpers for the admin Banner Studio.
//
// Kept out of the component so the formatting/decision logic is unit-testable
// without rendering React — the same pattern used for discoverySource.js and
// candidateOverrides.js in Phase 1.

export const CHANGE_TYPE_LABELS = {
  BANNER_GENERATED: 'Generated',
  BANNER_TEMPLATE_CHANGED: 'Template changed',
  BANNER_IMAGE_REPLACED: 'Image replaced',
  BANNER_REGENERATED: 'Regenerated',
};

export function changeTypeLabel(changeType) {
  return CHANGE_TYPE_LABELS[changeType] || changeType || 'Updated';
}

/** Suitability score band, matching the confidence-band visual language
 *  already established for import confidence elsewhere in this module. */
export function suitabilityBand(total) {
  const value = typeof total === 'number' ? total : 0;
  if (value >= 70) return 'HIGH';
  if (value >= 40) return 'MEDIUM';
  return 'LOW';
}

export const SUITABILITY_BAND_LABELS = {
  HIGH: 'Good',
  MEDIUM: 'Usable',
  LOW: 'Weak',
};

/**
 * Tri-state watermark control has three admin-facing states, cycled by a
 * single toggle: not assessed -> flagged -> confirmed clean -> not assessed.
 * `null` is the only state that means "no opinion yet" — see
 * heroImageRanking.ts's ImageCandidate.watermarkSuspected doc comment on the
 * backend for why null/true/false are each meaningful.
 */
export function nextWatermarkState(current) {
  if (current === undefined || current === null) return true;
  if (current === true) return false;
  return null;
}

export const WATERMARK_STATE_LABELS = {
  true: 'Watermark flagged',
  false: 'Confirmed clean',
  null: 'Not assessed',
};

export function watermarkStateLabel(value) {
  return WATERMARK_STATE_LABELS[String(value)] ?? WATERMARK_STATE_LABELS.null;
}

/**
 * Builds the flags array the backend API expects (`{url, watermarkSuspected}`)
 * from a local `{url: true|false}` map. Entries with no opinion (absent from
 * the map, or explicitly null) are omitted — "not assessed" is the absence
 * of an entry, not a stored null, matching the backend DTO's own comment.
 */
export function buildWatermarkFlags(flagMap) {
  return Object.entries(flagMap || {})
    .filter(([, value]) => value === true || value === false)
    .map(([url, watermarkSuspected]) => ({ url, watermarkSuspected }));
}

/** Human-readable size, e.g. 1856234 -> "1.8 MB". */
export function formatFileSize(bytes) {
  if (!bytes || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Short image dimension label, or null when unknown. */
export function formatDimensions(width, height) {
  if (!width || !height) return null;
  return `${width}×${height}`;
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
