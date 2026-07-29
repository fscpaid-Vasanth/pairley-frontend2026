import { describe, it, expect } from 'vitest';
import {
  DISCOVERY_SOURCES,
  getSourceById,
  getFailureMessage,
  normalizeSourceUrl,
  confidenceBand,
  isJobTerminal,
  hasActiveJob,
  jobProducedCandidate,
} from './discoverySource';

describe('DISCOVERY_SOURCES', () => {
  it('offers exactly the four approved Phase 1 sources', () => {
    expect(DISCOVERY_SOURCES.map((s) => s.id)).toEqual([
      'website',
      'poster',
      'pdf',
      'screenshot',
    ]);
  });

  it('routes the website source to the URL endpoint and the rest to file upload', () => {
    expect(getSourceById('website').endpoint).toBe('/discovery/import');
    ['poster', 'pdf', 'screenshot'].forEach((id) => {
      expect(getSourceById(id).endpoint).toBe('/discovery/import-file');
    });
  });

  it('gives every file source an accept list and every source a hint', () => {
    DISCOVERY_SOURCES.forEach((source) => {
      expect(source.hint).toBeTruthy();
      if (source.kind === 'file') expect(source.accept).toBeTruthy();
    });
  });

  it('restricts the PDF source to PDFs only', () => {
    expect(getSourceById('pdf').accept).toBe('application/pdf');
  });

  it('returns null for an unknown source rather than throwing', () => {
    expect(getSourceById('instagram')).toBeNull();
  });
});

describe('normalizeSourceUrl', () => {
  it('accepts a full https URL unchanged', () => {
    expect(normalizeSourceUrl('https://specgym.in/offers')).toEqual({
      valid: true,
      url: 'https://specgym.in/offers',
    });
  });

  it('assumes https for a bare domain, which is how admins actually paste', () => {
    expect(normalizeSourceUrl('specgym.in/offers').url).toBe(
      'https://specgym.in/offers',
    );
  });

  it('trims surrounding whitespace from a pasted value', () => {
    expect(normalizeSourceUrl('  https://specgym.in  ').url).toBe(
      'https://specgym.in/',
    );
  });

  it('preserves an explicit http scheme rather than silently upgrading it', () => {
    expect(normalizeSourceUrl('http://specgym.in').url).toBe(
      'http://specgym.in/',
    );
  });

  it('rejects an empty value', () => {
    expect(normalizeSourceUrl('')).toMatchObject({ valid: false });
    expect(normalizeSourceUrl('   ')).toMatchObject({ valid: false });
  });

  it('rejects a non-http scheme', () => {
    expect(normalizeSourceUrl('ftp://files.example.com')).toMatchObject({
      valid: false,
    });
    expect(normalizeSourceUrl('javascript:alert(1)')).toMatchObject({
      valid: false,
    });
  });

  // The backend SSRF guard would reject these anyway; catching them here is
  // about giving feedback while the field is still in front of the admin.
  it('rejects hostnames with no dot, which are local/intranet names', () => {
    expect(normalizeSourceUrl('localhost')).toMatchObject({ valid: false });
    expect(normalizeSourceUrl('http://localhost:3000')).toMatchObject({
      valid: false,
    });
    expect(normalizeSourceUrl('intranet/offers')).toMatchObject({
      valid: false,
    });
  });

  it('gives a usable error message on every rejection', () => {
    ['', 'ftp://x.com', 'localhost'].forEach((input) => {
      expect(normalizeSourceUrl(input).error).toBeTruthy();
    });
  });
});

describe('getFailureMessage', () => {
  it('translates a reason code into admin-readable copy', () => {
    expect(getFailureMessage('FILE_TOO_LARGE: 22MB')).toContain('15MB limit');
  });

  it('explains the robots.txt refusal and points at the workaround', () => {
    const message = getFailureMessage('ROBOTS_DISALLOWED: ex.com disallows /a');
    expect(message).toContain('robots.txt');
    expect(message).toMatch(/screenshot/i);
  });

  it('handles a bare reason code with no detail suffix', () => {
    expect(getFailureMessage('TIMEOUT')).toMatch(/took too long/);
  });

  // An unmapped code must stay visible — hiding it would make a new backend
  // failure reason invisible until someone noticed this table was stale.
  it('falls back to the raw string for an unknown reason', () => {
    expect(getFailureMessage('SOME_NEW_REASON: details')).toBe(
      'SOME_NEW_REASON: details',
    );
  });

  it('returns an empty string for no error', () => {
    expect(getFailureMessage(null)).toBe('');
    expect(getFailureMessage(undefined)).toBe('');
    expect(getFailureMessage('')).toBe('');
  });
});

describe('confidenceBand', () => {
  it.each([
    [1, 'HIGH'],
    [0.71, 'HIGH'],
    [0.7, 'HIGH'],
    [0.69, 'MEDIUM'],
    [0.4, 'MEDIUM'],
    [0.39, 'LOW'],
    [0, 'LOW'],
  ])('bands %s as %s', (score, expected) => {
    expect(confidenceBand(score)).toBe(expected);
  });

  it('treats a missing score as low confidence, never as high', () => {
    expect(confidenceBand(null)).toBe('LOW');
    expect(confidenceBand(undefined)).toBe('LOW');
  });
});

describe('job status helpers', () => {
  it('treats DONE and FAILED as terminal', () => {
    expect(isJobTerminal({ status: 'DONE' })).toBe(true);
    expect(isJobTerminal({ status: 'FAILED' })).toBe(true);
    expect(isJobTerminal({ status: 'PROCESSING' })).toBe(false);
    expect(isJobTerminal({ status: 'QUEUED' })).toBe(false);
  });

  it('detects an in-flight job so polling knows to keep going', () => {
    expect(hasActiveJob([{ status: 'DONE' }, { status: 'QUEUED' }])).toBe(true);
    expect(hasActiveJob([{ status: 'DONE' }, { status: 'FAILED' }])).toBe(false);
    expect(hasActiveJob([])).toBe(false);
    expect(hasActiveJob(undefined)).toBe(false);
  });

  // A job can succeed and still produce nothing reviewable — the page had no
  // readable title. That's a different outcome to the admin than "done".
  it('separates a successful job from one that actually produced a candidate', () => {
    expect(jobProducedCandidate({ status: 'DONE', created_offer_id: 'o1' })).toBe(true);
    expect(jobProducedCandidate({ status: 'DONE', created_offer_id: null })).toBe(false);
    expect(jobProducedCandidate({ status: 'FAILED', created_offer_id: 'o1' })).toBe(false);
    expect(jobProducedCandidate(undefined)).toBe(false);
  });
});
