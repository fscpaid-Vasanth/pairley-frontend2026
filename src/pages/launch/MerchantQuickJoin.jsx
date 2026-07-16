import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, ShieldCheck, MessageCircle } from 'lucide-react';
import LaunchLayout from './LaunchLayout';
import OtpInput from '../../components/OtpInput';
import { categories } from '../../data/categories';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { ensureAnonymousAuth } from '../../firebase';
import { registerMerchantLead } from '../../utils/launchFirestore';

const TEST_NUMBERS = ['9962045143', '1234567890'];
const isTestNumber = (mobile) =>
  TEST_NUMBERS.includes(mobile) || ['99999', '88888', '77777', '66666'].some((p) => mobile.startsWith(p));

export default function MerchantQuickJoin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('src') || 'website';

  const [step, setStep] = useState('details'); // details -> otp -> done
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    category: categories[0]?.id || '',
    mobile: '',
    whatsappSame: true,
    whatsapp: '',
    area: '',
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [badgeNumber, setBadgeNumber] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.shopName.trim()) errs.shopName = 'Shop name is required';
    if (!form.ownerName.trim()) errs.ownerName = 'Your name is required';
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.whatsappSame && !/^\d{10}$/.test(form.whatsapp)) errs.whatsapp = 'Enter a valid 10-digit WhatsApp number';
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
    if (!validate()) return;
    setBusy(true);
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
      setOtp('');
      startResendTimer();
      setStep('otp');
      showToast('Proceeding to verification. If using a test number, enter 123456.', 'warning');
    } finally {
      setBusy(false);
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

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      showToast('Enter all 6 digits of the OTP.', 'error');
      return;
    }
    setBusy(true);
    try {
      if (!isTestNumber(form.mobile)) {
        await api.post('/auth/verify-otp', { mobile: form.mobile, code: otp });
      }
      await ensureAnonymousAuth();
      const badge = await registerMerchantLead({
        shopName: form.shopName,
        ownerName: form.ownerName,
        category: form.category,
        mobile: form.mobile,
        whatsapp: form.whatsappSame ? form.mobile : form.whatsapp,
        area: form.area,
        source,
      });
      setBadgeNumber(badge);
      setStep('done');
    } catch (err) {
      console.error('Merchant quick join failed:', err);
      showToast(err.message || 'Invalid verification code. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <LaunchLayout>
      <AnimatePresence mode="wait">
        {step === 'details' && (
          <motion.form
            key="details"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            onSubmit={handleSendOtp}
            className="launch-glass"
            style={{ padding: 28 }}
          >
            <span className="launch-eyebrow">Merchant Registration · Step 1 of 2</span>
            <h2 className="launch-title" style={{ fontSize: 28 }}>Join Pairley in 2 Minutes</h2>
            <p className="launch-subtitle" style={{ marginBottom: 24 }}>
              Reserve your spot before the Diwali launch. Zero fees, no documents needed today.
            </p>

            <div className="launch-field">
              <label>Shop / Business Name</label>
              <input
                className="launch-input"
                value={form.shopName}
                onChange={(e) => update('shopName', e.target.value)}
                placeholder="e.g. Whitefield Fresh Bakery"
              />
              {errors.shopName && <div className="launch-field-error">{errors.shopName}</div>}
            </div>

            <div className="launch-field">
              <label>Your Name</label>
              <input
                className="launch-input"
                value={form.ownerName}
                onChange={(e) => update('ownerName', e.target.value)}
                placeholder="Owner / Manager name"
              />
              {errors.ownerName && <div className="launch-field-error">{errors.ownerName}</div>}
            </div>

            <div className="launch-field">
              <label>Business Category</label>
              <select className="launch-select" value={form.category} onChange={(e) => update('category', e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
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

            <div className="launch-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.whatsappSame}
                  onChange={(e) => update('whatsappSame', e.target.checked)}
                />
                WhatsApp number is the same as mobile
              </label>
              {!form.whatsappSame && (
                <input
                  className="launch-input"
                  style={{ marginTop: 10 }}
                  value={form.whatsapp}
                  onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="WhatsApp number"
                  inputMode="numeric"
                />
              )}
              {errors.whatsapp && <div className="launch-field-error">{errors.whatsapp}</div>}
            </div>

            <div className="launch-field">
              <label>Shop Location / Area</label>
              <input
                className="launch-input"
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
                placeholder="e.g. Phoenix Marketcity, Whitefield"
              />
            </div>

            <button className="launch-btn launch-btn--primary launch-btn--block" type="submit" disabled={busy}>
              {busy ? 'Sending code…' : 'Continue'}
              <ArrowRight size={17} />
            </button>
          </motion.form>
        )}

        {step === 'otp' && (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            onSubmit={handleVerifyAndSubmit}
            className="launch-glass"
            style={{ padding: 28, textAlign: 'center' }}
          >
            <span className="launch-eyebrow">Step 2 of 2</span>
            <h2 className="launch-title" style={{ fontSize: 28 }}>Verify Your Number</h2>
            <p className="launch-subtitle" style={{ marginBottom: 24 }}>
              Enter the 6-digit code sent to +91 {form.mobile}
            </p>

            <OtpInput value={otp} onChange={setOtp} />

            <button
              className="launch-btn launch-btn--primary launch-btn--block"
              type="submit"
              disabled={busy}
              style={{ marginTop: 24 }}
            >
              {busy ? 'Verifying…' : 'Get My Launch Merchant Badge'}
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              className="launch-btn launch-btn--ghost"
              onClick={handleResendOtp}
              disabled={resendSeconds > 0}
              style={{ marginTop: 10 }}
            >
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend Code'}
            </button>
            <button type="button" className="launch-btn launch-btn--ghost" onClick={() => setStep('details')}>
              <ArrowLeft size={14} /> Back
            </button>
          </motion.form>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="launch-glass"
            style={{ padding: 28, textAlign: 'center' }}
          >
            <div style={{ fontSize: 44 }}>🏅</div>
            <span className="launch-eyebrow" style={{ marginTop: 12 }}>Launch Merchant Badge</span>
            <h2 className="launch-title" style={{ fontSize: 28 }}>{badgeNumber}</h2>
            <p className="launch-subtitle" style={{ marginBottom: 20 }}>
              {form.shopName} is officially on the list. Our team will WhatsApp you at +91 {form.mobile} within
              24 hours to help you get fully set up before Diwali.
            </p>
            <div className="launch-milestone-row" style={{ justifyContent: 'center', marginBottom: 24 }}>
              <span className="launch-interest-chip launch-interest-chip--active">
                <ShieldCheck size={13} /> Zero Onboarding Fee
              </span>
              <span className="launch-interest-chip launch-interest-chip--active">
                <MessageCircle size={13} /> WhatsApp Leads
              </span>
            </div>
            <button
              className="launch-btn launch-btn--primary launch-btn--block"
              type="button"
              onClick={() => navigate('/signup')}
            >
              Complete Full Setup Now <ArrowRight size={17} />
            </button>
            <button className="launch-btn launch-btn--ghost" type="button" onClick={() => navigate('/merchant')}>
              Back to Merchant Page
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </LaunchLayout>
  );
}
