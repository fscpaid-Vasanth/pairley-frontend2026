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

  it('api.patch sends a PATCH request with a JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'offer-1' }),
    });
    const { api } = await import('./api.js');
    await api.patch('/admin/offer-publisher/drafts/offer-1', { title: 'New' });
    const [, opts] = globalThis.fetch.mock.calls[0];
    expect(opts.method).toBe('PATCH');
    expect(JSON.parse(opts.body)).toEqual({ title: 'New' });
  });

  it('api.patch clears a stale session on a 401, same as every other method', async () => {
    localStorage.setItem('pairley_token', 'stale');
    mock401();
    const { api } = await import('./api.js');
    await expect(
      api.patch('/admin/offer-publisher/drafts/offer-1', {}),
    ).rejects.toThrow();
    expect(localStorage.getItem('pairley_token')).toBeNull();
  });

  it('postMultipart sends the FormData body without a Content-Type header (browser sets the multipart boundary)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ drafts: [] }),
    });
    const { postMultipart } = await import('./api.js');
    const formData = new FormData();
    formData.append('files', new Blob(['x']), 'x.jpg');
    await postMultipart('/admin/offer-publisher/drafts', formData);

    const [url, opts] = globalThis.fetch.mock.calls[0];
    expect(url).toContain('/admin/offer-publisher/drafts');
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(formData);
    expect(opts.headers['Content-Type']).toBeUndefined();
  });

  it('postMultipart clears a stale session on a 401', async () => {
    localStorage.setItem('pairley_token', 'stale');
    mock401();
    const { postMultipart } = await import('./api.js');
    await expect(
      postMultipart('/admin/offer-publisher/drafts', new FormData()),
    ).rejects.toThrow();
    expect(localStorage.getItem('pairley_token')).toBeNull();
  });
});
