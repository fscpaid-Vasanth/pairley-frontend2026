let baseUrl = import.meta.env.VITE_API_URL || 'https://pairley-backend2026.onrender.com/api';
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}
if (!baseUrl.endsWith('/api')) {
  baseUrl = `${baseUrl}/api`;
}
const API_URL = baseUrl;
export { API_URL };


const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('pairley_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
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
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return response.json();
  },

  post: async (endpoint, body, token) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return response.json();
  },

  put: async (endpoint, body, token) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return response.json();
  },

  delete: async (endpoint, token) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return response.json();
  },
};
