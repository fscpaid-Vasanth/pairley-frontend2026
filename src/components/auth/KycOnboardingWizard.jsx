import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { MALLS } from '../../utils/constants';
import '../../pages/auth/SignUpPage.css';
import './KycOnboardingWizard.css';

const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kochi', 'Kolkata', 'Jaipur'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Gujarat', 'Kerala', 'West Bengal', 'Rajasthan'];
const BUSINESS_TYPES = ['Shop', 'Tour Operator', 'Restaurant', 'Salon/Spa', 'Gym/Fitness', 'Academy/Institute', 'Service Provider', 'Other'];

/**
 * Shared "complete your profile" KYC wizard used by both LoginPage (Google
 * sign-in of a new user) and SignUpPage (Google sign-in, and the standard
 * business signup path, which has always required these same fields).
 * Broken into short steps — each one fits a single screen without
 * scrolling — rather than one long form, since the business path alone has
 * 11 fields plus two document photo uploads with on-device OCR scanning.
 *
 * `role`: 'customer' | 'business'
 * `onComplete(onboardingPayload)`: called with the collected fields once the
 *   final step is submitted — the caller still owns actually registering
 *   (OTP send/verify, /auth/register or /auth/google) since that differs
 *   between the Login and Signup entry points.
 */
export default function KycOnboardingWizard({ role, onComplete, onCancel }) {
  const isBusiness = role === 'business';
  const steps = isBusiness
    ? ['contact', 'business', 'identity', 'documents']
    : ['contact', 'address'];
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];

  const [form, setForm] = useState({
    mobile: '', city: 'Bangalore', state: '', pincode: '',
    address: '',
    businessName: '', businessType: 'Shop', mallName: '',
    aadhaar: '', pan: '', gst: '',
    shopPhoto: '', aadhaarPhoto: '', panPhoto: '',
  });
  const [errors, setErrors] = useState({});
  const [isScanningAadhaar, setIsScanningAadhaar] = useState(false);
  const [aadhaarScanProgress, setAadhaarScanProgress] = useState(0);
  const [aadhaarScanMessage, setAadhaarScanMessage] = useState('');
  const [scannedAadhaarNumber, setScannedAadhaarNumber] = useState('');

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const scanAadhaarCard = async (file) => {
    setIsScanningAadhaar(true);
    setAadhaarScanProgress(0);
    setAadhaarScanMessage('Initializing OCR engine...');
    try {
      const { recognize } = await import('tesseract.js');
      setAadhaarScanMessage('Scanning image for 12-digit Aadhaar...');
      const result = await recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') setAadhaarScanProgress(Math.round(m.progress * 100));
        },
      });
      const text = result.data.text;
      const spaceMatch = text.match(/\b([2-9]\d{3})\s+(\d{4})\s+(\d{4})\b/);
      let extracted = '';
      if (spaceMatch) {
        extracted = `${spaceMatch[1]}${spaceMatch[2]}${spaceMatch[3]}`;
      } else {
        const contiguousMatch = text.match(/\b([2-9]\d{11})\b/);
        if (contiguousMatch) {
          extracted = contiguousMatch[1];
        } else {
          const withoutYears = text.replace(/\b(19\d{2}|20\d{2})\b/g, '');
          const match = withoutYears.replace(/\D/g, '').match(/[2-9]\d{11}/);
          if (match) extracted = match[0];
        }
      }
      if (extracted) {
        setScannedAadhaarNumber(extracted);
        setAadhaarScanMessage(`Success! Aadhaar number scanned: ${extracted}`);
        update('aadhaar', extracted);
      } else {
        setAadhaarScanMessage('Scan complete, but no clear 12-digit Aadhaar number was found. Please use a clearer photo.');
        setScannedAadhaarNumber('');
      }
    } catch (error) {
      console.error('Aadhaar scan failed:', error);
      setAadhaarScanMessage('Scanning failed. Please try again with a clearer photo.');
    } finally {
      setIsScanningAadhaar(false);
    }
  };

  const scanPANCard = async (file) => {
    try {
      const { recognize } = await import('tesseract.js');
      const result = await recognize(file, 'eng');
      const panMatch = result.data.text.match(/\b([A-Z]{5}\d{4}[A-Z])\b/i);
      if (panMatch) update('pan', panMatch[1].toUpperCase());
    } catch (error) {
      console.error('PAN scan failed:', error);
    }
  };

  const handleUploadClick = async (field) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({ quality: 90, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Prompt });
        if (image?.dataUrl) {
          update(field, image.dataUrl);
          if (field === 'aadhaarPhoto' || field === 'panPhoto') {
            const blob = await (await fetch(image.dataUrl)).blob();
            const file = new File([blob], `${field}.jpg`, { type: 'image/jpeg' });
            field === 'aadhaarPhoto' ? scanAadhaarCard(file) : scanPANCard(file);
          }
        }
      } catch {
        document.getElementById(`kyc-${field}-input`)?.click();
      }
    } else {
      document.getElementById(`kyc-${field}-input`)?.click();
    }
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update(field, reader.result);
      if (field === 'aadhaarPhoto') scanAadhaarCard(file);
      else if (field === 'panPhoto') scanPANCard(file);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      onComplete({
        mobile: form.mobile,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        address: isBusiness ? 'Registered Office Address' : form.address,
        business_name: isBusiness ? form.businessName : undefined,
        business_type: isBusiness ? form.businessType : undefined,
        category: isBusiness ? 'shopping' : undefined,
        mall_name: isBusiness ? form.mallName : undefined,
        aadhaar_number: isBusiness ? form.aadhaar : undefined,
        gst_number: isBusiness && form.gst.trim() ? form.gst : undefined,
        pan_number: isBusiness && form.pan.trim() ? form.pan : undefined,
        shop_photo: isBusiness ? form.shopPhoto : undefined,
        aadhaar_photo: isBusiness ? form.aadhaarPhoto : undefined,
        pan_photo: isBusiness && form.panPhoto ? form.panPhoto : undefined,
      });
    }
  };

  const goBack = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
    else onCancel();
  };

  return (
    <div className="kyc-wizard">
      <span className="kyc-wizard__step-label">Step {stepIdx + 1} of {steps.length}</span>
      <h2 className="signup-card-title">
        {step === 'contact' && 'Where Are You Located?'}
        {step === 'address' && 'Your Delivery Address'}
        {step === 'business' && 'About Your Business'}
        {step === 'identity' && 'Verify Your Identity'}
        {step === 'documents' && 'Additional Documents'}
      </h2>
      <p className="signup-card-subtitle" style={{ marginBottom: 16 }}>
        {isBusiness ? 'A few details to finalize your Shop Owner account.' : 'A few details to finalize your Customer account.'}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="signup-form w-full kyc-wizard__form">
        {step === 'contact' && (
          <>
            <div className="su-field">
              <label className="su-label">Mobile Number</label>
              <div className="su-phone-row">
                <select className="su-country-code" defaultValue="+91"><option value="+91">🇮🇳 +91</option></select>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className={`su-input su-phone-input ${errors.mobile ? 'su-input--error' : ''}`}
                  value={form.mobile}
                  onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              {errors.mobile && <span className="su-error">{errors.mobile}</span>}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="su-field" style={{ flex: 1 }}>
                <label className="su-label">City</label>
                <select className="su-input" style={{ background: 'white' }} value={form.city} onChange={(e) => update('city', e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="su-field" style={{ flex: 1 }}>
                <label className="su-label">State</label>
                <select className={`su-input ${errors.state ? 'su-input--error' : ''}`} style={{ background: 'white' }} value={form.state} onChange={(e) => update('state', e.target.value)}>
                  <option value="">Select State</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <span className="su-error">{errors.state}</span>}
              </div>
            </div>
            <div className="su-field">
              <label className="su-label">Pincode</label>
              <input
                type="text"
                placeholder="6-digit pincode"
                className={`su-input ${errors.pincode ? 'su-input--error' : ''}`}
                value={form.pincode}
                maxLength={6}
                onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              {errors.pincode && <span className="su-error">{errors.pincode}</span>}
            </div>
          </>
        )}

        {step === 'address' && (
          <div className="su-field">
            <label className="su-label">Detailed Address</label>
            <textarea
              placeholder="Flat/House No, Building, Street, Area"
              className={`su-input ${errors.address ? 'su-input--error' : ''}`}
              style={{ paddingLeft: 16, paddingTop: 10, minHeight: 90, background: 'white' }}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
            {errors.address && <span className="su-error">{errors.address}</span>}
          </div>
        )}

        {step === 'business' && (
          <>
            <div className="su-field">
              <label className="su-label">Shop Name</label>
              <input
                type="text"
                placeholder="Your shop or business name"
                className={`su-input ${errors.businessName ? 'su-input--error' : ''}`}
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
              />
              {errors.businessName && <span className="su-error">{errors.businessName}</span>}
            </div>
            <div className="su-field">
              <label className="su-label">Business Type</label>
              <select className="su-input" style={{ background: 'white' }} value={form.businessType} onChange={(e) => update('businessType', e.target.value)}>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="su-field">
              <label className="su-label">Associated Mall (Optional)</label>
              <select className="su-input" style={{ background: 'white' }} value={form.mallName} onChange={(e) => update('mallName', e.target.value)}>
                <option value="">No Mall / Standalone Shop</option>
                {MALLS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}

        {step === 'identity' && (
          <>
            <div className="su-field">
              <label className="su-label">Aadhaar Card Number (Required)</label>
              <input type="text" placeholder="Upload Aadhaar card image to scan" className={`su-input ${errors.aadhaar ? 'su-input--error' : ''}`} value={form.aadhaar} readOnly />
              {errors.aadhaar && <span className="su-error">{errors.aadhaar}</span>}
            </div>
            <div className="su-field">
              <div className="su-file-upload-wrap">
                <input type="file" accept="image/*" id="kyc-aadhaarPhoto-input" style={{ display: 'none' }} onChange={(e) => handleFileChange('aadhaarPhoto', e.target.files[0])} />
                <div onClick={() => handleUploadClick('aadhaarPhoto')} className={`su-file-upload-label ${errors.aadhaarPhoto ? 'su-file-upload-label--error' : ''}`} style={{ cursor: 'pointer' }}>
                  <span className="material-symbols-outlined">description</span>
                  {form.aadhaarPhoto ? 'Change Aadhaar Card Image' : 'Upload Aadhaar Card Image'}
                </div>
                {form.aadhaarPhoto && (
                  <div className="su-image-preview-container aadhaar-scan-container">
                    <img src={form.aadhaarPhoto} alt="Aadhaar Preview" className="su-image-preview" />
                    {isScanningAadhaar && (
                      <div className="aadhaar-scan-overlay">
                        <div className="aadhaar-scan-laser" />
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 28 }}>sync</span>
                        <div style={{ marginTop: 8, fontSize: 13 }}>Scanning Aadhaar...</div>
                        <div className="aadhaar-scan-progress-bar"><div className="aadhaar-scan-progress-fill" style={{ width: `${aadhaarScanProgress}%` }} /></div>
                      </div>
                    )}
                  </div>
                )}
                {aadhaarScanMessage && (
                  <div className={`aadhaar-scan-message-box ${scannedAadhaarNumber ? 'aadhaar-scan-message-box--success' : isScanningAadhaar ? 'aadhaar-scan-message-box--info' : 'aadhaar-scan-message-box--warning'}`}>
                    {aadhaarScanMessage}
                  </div>
                )}
              </div>
              {errors.aadhaarPhoto && <span className="su-error">{errors.aadhaarPhoto}</span>}
            </div>
          </>
        )}

        {step === 'documents' && (
          <>
            <div className="su-field">
              <label className="su-label">Shop Image (Required)</label>
              <div className="su-file-upload-wrap">
                <input type="file" accept="image/*" id="kyc-shopPhoto-input" style={{ display: 'none' }} onChange={(e) => handleFileChange('shopPhoto', e.target.files[0])} />
                <div onClick={() => handleUploadClick('shopPhoto')} className={`su-file-upload-label ${errors.shopPhoto ? 'su-file-upload-label--error' : ''}`} style={{ cursor: 'pointer' }}>
                  <span className="material-symbols-outlined">add_a_photo</span>
                  {form.shopPhoto ? 'Change Shop Image' : 'Upload Shop Image'}
                </div>
                {form.shopPhoto && <div className="su-image-preview-container"><img src={form.shopPhoto} alt="Shop Preview" className="su-image-preview" /></div>}
              </div>
              {errors.shopPhoto && <span className="su-error">{errors.shopPhoto}</span>}
            </div>
            <div className="su-field">
              <label className="su-label">PAN Card Number (Optional)</label>
              <input type="text" placeholder="Upload PAN image to scan (optional)" className="su-input" value={form.pan} readOnly />
            </div>
            <div className="su-field">
              <label className="su-label">GST Number (Optional)</label>
              <input
                type="text"
                placeholder="15-character GST number"
                className={`su-input ${errors.gst ? 'su-input--error' : ''}`}
                value={form.gst}
                maxLength={15}
                onChange={(e) => update('gst', e.target.value.toUpperCase().slice(0, 15))}
              />
              {errors.gst && <span className="su-error">{errors.gst}</span>}
            </div>
          </>
        )}

        <div className="kyc-wizard__actions">
          <button type="button" className="kyc-wizard__back" onClick={goBack}>← {stepIdx === 0 ? 'Cancel' : 'Back'}</button>
          <button type="submit" className="su-submit-btn" style={{ flex: 1 }}>
            {stepIdx < steps.length - 1 ? 'Continue' : 'Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
