import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import './SignUpPage.css';
 
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));
 
export default function SignUpPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [role, setRole] = useState('customer');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    shopName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // OTP Verification States & Refs
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendSeconds, setResendSeconds] = useState(30);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Countdown Timer Effect
  useEffect(() => {
    if (!isOtpStep || resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpStep, resendSeconds]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full Name is required';
    if (role === 'business' && !form.shopName.trim()) errs.shopName = 'Shop Name is required';
    if (!form.email.trim()) errs.email = 'Email Address is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Mobile Number is required';
    else if (!validatePhone(form.phone)) errs.phone = 'Phone must be 10 digits';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Confirm your password';
    else if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    if (!agreed) errs.terms = 'You must agree to the Terms & Privacy Policy';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(0, 1);
    const nextOtp = [...otpValues];
    nextOtp[index] = cleanVal;
    setOtpValues(nextOtp);

    // Auto focus next input
    if (cleanVal && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleResendOtp = () => {
    setOtpValues(['', '', '', '', '', '']);
    setResendSeconds(30);
    showToast('OTP code resent to ' + form.countryCode + ' ' + form.phone + '. Enter 123456 to verify.', 'info');
    setTimeout(() => {
      otpRefs[0].current?.focus();
    }, 100);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredCode = otpValues.join('');
    if (enteredCode.length < 6) {
      showToast('Please enter the complete 6-digit code.', 'error');
      return;
    }

    if (enteredCode === '123456' || enteredCode === '1234') {
      showToast('Registration successful! Welcome to Pairley.', 'success');
      navigate(role === 'customer' ? '/customer/dashboard' : '/business/dashboard');
    } else {
      showToast('Invalid verification code. Please enter 123456.', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }
    setIsOtpStep(true);
    setResendSeconds(30);
    showToast('OTP sent to ' + form.countryCode + ' ' + form.phone + '. Enter 1234 to verify.', 'info');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      showToast('Registered successfully with Google!', 'success');
      navigate(role === 'customer' ? '/customer/dashboard' : '/business/dashboard');
    } catch (error) {
      console.error('Google Auth failed:', error);
      showToast('Google registration failed or cancelled.', 'error');
    }
  };

  const leftContent = {
    customer: {
      title: 'Join the Community!',
      desc: 'Sign up and start saving more by buying together with your local community.',
      steps: [
        { label: 'Create your account', desc: 'Sign up in under 2 minutes — no credit card needed.' },
        { label: 'Explore group deals', desc: 'Browse thousands of deals curated for your community.' },
        { label: 'Save together', desc: 'Unlock better prices the more people join your group.' },
      ],
    },
    business: {
      title: 'Grow Your Business!',
      desc: 'Register your shop on Pairley and tap into our growing community of buyers.',
      steps: [
        { label: 'Register your shop', desc: 'List your store and products quickly with our easy setup.' },
        { label: 'Reach more customers', desc: 'Connect with thousands of group buyers in your area.' },
        { label: 'Boost your revenue', desc: 'Leverage community demand to grow sales consistently.' },
      ],
    },
  };

  const c = leftContent[role];

  return (
    <div className="signup-root">
      {/* ── Header ── */}
      <header className="signup-header">
        <Link className="signup-brand" to="/">
          <span className="material-symbols-outlined signup-brand-icon">shopping_bag</span>
          Pairley
        </Link>
        <Link className="signup-back-btn" to="/">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Home
        </Link>
      </header>

      {/* ── Main ── */}
      <main className="signup-main">
        <div className="signup-split">

          {/* ── LEFT ── */}
          <div className="signup-left">
            <div className="signup-left-top">
              <h1 className="signup-left-title">{c.title}</h1>
              <p className="signup-left-desc">{c.desc}</p>
            </div>

            {/* Steps */}
            <div className="signup-steps">
              {c.steps.map((step, i) => (
                <div key={i} className="signup-step-row">
                  <div className="signup-step-num">{i + 1}</div>
                  <div>
                    <h3 className="signup-step-label">{step.label}</h3>
                    <p className="signup-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Decoration */}
            <div className="signup-decoration">
              <div className="signup-decoration-inner">
                <span className="signup-decoration-emoji">{role === 'customer' ? '🛒' : '🏪'}</span>
                <div className="signup-decoration-badge">
                  <span className="signup-decoration-badge-val">Free</span>
                  <span className="signup-decoration-badge-lbl">Forever</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Card ── */}
          <div className="signup-right">
            <div className="signup-card">

              {/* Role tabs */}
              <div className="signup-role-tabs">
                <button
                  type="button"
                  className={`signup-role-tab ${role === 'customer' ? 'signup-role-tab--active' : ''}`}
                  onClick={() => setRole('customer')}
                >
                  👤 Customer
                </button>
                <button
                  type="button"
                  className={`signup-role-tab ${role === 'business' ? 'signup-role-tab--active' : ''}`}
                  onClick={() => setRole('business')}
                >
                  🏪 Shop Owner
                </button>
              </div>

              {!isOtpStep ? (
                <>
                  <h2 className="signup-card-title">Create Account</h2>
                  <p className="signup-card-subtitle">Fill in your details to get started</p>

                  <form onSubmit={handleSubmit} noValidate className="signup-form">

                    {/* Full Name */}
                    <div className="su-field">
                      <label className="su-label" htmlFor="su-fullName">Full Name</label>
                      <div className="su-input-wrap">
                        <span className="material-symbols-outlined su-input-icon">person</span>
                        <input
                          id="su-fullName"
                          type="text"
                          placeholder="Your full name"
                          className={`su-input ${errors.fullName ? 'su-input--error' : ''}`}
                          value={form.fullName}
                          onChange={(e) => update('fullName', e.target.value)}
                        />
                      </div>
                      {errors.fullName && <span className="su-error">{errors.fullName}</span>}
                    </div>

                    {/* Shop Name (business only) */}
                    {role === 'business' && (
                      <div className="su-field">
                        <label className="su-label" htmlFor="su-shopName">Shop Name</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">storefront</span>
                          <input
                            id="su-shopName"
                            type="text"
                            placeholder="Your shop or business name"
                            className={`su-input ${errors.shopName ? 'su-input--error' : ''}`}
                            value={form.shopName}
                            onChange={(e) => update('shopName', e.target.value)}
                          />
                        </div>
                        {errors.shopName && <span className="su-error">{errors.shopName}</span>}
                      </div>
                    )}

                    {/* Email */}
                    <div className="su-field">
                      <label className="su-label" htmlFor="su-email">Email Address</label>
                      <div className="su-input-wrap">
                        <span className="material-symbols-outlined su-input-icon">mail</span>
                        <input
                          id="su-email"
                          type="email"
                          placeholder="your@email.com"
                          className={`su-input ${errors.email ? 'su-input--error' : ''}`}
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                        />
                      </div>
                      {errors.email && <span className="su-error">{errors.email}</span>}
                    </div>

                    {/* Phone */}
                    <div className="su-field">
                      <label className="su-label" htmlFor="su-phone">Mobile Number</label>
                      <div className="su-phone-row">
                        <select
                          className="su-country-code"
                          value={form.countryCode}
                          onChange={(e) => update('countryCode', e.target.value)}
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                        </select>
                        <input
                          id="su-phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          className={`su-input su-phone-input ${errors.phone ? 'su-input--error' : ''}`}
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                        />
                      </div>
                      {errors.phone && <span className="su-error">{errors.phone}</span>}
                    </div>

                    {/* Password row */}
                    <div className="su-password-row">
                      {/* Password */}
                      <div className="su-field su-half">
                        <label className="su-label" htmlFor="su-password">Password</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">lock</span>
                          <input
                            id="su-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 8 characters"
                            className={`su-input su-input--pw ${errors.password ? 'su-input--error' : ''}`}
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                          />
                          <button type="button" className="su-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                              {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </div>
                        {errors.password && <span className="su-error">{errors.password}</span>}
                      </div>

                      {/* Confirm Password */}
                      <div className="su-field su-half">
                        <label className="su-label" htmlFor="su-confirm">Confirm Password</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">lock_clock</span>
                          <input
                            id="su-confirm"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repeat password"
                            className={`su-input su-input--pw ${errors.confirmPassword ? 'su-input--error' : ''}`}
                            value={form.confirmPassword}
                            onChange={(e) => update('confirmPassword', e.target.value)}
                          />
                          <button type="button" className="su-pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                              {showConfirm ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </div>
                        {errors.confirmPassword && <span className="su-error">{errors.confirmPassword}</span>}
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="su-terms-wrap">
                      <label className="su-terms">
                        <input
                          type="checkbox"
                          className="su-checkbox"
                          checked={agreed}
                          onChange={(e) => {
                            setAgreed(e.target.checked);
                            if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                          }}
                        />
                        I agree to the{' '}
                        <button type="button" className="su-terms-link" onClick={() => alert('Terms of Use (demo only)')}>Terms of Use</button>
                        {' '}and{' '}
                        <button type="button" className="su-terms-link" onClick={() => alert('Privacy Policy (demo only)')}>Privacy Policy</button>
                      </label>
                      {errors.terms && <span className="su-error">{errors.terms}</span>}
                    </div>

                    {/* Submit */}
                    <button type="submit" className="su-submit-btn">
                      {role === 'customer' ? 'Create Account' : 'Register Your Shop'}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="su-divider">
                    <span className="su-divider-line" />
                    <span className="su-divider-text">or sign up with</span>
                    <span className="su-divider-line" />
                  </div>

                  {/* Social */}
                  <div className="su-social-row">
                    <button type="button" className="su-social-btn" onClick={handleGoogleSignIn}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                    <button type="button" className="su-social-btn" onClick={() => alert('Facebook signup (demo only)')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                      </svg>
                      Facebook
                    </button>
                  </div>

                  {/* Login link */}
                  <p className="su-login-link">
                    Already have an account?{' '}
                    <Link to="/login" className="su-login-anchor">Log In</Link>
                  </p>
                </>
              ) : (
                <div className="su-otp-wrap">
                  <h2 className="signup-card-title">Verify Phone Number</h2>
                  <p className="signup-card-subtitle">
                    Enter the 4-digit verification code sent to <br />
                    <span className="font-bold text-slate-800">{form.countryCode} {form.phone}</span>
                  </p>

                  <form onSubmit={handleVerifyOtp} className="signup-form w-full">
                    <div className="su-otp-inputs">
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="su-otp-digit"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <button type="submit" className="su-submit-btn">
                      Verify OTP
                    </button>
                  </form>

                  <div className="su-otp-timer">
                    {resendSeconds > 0 ? (
                      <span>Resend OTP in <span className="text-slate-800 font-extrabold">{resendSeconds}s</span></span>
                    ) : (
                      <span>
                        Didn't receive the code? 
                        <button type="button" onClick={handleResendOtp} className="su-otp-resend">
                          Resend Code
                        </button>
                      </span>
                    )}
                  </div>

                  <button 
                    type="button" 
                    onClick={() => { setIsOtpStep(false); setOtpValues(['', '', '', '']); }}
                    className="su-terms-link mt-2 font-bold text-xs"
                  >
                    ← Back to edit registration details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="signup-footer">
        <span className="signup-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
          Secure Payments
        </span>
        <span className="signup-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span>
          24/7 Support
        </span>
        <span className="signup-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>local_offer</span>
          Best Prices
        </span>
      </footer>
    </div>
  );
}
