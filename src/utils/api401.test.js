import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('api 401 session teardown', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    delete window.location;
    window.location = { pathname: '/admin/dashboard', search: '', assign: vi.fn() };
  });

  const mock401 = () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 401,
      json: () => Promise.resolve({ message: 'Invalid or expired token' }),
    });
  };

  it('clears a stale session and redirects on a 401 from a normal endpoint', async () => {
    localStorage.setItem('pairley_token', 'stale');
    localStorage.setItem('pairley_user', '{"role":"Admin"}');
    mock401();
    const { api } = await import('./api.js');
    await expect(api.get('/notifications')).rejects.toThrow();
    expect(localStorage.getItem('pairley_token')).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith('/login?expired=1');
  });

  // A typo'd password must not destroy an existing session.
  it('does NOT clear the session on a 401 from an /auth/ endpoint', async () => {
    localStorage.setItem('pairley_token', 'good');
    mock401();
    const { api } = await import('./api.js');
    await expect(api.post('/auth/login', {})).rejects.toThrow();
    expect(localStorage.getItem('pairley_token')).toBe('good');
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('does not redirect when there was never a session', async () => {
    mock401();
    const { api } = await import('./api.js');
    await expect(api.get('/notifications')).rejects.toThrow();
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
