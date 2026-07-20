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

const handleResponse = async (response, correlationId) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    const error = new Error(err.message || 'Request failed');
    error.status = response.status;
    error.correlationId = correlationId;
    throw error;
  }
  return response.json();
};

// Fire-and-forget request to start waking a sleeping free-tier backend
// instance as early as possible. Render's free tier can take 30-60s to
// cold-start, which is fatal for a mall-booth QR scan if the first real
// request is the OTP send. Call this the moment a campaign entry page
// mounts (Launch Pass / merchant landing) so the instance is likely already
// awake by the time the user reaches a form submission.
export const warmUpBackend = () => {
  fetch(`${API_URL}/public/stats`).catch(() => {});
};

export const api = {
  get: async (endpoint, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(token, correlationId),
    });
    return handleResponse(response, correlationId);
  },

  post: async (endpoint, body, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(token, correlationId),
      body: JSON.stringify(body),
    });
    return handleResponse(response, correlationId);
  },

  put: async (endpoint, body, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(token, correlationId),
      body: JSON.stringify(body),
    });
    return handleResponse(response, correlationId);
  },

  delete: async (endpoint, token) => {
    const correlationId = generateCorrelationId();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(token, correlationId),
    });
    return handleResponse(response, correlationId);
  },
};
