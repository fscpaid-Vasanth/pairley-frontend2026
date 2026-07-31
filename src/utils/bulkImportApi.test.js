import { describe, it, expect } from 'vitest';
import { buildErrorCsv, matchesAccept } from './bulkImportApi';

describe('matchesAccept', () => {
  const file = (name, type = '') => ({ name, type });

  it('matches by extension, case-insensitively', () => {
    expect(matchesAccept(file('offers.csv'), '.csv,.xlsx')).toBe(true);
    expect(matchesAccept(file('OFFERS.XLSX'), '.csv,.xlsx')).toBe(true);
  });

  // The regression this exists to prevent: `accept` never filters a
  // drag-and-drop, so a PNG on the offer-sheet zone reached the server.
  it('rejects an image dropped on the CSV/XLSX zone', () => {
    expect(matchesAccept(file('ChatGPT Image.png', 'image/png'), '.csv,.xlsx')).toBe(false);
  });

  it('matches by MIME type when the extension is absent or unhelpful', () => {
    expect(matchesAccept(file('photo', 'image/jpeg'), 'image/jpeg,image/png')).toBe(true);
    expect(matchesAccept(file('photo', 'image/gif'), 'image/jpeg,image/png')).toBe(false);
  });

  it('accepts either the extension or the MIME type, since browsers disagree', () => {
    // Windows/Excel commonly reports a .csv as application/vnd.ms-excel.
    expect(matchesAccept(file('offers.csv', 'application/vnd.ms-excel'), '.csv,.xlsx')).toBe(true);
    // A .webp with an empty type (seen on folder uploads) still matches.
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

describe('buildErrorCsv', () => {
  it('builds a header row from the raw_data keys plus Row/Status/Errors', () => {
    const csv = buildErrorCsv([
      {
        row_no: 2,
        status: 'INVALID',
        errors: ['Merchant Name is required'],
        raw_data: { 'Merchant Name': '', City: 'Bangalore' },
      },
    ]);
    const [header, dataLine] = csv.split('\n');
    expect(header).toBe('Row,Status,Errors,Merchant Name,City');
    expect(dataLine).toBe('2,INVALID,Merchant Name is required,,Bangalore');
  });

  it('joins multiple errors with a semicolon', () => {
    const csv = buildErrorCsv([
      { row_no: 3, status: 'INVALID', errors: ['A', 'B'], raw_data: {} },
    ]);
    expect(csv).toContain('A; B');
  });

  it('quotes a field containing a comma', () => {
    const csv = buildErrorCsv([
      { row_no: 4, status: 'INVALID', errors: [], raw_data: { Address: '123 Main St, Suite 4' } },
    ]);
    expect(csv).toContain('"123 Main St, Suite 4"');
  });

  it('escapes an embedded quote by doubling it', () => {
    const csv = buildErrorCsv([
      { row_no: 5, status: 'DUPLICATE', errors: [], raw_data: { Title: 'The "Best" Deal' } },
    ]);
    expect(csv).toContain('"The ""Best"" Deal"');
  });

  it('returns just a bare header for an empty row list', () => {
    expect(buildErrorCsv([])).toBe('Row,Status,Errors');
  });
});
