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

// The S3 bucket backing uploads is private — a direct https://...s3....
// amazonaws.com/... URL 403s in the browser. Every uploaded document (KYC
// photos, poster/PDF imports, claim evidence) is stored as exactly that
// kind of URL, so it always needs to go through the document-preview
// proxy below, which fetches it server-side with AWS credentials. Only a
// genuinely external https:// URL (e.g. a WEBSITE-source import's source
// page) should ever be passed through unproxied.
const isS3Url = (src) => {
  try {
    return new URL(src).hostname.includes('.amazonaws.com');
  } catch {
    return false;
  }
};

export const getDocumentPreviewUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('data:image/')) return src;
  if ((src.startsWith('http://') || src.startsWith('https://')) && !isS3Url(src)) return src;
  const token = localStorage.getItem('pairley_token') || '';
  return `${API_URL}/business/document-preview?url=${encodeURIComponent(src)}&token=${encodeURIComponent(token)}`;
};

export const getDocumentDownloadUrl = (src) => {
  if (!src) return '#';
  if (src.startsWith('data:image/')) return src;
  if ((src.startsWith('http://') || src.startsWith('https://')) && !isS3Url(src)) return src;
  const token = localStorage.getItem('pairley_token') || '';
  return `${API_URL}/business/document-preview?url=${encodeURIComponent(src)}&download=true&token=${encodeURIComponent(token)}`;
};
