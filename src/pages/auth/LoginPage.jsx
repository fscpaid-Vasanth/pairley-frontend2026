import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import SEO from '../../components/SEO';
import './LoginPage.css';


const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [role, setRole] = useState('customer');

  const searchParams = new URLSearchParams(window.location.search);
  const isAdminLogin = searchParams.get('role') === 'admin';

  useEffect(() => {
    if (isAdminLogin) {
      setLoginMethod('password');
    }
  }, [isAdminLogin]);
  
  // Credentials Login States
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  // OTP Login States & Refs
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'verify'
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  // Google Onboarding States
  const [googleUser, setGoogleUser] = useState(null);
  const [showGoogleOnboarding, setShowGoogleOnboarding] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    mobile: '',
    city: 'Mumbai',
    state: '',
    pincode: '',
    businessName: '',
    businessType: 'Shop',
    address: '',
    aadhaar: '',
    gst: '',
    pan: '',
    shopPhoto: '',
    aadhaarPhoto: '',
    panPhoto: ''
  });
  const [onboardingErrors, setOnboardingErrors] = useState({});
  const [isScanningAadhaar, setIsScanningAadhaar] = useState(false);
  const [aadhaarScanProgress, setAadhaarScanProgress] = useState(0);
  const [aadhaarScanMessage, setAadhaarScanMessage] = useState('');
  const [scannedAadhaarNumber, setScannedAadhaarNumber] = useState('');
  const [aadhaarMatchError, setAadhaarMatchError] = useState('');

  const scanAadhaarCard = async (file) => {
    setIsScanningAadhaar(true);
    setAadhaarScanProgress(0);
    setAadhaarScanMessage('Initializing OCR engine...');
    setAadhaarMatchError('');

    try {
      const { recognize } = await import('tesseract.js');
      setAadhaarScanMessage('Scanning image for 12-digit Aadhaar...');
      const result = await recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setAadhaarScanProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      console.log('Aadhaar Scanned Text:', text);

      // Clean up text and find 12 digits
      const cleanDigits = text.replace(/[^0-9\s]/g, '');
      const regexPattern = /\d{4}\s+\d{4}\s+\d{4}/;
      const spaceMatch = cleanDigits.match(regexPattern);
      let extractedAadhaar = '';

      if (spaceMatch) {
        extractedAadhaar = spaceMatch[0].replace(/\s+/g, '');
      } else {
        const contiguousMatch = text.replace(/\s+/g, '').match(/\d{12}/);
        if (contiguousMatch) {
          extractedAadhaar = contiguousMatch[0];
        }
      }

      if (extractedAadhaar) {
        setScannedAadhaarNumber(extractedAadhaar);
        setAadhaarScanMessage(`Success! Aadhaar number scanned: ${extractedAadhaar}`);
        setOnboardingForm(prev => ({ ...prev, aadhaar: extractedAadhaar }));
        if (onboardingErrors.aadhaar) setOnboardingErrors(prev => ({ ...prev, aadhaar: '' }));
      } else {
        setAadhaarScanMessage('Scan complete, but no clear 12-digit number was found. Please enter it manually.');
        setScannedAadhaarNumber('');
      }
    } catch (error) {
      console.error('Aadhaar scan failed:', error);
      setAadhaarScanMessage('Scanning failed. Please enter the Aadhaar number manually.');
    } finally {
      setIsScanningAadhaar(false);
    }
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setOnboardingForm(prev => ({ ...prev, [field]: reader.result }));
      if (onboardingErrors[field]) {
        setOnboardingErrors(prev => ({ ...prev, [field]: '' }));
      }
      if (field === 'aadhaarPhoto') {
        scanAadhaarCard(file);
      }
    };
    reader.onerror = (error) => {
      console.error('File conversion error:', error);
    };
  };
  // Resend Countdown Timer Effect
  useEffect(() => {
    if (loginMethod !== 'otp' || otpStep !== 'verify' || resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loginMethod, otpStep, resendSeconds]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email Address is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    if (form.email.trim().toLowerCase() === 'admin@pairley.com' && !isAdminLogin) {
      showToast('Access denied: Admin credentials must be used via the Admin Portal link.', 'error');
      return;
    }

    api.post('/auth/login', { email: form.email, password_hash: form.password })
      .then((res) => {
        if (res.role === 'Admin' && !isAdminLogin) {
          showToast('Access denied: Admin credentials must be used via the Admin Portal link.', 'error');
          return;
        }
        localStorage.setItem('pairley_token', res.access_token || res.token);
        localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
        showToast('Logged in successfully!', 'success');
        navigate(res.role === 'Admin' ? '/admin/dashboard' : res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard');
      })
      .catch((err) => {
        console.error('Login failed:', err);
        showToast(err.message || 'Login failed. Invalid email or password.', 'error');
      });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrors({ phone: 'Mobile Number is required' });
      showToast('Please enter a mobile number.', 'error');
      return;
    }
    if (!validatePhone(phone)) {
      setErrors({ phone: 'Phone must be exactly 10 digits' });
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setErrors({});
    setOtpSending(true);
    
    api.post('/auth/send-otp', { mobile: phone.trim() })
      .then(() => {
        setOtpStep('verify');
        setOtpValues(['', '', '', '', '', '']);
        setResendSeconds(30);
        showToast(`OTP verification code sent to ${countryCode} ${phone}.`, 'success');
        setTimeout(() => { otpRefs[0].current?.focus(); }, 100);
      })
      .catch((err) => {
        console.error('Failed to send OTP:', err);
        showToast(err.message || 'Failed to send OTP. Please check your mobile number and try again.', 'error');
      })
      .finally(() => setOtpSending(false));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredCode = otpValues.join('');
    if (enteredCode.length < 6) {
      showToast('Please enter all 6 digits of the OTP.', 'error');
      return;
    }

    api.post('/auth/verify-otp', { mobile: phone.trim(), code: enteredCode })
      .then((res) => {
        if (res.exists) {
          if (res.role === 'Admin' && !isAdminLogin) {
            showToast('Access denied: Admin credentials must be used via the Admin Portal link.', 'error');
            return;
          }
          localStorage.setItem('pairley_token', res.token);
          localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
          showToast('Logged in successfully!', 'success');
          navigate(res.role === 'Admin' ? '/admin/dashboard' : res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard');
        } else {
          showToast('No profile found with this mobile number. Please register/signup first.', 'warning');
          navigate('/signup');
        }
      })
      .catch((err) => {
        console.error('OTP Verification failed:', err);
        showToast(err.message || 'Invalid verification code. Please try again.', 'error');
      });
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
    api.post('/auth/send-otp', { mobile: phone.trim() })
      .then(() => {
        showToast(`OTP code resent to ${countryCode} ${phone}.`, 'success');
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
      })
      .catch((err) => {
        console.error('Failed to resend OTP:', err);
        showToast(err.message || 'Failed to resend OTP. Please try again.', 'error');
      });
  };

  const handleGoogleSignIn = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      const checkPayload = {
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email,
        role: role === 'customer' ? 'Customer' : 'Business',
        google_uid: firebaseUser.uid,
        profile_photo: firebaseUser.photoURL || undefined
      };

      // Call backend to verify if registered
      api.post('/auth/google', checkPayload)
        .then((res) => {
          if (res.exists) {
            if (res.role === 'Admin' && !isAdminLogin) {
              showToast('Access denied: Admin credentials must be used via the Admin Portal link.', 'error');
              return;
            }
            localStorage.setItem('pairley_token', res.access_token || res.token);
            localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
            showToast('Logged in with Google!', 'success');
            navigate(res.role === 'Admin' ? '/admin/dashboard' : res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard');
          } else {
            // User does not exist, trigger onboarding step
            setGoogleUser(checkPayload);
            setShowGoogleOnboarding(true);
            showToast('Please complete your profile to continue.', 'info');
          }
        })
        .catch((err) => {
          console.error('Google check failed, using fallback onboarding:', err);
          setGoogleUser(checkPayload);
          setShowGoogleOnboarding(true);
        });
    } catch (error) {
      console.error('Google Auth failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        showToast('Google Sign-in failed: Domain is not authorized in Firebase Console.', 'error');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-in cancelled (popup closed).', 'warning');
      } else {
        showToast(`Google Sign-in failed: ${error?.message || 'Unknown error'}`, 'error');
      }
    }
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!onboardingForm.mobile.trim()) {
      errs.mobile = 'Mobile Number is required';
    } else if (!validatePhone(onboardingForm.mobile)) {
      errs.mobile = 'Phone must be exactly 10 digits';
    }

    if (!onboardingForm.state.trim()) {
      errs.state = 'State is required';
    }

    if (!onboardingForm.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(onboardingForm.pincode.replace(/\D/g, ''))) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }

    if (role === 'customer') {
      if (!onboardingForm.address.trim()) {
        errs.address = 'Detailed Address is required';
      }
    }

    if (role === 'business') {
      if (!onboardingForm.businessName.trim()) {
        errs.businessName = 'Business/Shop name is required';
      }
      if (!onboardingForm.aadhaar.trim()) {
        errs.aadhaar = 'Aadhaar Card Number is required';
      } else if (!/^\d{12}$/.test(onboardingForm.aadhaar.replace(/\D/g, ''))) {
        errs.aadhaar = 'Aadhaar must be exactly 12 digits';
      } else if (scannedAadhaarNumber && onboardingForm.aadhaar.replace(/\D/g, '') !== scannedAadhaarNumber) {
        errs.aadhaar = 'Aadhaar number does not match the scanned Aadhaar Card image';
        setAadhaarMatchError('Aadhaar number does not match the scanned Aadhaar Card image');
      }

      if (onboardingForm.gst.trim() && onboardingForm.gst.trim().length !== 15) {
        errs.gst = 'GST Number must be exactly 15 characters';
      }
      if (onboardingForm.pan.trim() && onboardingForm.pan.trim().length !== 10) {
        errs.pan = 'PAN Number must be exactly 10 characters';
      }

      // Photos validation
      if (!onboardingForm.shopPhoto) {
        errs.shopPhoto = 'Shop Image is required';
      }
      if (!onboardingForm.aadhaarPhoto) {
        errs.aadhaarPhoto = 'Aadhaar Card Image is required';
      }
    }
    
    setOnboardingErrors(errs);

    if (Object.keys(errs).length > 0) {
      showToast('Please fix the validation errors.', 'error');
      return;
    }

    const payload = {
      ...googleUser,
      mobile: onboardingForm.mobile,
      city: onboardingForm.city,
      state: onboardingForm.state,
      pincode: onboardingForm.pincode,
      address: role === 'customer' ? onboardingForm.address : 'Registered Office Address',
      business_name: role === 'business' ? onboardingForm.businessName : undefined,
      business_type: role === 'business' ? onboardingForm.businessType : undefined,
      category: role === 'business' ? 'shopping' : undefined,
      aadhaar_number: role === 'business' ? onboardingForm.aadhaar : undefined,
      gst_number: (role === 'business' && onboardingForm.gst.trim()) ? onboardingForm.gst : undefined,
      pan_number: (role === 'business' && onboardingForm.pan.trim()) ? onboardingForm.pan : undefined,
      shop_photo: role === 'business' ? onboardingForm.shopPhoto : undefined,
      aadhaar_photo: role === 'business' ? onboardingForm.aadhaarPhoto : undefined,
      pan_photo: (role === 'business' && onboardingForm.panPhoto) ? onboardingForm.panPhoto : undefined
    };

    api.post('/auth/google', payload)
      .then((res) => {
        if (res.exists) {
          localStorage.setItem('pairley_token', res.access_token || res.token);
          localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
          showToast('Profile completed and logged in!', 'success');
          navigate(res.role === 'Admin' ? '/admin/dashboard' : res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard');
        } else {
          showToast(res.message || 'Profile completion failed.', 'error');
        }
      })
      .catch((err) => {
        console.error('Google registration failed:', err);
        showToast(err.message || 'Registration failed. Please check your network and try again.', 'error');
      });
  };

  const leftContent = {
    customer: {
      title: 'Welcome Back!',
      desc: 'Login to your account and continue discovering amazing group deals with your community.',
      benefits: [
        { title: 'Manage Your Purchases', desc: 'Track your group buys and recent orders seamlessly.', icon: 'shopping_cart' },
        { title: 'Grow Your Savings', desc: "See how much you've saved by participating in collective action.", icon: 'trending_down' },
        { title: 'Trusted Platform', desc: 'Secure transactions and verified community members.', icon: 'verified_user' },
      ],
    },
    business: {
      title: 'Welcome Back!',
      desc: 'Log in to manage your store, track orders, and grow your business with Pairley.',
      benefits: [
        { title: 'Manage Your Store', desc: 'Easily update products, control inventory, and fulfill orders in real-time.', icon: 'storefront' },
        { title: 'Grow Your Business', desc: 'Tap into our community buying power to reach more customers.', icon: 'trending_up' },
        { title: 'Trusted Platform', desc: 'A secure ecosystem built specifically for premium retail shop owners.', icon: 'verified_user' },
      ],
    },
    admin: {
      title: 'Super Admin Gateway',
      desc: 'Access the Super Admin Control Center to verify merchant accounts and moderate offers.',
      benefits: [
        { title: 'Verify Onboardings', desc: 'Audit and approve new shop registrations and uploaded verification files.', icon: 'admin_panel_settings' },
        { title: 'Moderate Deals', desc: 'Track and update co-buy offer statuses across mall categories.', icon: 'gavel' },
        { title: 'Operational Metrics', desc: 'Analyze real-time revenue collection, users growth, and active deals.', icon: 'monitoring' },
      ],
    },
  };

  const c = isAdminLogin ? leftContent.admin : leftContent[role];

  return (
    <div className="login-root">
      {/* ── Header ── */}
      <header className="login-header">
        <Link className="login-brand" to="/">
          <img src="/logo.svg" alt="Pairley Logo" className="login-logo-img" />
        </Link>
        <Link className="login-back-btn" to="/">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Home
        </Link>
      </header>

      {/* ── Main ── */}
      <main className="login-main">
        <div className="login-split">

          {/* ── LEFT: Value Prop ── */}
          <div className="login-left">
            <div className="login-left-top">
              <h1 className="login-left-title">{c.title}</h1>
              <p className="login-left-desc">{c.desc}</p>
            </div>

            <div className="login-benefits">
              {c.benefits.map((b, i) => (
                <div key={i} className="login-benefit-row">
                  <div className="login-benefit-icon-wrap">
                    <span className="material-symbols-outlined">{b.icon}</span>
                  </div>
                  <div>
                    <h3 className="login-benefit-title">{b.title}</h3>
                    <p className="login-benefit-desc">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Illustration — pure CSS, no broken image */}
            {isAdminLogin ? (
              <div className="login-illustration animate-fadeIn">
                <div className="login-illustration-inner">
                  <span className="login-illustration-emoji">🛡️</span>
                  <div className="login-illustration-rings">
                    <div className="login-illustration-ring login-illustration-ring--1" style={{ borderColor: 'rgba(78, 43, 196, 0.15)' }} />
                    <div className="login-illustration-ring login-illustration-ring--2" style={{ borderColor: 'rgba(16, 185, 129, 0.15)' }} />
                  </div>
                  <div className="login-illustration-stat">
                    <span className="login-illustration-stat-val" style={{ color: '#4E2BC4' }}>SECURED</span>
                    <span className="login-illustration-stat-lbl">Authorized Session Only</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="login-illustration">
                <div className="login-illustration-inner">
                  <span className="login-illustration-emoji">🛍️</span>
                  <div className="login-illustration-rings">
                    <div className="login-illustration-ring login-illustration-ring--1" />
                    <div className="login-illustration-ring login-illustration-ring--2" />
                  </div>
                  <div className="login-illustration-stat">
                    <span className="login-illustration-stat-val">50K+</span>
                    <span className="login-illustration-stat-lbl">Community Members</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Form Card ── */}
          <div className="login-right">
            <div className="login-card">

              {/* Role Switcher */}
              {!showGoogleOnboarding && !isAdminLogin && (
                <div className="login-role-tabs">
                  <button
                    type="button"
                    className={`login-role-tab ${role === 'customer' ? 'login-role-tab--active' : ''}`}
                    onClick={() => setRole('customer')}
                  >
                    👤 Customer
                  </button>
                  <button
                    type="button"
                    className={`login-role-tab ${role === 'business' ? 'login-role-tab--active' : ''}`}
                    onClick={() => setRole('business')}
                  >
                    🏪 Shop Owner
                  </button>
                </div>
              )}

              {showGoogleOnboarding ? (
                <div className="login-otp-wrap">
                  <h2 className="login-card-title">Complete Your Profile</h2>
                  <p className="login-card-subtitle" style={{ marginBottom: '20px' }}>
                    We need a few details to finalize your {role === 'customer' ? 'Customer' : 'Shop Owner'} account
                  </p>

                  <form onSubmit={handleOnboardingSubmit} className="login-form w-full">
                    {/* Mobile */}
                    <div className="login-field">
                      <label className="login-label">Mobile Number</label>
                      <div className="login-phone-row">
                        <select className="login-country-code" defaultValue="+91">
                          <option value="+91">🇮🇳 +91</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          className={`login-input login-phone-input ${onboardingErrors.mobile ? 'login-input--error' : ''}`}
                          value={onboardingForm.mobile}
                          maxLength={10}
                          onChange={(e) => {
                            setOnboardingForm(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                            if (onboardingErrors.mobile) setOnboardingErrors(prev => ({ ...prev, mobile: '' }));
                          }}
                        />
                      </div>
                       {onboardingErrors.mobile && <span className="login-error">{onboardingErrors.mobile}</span>}
                     </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* City */}
                      <div className="login-field" style={{ flex: 1 }}>
                        <label className="login-label">City</label>
                        <div className="login-input-wrap">
                          <span className="material-symbols-outlined login-input-icon">location_on</span>
                          <select
                            className="login-input"
                            style={{ paddingLeft: '40px', background: 'white' }}
                            value={onboardingForm.city}
                            onChange={(e) => setOnboardingForm(prev => ({ ...prev, city: e.target.value }))}
                          >
                            {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kochi', 'Kolkata', 'Jaipur'].map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* State */}
                      <div className="login-field" style={{ flex: 1 }}>
                        <label className="login-label">State</label>
                        <div className="login-input-wrap">
                          <span className="material-symbols-outlined login-input-icon">map</span>
                          <select
                            className={`login-input ${onboardingErrors.state ? 'login-input--error' : ''}`}
                            style={{ paddingLeft: '40px', background: 'white' }}
                            value={onboardingForm.state}
                            onChange={(e) => {
                              setOnboardingForm(prev => ({ ...prev, state: e.target.value }));
                              if (onboardingErrors.state) setOnboardingErrors(prev => ({ ...prev, state: '' }));
                            }}
                          >
                            <option value="">Select State</option>
                            {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Gujarat', 'Kerala', 'West Bengal', 'Rajasthan'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        {onboardingErrors.state && <span className="login-error">{onboardingErrors.state}</span>}
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="login-field">
                      <label className="login-label">Pincode</label>
                      <div className="login-input-wrap">
                        <span className="material-symbols-outlined login-input-icon">pin</span>
                        <input
                          type="text"
                          placeholder="6-digit pincode"
                          className={`login-input ${onboardingErrors.pincode ? 'login-input--error' : ''}`}
                          value={onboardingForm.pincode}
                          maxLength={6}
                          onChange={(e) => {
                            setOnboardingForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                            if (onboardingErrors.pincode) setOnboardingErrors(prev => ({ ...prev, pincode: '' }));
                          }}
                        />
                      </div>
                      {onboardingErrors.pincode && <span className="login-error">{onboardingErrors.pincode}</span>}
                    </div>

                    {role === 'customer' && (
                      <div className="login-field">
                        <label className="login-label">Detailed Address</label>
                        <div className="login-input-wrap">
                          <span className="material-symbols-outlined login-input-icon">home</span>
                          <textarea
                            placeholder="Flat/House No, Building, Street, Area"
                            className={`login-input ${onboardingErrors.address ? 'login-input--error' : ''}`}
                            style={{ paddingLeft: '40px', paddingTop: '8px', minHeight: '60px', background: 'white' }}
                            value={onboardingForm.address}
                            onChange={(e) => {
                              setOnboardingForm(prev => ({ ...prev, address: e.target.value }));
                              if (onboardingErrors.address) setOnboardingErrors(prev => ({ ...prev, address: '' }));
                            }}
                          />
                        </div>
                        {onboardingErrors.address && <span className="login-error">{onboardingErrors.address}</span>}
                      </div>
                    )}

                    {role === 'business' && (
                      <>
                        {/* Shop Name */}
                        <div className="login-field">
                          <label className="login-label">Shop Name</label>
                          <div className="login-input-wrap">
                            <span className="material-symbols-outlined login-input-icon">storefront</span>
                            <input
                              type="text"
                              placeholder="Your shop or business name"
                              className={`login-input ${onboardingErrors.businessName ? 'login-input--error' : ''}`}
                              value={onboardingForm.businessName}
                              onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, businessName: e.target.value }));
                                  if (onboardingErrors.businessName) setOnboardingErrors(prev => ({ ...prev, businessName: '' }));
                                }}
                              />
                            </div>
                            {onboardingErrors.businessName && <span className="login-error">{onboardingErrors.businessName}</span>}
                          </div>

                          {/* Business Type */}
                          <div className="login-field">
                            <label className="login-label">Business Type</label>
                            <div className="login-input-wrap">
                              <span className="material-symbols-outlined login-input-icon">work</span>
                              <select
                                className="login-input"
                                style={{ paddingLeft: '40px', background: 'white' }}
                                value={onboardingForm.businessType}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, businessType: e.target.value }))}
                              >
                                {['Shop', 'Tour Operator', 'Restaurant', 'Salon/Spa', 'Gym/Fitness', 'Academy/Institute', 'Service Provider', 'Other'].map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Aadhaar Card */}
                          <div className="login-field">
                            <label className="login-label">Aadhaar Card Number (Required)</label>
                            <div className="login-input-wrap">
                              <span className="material-symbols-outlined login-input-icon">fingerprint</span>
                              <input
                                type="text"
                                placeholder="12-digit Aadhaar number"
                                className={`login-input ${onboardingErrors.aadhaar ? 'login-input--error' : ''}`}
                                value={onboardingForm.aadhaar}
                                maxLength={12}
                                onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }));
                                  if (onboardingErrors.aadhaar) setOnboardingErrors(prev => ({ ...prev, aadhaar: '' }));
                                  setAadhaarMatchError('');
                                }}
                              />
                            </div>
                            {onboardingErrors.aadhaar && <span className="login-error">{onboardingErrors.aadhaar}</span>}
                            {scannedAadhaarNumber && (
                              <div className={`aadhaar-match-indicator ${
                                onboardingForm.aadhaar.replace(/\D/g, '') === scannedAadhaarNumber 
                                  ? 'aadhaar-match-indicator--success' 
                                  : 'aadhaar-match-indicator--error'
                              }`}>
                                {onboardingForm.aadhaar.replace(/\D/g, '') === scannedAadhaarNumber ? (
                                  <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                    <span>Matches scanned card image</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                                    <span>Does not match scanned card number ({scannedAadhaarNumber})</span>
                                  </>
                                )}
                              </div>
                            )}
                            {aadhaarMatchError && <div className="aadhaar-match-indicator aadhaar-match-indicator--error">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
                              <span>{aadhaarMatchError}</span>
                            </div>}
                          </div>

                          {/* PAN Card */}
                          <div className="login-field">
                            <label className="login-label">PAN Card Number (Optional)</label>
                            <div className="login-input-wrap">
                              <span className="material-symbols-outlined login-input-icon">badge</span>
                              <input
                                type="text"
                                placeholder="10-character PAN number"
                                className={`login-input ${onboardingErrors.pan ? 'login-input--error' : ''}`}
                                value={onboardingForm.pan}
                                maxLength={10}
                                onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, pan: e.target.value.toUpperCase().slice(0, 10) }));
                                  if (onboardingErrors.pan) setOnboardingErrors(prev => ({ ...prev, pan: '' }));
                                }}
                              />
                            </div>
                            {onboardingErrors.pan && <span className="login-error">{onboardingErrors.pan}</span>}
                          </div>

                          {/* GST Number */}
                          <div className="login-field">
                            <label className="login-label">GST Number (Optional)</label>
                            <div className="login-input-wrap">
                              <span className="material-symbols-outlined login-input-icon">receipt_long</span>
                              <input
                                type="text"
                                placeholder="15-character GST number"
                                className={`login-input ${onboardingErrors.gst ? 'login-input--error' : ''}`}
                                value={onboardingForm.gst}
                                maxLength={15}
                                onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, gst: e.target.value.toUpperCase().slice(0, 15) }));
                                  if (onboardingErrors.gst) setOnboardingErrors(prev => ({ ...prev, gst: '' }));
                                }}
                              />
                            </div>
                            {onboardingErrors.gst && <span className="login-error">{onboardingErrors.gst}</span>}
                          </div>

                          {/* Shop photo file upload */}
                          <div className="login-field">
                            <label className="login-label">Shop Image (Required)</label>
                            <div className="su-file-upload-wrap">
                              <input
                                type="file"
                                accept="image/*"
                                id="onboarding-shop-photo"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange('shopPhoto', e.target.files[0])}
                              />
                              <label
                                htmlFor="onboarding-shop-photo"
                                className={`su-file-upload-label ${onboardingErrors.shopPhoto ? 'su-file-upload-label--error' : ''}`}
                              >
                                <span className="material-symbols-outlined">add_a_photo</span>
                                {onboardingForm.shopPhoto ? 'Change Shop Image' : 'Upload Shop Image'}
                              </label>
                              {onboardingForm.shopPhoto && (
                                <div className="su-image-preview-container">
                                  <img src={onboardingForm.shopPhoto} alt="Shop Preview" className="su-image-preview" />
                                </div>
                              )}
                            </div>
                            {onboardingErrors.shopPhoto && <span className="login-error">{onboardingErrors.shopPhoto}</span>}
                          </div>

                          {/* Aadhaar Card photo file upload */}
                          <div className="login-field">
                            <label className="login-label">Aadhaar Card Image (Required)</label>
                            <div className="su-file-upload-wrap">
                              <input
                                type="file"
                                accept="image/*"
                                id="onboarding-aadhaar-photo"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange('aadhaarPhoto', e.target.files[0])}
                              />
                              <label
                                htmlFor="onboarding-aadhaar-photo"
                                className={`su-file-upload-label ${onboardingErrors.aadhaarPhoto ? 'su-file-upload-label--error' : ''}`}
                              >
                                <span className="material-symbols-outlined">description</span>
                                {onboardingForm.aadhaarPhoto ? 'Change Aadhaar Card Image' : 'Upload Aadhaar Card Image'}
                              </label>
                              {onboardingForm.aadhaarPhoto && (
                                <div className="su-image-preview-container aadhaar-scan-container">
                                  <img src={onboardingForm.aadhaarPhoto} alt="Aadhaar Preview" className="su-image-preview" />
                                  {isScanningAadhaar && (
                                    <div className="aadhaar-scan-overlay">
                                      <div className="aadhaar-scan-laser" />
                                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px' }}>sync</span>
                                      <div style={{ marginTop: '8px', fontSize: '13px' }}>Scanning Aadhaar...</div>
                                      <div className="aadhaar-scan-progress-bar">
                                        <div className="aadhaar-scan-progress-fill" style={{ width: `${aadhaarScanProgress}%` }} />
                                      </div>
                                      <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>{aadhaarScanProgress}% complete</div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {aadhaarScanMessage && (
                                <div className={`aadhaar-scan-message-box ${
                                  scannedAadhaarNumber 
                                    ? 'aadhaar-scan-message-box--success' 
                                    : isScanningAadhaar 
                                      ? 'aadhaar-scan-message-box--info' 
                                      : 'aadhaar-scan-message-box--warning'
                                }`}>
                                  {aadhaarScanMessage}
                                </div>
                              )}
                            </div>
                            {onboardingErrors.aadhaarPhoto && <span className="login-error">{onboardingErrors.aadhaarPhoto}</span>}
                          </div>

                          {/* PAN Card photo file upload */}
                          <div className="login-field">
                            <label className="login-label">PAN Card Image (Optional)</label>
                            <div className="su-file-upload-wrap">
                              <input
                                type="file"
                                accept="image/*"
                                id="onboarding-pan-photo"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange('panPhoto', e.target.files[0])}
                              />
                              <label
                                htmlFor="onboarding-pan-photo"
                                className={`su-file-upload-label ${onboardingErrors.panPhoto ? 'su-file-upload-label--error' : ''}`}
                              >
                                <span className="material-symbols-outlined">badge</span>
                                {onboardingForm.panPhoto ? 'Change PAN Card Image' : 'Upload PAN Card Image'}
                              </label>
                              {onboardingForm.panPhoto && (
                                <div className="su-image-preview-container">
                                  <img src={onboardingForm.panPhoto} alt="PAN Preview" className="su-image-preview" />
                                </div>
                              )}
                            </div>
                            {onboardingErrors.panPhoto && <span className="login-error">{onboardingErrors.panPhoto}</span>}
                          </div>
                      </>
                    )}

                    <button type="submit" className="login-submit-btn" style={{ marginTop: '16px' }}>
                      Complete Profile
                    </button>
                  </form>

                  <button 
                    type="button" 
                    onClick={() => { setShowGoogleOnboarding(false); setGoogleUser(null); }}
                    className="login-signup-anchor"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '16px' }}
                  >
                    ← Cancel Google Onboarding
                  </button>
                </div>
              ) : loginMethod === 'otp' && otpStep === 'verify' ? (
                <div className="login-otp-wrap">
                  <h2 className="login-card-title">Verify Phone Number</h2>
                  <p className="login-card-subtitle">
                    Enter the 6-digit verification code sent to <br />
                    <span style={{ fontWeight: 700, color: '#000f22' }}>{countryCode} {phone}</span>
                  </p>

                  <form onSubmit={handleVerifyOtp} className="login-form w-full">
                    <div className="login-otp-inputs">
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
                          className="login-otp-digit"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <button type="submit" className="login-submit-btn">
                      Verify OTP
                    </button>
                  </form>

                  <div className="login-otp-timer">
                    {resendSeconds > 0 ? (
                      <span>Resend OTP in <span style={{ fontWeight: 800, color: '#000f22' }}>{resendSeconds}s</span></span>
                    ) : (
                      <span>
                        Didn't receive the code? 
                        <button type="button" onClick={handleResendOtp} className="login-otp-resend">
                          Resend Code
                        </button>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => { setOtpStep('phone'); setOtpValues(['', '', '', '', '', '']); }}
                      className="login-signup-anchor"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                    >
                      ← Back to edit phone number
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setLoginMethod('password'); setOtpStep('phone'); setErrors({}); }}
                      className="login-signup-anchor"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 'bold' }}
                    >
                      🔑 Switch to Password Login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isAdminLogin ? (
                    <div className="admin-login-indicator bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 mb-4 text-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4E2BC4] flex items-center justify-center gap-1">
                        🛡️ Admin Login Console
                      </span>
                    </div>
                  ) : null}
                  <h2 className="login-card-title">{isAdminLogin ? 'Admin Portal Access' : 'Login'}</h2>
                  <p className="login-card-subtitle">{isAdminLogin ? 'Enter authorized admin credentials to continue' : 'Enter your credentials to access your account'}</p>

                  {/* Method Switcher */}
                  {!isAdminLogin && (
                    <div className="login-method-tabs">
                      <button
                        type="button"
                        className={`login-method-tab ${loginMethod === 'password' ? 'login-method-tab--active' : ''}`}
                        onClick={() => {
                          setLoginMethod('password');
                          setErrors({});
                        }}
                      >
                        🔑 Password Login
                      </button>
                      <button
                        type="button"
                        className={`login-method-tab ${loginMethod === 'otp' ? 'login-method-tab--active' : ''}`}
                        onClick={() => {
                          setLoginMethod('otp');
                          setErrors({});
                        }}
                      >
                        📱 Mobile OTP Login
                      </button>
                    </div>
                  )}

                  {loginMethod === 'password' ? (
                    <form onSubmit={handleSubmit} noValidate className="login-form">
                      {/* Email */}
                      <div className="login-field">
                        <label className="login-label" htmlFor="lp-email">Email Address</label>
                        <div className="login-input-wrap">
                          <span className="material-symbols-outlined login-input-icon">mail</span>
                          <input
                            id="lp-email"
                            type="text"
                            placeholder="Enter email address"
                            className={`login-input ${errors.email ? 'login-input--error' : ''}`}
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                          />
                        </div>
                        {errors.email && <span className="login-error">{errors.email}</span>}
                      </div>

                      {/* Password */}
                      <div className="login-field">
                        <label className="login-label" htmlFor="lp-password">Password</label>
                        <div className="login-input-wrap">
                          <span className="material-symbols-outlined login-input-icon">lock</span>
                          <input
                            id="lp-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className={`login-input login-input--pw ${errors.password ? 'login-input--error' : ''}`}
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                          />
                          <button
                            type="button"
                            className="login-pw-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                              {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </div>
                        {errors.password && <span className="login-error">{errors.password}</span>}
                      </div>

                      {/* Remember / Forgot */}
                      <div className="login-options-row">
                        <label className="login-remember">
                          <input
                            type="checkbox"
                            className="login-checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                          />
                          Remember Me
                        </label>
                        <button type="button" className="login-forgot" onClick={() => alert('Password reset (demo only)')}>
                          Forgot Password?
                        </button>
                      </div>

                      {/* Submit */}
                      <button type="submit" className="login-submit-btn">
                        {isAdminLogin ? 'Admin Secure Login' : role === 'customer' ? 'Login' : 'Login to Dashboard'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSendOtp} noValidate className="login-form">
                      {/* Phone */}
                      <div className="login-field">
                        <label className="login-label" htmlFor="lp-phone">Mobile Number</label>
                        <div className="login-phone-row">
                          <select
                            className="login-country-code"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                          </select>
                          <input
                            id="lp-phone"
                            type="tel"
                            placeholder="10-digit mobile number"
                            className={`login-input login-phone-input ${errors.phone ? 'login-input--error' : ''}`}
                            value={phone}
                            maxLength={10}
                            onChange={(e) => {
                              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                          />
                        </div>
                        {errors.phone && <span className="login-error">{errors.phone}</span>}
                      </div>

                      {/* Submit */}
                      <button type="submit" className="login-submit-btn" style={{ marginTop: '8px' }} disabled={otpSending}>
                        {otpSending ? 'Sending OTP...' : 'Send OTP'}
                      </button>
                    </form>
                  )}

                  {/* Divider and Social Login options */}
                  {!isAdminLogin && (
                    <>
                      <div className="login-divider">
                        <span className="login-divider-line" />
                        <span className="login-divider-text">or continue with</span>
                        <span className="login-divider-line" />
                      </div>

                      <div className="login-social-row">
                        <button type="button" className="login-social-btn" onClick={handleGoogleSignIn}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Google
                        </button>
                        <button type="button" className="login-social-btn" onClick={() => alert('Facebook Login (demo only)')}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                          </svg>
                          Facebook
                        </button>
                      </div>

                      <p className="login-signup-link">
                        Don't have an account?{' '}
                        <Link to="/signup" className="login-signup-anchor">Sign Up</Link>
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="login-footer">
        <span className="login-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
          Secure Payments
        </span>
        <span className="login-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>support_agent</span>
          24/7 Support
        </span>
        <span className="login-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>local_offer</span>
          Best Prices
        </span>
      </footer>
    </div>
  );
}
