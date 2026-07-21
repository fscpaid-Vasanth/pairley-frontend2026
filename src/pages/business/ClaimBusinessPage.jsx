import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Store, Phone, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import OtpInput from '../../components/OtpInput';

const validatePhone = (phone) => /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
const storageKey = (businessId) => `pairley_claim_token_${businessId}`;

const STATUS_COPY = {
  PENDING_ADMIN_REVIEW: {
    icon: Clock,
    title: "We've got your request",
    body: "Our team is reviewing your claim. This usually doesn't take long — check back soon.",
  },
  ADMIN_APPROVED: {
    icon: ShieldCheck,
    title: 'Your claim was approved',
    body: 'Verify your mobile number to finish taking ownership of this business.',
  },
  ADMIN_REJECTED: {
    icon: XCircle,
    title: 'This claim was not approved',
    body: 'Contact Pairley support if you believe this is a mistake.',
  },
  EXPIRED: {
    icon: RotateCcw,
    title: 'This claim link has expired',
    body: 'Please submit a new claim request below.',
  },
  COMPLETED: {
    icon: CheckCircle2,
    title: "You're all set",
    body: 'Ownership has been transferred to your account.',
  },
};

// Module 9 Phase 4 — public, unauthenticated claim flow. Admin-assisted by
// design (see Module 9 STEP 1 Decision 2): this page only ever gets the
// merchant to ADMIN_APPROVED; an admin has to act in between before OTP
// verification unlocks. No self-service auto-approval path exists.
export default function ClaimBusinessPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [claimToken, setClaimToken] = useState(() => localStorage.getItem(storageKey(businessId)) || '');
  const [status, setStatus] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const refreshStatus = useCallback(() => {
    if (!claimToken) return;
    setLoadingStatus(true);
    api
      .get(`/business/claim/status/${claimToken}`)
      .then((data) => {
        setStatus(data.status);
        setBusinessName(data.businessName);
        setLoadingStatus(false);
      })
      .catch(() => {
        // A stale/invalid stored token — clear it and fall back to the
        // request form rather than showing a dead-end error forever.
        localStorage.removeItem(storageKey(businessId));
        setClaimToken('');
        setStatus(null);
        setLoadingStatus(false);
      });
  }, [claimToken, businessId]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleRequestClaim = (e) => {
    e.preventDefault();
    if (!validatePhone(mobile)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSubmitting(true);
    api
      .post('/business/claim/request', { business_id: businessId, mobile })
      .then((data) => {
        localStorage.setItem(storageKey(businessId), data.claimToken);
        setClaimToken(data.claimToken);
        setStatus(data.status);
        showToast(data.message, 'success');
      })
      .catch((err) => {
        setError(err.message || 'Could not submit your claim request');
      })
      .finally(() => setSubmitting(false));
  };

  const handleSendOtp = () => {
    setSubmitting(true);
    api
      .post('/business/claim/otp/send', { claimToken })
      .then(() => {
        setOtpSent(true);
        showToast('OTP sent to your mobile number.', 'success');
      })
      .catch((err) => showToast(err.message || 'Failed to send OTP', 'error'))
      .finally(() => setSubmitting(false));
  };

  const handleVerifyOtp = () => {
    setVerifying(true);
    api
      .post('/business/claim/otp/verify', { claimToken, code: otp })
      .then((res) => {
        localStorage.setItem('pairley_token', res.token);
        localStorage.setItem('pairley_user', JSON.stringify({ ...res.user, role: res.role }));
        localStorage.removeItem(storageKey(businessId));
        showToast('Business claimed! Welcome to your dashboard.', 'success');
        navigate('/business/dashboard', { replace: true });
      })
      .catch((err) => {
        showToast(err.message || 'Invalid OTP code', 'error');
        setOtp('');
      })
      .finally(() => setVerifying(false));
  };

  const startOver = () => {
    localStorage.removeItem(storageKey(businessId));
    setClaimToken('');
    setStatus(null);
    setMobile('');
    setOtpSent(false);
    setOtp('');
  };

  const copy = status ? STATUS_COPY[status] : null;

  return (
    <div className="page-wrapper min-h-screen py-16 flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl p-7 shadow-lg text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5B12D6]/10 flex items-center justify-center mb-4">
            <Store className="text-[#5B12D6]" size={26} />
          </div>
          <h1 className="text-xl font-black text-slate-800">Claim Your Business</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1 mb-6">
            {businessName || 'Prove this listing belongs to you to take ownership.'}
          </p>

          {loadingStatus && <p className="text-sm text-slate-400 font-semibold py-8">Checking claim status...</p>}

          {!loadingStatus && !claimToken && (
            <form onSubmit={handleRequestClaim} className="text-left space-y-4">
              <label className="block">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Your Mobile Number</span>
                <div className="relative mt-1.5">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:outline-none focus:border-[#5B12D6] text-sm font-semibold"
                  />
                </div>
                {error && <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{error}</span>}
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#5B12D6] hover:bg-[#430bb0] text-white font-bold text-sm transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Request to Claim'}
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                An admin will review your request, then you'll verify your number by OTP.
              </p>
            </form>
          )}

          {!loadingStatus && claimToken && copy && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <copy.icon size={32} className="text-[#5B12D6]" />
                <h2 className="text-base font-black text-slate-800">{copy.title}</h2>
                <p className="text-xs text-slate-500 font-medium max-w-xs">{copy.body}</p>
              </div>

              {status === 'PENDING_ADMIN_REVIEW' && (
                <button
                  onClick={refreshStatus}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs"
                >
                  Refresh status
                </button>
              )}

              {status === 'ADMIN_APPROVED' && !otpSent && (
                <button
                  onClick={handleSendOtp}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#5B12D6] hover:bg-[#430bb0] text-white font-bold text-sm disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Verification Code'}
                </button>
              )}

              {status === 'ADMIN_APPROVED' && otpSent && (
                <div className="space-y-4">
                  <OtpInput value={otp} onChange={setOtp} variant="light" />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifying || otp.length < 6}
                    className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold text-sm disabled:opacity-50"
                  >
                    {verifying ? 'Verifying...' : 'Verify & Claim Business'}
                  </button>
                  <button onClick={handleSendOtp} disabled={submitting} className="w-full text-[11px] text-slate-400 font-semibold">
                    Didn't get a code? Resend
                  </button>
                </div>
              )}

              {(status === 'ADMIN_REJECTED' || status === 'EXPIRED') && (
                <button
                  onClick={startOver}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs"
                >
                  Submit a New Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
