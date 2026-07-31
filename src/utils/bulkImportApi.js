// Bulk Offer Import — thin fetch wrapper for BulkImportPanel.jsx.
//
// The JSON endpoints (history/status/preview/errors/create-drafts/publish)
// go through the existing `api` helper, same as every other admin screen.
// The two upload endpoints (offer sheet, images) need raw multipart
// requests instead — `api` only ever sends JSON — so they follow the same
// fetch+FormData+auth-header pattern already established in
// MediaUploadPanel.jsx, rather than inventing a second convention.

import { api, API_URL, generateCorrelationId } from './api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('pairley_token') || ''}`,
  'X-Request-Id': generateCorrelationId(),
});

async function uploadRequest(path, formData) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || 'Upload failed');
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export const bulkImportApi = {
  listHistory: () => api.get('/admin/bulk-import/history'),
  getBatch: (id) => api.get(`/admin/bulk-import/${id}`),
  getPreview: (id) => api.get(`/admin/bulk-import/${id}/preview`),
  getErrorRows: (id) => api.get(`/admin/bulk-import/${id}/errors`),
  createDrafts: (id) => api.post(`/admin/bulk-import/${id}/create-drafts`, {}),
  publish: (id) => api.post(`/admin/bulk-import/${id}/publish`, {}),

  uploadSheet: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest('/admin/bulk-import', formData);
  },

  uploadImageFiles: (batchId, files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    return uploadRequest(`/admin/bulk-import/${batchId}/images`, formData);
  },

  uploadImageZip: (batchId, zipFile) => {
    const formData = new FormData();
    formData.append('file', zipFile);
    return uploadRequest(`/admin/bulk-import/${batchId}/images/zip`, formData);
  },
};

/**
 * Pure — does this file satisfy an `accept` string (the same syntax the
 * `<input accept>` attribute uses: ".csv,.xlsx", "image/jpeg,image/png",
 * "image/*")?
 *
 * Needed because `accept` only filters the OS *browse* dialog — a
 * drag-and-dropped file bypasses it entirely, so without this a PNG
 * dropped on the CSV/XLSX zone was uploaded and only rejected server-side,
 * costing a round trip to say something the browser already knew.
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

/** Pure — builds the CSV text for INVALID/DUPLICATE rows (from getErrorRows). Separated from downloadErrorReport so it's testable without a DOM. */
export function buildErrorCsv(rows) {
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerKeys = rows.length ? Object.keys(rows[0].raw_data || {}) : [];
  const header = ['Row', 'Status', 'Errors', ...headerKeys];
  const lines = rows.map((r) => [
    r.row_no,
    r.status,
    (r.errors || []).join('; '),
    ...headerKeys.map((k) => r.raw_data?.[k]),
  ]);
  return [header, ...lines].map((row) => row.map(escape).join(',')).join('\n');
}

/** Triggers a browser download of the error report as CSV — no new dependency, just a Blob. */
export function downloadErrorReport(rows, fileName = 'bulk-import-errors.csv') {
  const csv = buildErrorCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
