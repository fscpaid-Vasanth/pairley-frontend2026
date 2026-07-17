import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import SEO from '../../components/SEO';
import OtpInput from '../../components/OtpInput';
import KycOnboardingWizard from '../../components/auth/KycOnboardingWizard';
import './SignUpPage.css';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));
const isTestNumber = (mobile) =>
  mobile === '9962045143' || mobile === '1234567890' ||
  ['99999', '88888', '77777', '66666'].some((p) => mobile.startsWith(p));

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kochi', 'Kolkata', 'Jaipur'];

const PANEL_COPY = {
  customer: { icon: 'shopping_bag', title: 'Customer Sign Up', subtitle: 'Join and start saving with your community.' },
  business: { icon: 'storefront', title: 'Merchant Sign Up', subtitle: 'List your store, zero onboarding fee.' },
};

/**
 * A single self-contained signup form for one role — two of these render
 * side by side. Both collect the same minimal fields; anything role-specific
 * (shop name, KYC documents) is collected afterward in KycOnboardingWizard
 * rather than duplicated here, so both panels stay short enough to fit one
 * screen next to each other.
 */
function SignupPanel({ role, onBasicInfoSubmit, onGoogleNewUser }) {
  const { showToast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', city: 'Bangalore', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email format';
    if (!validatePhone(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    if (!agreed) errs.terms = 'You must agree to the Terms & Privacy Policy';
    setErrors(errs);
    if (Object.keys(errs).length) {
      showToast('Please correct the validation errors.', 'error');
      return;
    }
    onBasicInfoSubmit(role, form);
  };

  const handleGoogleSignIn = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return;
      const checkPayload = {
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email,
        role: role === 'customer' ? 'Customer' : 'Business',
        google_uid: firebaseUser.uid,
        profile_photo: firebaseUser.photoURL || undefined,
      };
      const res = await api.post('/auth/google', checkPayload);
      if (res.exists) {
        localStorage.setItem('pairley_token', res.access_token || res.token);
        localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
        showToast('Logged in with Google!', 'success');
        window.location.href = res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard';
      } else {
        onGoogleNewUser(role, checkPayload);
      }
    } catch (error) {
      console.error('Google Auth failed:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-in cancelled.', 'warning');
      } else {
        showToast('Google Sign-in failed. Please try again.', 'error');
      }
    }
  };

  const copy = PANEL_COPY[role];

  return (
    <div className={`signup-panel signup-panel--${role === 'business' ? 'business' : 'customer'}`}>
      <div className="signup-panel__header">
        <span className="signup-panel__icon material-symbols-outlined">{copy.icon}</span>
        <div>
          <h2 className="signup-panel__title">{copy.title}</h2>
          <p className="signup-panel__subtitle">{copy.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="signup-form">
        <div className="su-field">
          <label className="su-label">Full Name</label>
          <div className="su-input-wrap">
            <span className="material-symbols-outlined su-input-icon">person</span>
            <input type="text" placeholder="Your full name" className={`su-input ${errors.fullName ? 'su-input--error' : ''}`} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          {errors.fullName && <span className="su-error">{errors.fullName}</span>}
        </div>

        <div className="su-field">
          <label className="su-label">Email Address</label>
          <div className="su-input-wrap">
            <span className="material-symbols-outlined su-input-icon">mail</span>
            <input type="email" placeholder="your@email.com" className={`su-input ${errors.email ? 'su-input--error' : ''}`} value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          {errors.email && <span className="su-error">{errors.email}</span>}
        </div>

        <div className="su-field">
          <label className="su-label">Mobile Number</label>
          <div className="su-phone-row">
            <span className="su-country-code" style={{ display: 'flex', alignItems: 'center' }}>🇮🇳 +91</span>
            <input type="tel" placeholder="10-digit mobile number" className={`su-input su-phone-input ${errors.phone ? 'su-input--error' : ''}`} value={form.phone} maxLength={10} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </div>
          {errors.phone && <span className="su-error">{errors.phone}</span>}
        </div>

        <div className="su-field">
          <label className="su-label">City</label>
          <select className="su-input" style={{ background: 'white' }} value={form.city} onChange={(e) => update('city', e.target.value)}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="su-password-row">
          <div className="su-field su-half">
            <label className="su-label">Password</label>
            <div className="su-input-wrap">
              <span className="material-symbols-outlined su-input-icon">lock</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className={`su-input su-input--pw ${errors.password ? 'su-input--error' : ''}`} value={form.password} onChange={(e) => update('password', e.target.value)} />
              <button type="button" className="su-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
            {errors.password && <span className="su-error">{errors.password}</span>}
          </div>
          <div className="su-field su-half">
            <label className="su-label">Confirm</label>
            <div className="su-input-wrap">
              <span className="material-symbols-outlined su-input-icon">lock_clock</span>
              <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" className={`su-input su-input--pw ${errors.confirmPassword ? 'su-input--error' : ''}`} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
              <button type="button" className="su-pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showConfirm ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
            {errors.confirmPassword && <span className="su-error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="su-terms-wrap">
          <label className="su-terms">
            <input type="checkbox" className="su-checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' })); }} />
            I agree to the{' '}
            <button type="button" className="su-terms-link" onClick={() => alert('Terms of Use (coming soon)')}>Terms</button>
            {' '}&amp;{' '}
            <button type="button" className="su-terms-link" onClick={() => alert('Privacy Policy (coming soon)')}>Privacy Policy</button>
          </label>
          {errors.terms && <span className="su-error">{errors.terms}</span>}
        </div>

        <button type="submit" className="su-submit-btn">
          {role === 'customer' ? 'Create Account' : 'Register Your Shop'}
        </button>
      </form>

      <div className="su-divider">
        <span className="su-divider-line" /><span className="su-divider-text">or</span><span className="su-divider-line" />
      </div>
      <button type="button" className="su-social-btn" style={{ width: '100%' }} onClick={handleGoogleSignIn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [view, setView] = useState('panels'); // 'panels' | 'kyc' | 'otp'
  const [kycContext, setKycContext] = useState(null); // { role, googleUser? , basicInfo? }
  const [pendingPayload, setPendingPayload] = useState(null);
  const [otpMode, setOtpMode] = useState('register'); // 'register' | 'google'
  const [otp, setOtp] = useState('');
  const [resendSeconds, setResendSeconds] = useState(30);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (view !== 'otp' || resendSeconds <= 0) return;
    const interval = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [view, resendSeconds]);

  useEffect(() => {
    if (view === 'otp') {
      showToast('Use Default OTP: 123456', 'info');
    }
  }, [view, showToast]);

  const sendOtpAndGoToVerify = (payload, mode) => {
    setPendingPayload(payload);
    setOtpMode(mode);
    if (isTestNumber(payload.mobile)) {
      setOtp('123456');
      setResendSeconds(30);
      setView('otp');
      showToast('Test account detected: OTP has been auto-filled with 123456.', 'success');
      return;
    }
    setBusy(true);
    api.post('/auth/send-otp', { mobile: payload.mobile })
      .then(() => {
        setOtp('');
        setResendSeconds(30);
        setView('otp');
        showToast(`Verification code sent to +91 ${payload.mobile}.`, 'success');
      })
      .catch(() => {
        setOtp('');
        setResendSeconds(30);
        setView('otp');
        showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
      })
      .finally(() => setBusy(false));
  };

  const handleBasicInfoSubmit = (role, form) => {
    if (role === 'business') {
      setKycContext({ role: 'business', basicInfo: form });
      setView('kyc');
      return;
    }
    sendOtpAndGoToVerify({
      name: form.fullName,
      mobile: form.phone,
      email: form.email,
      role: 'Customer',
      password: form.password,
      address: 'Select Address',
      city: form.city || 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    }, 'register');
  };

  const handleGoogleNewUser = (role, googleUser) => {
    setKycContext({ role, googleUser });
    setView('kyc');
  };

  const handleKycComplete = (fields) => {
    const { role, googleUser, basicInfo } = kycContext;
    if (googleUser) {
      sendOtpAndGoToVerify({ ...googleUser, ...fields }, 'google');
    } else {
      sendOtpAndGoToVerify({
        name: basicInfo.fullName,
        mobile: basicInfo.phone,
        email: basicInfo.email,
        role: role === 'business' ? 'Business' : 'Customer',
        password: basicInfo.password,
        ...fields,
      }, 'register');
    }
  };

  const handleResendOtp = () => {
    if (resendSeconds > 0) return;
    setResendSeconds(30);
    api.post('/auth/send-otp', { mobile: pendingPayload.mobile })
      .then(() => showToast('Verification code resent.', 'success'))
      .catch((err) => showToast(err.message || 'Failed to resend code.', 'error'));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      showToast('Enter all 6 digits of the OTP.', 'error');
      return;
    }
    setBusy(true);
    api.post('/auth/verify-otp', { mobile: pendingPayload.mobile, code: otp })
      .then(() => (otpMode === 'register' ? api.post('/auth/register', pendingPayload) : api.post('/auth/google', pendingPayload)))
      .then((res) => {
        const token = res.token || res.access_token;
        localStorage.setItem('pairley_token', token);
        localStorage.setItem('pairley_user', JSON.stringify({ ...(res.user || {}), role: res.role }));
        if (res.role === 'Business') {
          showToast("Shop registered! Your account is pending admin approval (24–48 hrs). You'll be notified once approved. 🎉", 'info');
        } else {
          showToast('Account created successfully! Welcome to Pairley 🎉', 'success');
        }
        navigate(res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard');
      })
      .catch((err) => {
        console.error('Registration/Verification failed:', err);
        const msg = err.message || '';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
          showToast('This mobile number or email is already registered. Please log in instead.', 'warning');
          navigate('/login');
        } else {
          showToast(msg || 'Invalid verification code or registration failed.', 'error');
        }
      })
      .finally(() => setBusy(false));
  };

  const isFixed = view === 'panels';

  return (
    <div className={`signup-root ${isFixed ? 'signup-root--fixed' : ''}`}>
      <SEO title="Sign Up — Pairley" description="Create your Pairley customer or merchant account." />
      <header className="signup-header">
        <Link className="signup-brand" to="/">
          <img src="/logo.svg" alt="Pairley Logo" className="signup-logo-img" />
        </Link>
        <Link className="signup-back-btn" to="/">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Home
        </Link>
      </header>

      <main className="signup-main">
        {view === 'panels' && (
          <div className="signup-dual-grid">
            <SignupPanel role="customer" onBasicInfoSubmit={handleBasicInfoSubmit} onGoogleNewUser={handleGoogleNewUser} />
            <SignupPanel role="business" onBasicInfoSubmit={handleBasicInfoSubmit} onGoogleNewUser={handleGoogleNewUser} />
          </div>
        )}

        {view === 'kyc' && kycContext && (
          <div className="signup-single-card-wrap">
            <div className={`signup-panel signup-panel--${kycContext.role === 'business' ? 'business' : 'customer'}`}>
              <KycOnboardingWizard
                role={kycContext.role === 'business' ? 'business' : 'customer'}
                onComplete={handleKycComplete}
                onCancel={() => { setKycContext(null); setView('panels'); }}
              />
            </div>
          </div>
        )}

        {view === 'otp' && (
          <div className="signup-single-card-wrap">
            <div className="signup-panel signup-panel--customer">
              <div className="su-otp-wrap">
                <h2 className="signup-card-title">Verify Mobile Number</h2>
                <p className="signup-card-subtitle">
                  Enter the code sent to <strong style={{ color: '#000f22' }}>+91 {pendingPayload?.mobile}</strong>
                </p>
                <form onSubmit={handleVerifyOtp} className="signup-form w-full">
                  <OtpInput value={otp} onChange={setOtp} variant="light" />

                  <div style={{
                    background: 'rgba(79, 70, 229, 0.06)',
                    border: '1px dashed rgba(79, 70, 229, 0.3)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#4f46e5',
                    marginTop: 14,
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    💡 Use Default OTP: <strong>123456</strong>
                  </div>

                  <button type="submit" className="su-submit-btn" disabled={busy} style={{ marginTop: 18 }}>
                    {busy ? 'Verifying…' : 'Verify & Create Account'}
                  </button>
                </form>
                <div className="su-otp-timer">
                  {resendSeconds > 0 ? (
                    <span>Resend in <strong>{resendSeconds}s</strong></span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} className="su-otp-resend">Resend Code</button>
                  )}
                </div>
                <button type="button" className="su-terms-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 12 }} onClick={() => setView('panels')}>
                  ← Back to edit details
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {isFixed && (
        <footer className="signup-footer">
          <span className="signup-footer-item"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span> Secure Platform</span>
          <span className="signup-footer-item"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span> 24/7 Support</span>
          <span className="signup-footer-item"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>local_offer</span> Best Prices</span>
        </footer>
      )}

      {view === 'panels' && (
        <p className="su-login-link" style={{ textAlign: 'center', marginBottom: 12 }}>
          Already have an account?{' '}
          <Link to="/login" className="su-login-anchor">Log In</Link>
        </p>
      )}
    </div>
  );
}
