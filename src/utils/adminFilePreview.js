import { API_URL } from './api';

// Shared by every admin surface that previews an uploaded file (KYC
// documents on the Shop Onboarding tab, and — Module 10 — poster/PDF
// thumbnails on the Discovered Offers tab). Originally defined only inside
// AdminDashboard.jsx; extracted here once a second real caller needed the
// identical logic, rather than duplicating it.
//
// document-preview is admin-only server-side; since it's consumed as a raw
// <img src>/<a href> URL (no Authorization header possible), the JWT is
// passed as a query param instead — JwtAuthGuard falls back to it when no
// header is sent (see jwt-auth.guard.ts).
export const isValidImageSrc = (src) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:image/') ||
    lower.startsWith('/uploads/')
  );
};

export const getDocumentPreviewUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('data:image/') || src.startsWith('http://') || src.startsWith('https://')) return src;
  const token = localStorage.getItem('pairley_token') || '';
  return `${API_URL}/business/document-preview?url=${encodeURIComponent(src)}&token=${encodeURIComponent(token)}`;
};

export const getDocumentDownloadUrl = (src) => {
  if (!src) return '#';
  if (src.startsWith('data:image/') || src.startsWith('http://') || src.startsWith('https://')) return src;
  const token = localStorage.getItem('pairley_token') || '';
  return `${API_URL}/business/document-preview?url=${encodeURIComponent(src)}&download=true&token=${encodeURIComponent(token)}`;
};
