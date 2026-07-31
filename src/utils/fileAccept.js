/**
 * Pure — does this file satisfy an `accept` string (the same syntax the
 * `<input accept>` attribute uses: ".csv,.xlsx", "image/jpeg,image/png",
 * "image/*")?
 *
 * Needed because `accept` only filters the OS *browse* dialog — a
 * drag-and-dropped file bypasses it entirely, so without this a PNG
 * dropped on a spreadsheet-only zone was uploaded and only rejected
 * server-side, costing a round trip to say something the browser already
 * knew.
 *
 * Matches on extension OR MIME type, since browsers are inconsistent about
 * the latter (a .csv commonly arrives as text/csv, application/csv,
 * application/vnd.ms-excel, or ""), and an empty `accept` allows anything.
 */
export function matchesAccept(file, accept) {
  if (!accept) return true;
  const name = (file?.name || '').toLowerCase();
  const mime = (file?.type || '').toLowerCase();
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith('.')) return name.endsWith(token);
      if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1));
      return mime === token;
    });
}
