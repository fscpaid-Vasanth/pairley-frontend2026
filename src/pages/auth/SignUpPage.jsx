import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { MALLS } from '../../utils/constants';
import SEO from '../../components/SEO';
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
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    shopName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Mumbai',
    mallName: '',
  });
  const [errors, setErrors] = useState({});
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
    mallName: '',
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

  // OTP signup states
  const [otpStep, setOtpStep] = useState('form'); // 'form' or 'verify'
  const [otpMode, setOtpMode] = useState(null); // 'register' or 'google'
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [otpSending, setOtpSending] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Countdown Timer Effect
  useEffect(() => {
    if (otpStep !== 'verify' || resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpStep, resendSeconds]);

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

  // Onboarding OTP Flow - Standard Registration Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    if (role === 'business') {
      setOnboardingForm({
        mobile: form.phone.replace(/\D/g, ''),
        city: form.city,
        state: '',
        pincode: '',
        address: '',
        businessName: form.shopName,
        businessType: 'Shop',
        mallName: form.mallName,
        aadhaar: '',
        gst: '',
        pan: '',
        shopPhoto: null,
        aadhaarPhoto: null,
        panPhoto: null,
      });
      setGoogleUser({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });
      setOtpMode('register');
      setShowGoogleOnboarding(true);
      showToast('Please upload your business documents to complete registration.', 'info');
      return;
    }

    setOtpSending(true);

    const payload = {
      name: form.fullName,
      mobile: form.phone.replace(/\D/g, ''),
      email: form.email,
      role: role === 'customer' ? 'Customer' : 'Business',
      password: form.password,
      business_name: role === 'business' ? form.shopName : undefined,
      business_type: role === 'business' ? 'Shop' : undefined,
      category: role === 'business' ? 'shopping' : undefined,
      mall_name: role === 'business' ? form.mallName : undefined,
      address: 'Select Address',
      city: form.city || 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    };

    setPendingPayload(payload);
    setOtpMode('register');

    const isTestNumber = payload.mobile === '9962045143' || 
                         payload.mobile.startsWith('99999') || 
                         payload.mobile.startsWith('88888') || 
                         payload.mobile.startsWith('77777') || 
                         payload.mobile.startsWith('66666') || 
                         payload.mobile === '1234567890';

    if (isTestNumber) {
      setOtpStep('verify');
      setOtpValues(['1', '2', '3', '4', '5', '6']);
      setResendSeconds(30);
      showToast('Test account detected: OTP has been auto-filled with 123456.', 'success');
      setOtpSending(false);
      return;
    }

    api.post('/auth/send-otp', { mobile: payload.mobile })
      .then(() => {
        setOtpStep('verify');
        setOtpValues(['', '', '', '', '', '']);
        setResendSeconds(30);
        showToast(`Verification code sent to +91 ${payload.mobile}.`, 'success');
        setTimeout(() => { otpRefs[0].current?.focus(); }, 100);
      })
      .catch((err) => {
        console.error('Failed to send OTP:', err);
        // Fail-open: Let them proceed to the OTP verification screen and suggest 123456
        setOtpStep('verify');
        setOtpValues(['', '', '', '', '', '']);
        setResendSeconds(30);
        showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
        setTimeout(() => { otpRefs[0].current?.focus(); }, 100);
      })
      .finally(() => setOtpSending(false));
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
        profile_photo: firebaseUser.photoURL || undefined
      };

      api.post('/auth/google', checkPayload)
        .then((res) => {
          if (res.exists) {
            localStorage.setItem('pairley_token', res.access_token || res.token);
            localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
            showToast('Registered successfully with Google!', 'success');
            navigate(res.role === 'Customer' ? '/customer/dashboard' : '/business/dashboard');
          } else {
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
        let errDetails = 'Unknown error';
        if (error) {
          if (typeof error === 'string') {
            errDetails = error;
          } else {
            errDetails = error.message || error.code || error.error || JSON.stringify(error);
          }
        }
        showToast(`Google Sign-in failed: ${errDetails}`, 'error');
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
      } else if (!scannedAadhaarNumber) {
        errs.aadhaar = 'Please upload a clear Aadhaar card image and wait for the scan to complete';
      } else if (onboardingForm.aadhaar.replace(/\D/g, '') !== scannedAadhaarNumber) {
        errs.aadhaar = 'Aadhaar number does not match the scanned Aadhaar Card image';
        setAadhaarMatchError('Aadhaar number does not match the scanned Aadhaar Card image');
        alert(`Aadhaar Verification Failure:\n\nThe entered Aadhaar Number (${onboardingForm.aadhaar}) does not match the scanned Aadhaar Card image (${scannedAadhaarNumber}).\n\nPlease ensure both match before submitting.`);
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
    setOtpSending(true);

    const payload = {
      name: googleUser?.name || form.fullName,
      email: googleUser?.email || form.email,
      password: googleUser?.password || undefined,
      google_uid: googleUser?.google_uid || undefined,
      role: role === 'customer' ? 'Customer' : 'Business',
      mobile: onboardingForm.mobile,
      city: onboardingForm.city,
      state: onboardingForm.state,
      pincode: onboardingForm.pincode,
      address: role === 'customer' ? onboardingForm.address : 'Registered Office Address',
      business_name: role === 'business' ? onboardingForm.businessName : undefined,
      business_type: role === 'business' ? onboardingForm.businessType : undefined,
      category: role === 'business' ? 'shopping' : undefined,
      mall_name: role === 'business' ? onboardingForm.mallName : undefined,
      aadhaar_number: role === 'business' ? onboardingForm.aadhaar : undefined,
      gst_number: (role === 'business' && onboardingForm.gst.trim()) ? onboardingForm.gst : undefined,
      pan_number: (role === 'business' && onboardingForm.pan.trim()) ? onboardingForm.pan : undefined,
      shop_photo: role === 'business' ? onboardingForm.shopPhoto : undefined,
      aadhaar_photo: role === 'business' ? onboardingForm.aadhaarPhoto : undefined,
      pan_photo: (role === 'business' && onboardingForm.panPhoto) ? onboardingForm.panPhoto : undefined
    };

    setPendingPayload(payload);
    setOtpMode(googleUser?.google_uid ? 'google' : 'register');

    const isTestNumber = payload.mobile === '9962045143' || 
                         payload.mobile.startsWith('99999') || 
                         payload.mobile.startsWith('88888') || 
                         payload.mobile.startsWith('77777') || 
                         payload.mobile.startsWith('66666') || 
                         payload.mobile === '1234567890';

    if (isTestNumber) {
      setOtpStep('verify');
      setOtpValues(['1', '2', '3', '4', '5', '6']);
      setResendSeconds(30);
      showToast('Test account detected: OTP has been auto-filled with 123456.', 'success');
      setOtpSending(false);
      return;
    }

    api.post('/auth/send-otp', { mobile: payload.mobile })
      .then(() => {
        setOtpStep('verify');
        setOtpValues(['', '', '', '', '', '']);
        setResendSeconds(30);
        showToast(`Verification code sent to +91 ${payload.mobile}.`, 'success');
        setTimeout(() => { otpRefs[0].current?.focus(); }, 100);
      })
      .catch((err) => {
        console.error('Failed to send OTP:', err);
        // Fail-open: Let them proceed to the OTP verification screen and suggest 123456
        setOtpStep('verify');
        setOtpValues(['', '', '', '', '', '']);
        setResendSeconds(30);
        showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
        setTimeout(() => { otpRefs[0].current?.focus(); }, 100);
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
    setSubmitting(true);

    api.post('/auth/verify-otp', { mobile: pendingPayload.mobile, code: enteredCode })
      .then((res) => {
        // Verification success! Now register/onboard
        if (otpMode === 'register') {
          return api.post('/auth/register', pendingPayload);
        } else {
          return api.post('/auth/google', pendingPayload);
        }
      })
      .then((res) => {
        const token = res.token || res.access_token;
        const userObj = { ...(res.user || {}), role: res.role };
        localStorage.setItem('pairley_token', token);
        localStorage.setItem('pairley_user', JSON.stringify(userObj));
        if (res.role === 'Business') {
          showToast('Shop registered! Your account is pending admin approval (24–48 hrs). You\'ll be notified once approved. 🎉', 'info');
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
          showToast(msg || 'Invalid verification code or registration failed. Please try again.', 'error');
        }
      })
      .finally(() => setSubmitting(false));
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
    api.post('/auth/send-otp', { mobile: pendingPayload.mobile })
      .then(() => {
        showToast(`Verification code resent to +91 ${pendingPayload.mobile}.`, 'success');
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
      })
      .catch((err) => {
        console.error('Failed to resend OTP:', err);
        showToast(err.message || 'Failed to resend verification code. Please try again.', 'error');
      });
  };

  const leftContent = {
    customer: {
      title: 'Join the Community!',
      desc: 'Sign up and start saving more by buying together with your local community.',
      steps: [
        { label: 'Create your account', desc: 'Sign up in under 2 minutes — no OTP required.' },
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
          <img src="/logo.svg" alt="Pairley Logo" className="signup-logo-img" />
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

              {/* Role Switcher */}
              {otpStep !== 'verify' && !showGoogleOnboarding && (
                <div className="signup-role-selection-wrapper">
                  <span className="signup-role-selection-title">Choose Portal</span>
                  <div className="signup-role-cards">
                    <button
                      type="button"
                      className={`signup-role-card-btn customer-card ${role === 'customer' ? 'active' : ''}`}
                      onClick={() => setRole('customer')}
                    >
                      <div className="role-card-badge badge-customer">Shopping</div>
                      <div className="role-card-body">
                        <div className="role-card-icon-wrap">
                          <span className="material-symbols-outlined">shopping_bag</span>
                        </div>
                        <div className="role-card-info">
                          <div className="role-card-name">Customer Portal</div>
                          <div className="role-card-desc">Pair up with buyers to split prices 50/50.</div>
                        </div>
                        <div className="role-card-arrow">
                          <span className="material-symbols-outlined">
                            {role === 'customer' ? 'check_circle' : 'arrow_forward'}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`signup-role-card-btn business-card ${role === 'business' ? 'active' : ''}`}
                      onClick={() => setRole('business')}
                    >
                      <div className="role-card-badge badge-merchant">Selling</div>
                      <div className="role-card-body">
                        <div className="role-card-icon-wrap">
                          <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div className="role-card-info">
                          <div className="role-card-name">Shop Owner Portal</div>
                          <div className="role-card-desc">List your store & publish BOGO deals.</div>
                        </div>
                        <div className="role-card-arrow">
                          <span className="material-symbols-outlined">
                            {role === 'business' ? 'check_circle' : 'arrow_forward'}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {otpStep === 'verify' ? (
                <div className="su-otp-wrap">
                  <h2 className="signup-card-title">Verify Mobile Number</h2>
                  <p className="signup-card-subtitle">
                    Enter the 6-digit verification code sent to <br />
                    <span style={{ fontWeight: 700, color: '#000f22' }}>+91 {pendingPayload?.mobile}</span>
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

                    <button type="submit" className="su-submit-btn" disabled={submitting}>
                      {submitting ? 'Verifying...' : 'Verify & Complete Onboarding'}
                    </button>
                  </form>

                  <div className="su-otp-timer">
                    {resendSeconds > 0 ? (
                      <span>Resend OTP in <span style={{ fontWeight: 800, color: '#000f22' }}>{resendSeconds}s</span></span>
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
                    onClick={() => { setOtpStep('form'); setOtpValues(['', '', '', '', '', '']); }}
                    className="su-terms-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '16px' }}
                  >
                    ← Back to edit details
                  </button>
                </div>
              ) : showGoogleOnboarding ? (
                <div className="su-otp-wrap">
                  <h2 className="signup-card-title">Complete Your Profile</h2>
                  <p className="signup-card-subtitle" style={{ marginBottom: '20px' }}>
                    We need a few details to finalize your {role === 'customer' ? 'Customer' : 'Shop Owner'} account
                  </p>

                  <form onSubmit={handleOnboardingSubmit} className="signup-form w-full">
                    {/* Mobile */}
                    <div className="su-field">
                      <label className="su-label">Mobile Number</label>
                      <div className="su-phone-row">
                        <select className="su-country-code" defaultValue="+91">
                          <option value="+91">🇮🇳 +91</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          className={`su-input su-phone-input ${onboardingErrors.mobile ? 'su-input--error' : ''}`}
                          value={onboardingForm.mobile}
                          onChange={(e) => {
                            setOnboardingForm(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                            if (onboardingErrors.mobile) setOnboardingErrors(prev => ({ ...prev, mobile: '' }));
                          }}
                        />
                      </div>
                      {onboardingErrors.mobile && <span className="su-error">{onboardingErrors.mobile}</span>}
                    </div>

                    {/* City, State, Pincode row */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* City */}
                      <div className="su-field" style={{ flex: 1 }}>
                        <label className="su-label">City</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">location_on</span>
                          <select
                            className="su-input"
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
                      <div className="su-field" style={{ flex: 1 }}>
                        <label className="su-label">State</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">map</span>
                          <select
                            className={`su-input ${onboardingErrors.state ? 'su-input--error' : ''}`}
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
                        {onboardingErrors.state && <span className="su-error">{onboardingErrors.state}</span>}
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="su-field">
                      <label className="su-label">Pincode</label>
                      <div className="su-input-wrap">
                        <span className="material-symbols-outlined su-input-icon">pin</span>
                        <input
                          type="text"
                          placeholder="6-digit pincode"
                          className={`su-input ${onboardingErrors.pincode ? 'su-input--error' : ''}`}
                          value={onboardingForm.pincode}
                          maxLength={6}
                          onChange={(e) => {
                            setOnboardingForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                            if (onboardingErrors.pincode) setOnboardingErrors(prev => ({ ...prev, pincode: '' }));
                          }}
                        />
                      </div>
                      {onboardingErrors.pincode && <span className="su-error">{onboardingErrors.pincode}</span>}
                    </div>

                    {role === 'customer' && (
                      <div className="su-field">
                        <label className="su-label">Detailed Address</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">home</span>
                          <textarea
                            placeholder="Flat/House No, Building, Street, Area"
                            className={`su-input ${onboardingErrors.address ? 'su-input--error' : ''}`}
                            style={{ paddingLeft: '40px', paddingTop: '8px', minHeight: '60px', background: 'white' }}
                            value={onboardingForm.address}
                            onChange={(e) => {
                              setOnboardingForm(prev => ({ ...prev, address: e.target.value }));
                              if (onboardingErrors.address) setOnboardingErrors(prev => ({ ...prev, address: '' }));
                            }}
                          />
                        </div>
                        {onboardingErrors.address && <span className="su-error">{onboardingErrors.address}</span>}
                      </div>
                    )}

                    {role === 'business' && (
                      <>
                        {/* Shop Name */}
                        <div className="su-field">
                          <label className="su-label">Shop Name</label>
                          <div className="su-input-wrap">
                            <span className="material-symbols-outlined su-input-icon">storefront</span>
                            <input
                              type="text"
                              placeholder="Your shop or business name"
                              className={`su-input ${onboardingErrors.businessName ? 'su-input--error' : ''}`}
                              value={onboardingForm.businessName}
                              onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, businessName: e.target.value }));
                                  if (onboardingErrors.businessName) setOnboardingErrors(prev => ({ ...prev, businessName: '' }));
                                }}
                              />
                            </div>
                            {onboardingErrors.businessName && <span className="su-error">{onboardingErrors.businessName}</span>}
                          </div>

                          {/* Business Type */}
                          <div className="su-field">
                            <label className="su-label">Business Type</label>
                            <div className="su-input-wrap">
                              <span className="material-symbols-outlined su-input-icon">work</span>
                              <select
                                className="su-input"
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

                          {/* Associated Mall */}
                          <div className="su-field">
                            <label className="su-label">Associated Mall (Optional)</label>
                            <div className="su-input-wrap">
                              <span className="material-symbols-outlined su-input-icon">storefront</span>
                              <select
                                className="su-input"
                                style={{ paddingLeft: '40px', background: 'white' }}
                                value={onboardingForm.mallName}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, mallName: e.target.value }))}
                              >
                                <option value="">No Mall / Standalone Shop</option>
                                {MALLS.map(mall => (
                                  <option key={mall} value={mall}>{mall}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Aadhaar Card */}
                          <div className="su-field">
                            <label className="su-label">Aadhaar Card Number (Required)</label>
                            <div className="su-input-wrap">
                              <span className="material-symbols-outlined su-input-icon">fingerprint</span>
                              <input
                                type="text"
                                placeholder="12-digit Aadhaar number"
                                className={`su-input ${onboardingErrors.aadhaar ? 'su-input--error' : ''}`}
                                value={onboardingForm.aadhaar}
                                maxLength={12}
                                onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }));
                                  if (onboardingErrors.aadhaar) setOnboardingErrors(prev => ({ ...prev, aadhaar: '' }));
                                  setAadhaarMatchError('');
                                }}
                              />
                            </div>
                            {onboardingErrors.aadhaar && <span className="su-error">{onboardingErrors.aadhaar}</span>}
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
                          <div className="su-field">
                            <label className="su-label">PAN Card Number (Optional)</label>
                            <div className="su-input-wrap">
                              <span className="material-symbols-outlined su-input-icon">badge</span>
                              <input
                                type="text"
                                placeholder="10-character PAN number"
                                className={`su-input ${onboardingErrors.pan ? 'su-input--error' : ''}`}
                                value={onboardingForm.pan}
                                maxLength={10}
                                onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, pan: e.target.value.toUpperCase().slice(0, 10) }));
                                  if (onboardingErrors.pan) setOnboardingErrors(prev => ({ ...prev, pan: '' }));
                                }}
                              />
                            </div>
                            {onboardingErrors.pan && <span className="su-error">{onboardingErrors.pan}</span>}
                          </div>

                          {/* GST Number */}
                          <div className="su-field">
                            <label className="su-label">GST Number (Optional)</label>
                            <div className="su-input-wrap">
                              <span className="material-symbols-outlined su-input-icon">receipt_long</span>
                              <input
                                type="text"
                                placeholder="15-character GST number"
                                className={`su-input ${onboardingErrors.gst ? 'su-input--error' : ''}`}
                                value={onboardingForm.gst}
                                maxLength={15}
                                onChange={(e) => {
                                  setOnboardingForm(prev => ({ ...prev, gst: e.target.value.toUpperCase().slice(0, 15) }));
                                  if (onboardingErrors.gst) setOnboardingErrors(prev => ({ ...prev, gst: '' }));
                                }}
                              />
                            </div>
                            {onboardingErrors.gst && <span className="su-error">{onboardingErrors.gst}</span>}
                          </div>

                          {/* Shop photo file upload */}
                          <div className="su-field">
                            <label className="su-label">Shop Image (Required)</label>
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
                            {onboardingErrors.shopPhoto && <span className="su-error">{onboardingErrors.shopPhoto}</span>}
                          </div>

                          {/* Aadhaar Card photo file upload */}
                          <div className="su-field">
                            <label className="su-label">Aadhaar Card Image (Required)</label>
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
                            {onboardingErrors.aadhaarPhoto && <span className="su-error">{onboardingErrors.aadhaarPhoto}</span>}
                          </div>

                          {/* PAN Card photo file upload */}
                          <div className="su-field">
                            <label className="su-label">PAN Card Image (Optional)</label>
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
                            {onboardingErrors.panPhoto && <span className="su-error">{onboardingErrors.panPhoto}</span>}
                          </div>
                      </>
                    )}

                    <button type="submit" className="su-submit-btn" style={{ marginTop: '16px' }}>
                      Complete Profile
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => { setShowGoogleOnboarding(false); setGoogleUser(null); }}
                    className="su-terms-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '16px' }}
                  >
                    ← Cancel Google Onboarding
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="signup-card-title">Create Account</h2>
                  <p className="signup-card-subtitle">Fill in your details to get started instantly</p>

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
                          maxLength={10}
                          onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </div>
                      {errors.phone && <span className="su-error">{errors.phone}</span>}
                    </div>

                    {/* City */}
                    <div className="su-field">
                      <label className="su-label" htmlFor="su-city">City</label>
                      <div className="su-input-wrap">
                        <span className="material-symbols-outlined su-input-icon">location_on</span>
                        <select
                          id="su-city"
                          className="su-input"
                          style={{ paddingLeft: '40px', background: 'white' }}
                          value={form.city}
                          onChange={(e) => update('city', e.target.value)}
                        >
                          {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kochi', 'Kolkata', 'Jaipur'].map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Associated Mall (Optional for Business) */}
                    {role === 'business' && (
                      <div className="su-field">
                        <label className="su-label" htmlFor="su-mallName">Associated Mall (Optional)</label>
                        <div className="su-input-wrap">
                          <span className="material-symbols-outlined su-input-icon">storefront</span>
                          <select
                            id="su-mallName"
                            className="su-input"
                            style={{ paddingLeft: '40px', background: 'white' }}
                            value={form.mallName}
                            onChange={(e) => update('mallName', e.target.value)}
                          >
                            <option value="">No Mall / Standalone Shop</option>
                            {MALLS.map(mall => (
                              <option key={mall} value={mall}>{mall}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

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
                        <button type="button" className="su-terms-link" onClick={() => alert('Terms of Use (coming soon)')}>Terms of Use</button>
                        {' '}and{' '}
                        <button type="button" className="su-terms-link" onClick={() => alert('Privacy Policy (coming soon)')}>Privacy Policy</button>
                      </label>
                      {errors.terms && <span className="su-error">{errors.terms}</span>}
                    </div>

                    {/* Submit */}
                    <button type="submit" className="su-submit-btn" disabled={submitting}>
                      {submitting ? 'Creating Account...' : (role === 'customer' ? 'Create Account' : 'Register Your Shop')}
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
                    <button type="button" className="su-social-btn" onClick={() => alert('Facebook signup (coming soon)')}>
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
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="signup-footer">
        <span className="signup-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
          Secure Platform
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
