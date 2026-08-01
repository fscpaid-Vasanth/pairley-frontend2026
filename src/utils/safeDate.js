/**
 * Date helpers that degrade instead of throwing.
 *
 * `new Date(undefined).toISOString()` raises "RangeError: Invalid time value",
 * and because that happens mid-`.map()` it takes down the entire list being
 * built, not just the one bad field. That is exactly how the customer order
 * history broke: `offer_interests` has no `updated_at` column at all, so
 * `item.updated_at` arrived as undefined and one COMPLETED interest was enough
 * to fail the whole history load with "Failed to load user order history".
 *
 * Anything formatting an API date should use these rather than calling
 * toISOString() directly — API payloads legitimately carry nulls, and missing
 * optional columns should never be able to blank out a whole screen.
 */

/** True only for a Date that will not throw on toISOString(). */
export function isValidDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * YYYY-MM-DD, or `fallback` when the input is missing or unparseable.
 * Replaces the `new Date(x).toISOString().split('T')[0]` idiom.
 */
export function toDateOnly(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString().split('T')[0];
}

/** Full ISO string, or `fallback` when the input is missing or unparseable. */
export function toIsoOrNull(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString();
}

/**
 * Localised display date, or `fallback`. Defaults to en-IN since that is the
 * audience; pass a locale explicitly if that ever stops being true.
 */
export function toDisplayDate(value, fallback = '—', locale = 'en-IN') {
  if (value === null || value === undefined || value === '') return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
