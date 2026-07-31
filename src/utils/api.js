let baseUrl = import.meta.env.VITE_API_URL || 'https://pairley-backend2026.onrender.com/api';
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}
if (!baseUrl.endsWith('/api')) {
  baseUrl = `${baseUrl}/api`;
}
const API_URL = baseUrl;
export { API_URL };


// Per-request correlation ID, echoed back by the backend on the response
// and included as a Sentry tag on the frontend (see instrument.js) — lets
// a single failed request be found in both the backend logs and Sentry.
export const generateCorrelationId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getHeaders = (token, correlationId) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Request-Id': correlationId,
  };
  const activeToken = token || localStorage.getItem('pairley_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
};

// Endpoints where a 401 is a normal answer about the credentials being
// submitted ("wrong password", "bad OTP"), not a statement about a stored
// session. These must never trigger the session teardown below, or a single
// typo'd password would wipe the user's login and bounce them mid-form.
const AUTH_ENDPOINT_PREFIX = '/auth/';

/**
 * A 401 on a request we attached a stored token to means that token is no
 * longer valid — expired, or signed with a secret that has since been
 * rotated. Nothing the user does will fix it while the dead token stays in
 * localStorage: every poller just keeps retrying and failing.
 *
 * Before this, that state surfaced as an endless console stream ("Invalid or
 * expired token" ~20x) and misleading UI ("Failed to load dashboard metrics.
 * Check backend connection.") that blamed the backend while it was healthy
 * and correctly rejecting a stale credential. Now the dead session is
 * cleared and the user is sent to log in once, which is the only thing that
 * actually resolves it.
 */
const endStaleSession = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('pairley_token')) return; // never had a session
  localStorage.removeItem('pairley_token');
  localStorage.removeItem('pairley_user');
  // Guard against a redirect loop if the login page itself 401s.
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login?expired=1');
  }
};

const handleResponse = async (response, correlationId, endpoint = '') => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    const error = new Error(err.message || 'Request failed');
    error.status = response.status;
    error.correlationId = correlationId;
    if (response.status === 401 && !endpoint.startsWith(AUTH_ENDPOINT_PREFIX)) {
      endStaleSession();
    }
    throw error;
  }
  return response.json();
};

// Multipart requests (file uploads) can't go through api.post() — that
// always JSON.stringifies the body and sets Content-Type: application/json,
// which breaks a FormData body. This was previously duplicated, nearly
// verbatim, in both MediaUploadPanel.jsx and bulkImportApi.js; a third
// near-identical copy for Offer Publisher is what made extracting it here
// worthwhile. No Content-Type header is set deliberately — the browser
// derives the multipart boundary from the FormData body itself, and
// setting it manually strips that boundary.
export const postMultipart = async (endpoint, formData) => {
  const correlationId = generateCorrelationId();
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('pairley_token') || ''}`,
      'X-Request-Id': correlationId,
    },
    body: formData,
  });
  return handleResponse(response, correlationId, endpoint);
};

// Fire-and-forget request to start waking a sleeping free-tier backend
// instance as early as possible. Render's free tier can take 30-60s to
// cold-start, which is fatal for a mall-booth QR scan if the first real
// request is the OTP send. Call this the moment a campaign entry page
// mounts (Launch Pass / merchant landing) OR an auth page mounts, so the
// instance is likely already awake by the time the user reaches a form
// submission or a Google sign-in.
//
// Deliberately pings the bare `/api` root (a plain string, zero DB work)
// rather than `/api/public/stats`. Any request wakes the instance equally,
// but measured against production, /api/public/stats takes ~6-9s (it runs
// several sequential un-indexed aggregate counts) versus ~0.3-0.8s for the
// root — so the old choice was both the slowest possible probe and an
// accidental repeat of that heavy query on every page that warms up.
export const warmUpBackend = () => {
  fetch(API_URL).catch(() => {});
};

export const api = {
  get: async (endpoint, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(token, correlationId),
    });
    return handleResponse(response, correlationId, endpoint);
  },

  post: async (endpoint, body, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(token, correlationId),
      body: JSON.stringify(body),
    });
    return handleResponse(response, correlationId, endpoint);
  },

  put: async (endpoint, body, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(token, correlationId),
      body: JSON.stringify(body),
    });
    return handleResponse(response, correlationId, endpoint);
  },

  patch: async (endpoint, body, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(token, correlationId),
      body: JSON.stringify(body),
    });
    return handleResponse(response, correlationId, endpoint);
  },

  delete: async (endpoint, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(token, correlationId),
    });
    return handleResponse(response, correlationId, endpoint);
  },
};
