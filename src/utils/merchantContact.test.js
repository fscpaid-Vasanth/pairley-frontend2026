import { describe, it, expect } from 'vitest';
import {
  resolveContactDisplay,
  normalizeWebsite,
  websiteLabel,
  CONTACT_MODES,
} from './merchantContact';

// Lead-generation revision: Pairley never hands merchant contact fields to
// a customer through this endpoint anymore, regardless of business status
// or expressed interest — see offerVisibility.ts. The only thing left to
// display is the merchant's own published website (always public,
// independent of the contact-reveal policy).
describe('resolveContactDisplay', () => {
  it('points at the merchant’s own site when a website is present', () => {
    const result = resolveContactDisplay({ website: 'https://specgym.in' });
    expect(result.mode).toBe(CONTACT_MODES.WEBSITE);
    expect(result.website).toBe('https://specgym.in/');
  });

  it('shows nothing when there is no website', () => {
    expect(resolveContactDisplay({ website: null }).mode).toBe(CONTACT_MODES.NONE);
    expect(resolveContactDisplay({}).mode).toBe(CONTACT_MODES.NONE);
  });

  it('handles a missing business object', () => {
    expect(resolveContactDisplay(null).mode).toBe(CONTACT_MODES.NONE);
    expect(resolveContactDisplay(undefined).mode).toBe(CONTACT_MODES.NONE);
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
