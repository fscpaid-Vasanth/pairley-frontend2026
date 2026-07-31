import { describe, it, expect } from 'vitest';
import { matchesAccept } from './fileAccept';

describe('matchesAccept', () => {
  const file = (name, type = '') => ({ name, type });

  it('matches by extension, case-insensitively', () => {
    expect(matchesAccept(file('offers.csv'), '.csv,.xlsx')).toBe(true);
    expect(matchesAccept(file('OFFERS.XLSX'), '.csv,.xlsx')).toBe(true);
  });

  it('rejects an image dropped on a spreadsheet-only zone', () => {
    expect(matchesAccept(file('ChatGPT Image.png', 'image/png'), '.csv,.xlsx')).toBe(false);
  });

  it('matches by MIME type when the extension is absent or unhelpful', () => {
    expect(matchesAccept(file('photo', 'image/jpeg'), 'image/jpeg,image/png')).toBe(true);
    expect(matchesAccept(file('photo', 'image/gif'), 'image/jpeg,image/png')).toBe(false);
  });

  it('accepts either the extension or the MIME type, since browsers disagree', () => {
    expect(matchesAccept(file('offers.csv', 'application/vnd.ms-excel'), '.csv,.xlsx')).toBe(true);
    expect(matchesAccept(file('OFF000001.webp', ''), 'image/webp,.webp')).toBe(true);
  });

  it('supports a wildcard MIME token', () => {
    expect(matchesAccept(file('x.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('x.pdf', 'application/pdf'), 'image/*')).toBe(false);
  });

  it('allows anything when accept is empty or missing', () => {
    expect(matchesAccept(file('anything.bin', ''), '')).toBe(true);
    expect(matchesAccept(file('anything.bin', ''), undefined)).toBe(true);
  });
});
