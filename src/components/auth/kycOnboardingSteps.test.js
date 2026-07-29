import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_FORM,
  stepsForRole,
  getStepErrors,
  resumeStepIdx,
  readSavedProgress,
  saveProgress,
  clearSavedProgress,
  storageKeyFor,
} from './kycOnboardingSteps';

// Merchant onboarding previously kept its step index in React state only, and
// created no Business row until the final step — so any interruption dropped a
// half-finished onboarding back to step 1 with nothing recoverable. These
// cover the resume logic that replaced that, with particular weight on the
// safety property: restoring a saved step index must never let a merchant skip
// a step whose required KYC document is missing (photos are deliberately not
// persisted, since base64 data URLs blow localStorage's ~5MB quota).

const BUSINESS_STEPS = stepsForRole('business');
const CUSTOMER_STEPS = stepsForRole('customer');

// Every typed field a business merchant would have filled in, with no photos —
// exactly the state restored from localStorage after an interruption.
const typedOnly = {
  ...DEFAULT_FORM,
  mobile: '9686490924',
  state: 'Karnataka',
  pincode: '560066',
  businessName: 'Spec Watch House',
  aadhaar: '234512345678',
};

describe('kycOnboardingSteps', () => {
  describe('getStepErrors', () => {
    it('accepts a fully valid contact step', () => {
      expect(getStepErrors('contact', typedOnly)).toEqual({});
    });

    it('flags each invalid contact field', () => {
      const errs = getStepErrors('contact', { ...DEFAULT_FORM, mobile: '123', pincode: '56' });
      expect(errs).toHaveProperty('mobile');
      expect(errs).toHaveProperty('state');
      expect(errs).toHaveProperty('pincode');
    });

    it('requires both the Aadhaar number and its photo on the identity step', () => {
      expect(getStepErrors('identity', typedOnly)).toEqual({
        aadhaarPhoto: 'Aadhaar card image is required',
      });
      expect(
        getStepErrors('identity', { ...typedOnly, aadhaarPhoto: 'data:image/png;base64,x' }),
      ).toEqual({});
    });

    it('treats GST as optional but validates its length when present', () => {
      const withShop = { ...typedOnly, shopPhoto: 'data:image/png;base64,x' };
      expect(getStepErrors('documents', withShop)).toEqual({});
      expect(getStepErrors('documents', { ...withShop, gst: 'TOOSHORT' })).toHaveProperty('gst');
      expect(getStepErrors('documents', { ...withShop, gst: '29ABCDE1234F1Z5' })).toEqual({});
    });
  });

  describe('resumeStepIdx — safety: never skip a step missing its document', () => {
    it('clamps back to identity when the merchant had reached the documents step', () => {
      // They got to step 4 (documents), but neither photo survived the
      // interruption — resuming at 3 would skip Aadhaar entirely.
      expect(resumeStepIdx(3, BUSINESS_STEPS, typedOnly)).toBe(2);
    });

    it('stops at the first step whose typed data is incomplete', () => {
      expect(resumeStepIdx(3, BUSINESS_STEPS, { ...typedOnly, businessName: '' })).toBe(1);
      expect(resumeStepIdx(3, BUSINESS_STEPS, { ...typedOnly, pincode: '56' })).toBe(0);
    });

    it('never resumes further than the merchant actually reached', () => {
      expect(resumeStepIdx(1, BUSINESS_STEPS, typedOnly)).toBe(1);
      expect(resumeStepIdx(0, BUSINESS_STEPS, typedOnly)).toBe(0);
    });

    it('starts from scratch for an empty form', () => {
      expect(resumeStepIdx(3, BUSINESS_STEPS, DEFAULT_FORM)).toBe(0);
    });

    it('resumes the customer path, which has no document steps', () => {
      expect(resumeStepIdx(1, CUSTOMER_STEPS, typedOnly)).toBe(1);
    });
  });

  describe('persistence', () => {
    const key = 'business:merchant@example.com';

    beforeEach(() => {
      localStorage.clear();
    });

    it('round-trips typed fields and the step index', () => {
      saveProgress(key, 2, typedOnly);
      const saved = readSavedProgress(key);
      expect(saved.stepIdx).toBe(2);
      expect(saved.form.businessName).toBe('Spec Watch House');
      expect(saved.form.mobile).toBe('9686490924');
    });

    it('never persists the base64 photo fields', () => {
      saveProgress(key, 3, {
        ...typedOnly,
        shopPhoto: 'data:image/png;base64,AAAA',
        aadhaarPhoto: 'data:image/png;base64,BBBB',
        panPhoto: 'data:image/png;base64,CCCC',
      });
      const saved = readSavedProgress(key);
      expect(saved.form).not.toHaveProperty('shopPhoto');
      expect(saved.form).not.toHaveProperty('aadhaarPhoto');
      expect(saved.form).not.toHaveProperty('panPhoto');
      expect(localStorage.getItem(storageKeyFor(key))).not.toContain('base64');
    });

    it('is a no-op without a persistKey, so unscoped wizards never write', () => {
      saveProgress(undefined, 2, typedOnly);
      expect(readSavedProgress(undefined)).toBeNull();
      expect(localStorage.length).toBe(0);
    });

    it('scopes drafts per identity so one merchant never resumes another', () => {
      saveProgress('business:a@example.com', 2, typedOnly);
      expect(readSavedProgress('business:b@example.com')).toBeNull();
    });

    it('clears a draft on completion', () => {
      saveProgress(key, 2, typedOnly);
      clearSavedProgress(key);
      expect(readSavedProgress(key)).toBeNull();
    });

    it('ignores a corrupt or stale-version entry instead of throwing', () => {
      localStorage.setItem(storageKeyFor(key), 'not-json{');
      expect(readSavedProgress(key)).toBeNull();

      localStorage.setItem(storageKeyFor(key), JSON.stringify({ v: 999, stepIdx: 3, form: {} }));
      expect(readSavedProgress(key)).toBeNull();
    });
  });
});
