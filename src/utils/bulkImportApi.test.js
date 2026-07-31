import { describe, it, expect } from 'vitest';
import { buildErrorCsv } from './bulkImportApi';

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
