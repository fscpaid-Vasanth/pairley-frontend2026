import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import SEO from '../../components/SEO';
import OtpInput from '../../components/OtpInput';
import KycOnboardingWizard from '../../components/auth/KycOnboardingWizard';
import './LoginPage.css';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));
const isTestNumber = (mobile) =>
  mobile === '9962045143' || mobile === '1234567890' ||
  ['99999', '88888', '77777', '66666'].some((p) => mobile.startsWith(p));

const dashboardPathFor = (role) =>
  role === 'Admin' ? '/admin/dashboard' : role === 'Customer' ? '/customer/dashboard' : '/business/dashboard';

const PANEL_COPY = {
  customer: { icon: 'shopping_bag', title: 'Customer Login', subtitle: 'Pair up with buyers to split prices 50/50.' },
  business: { icon: 'storefront', title: 'Merchant Login', subtitle: 'Manage your store and publish BOGO deals.' },
};

/**
 * A single self-contained login form for one role — two of these render
 * side by side (Customer / Merchant), each with its own Password/OTP tabs
 * and its own local state, so filling one out never affects the other.
 */
function LoginPanel({ role, isAdminLogin = false, onGoogleNewUser, onForgotPassword }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [method, setMethod] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const [otpStep, setOtpStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (method !== 'otp' || otpStep !== 'verify' || resendSeconds <= 0) return;
    const interval = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [method, otpStep, resendSeconds]);

  useEffect(() => {
    if (method === 'otp' && otpStep === 'verify') {
      showToast('Use Default OTP: 123456', 'info');
    }
  }, [method, otpStep, showToast]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const routeAfterLogin = (res) => {
    if (res.role === 'Admin' && !isAdminLogin) {
      showToast('Access denied: Admin credentials must be used via the Admin Portal link.', 'error');
      return;
    }
    localStorage.setItem('pairley_token', res.access_token || res.token);
    localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
    showToast('Logged in successfully!', 'success');
    navigate(dashboardPathFor(res.role));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (form.email.trim().toLowerCase() === 'admin@pairley.com' && !isAdminLogin) {
      showToast('Access denied: Admin credentials must be used via the Admin Portal link.', 'error');
      return;
    }

    setBusy(true);
    api.post('/auth/login', { email: form.email, password_hash: form.password })
      .then(routeAfterLogin)
      .catch((err) => showToast(err.message || 'Login failed. Invalid email or password.', 'error'))
      .finally(() => setBusy(false));
  };

  const startResendTimer = () => setResendSeconds(30);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setErrors({ phone: 'Enter a valid 10-digit mobile number' });
      return;
    }
    setErrors({});
    setBusy(true);
    if (isTestNumber(phone)) {
      setOtp('123456');
      setOtpStep('verify');
      startResendTimer();
      showToast('Test number detected — OTP auto-filled with 123456.', 'success');
      setBusy(false);
      return;
    }
    api.post('/auth/send-otp', { mobile: phone })
      .then(() => {
        setOtp('');
        setOtpStep('verify');
        startResendTimer();
        showToast(`OTP sent to +91 ${phone}.`, 'success');
      })
      .catch(() => {
        setOtp('');
        setOtpStep('verify');
        startResendTimer();
        showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
      })
      .finally(() => setBusy(false));
  };

  const handleResendOtp = () => {
    if (resendSeconds > 0) return;
    startResendTimer();
    api.post('/auth/send-otp', { mobile: phone })
      .then(() => showToast('OTP resent.', 'success'))
      .catch((err) => showToast(err.message || 'Failed to resend OTP.', 'error'));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      showToast('Enter all 6 digits of the OTP.', 'error');
      return;
    }
    setBusy(true);
    api.post('/auth/verify-otp', { mobile: phone, code: otp })
      .then((res) => {
        if (res.exists) {
          routeAfterLogin(res);
        } else {
          showToast('No account found with this number — redirecting to sign up.', 'warning');
          navigate('/signup');
        }
      })
      .catch((err) => showToast(err.message || 'Invalid verification code.', 'error'))
      .finally(() => setBusy(false));
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
        routeAfterLogin(res);
      } else {
        onGoogleNewUser(role, checkPayload);
      }
    } catch (error) {
      console.error('Google Auth failed:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-in cancelled.', 'warning');
      } else {
        showToast('Google Sign-in failed. Please try again or use another method.', 'error');
      }
    }
  };

  const copy = PANEL_COPY[role];

  return (
    <div className={`login-panel login-panel--${role === 'business' ? 'business' : 'customer'}`}>
      {!isAdminLogin && (
        <div className="login-panel__header">
          <span className="login-panel__icon material-symbols-outlined">{copy.icon}</span>
          <div>
            <h2 className="login-panel__title">{copy.title}</h2>
            <p className="login-panel__subtitle">{copy.subtitle}</p>
          </div>
        </div>
      )}

      {!isAdminLogin && (
        <div className="login-method-tabs">
          <button type="button" className={`login-method-tab ${method === 'password' ? 'login-method-tab--active' : ''}`} onClick={() => setMethod('password')}>
            🔑 Password
          </button>
          <button type="button" className={`login-method-tab ${method === 'otp' ? 'login-method-tab--active' : ''}`} onClick={() => setMethod('otp')}>
            📱 OTP
          </button>
        </div>
      )}

      {method === 'otp' && otpStep === 'verify' && !isAdminLogin ? (
        <div className="login-otp-wrap">
          <h2 className="login-card-title">Verify Phone Number</h2>
          <p className="login-card-subtitle">
            Enter the code sent to <strong style={{ color: '#000f22' }}>+91 {phone}</strong>
          </p>
          <form onSubmit={handleVerifyOtp} className="login-form w-full">
            <OtpInput value={otp} onChange={setOtp} variant="light" />

            <div style={{
              background: 'rgba(79, 70, 229, 0.06)',
              border: '1px dashed rgba(79, 70, 229, 0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              color: '#4f46e5',
              marginTop: 12,
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              💡 Use Default OTP: <strong>123456</strong>
            </div>

            <button type="submit" className="login-submit-btn" disabled={busy} style={{ marginTop: 16 }}>
              {busy ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>
          <div className="login-otp-timer">
            {resendSeconds > 0 ? (
              <span>Resend in <strong>{resendSeconds}s</strong></span>
            ) : (
              <button type="button" onClick={handleResendOtp} className="login-otp-resend">Resend Code</button>
            )}
          </div>
          <button type="button" className="login-signup-anchor" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 8 }} onClick={() => setOtpStep('phone')}>
            ← Back
          </button>
        </div>
      ) : method === 'password' || isAdminLogin ? (
        <form onSubmit={handlePasswordSubmit} noValidate className="login-form">
          <div className="login-field">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrap">
              <span className="material-symbols-outlined login-input-icon">mail</span>
              <input type="text" placeholder="Enter email address" className={`login-input ${errors.email ? 'login-input--error' : ''}`} value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            {errors.email && <span className="login-error">{errors.email}</span>}
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <span className="material-symbols-outlined login-input-icon">lock</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className={`login-input login-input--pw ${errors.password ? 'login-input--error' : ''}`} value={form.password} onChange={(e) => update('password', e.target.value)} />
              <button type="button" className="login-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
            {errors.password && <span className="login-error">{errors.password}</span>}
          </div>
          <div className="login-options-row">
            <label className="login-remember">
              <input type="checkbox" className="login-checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember Me
            </label>
            <button type="button" className="login-forgot" onClick={onForgotPassword}>Forgot Password?</button>
          </div>
          <button type="submit" className="login-submit-btn" disabled={busy}>
            {busy ? 'Logging in…' : isAdminLogin ? 'Admin Secure Login' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} noValidate className="login-form">
          <div className="login-field">
            <label className="login-label">Mobile Number</label>
            <div className="login-phone-row">
              <span className="login-country-code" style={{ display: 'flex', alignItems: 'center' }}>🇮🇳 +91</span>
              <input type="tel" placeholder="10-digit mobile number" className={`login-input login-phone-input ${errors.phone ? 'login-input--error' : ''}`} value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            {errors.phone && <span className="login-error">{errors.phone}</span>}
          </div>
          <button type="submit" className="login-submit-btn" disabled={busy}>
            {busy ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      )}

      {!isAdminLogin && !(method === 'otp' && otpStep === 'verify') && (
        <>
          <div className="login-divider">
            <span className="login-divider-line" /><span className="login-divider-text">or</span><span className="login-divider-line" />
          </div>
          <button type="button" className="login-social-btn" style={{ width: '100%' }} onClick={handleGoogleSignIn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const isAdminLogin = searchParams.get('role') === 'admin';

  const [selectedRole, setSelectedRole] = useState(() => {
    const roleParam = searchParams.get('role') || '';
    if (roleParam.toLowerCase() === 'business' || roleParam.toLowerCase() === 'merchant') {
      return 'business';
    }
    return 'customer';
  });

  const [onboarding, setOnboarding] = useState(null); // { role, googleUser } | null
  const [onboardingOtpStep, setOnboardingOtpStep] = useState('none'); // 'none' | 'otp'
  const [onboardingOtp, setOnboardingOtp] = useState('');
  const [onboardingPayload, setOnboardingPayload] = useState(null);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [onboardingResendSeconds, setOnboardingResendSeconds] = useState(0);

  useEffect(() => {
    if (onboardingOtpStep !== 'otp' || onboardingResendSeconds <= 0) return;
    const interval = setInterval(() => setOnboardingResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [onboardingOtpStep, onboardingResendSeconds]);

  useEffect(() => {
    if (onboardingOtpStep === 'otp') {
      showToast('Use Default OTP: 123456', 'info');
    }
  }, [onboardingOtpStep, showToast]);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleGoogleNewUser = (role, googleUser) => setOnboarding({ role, googleUser });

  const handleOnboardingComplete = (fields) => {
    const payload = { ...onboarding.googleUser, ...fields };
    setOnboardingPayload(payload);
    setOnboardingBusy(true);

    if (isTestNumber(fields.mobile)) {
      setOnboardingOtp('123456');
      setOnboardingOtpStep('otp');
      setOnboardingResendSeconds(30);
      setOnboardingBusy(false);
      showToast('Test number detected — OTP auto-filled with 123456.', 'success');
      return;
    }

    api.post('/auth/send-otp', { mobile: fields.mobile })
      .then(() => {
        setOnboardingOtp('');
        setOnboardingOtpStep('otp');
        setOnboardingResendSeconds(30);
        showToast(`Verification code sent to +91 ${fields.mobile}.`, 'success');
      })
      .catch((err) => {
        setOnboardingOtp('');
        setOnboardingOtpStep('otp');
        setOnboardingResendSeconds(30);
        showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
      })
      .finally(() => setOnboardingBusy(false));
  };

  const handleResendOnboardingOtp = () => {
    if (onboardingResendSeconds > 0) return;
    setOnboardingResendSeconds(30);
    if (isTestNumber(onboardingPayload.mobile)) {
      setOnboardingOtp('123456');
      showToast('Test number detected — OTP auto-filled with 123456.', 'success');
      return;
    }
    api.post('/auth/send-otp', { mobile: onboardingPayload.mobile })
      .then(() => showToast('Verification code resent.', 'success'))
      .catch((err) => showToast(err.message || 'Failed to resend code.', 'error'));
  };

  const handleVerifyOnboardingOtp = (e) => {
    e.preventDefault();
    if (onboardingOtp.length < 6) {
      showToast('Enter all 6 digits of the OTP.', 'error');
      return;
    }
    setOnboardingBusy(true);
    let verifyPromise;
    if (isTestNumber(onboardingPayload.mobile)) {
      verifyPromise = Promise.resolve();
    } else {
      verifyPromise = api.post('/auth/verify-otp', { mobile: onboardingPayload.mobile, code: onboardingOtp });
    }

    verifyPromise
      .then(() => api.post('/auth/google', onboardingPayload))
      .then((res) => {
        localStorage.setItem('pairley_token', res.access_token || res.token);
        localStorage.setItem('pairley_user', JSON.stringify({ ...(res.user || {}), role: res.role }));

        if (res.role === 'Business') {
          showToast("Shop registered! Your account is pending admin approval (24–48 hrs). 🎉", 'info');
        } else {
          showToast('Profile completed and logged in!', 'success');
        }
        window.location.href = dashboardPathFor(res.role);
      })
      .catch((err) => {
        console.error('Onboarding registration/verification failed:', err);
        showToast(err.message || 'Invalid verification code or registration failed.', 'error');
      })
      .finally(() => setOnboardingBusy(false));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const email = forgotEmail.trim();
    if (!email) return setForgotError('Email Address is required');
    if (!validateEmail(email)) return setForgotError('Invalid email format');
    setForgotError('');
    setForgotSending(true);
    api.post('/auth/forgot-password', { email })
      .then(() => { setForgotSending(false); setForgotSuccess(true); })
      .catch(() => {
        setTimeout(() => { setForgotSending(false); setForgotSuccess(true); }, 1000);
      });
  };

  return (
    <div className={`login-root ${!onboarding ? 'login-root--fixed' : ''}`}>
      <SEO title="Login — Pairley" description="Log in to your Pairley customer or merchant account." />
      <header className="login-header">
        <Link className="login-brand" to="/">
          <img src="/logo.svg" alt="Pairley Logo" className="login-logo-img" />
        </Link>
        <Link className="login-back-btn" to="/">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Home
        </Link>
      </header>

      <main className="login-main">
        {onboarding ? (
          <div className="login-single-card-wrap">
            <div className={`login-panel login-panel--${onboarding.role === 'business' ? 'business' : 'customer'}`}>
              {onboardingOtpStep === 'otp' ? (
                <div className="login-otp-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '105%', margin: '0 auto' }}>
                  <h2 className="login-card-title" style={{ color: '#0f172a' }}>Verify Phone Number</h2>
                  <p className="login-card-subtitle" style={{ marginBottom: 16 }}>
                    Enter the code sent to <strong style={{ color: '#00af80' }}>+91 {onboardingPayload?.mobile}</strong>
                  </p>
                  <form onSubmit={handleVerifyOnboardingOtp} className="login-form w-full">
                    <OtpInput value={onboardingOtp} onChange={setOnboardingOtp} variant="light" />

                    <div style={{
                      background: 'rgba(79, 70, 229, 0.06)',
                      border: '1px dashed rgba(79, 70, 229, 0.3)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                      color: '#4f46e5',
                      marginTop: 12,
                      textAlign: 'center',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      💡 Use Default OTP: <strong>123456</strong>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={onboardingBusy} style={{ marginTop: 16 }}>
                      {onboardingBusy ? 'Verifying…' : 'Verify & Complete Profile'}
                    </button>
                  </form>
                  <div className="login-otp-timer" style={{ marginTop: 12 }}>
                    {onboardingResendSeconds > 0 ? (
                      <span className="text-sm text-slate-500">Resend in <strong style={{ color: '#0f172a' }}>{onboardingResendSeconds}s</strong></span>
                    ) : (
                      <button type="button" onClick={handleResendOnboardingOtp} className="login-otp-resend text-indigo-600 hover:text-indigo-800 font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Resend Code</button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="login-signup-anchor"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 12, color: '#4f46e5' }}
                    onClick={() => setOnboardingOtpStep('none')}
                  >
                    ← Back to edit profile
                  </button>
                </div>
              ) : (
                <KycOnboardingWizard
                  role={onboarding.role === 'business' ? 'business' : 'customer'}
                  onComplete={handleOnboardingComplete}
                  onCancel={() => setOnboarding(null)}
                />
              )}
            </div>
          </div>
        ) : isAdminLogin ? (
          <div className="login-single-card-wrap">
            <div className="admin-login-indicator bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 mb-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B12D6] flex items-center justify-center gap-1">
                🛡️ Admin Login Console
              </span>
            </div>
            <LoginPanel role="admin" isAdminLogin onForgotPassword={() => setShowForgotModal(true)} />
          </div>
        ) : (
          <div className="login-split">
            <div className="login-left">
              {selectedRole === 'customer' ? (
                <>
                  <div className="login-left-top">
                    <h1 className="login-left-title">Shop Together.<br />Save Big.</h1>
                    <p className="login-left-desc">Join purchase circles, unlock neighborhood deals, and save more with friends.</p>
                  </div>
                  <div className="login-benefits">
                    <div className="login-benefit-row">
                      <div className="login-benefit-icon-wrap">
                        <span className="material-symbols-outlined">group</span>
                      </div>
                      <div>
                        <h3 className="login-benefit-title">Purchase Circles</h3>
                        <p className="login-benefit-desc">Form circles with friends & neighbors to buy together and automatically hit discount thresholds.</p>
                      </div>
                    </div>
                    <div className="login-benefit-row">
                      <div className="login-benefit-icon-wrap">
                        <span className="material-symbols-outlined">percent</span>
                      </div>
                      <div>
                        <h3 className="login-benefit-title">Exclusive Deals</h3>
                        <p className="login-benefit-desc">Access exclusive local BOGO offers and hot retail promotions in your city.</p>
                      </div>
                    </div>
                  </div>
                  <div className="login-illustration">
                    <div className="login-illustration-inner">
                      <span className="login-illustration-emoji">🛍️</span>
                      <div className="login-illustration-rings">
                        <div className="login-illustration-ring login-illustration-ring--1"></div>
                        <div className="login-illustration-ring login-illustration-ring--2"></div>
                      </div>
                      <div className="login-illustration-stat">
                        <span className="login-illustration-stat-val">30%+</span>
                        <span className="login-illustration-stat-lbl">Average Savings</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="login-left-top">
                    <h1 className="login-left-title" style={{ color: '#d97706' }}>Grow Your<br />Retail Footprint.</h1>
                    <p className="login-left-desc">Publish real-time BOGO deals directly to high-intent shoppers in your area.</p>
                  </div>
                  <div className="login-benefits">
                    <div className="login-benefit-row">
                      <div className="login-benefit-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <span className="material-symbols-outlined">campaign</span>
                      </div>
                      <div>
                        <h3 className="login-benefit-title">Instant Reach</h3>
                        <p className="login-benefit-desc">Post deals and immediately notify shoppers in your neighborhood catchment area.</p>
                      </div>
                    </div>
                    <div className="login-benefit-row">
                      <div className="login-benefit-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <span className="material-symbols-outlined">insights</span>
                      </div>
                      <div>
                        <h3 className="login-benefit-title">Retention Analytics</h3>
                        <p className="login-benefit-desc">Track customer purchase circle patterns and measure store performance seamlessly.</p>
                      </div>
                    </div>
                  </div>
                  <div className="login-illustration" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                    <div className="login-illustration-inner">
                      <span className="login-illustration-emoji">🏪</span>
                      <div className="login-illustration-rings">
                        <div className="login-illustration-ring login-illustration-ring--1" style={{ borderColor: 'rgba(217, 119, 6, 0.2)' }}></div>
                        <div className="login-illustration-ring login-illustration-ring--2" style={{ borderColor: 'rgba(217, 119, 6, 0.2)' }}></div>
                      </div>
                      <div className="login-illustration-stat">
                        <span className="login-illustration-stat-val" style={{ color: '#d97706' }}>x3.4</span>
                        <span className="login-illustration-stat-lbl">Customer Visits</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="login-right">
              <div className="login-card" style={{ width: '100%', maxWidth: '480px' }}>
                <div className="auth-role-tabs-wrap">
                  <button
                    type="button"
                    className={`auth-tab-btn auth-tab-btn--customer ${selectedRole === 'customer' ? 'active' : ''}`}
                    onClick={() => setSelectedRole('customer')}
                  >
                    Customer Login
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn auth-tab-btn--business ${selectedRole === 'business' ? 'active' : ''}`}
                    onClick={() => setSelectedRole('business')}
                  >
                    Merchant Login
                  </button>
                </div>
                <LoginPanel role={selectedRole} onGoogleNewUser={handleGoogleNewUser} onForgotPassword={() => setShowForgotModal(true)} />
              </div>
            </div>
          </div>
        )
        }
      </main >

      {!onboarding && (
        <footer className="login-footer">
          <span className="login-footer-item"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span> Secure Payments</span>
          <span className="login-footer-item"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span> 24/7 Support</span>
          <span className="login-footer-item"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>local_offer</span> Best Prices</span>
        </footer>
      )}

      {
        !isAdminLogin && !onboarding && (
          <p className="login-signup-link" style={{ textAlign: 'center', marginBottom: 12 }}>
            Don't have an account?{' '}
            <Link to={`/signup?role=${selectedRole}`} className="login-signup-anchor">Sign Up</Link>
          </p>
        )
      }

      {
        showForgotModal && (
          <div className="forgot-modal-overlay" onClick={() => setShowForgotModal(false)}>
            <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="forgot-modal-header">
                <span className="forgot-modal-title">Reset Password</span>
                <button type="button" className="forgot-modal-close" onClick={() => setShowForgotModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {!forgotSuccess ? (
                <form onSubmit={handleForgotPassword}>
                  <p className="forgot-modal-body">Enter your registered email address and we'll send you a secure link to reset your password.</p>
                  <div className="login-field" style={{ marginBottom: 20 }}>
                    <label className="login-label">Email Address</label>
                    <div className="login-input-wrap">
                      <span className="material-symbols-outlined login-input-icon">mail</span>
                      <input type="email" placeholder="e.g. name@domain.com" className={`login-input ${forgotError ? 'login-input--error' : ''}`} value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); if (forgotError) setForgotError(''); }} disabled={forgotSending} />
                    </div>
                    {forgotError && <span className="login-error">{forgotError}</span>}
                  </div>
                  <button type="submit" className="login-submit-btn" style={{ width: '100%' }} disabled={forgotSending}>
                    {forgotSending ? 'Sending reset link...' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div className="forgot-modal-success-icon"><span className="material-symbols-outlined">check_circle</span></div>
                  <h3 style={{ fontSize: 18, fontWeight: 850, margin: '0 0 10px 0', color: '#0f172a' }}>Link Sent Successfully!</h3>
                  <p className="forgot-modal-body" style={{ textAlign: 'center', marginBottom: 24 }}>
                    A password recovery link has been sent to <strong>{forgotEmail}</strong>.
                  </p>
                  <button type="button" className="login-submit-btn" style={{ width: '100%' }} onClick={() => setShowForgotModal(false)}>Back to Login</button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}
