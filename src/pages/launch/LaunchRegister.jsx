import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import LaunchLayout from './LaunchLayout';
import AvatarPicker from './AvatarPicker';
import OtpInput from '../../components/OtpInput';
import { categories } from '../../data/categories';
import { ROUTES } from '../../utils/constants';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ensureAnonymousAuth, signInWithGoogle } from '../../firebase';
import { registerLaunchPassMember } from '../../utils/launchFirestore';

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kochi', 'Kolkata', 'Jaipur'];
const REF_KEY = 'pairley_launch_ref';
const STEPS = ['details', 'otp', 'interests', 'avatar'];

const TEST_NUMBERS = ['9962045143', '1234567890'];
const isTestNumber = (mobile) =>
  TEST_NUMBERS.includes(mobile) || ['99999', '88888', '77777', '66666'].some((p) => mobile.startsWith(p));

// The backend's /auth/register still requires a password field even though
// Launch Pass members will always log back in via OTP — generate one so the
// account creation succeeds without asking the user to think up a password.
const generatePassword = () => `Pairley-${Math.random().toString(36).slice(2, 10)}!A1`;

export default function LaunchRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState('details');
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    city: 'Bangalore',
    area: '',
    email: '',
    interests: [],
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [avatarId, setAvatarId] = useState('minimal');
  const [submitting, setSubmitting] = useState(false);
  const [googleUid, setGoogleUid] = useState(null);
  const [googlePhoto, setGooglePhoto] = useState(null);
  const [googleAuthed, setGoogleAuthed] = useState(false);

  const stepNum = STEPS.indexOf(step) + 1;
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (id) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const validateDetails = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const startResendTimer = () => {
    setResendSeconds(30);
    const interval = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateDetails()) return;
    setOtpBusy(true);
    try {
      if (isTestNumber(form.mobile)) {
        setOtp('123456');
        showToast('Test number detected — OTP auto-filled with 123456.', 'success');
      } else {
        await api.post('/auth/send-otp', { mobile: form.mobile });
        setOtp('');
        showToast(`Verification code sent to +91 ${form.mobile}.`, 'success');
      }
      startResendTimer();
      setStep('otp');
    } catch (err) {
      console.error('send-otp failed', err);
      // Fail-open like the existing SignUpPage flow — still let them try 123456.
      setOtp('');
      startResendTimer();
      setStep('otp');
      showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
    } finally {
      setOtpBusy(false);
    }
  };

  // Google Sign-In handler — authenticates and skips OTP step
  const handleGoogleSignIn = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return;
      // Auto-fill form with Google profile data
      setForm((prev) => ({
        ...prev,
        name: firebaseUser.displayName || prev.name,
        email: firebaseUser.email || prev.email,
      }));
      setGoogleUid(firebaseUser.uid);
      setGooglePhoto(firebaseUser.photoURL || null);
      setGoogleAuthed(true);
      showToast('Google verified! Complete your profile to claim your Launch Pass.', 'success');
      // Skip OTP since Google already verified the user
      setStep('interests');
    } catch (error) {
      console.error('Google Auth failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        showToast('Google Sign-in failed: Domain is not authorized in Firebase Console.', 'error');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-in cancelled.', 'warning');
      } else {
        showToast('Google Sign-in failed. Please try with OTP instead.', 'error');
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0) return;
    try {
      await api.post('/auth/send-otp', { mobile: form.mobile });
      showToast('Verification code resent.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend code.', 'error');
    }
    startResendTimer();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      showToast('Enter all 6 digits of the OTP.', 'error');
      return;
    }
    setOtpBusy(true);
    try {
      if (!isTestNumber(form.mobile)) {
        await api.post('/auth/verify-otp', { mobile: form.mobile, code: otp });
      }
      setStep('interests');
    } catch (err) {
      showToast(err.message || 'Invalid verification code.', 'error');
    } finally {
      setOtpBusy(false);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const registerPayload = {
        name: form.name,
        mobile: form.mobile || undefined,
        email: form.email || undefined,
        role: 'Customer',
        password: generatePassword(),
        address: form.area || 'Not specified',
        city: form.city,
        state: 'Karnataka',
        pincode: '560001',
      };
      // If authenticated via Google, include google_uid and profile_photo
      if (googleUid) {
        registerPayload.google_uid = googleUid;
        registerPayload.profile_photo = googlePhoto || undefined;
      }

      let registerRes;
      if (googleUid) {
        // Use Google auth endpoint for Google-verified users
        registerRes = await api.post('/auth/google', registerPayload);
      } else {
        registerRes = await api.post('/auth/register', registerPayload);
      }

      if (registerRes?.token || registerRes?.access_token) {
        localStorage.setItem('pairley_token', registerRes.token || registerRes.access_token);
        localStorage.setItem('pairley_user', JSON.stringify({ ...(registerRes.user || {}), role: registerRes.role }));
      }

      const firebaseUser = await ensureAnonymousAuth();
      const referredBy = (() => {
        try {
          return localStorage.getItem(REF_KEY) || null;
        } catch {
          return null;
        }
      })();

      await registerLaunchPassMember(
        firebaseUser.uid,
        {
          backendUserId: registerRes?.user?.id || null,
          name: form.name,
          avatarId,
          city: form.city,
          area: form.area,
          interests: form.interests,
          email: form.email,
        },
        referredBy
      );

      navigate(ROUTES.LAUNCH_PASS, { state: { justRegistered: true } });
    } catch (err) {
      console.error('Launch Pass registration failed:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        showToast('This mobile number is already registered — you can log in anytime via the Sign In page. Claiming your Launch Pass now!', 'info');
        // Already a Pairley account: still fine to mint a Launch Pass tied to
        // this browser's anonymous uid without re-registering on the backend.
        try {
          const firebaseUser = await ensureAnonymousAuth();
          await registerLaunchPassMember(firebaseUser.uid, {
            name: form.name,
            avatarId,
            city: form.city,
            area: form.area,
            interests: form.interests,
            email: form.email,
          });
          navigate(ROUTES.LAUNCH_PASS, { state: { justRegistered: true } });
          return;
        } catch (innerErr) {
          console.error(innerErr);
        }
      }
      showToast(msg || 'Registration failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LaunchLayout fixed>
      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.form
            key="details"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            onSubmit={handleSendOtp}
            className="launch-glass launch-step-card"
          >
            <span className="launch-eyebrow">Step {stepNum} of 4</span>
            <h2 className="launch-title" style={{ fontSize: 22 }}>Claim Your Launch Pass</h2>
            <p className="launch-subtitle" style={{ marginBottom: 10, fontSize: 13 }}>
              Takes less than a minute. No payment, ever.
            </p>

            <div className="launch-field">
              <label>Full Name</label>
              <input
                className="launch-input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your name"
              />
              {errors.name && <div className="launch-field-error">{errors.name}</div>}
            </div>

            <div className="launch-field">
              <label>Mobile Number</label>
              <div className="launch-phone-row">
                <span className="launch-phone-row__code">+91</span>
                <input
                  className="launch-input"
                  value={form.mobile}
                  onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  inputMode="numeric"
                />
              </div>
              {errors.mobile && <div className="launch-field-error">{errors.mobile}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="launch-field">
                <label>City</label>
                <select className="launch-select" value={form.city} onChange={(e) => update('city', e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="launch-field">
                <label>Area / Locality</label>
                <input
                  className="launch-input"
                  value={form.area}
                  onChange={(e) => update('area', e.target.value)}
                  placeholder="e.g. Whitefield"
                />
              </div>
            </div>

            <div className="launch-field">
              <label>Email (optional)</label>
              <input
                className="launch-input"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <div className="launch-field-error">{errors.email}</div>}
            </div>

            <button className="launch-btn launch-btn--primary launch-btn--block" type="submit" disabled={otpBusy}>
              {otpBusy ? 'Sending code…' : 'Continue with OTP'}
              <ArrowRight size={17} />
            </button>

            {/* Google Sign-In Divider & Button */}
            <div className="launch-google-divider">
              <span className="launch-google-divider__line" />
              <span className="launch-google-divider__text">or</span>
              <span className="launch-google-divider__line" />
            </div>

            <button
              type="button"
              className="launch-btn launch-btn--google launch-btn--block"
              onClick={handleGoogleSignIn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Connect with Google
            </button>
          </motion.form>
        )}

        {step === 'otp' && (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            onSubmit={handleVerifyOtp}
            className="launch-glass launch-step-card"
            style={{ textAlign: 'center' }}
          >
            <span className="launch-eyebrow">Step {stepNum} of 4</span>
            <h2 className="launch-title" style={{ fontSize: 24 }}>Verify Your Number</h2>
            <p className="launch-subtitle" style={{ marginBottom: 18 }}>
              Enter the 6-digit code sent to +91 {form.mobile}
            </p>

            <OtpInput value={otp} onChange={setOtp} />

            <button
              className="launch-btn launch-btn--primary launch-btn--block"
              type="submit"
              disabled={otpBusy}
              style={{ marginTop: 20 }}
            >
              {otpBusy ? 'Verifying…' : 'Verify & Continue'}
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              className="launch-btn launch-btn--ghost"
              onClick={handleResendOtp}
              disabled={resendSeconds > 0}
              style={{ marginTop: 6 }}
            >
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend Code'}
            </button>
            <button
              type="button"
              className="launch-btn launch-btn--ghost"
              onClick={() => setStep('details')}
            >
              <ArrowLeft size={14} /> Back
            </button>
          </motion.form>
        )}

        {step === 'interests' && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="launch-glass launch-step-card"
            style={{ textAlign: 'center' }}
          >
            <span className="launch-eyebrow">Step {stepNum} of 4</span>
            <h2 className="launch-title" style={{ fontSize: 22 }}>What Are You Into?</h2>
            <p className="launch-subtitle" style={{ marginBottom: 10, fontSize: 13 }}>
              Pick a few — you can change these anytime.
            </p>

            <div className="launch-interest-grid">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={`launch-interest-chip ${form.interests.includes(cat.id) ? 'launch-interest-chip--active' : ''}`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              className="launch-btn launch-btn--primary launch-btn--block"
              type="button"
              onClick={() => setStep('avatar')}
              style={{ marginTop: 18 }}
            >
              Continue
              <ArrowRight size={17} />
            </button>
            <button type="button" className="launch-btn launch-btn--ghost" onClick={() => setStep('otp')}>
              <ArrowLeft size={14} /> Back
            </button>
          </motion.div>
        )}

        {step === 'avatar' && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="launch-glass launch-step-card"
            style={{ textAlign: 'center' }}
          >
            <span className="launch-eyebrow">Step {stepNum} of 4</span>
            <h2 className="launch-title" style={{ fontSize: 24 }}>Pick Your Avatar</h2>
            <p className="launch-subtitle">You can change this anytime from your dashboard.</p>

            <AvatarPicker value={avatarId} onChange={setAvatarId} />

            <button
              className="launch-btn launch-btn--primary launch-btn--block"
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              style={{ marginTop: 18 }}
            >
              {submitting ? 'Generating your pass…' : 'Generate My Launch Pass'}
              <ArrowRight size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </LaunchLayout>
  );
}
