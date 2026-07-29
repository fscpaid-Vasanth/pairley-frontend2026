/**
 * Pure step/validation/persistence logic for KycOnboardingWizard, kept out of
 * the component so it can be tested directly without pulling in Capacitor,
 * CSS, or a DOM render.
 */

export const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

export const DEFAULT_FORM = {
  mobile: '', city: 'Bangalore', state: '', pincode: '',
  address: '',
  businessName: '', businessType: 'Shop', mallName: '',
  aadhaar: '', pan: '', gst: '',
  shopPhoto: '', aadhaarPhoto: '', panPhoto: '',
};

export const stepsForRole = (role) =>
  role === 'business'
    ? ['contact', 'business', 'identity', 'documents']
    : ['contact', 'address'];

/**
 * Per-step validation as a pure function, so the resume logic below can ask
 * "is this step already satisfied?" using the exact same rules the form
 * enforces rather than a second copy that could drift out of sync.
 */
export const getStepErrors = (step, form) => {
  const errs = {};
  if (step === 'contact') {
    if (!validatePhone(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Pincode must be exactly 6 digits';
  } else if (step === 'address') {
    if (!form.address.trim()) errs.address = 'Detailed address is required';
  } else if (step === 'business') {
    if (!form.businessName.trim()) errs.businessName = 'Shop name is required';
  } else if (step === 'identity') {
    if (!/^\d{12}$/.test(form.aadhaar)) errs.aadhaar = 'Upload a clear Aadhaar photo to scan the number';
    if (!form.aadhaarPhoto) errs.aadhaarPhoto = 'Aadhaar card image is required';
  } else if (step === 'documents') {
    if (!form.shopPhoto) errs.shopPhoto = 'Shop image is required';
    if (form.gst.trim() && form.gst.trim().length !== 15) errs.gst = 'GST number must be exactly 15 characters';
  }
  return errs;
};

// ── Onboarding progress persistence ──────────────────────────────────────
// Without this, the wizard's step index lived only in React state and no
// Business row exists until its final step — so a refresh, an accidental
// back, or simply closing the tab dropped a half-finished merchant
// onboarding back to step 1 with nothing recoverable.
export const PERSIST_VERSION = 1;

// The three photo fields hold base64 data URLs that routinely run to several
// MB each — far past localStorage's ~5MB per-origin quota. Progress therefore
// covers typed fields only, and resumeStepIdx below is clamped so a step
// whose document is missing is never skipped past.
export const UNPERSISTED_FIELDS = ['shopPhoto', 'aadhaarPhoto', 'panPhoto'];

export const storageKeyFor = (persistKey) => `pairley_kyc_progress:${persistKey}`;

export const readSavedProgress = (persistKey) => {
  if (!persistKey) return null;
  try {
    const raw = localStorage.getItem(storageKeyFor(persistKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.v === PERSIST_VERSION ? parsed : null;
  } catch {
    return null; // corrupt entry or storage unavailable — start clean
  }
};

export const saveProgress = (persistKey, stepIdx, form) => {
  if (!persistKey) return;
  const persistable = { ...form };
  UNPERSISTED_FIELDS.forEach((field) => delete persistable[field]);
  try {
    localStorage.setItem(
      storageKeyFor(persistKey),
      JSON.stringify({ v: PERSIST_VERSION, stepIdx, form: persistable }),
    );
  } catch {
    /* quota exceeded or private mode — persistence is an enhancement, never a
       requirement for completing onboarding */
  }
};

export const clearSavedProgress = (persistKey) => {
  if (!persistKey) return;
  try {
    localStorage.removeItem(storageKeyFor(persistKey));
  } catch {
    /* best-effort */
  }
};

/**
 * Furthest step we can honestly drop a returning user at: walk forward from
 * the start while each step's real validation passes, stopping at the first
 * unsatisfied one and never going past where they actually got to.
 *
 * Because photos aren't persisted, a business user resumes with their contact
 * and business details intact but still has to re-supply the documents — the
 * clamp is what guarantees a required KYC document can never be skipped by
 * restoring a later step index.
 */
export const resumeStepIdx = (savedIdx, steps, form) => {
  let idx = 0;
  while (
    idx < savedIdx &&
    idx < steps.length - 1 &&
    Object.keys(getStepErrors(steps[idx], form)).length === 0
  ) {
    idx += 1;
  }
  return idx;
};
