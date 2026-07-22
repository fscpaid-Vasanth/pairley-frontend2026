import { describe, it, expect, beforeEach } from 'vitest';
import { isValidImageSrc, getDocumentPreviewUrl, getDocumentDownloadUrl } from './adminFilePreview';

// Module 12 Phase 3 — regression test for the URL-routing bug found while
// building the claim-evidence viewer: getDocumentPreviewUrl/
// getDocumentDownloadUrl were passing private S3 URLs straight through to
// <img src>/<a href> instead of routing them through the authenticated
// document-preview proxy, so they 403'd in the browser. The bug affected
// every admin surface that previews an uploaded file (KYC docs, poster/PDF
// imports, and now claim evidence) since they all share this helper.
describe('adminFilePreview', () => {
  beforeEach(() => {
    localStorage.setItem('pairley_token', 'test-jwt');
  });

  describe('isValidImageSrc', () => {
    it('accepts http(s), data:image, and /uploads/ sources', () => {
      expect(isValidImageSrc('https://pairley-storage.s3.ap-south-1.amazonaws.com/x.png')).toBe(true);
      expect(isValidImageSrc('data:image/png;base64,abc')).toBe(true);
      expect(isValidImageSrc('/uploads/documents/x.png')).toBe(true);
    });

    it('rejects empty/missing sources', () => {
      expect(isValidImageSrc('')).toBe(false);
      expect(isValidImageSrc(null)).toBe(false);
      expect(isValidImageSrc(undefined)).toBe(false);
    });
  });

  describe('getDocumentPreviewUrl', () => {
    it('routes a private S3 URL through the authenticated proxy, not straight through', () => {
      const s3Url = 'https://pairley-storage.s3.ap-south-1.amazonaws.com/claim-evidence/1-evidence-1.png';
      const result = getDocumentPreviewUrl(s3Url);
      expect(result).toContain('/business/document-preview?url=');
      expect(result).toContain(encodeURIComponent(s3Url));
      expect(result).toContain('token=test-jwt');
    });

    it('routes an http (non-https) S3 URL through the proxy too', () => {
      const s3Url = 'http://pairley-storage.s3.ap-south-1.amazonaws.com/x.png';
      expect(getDocumentPreviewUrl(s3Url)).toContain('/business/document-preview?url=');
    });

    it('passes a genuinely external https URL straight through', () => {
      const external = 'https://example.com/some-source-page';
      expect(getDocumentPreviewUrl(external)).toBe(external);
    });

    it('passes a data:image URI straight through', () => {
      const dataUri = 'data:image/png;base64,abc123';
      expect(getDocumentPreviewUrl(dataUri)).toBe(dataUri);
    });

    it('routes a relative /uploads/ path (mock storage) through the proxy', () => {
      expect(getDocumentPreviewUrl('/uploads/claim-evidence/x.png')).toContain('/business/document-preview?url=');
    });

    it('returns an empty string for a missing source', () => {
      expect(getDocumentPreviewUrl('')).toBe('');
      expect(getDocumentPreviewUrl(null)).toBe('');
    });
  });

  describe('getDocumentDownloadUrl', () => {
    it('routes a private S3 URL through the proxy with download=true', () => {
      const s3Url = 'https://pairley-storage.s3.ap-south-1.amazonaws.com/claim-evidence/1-evidence-2.pdf';
      const result = getDocumentDownloadUrl(s3Url);
      expect(result).toContain('/business/document-preview?url=');
      expect(result).toContain('download=true');
    });

    it('passes a genuinely external https URL straight through', () => {
      const external = 'https://example.com/poster-source';
      expect(getDocumentDownloadUrl(external)).toBe(external);
    });

    it('returns "#" for a missing source', () => {
      expect(getDocumentDownloadUrl('')).toBe('#');
      expect(getDocumentDownloadUrl(null)).toBe('#');
    });
  });
});
