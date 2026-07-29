import { describe, it, expect } from 'vitest';
import {
  resolveContactDisplay,
  normalizeWebsite,
  websiteLabel,
  CONTACT_MODES,
} from './merchantContact';

describe('resolveContactDisplay', () => {
  it('shows real contact when the backend sent it', () => {
    const result = resolveContactDisplay({
      contact_available: true,
      contact_notice: 'AVAILABLE',
      mobile: '9876543210',
    });
    expect(result.mode).toBe(CONTACT_MODES.AVAILABLE);
  });

  it('offers the signup prompt to an anonymous viewer', () => {
    const result = resolveContactDisplay({
      contact_available: false,
      contact_notice: 'SIGN_UP_REQUIRED',
    });
    expect(result.mode).toBe(CONTACT_MODES.SIGN_UP);
    expect(result.labels.phone).toMatch(/after free signup/);
    expect(result.labels.whatsapp).toMatch(/after signup/);
    expect(result.labels.email).toMatch(/after signup/);
  });

  it('points at the merchant’s own site for an unclaimed business', () => {
    const result = resolveContactDisplay({
      contact_available: false,
      contact_notice: 'USE_OFFICIAL_WEBSITE',
      website: 'https://specgym.in',
    });
    expect(result.mode).toBe(CONTACT_MODES.WEBSITE);
    expect(result.website).toBe('https://specgym.in/');
  });

  // A "Visit Official Website" button with nowhere to go is worse than no
  // button — Show Interest is the path in that case.
  it('renders nothing rather than a dead website affordance', () => {
    const result = resolveContactDisplay({
      contact_available: false,
      contact_notice: 'USE_OFFICIAL_WEBSITE',
      website: null,
    });
    expect(result.mode).toBe(CONTACT_MODES.NONE);
  });

  it('handles a missing business object', () => {
    expect(resolveContactDisplay(null).mode).toBe(CONTACT_MODES.NONE);
    expect(resolveContactDisplay(undefined).mode).toBe(CONTACT_MODES.NONE);
  });

  // Defensive: an older backend, or a response shape change, must degrade to
  // showing nothing rather than to showing contact.
  it('defaults to NONE when the notice is unrecognised', () => {
    expect(
      resolveContactDisplay({ contact_available: false, contact_notice: 'SOMETHING_NEW' })
        .mode,
    ).toBe(CONTACT_MODES.NONE);
    expect(resolveContactDisplay({}).mode).toBe(CONTACT_MODES.NONE);
  });
});

describe('normalizeWebsite', () => {
  it('passes through a full URL', () => {
    expect(normalizeWebsite('https://specgym.in/offers')).toBe(
      'https://specgym.in/offers',
    );
  });

  it('assumes https for a bare domain', () => {
    expect(normalizeWebsite('specgym.in')).toBe('https://specgym.in/');
    expect(normalizeWebsite('www.specgym.in')).toBe('https://www.specgym.in/');
  });

  it('trims whitespace', () => {
    expect(normalizeWebsite('  specgym.in  ')).toBe('https://specgym.in/');
  });

  // This is an href destination, so a scripted scheme must never survive.
  it('refuses non-http(s) schemes', () => {
    expect(normalizeWebsite('javascript:alert(1)')).toBeNull();
    expect(normalizeWebsite('data:text/html,<script>')).toBeNull();
    expect(normalizeWebsite('ftp://files.example.com')).toBeNull();
  });

  it('refuses a hostname with no dot', () => {
    expect(normalizeWebsite('localhost')).toBeNull();
    expect(normalizeWebsite('intranet')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(normalizeWebsite('')).toBeNull();
    expect(normalizeWebsite(null)).toBeNull();
    expect(normalizeWebsite(undefined)).toBeNull();
  });
});

describe('websiteLabel', () => {
  it('shows the bare hostname', () => {
    expect(websiteLabel('https://www.specgym.in/offers')).toBe('specgym.in');
    expect(websiteLabel('https://specgym.in')).toBe('specgym.in');
  });

  it('returns null for nothing usable', () => {
    expect(websiteLabel(null)).toBeNull();
    expect(websiteLabel('not a url')).toBeNull();
  });
});
