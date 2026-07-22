import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Store, Phone, User, Upload, FileText, X, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import OtpInput from '../../components/OtpInput';

const validatePhone = (phone) => /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
const storageKey = (businessId) => `pairley_claim_token_${businessId}`;

// Module 12 Phase 1's real limits (FileValidationService/ClaimRequestService)
// — mirrored here so the UI rejects early with the same numbers the server
// will enforce anyway, rather than letting a merchant hit a surprise error
// after already picking files.
const MAX_EVIDENCE_FILES = 5;
const MAX_EVIDENCE_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_EVIDENCE_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';

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

// Module 12 Phase 2 — local, single-use component: reads files client-side
// as base64 data URIs (same FileReader.readAsDataURL pattern already used
// by KycOnboardingWizard/CreateDealPage) and hands them straight to the
// parent's state. Deliberately not MediaUploadPanel — that component
// uploads to an authenticated server endpoint, and no Business JWT exists
// yet at claim-submission time (see ClaimRequestService's design notes).
// Visually mirrors MediaUploadPanel's gallery-grid/dashed-tile language for
// consistency without depending on its upload machinery.
function EvidenceUploadField({ files, onAdd, onRemove }) {
  const roomLeft = MAX_EVIDENCE_FILES - files.length;

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-picking the same file after a remove
    onAdd(picked);
  };

  return (
    <div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        Proof of Ownership <span className="normal-case font-semibold text-slate-400">(optional)</span>
      </span>
      <p className="text-[11px] text-slate-400 font-medium mt-1 mb-2">
        A business registration certificate, GST document, rental agreement, or a photo of you at the storefront — anything that helps us confirm this is really your business. Up to {MAX_EVIDENCE_FILES} files.
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {files.map((f, i) => (
          <div key={i} className="relative aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            {f.isImage ? (
              <img src={f.dataUri} alt={f.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 p-1">
                <FileText size={20} />
                <span className="text-[8px] font-semibold text-center line-clamp-2 px-1">{f.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center"
              aria-label={`Remove ${f.name}`}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        {roomLeft > 0 && (
          <label className="aspect-square rounded-xl border border-dashed border-slate-300 bg-white hover:border-[#5B12D6] hover:bg-[#5B12D6]/5 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#5B12D6] cursor-pointer transition-colors">
            <Upload size={18} />
            <span className="text-[9px] font-bold">Add file</span>
            <input type="file" accept={ACCEPTED_EVIDENCE_TYPES} multiple hidden onChange={handleChange} />
          </label>
        )}
      </div>
    </div>
  );
}

// Module 9 Phase 4 — public, unauthenticated claim flow. Admin-assisted by
// design (see Module 9 STEP 1 Decision 2): this page only ever gets the
// merchant to ADMIN_APPROVED; an admin has to act in between before OTP
// verification unlocks. No self-service auto-approval path exists.
// Module 12 Phase 2 — extended to collect a claimant name and optional
// evidence, giving the admin something real to review instead of nothing
// but a mobile number.
export default function ClaimBusinessPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [claimToken, setClaimToken] = useState(() => localStorage.getItem(storageKey(businessId)) || '');
  const [status, setStatus] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [claimantName, setClaimantName] = useState('');
  const [mobile, setMobile] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
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

  const handleEvidenceAdd = (pickedFiles) => {
    const roomLeft = MAX_EVIDENCE_FILES - evidenceFiles.length;
    if (pickedFiles.length > roomLeft) {
      showToast(`You can add up to ${MAX_EVIDENCE_FILES} files total`, 'error');
    }
    pickedFiles.slice(0, Math.max(0, roomLeft)).forEach((file) => {
      if (file.size > MAX_EVIDENCE_SIZE_BYTES) {
        showToast(`"${file.name}" is too large — max 15MB per file`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceFiles((prev) => [
          ...prev,
          { name: file.name, dataUri: reader.result, isImage: file.type.startsWith('image/') },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEvidenceRemove = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRequestClaim = (e) => {
    e.preventDefault();
    if (!claimantName.trim()) {
      setError('Enter your full name');
      return;
    }
    if (!validatePhone(mobile)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSubmitting(true);
    api
      .post('/business/claim/request', {
        business_id: businessId,
        mobile,
        claimant_name: claimantName.trim(),
        // Undefined (not an empty array) when there's nothing to send —
        // matches ClaimRequestService's "an omitted field means exactly
        // pre-Module-12 behavior" design.
        evidence: evidenceFiles.length > 0 ? evidenceFiles.map((f) => f.dataUri) : undefined,
      })
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
    setClaimantName('');
    setMobile('');
    setEvidenceFiles([]);
    setOtpSent(false);
    setOtp('');
  };

  const copy = status ? STATUS_COPY[status] : null;

  return (
    <div className="page-wrapper min-h-screen py-10 sm:py-16 flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4 w-full">
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-lg text-center">
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
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Your Full Name</span>
                <div className="relative mt-1.5">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white focus:outline-none focus:border-[#5B12D6] text-sm font-semibold"
                  />
                </div>
              </label>

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
              </label>

              <EvidenceUploadField files={evidenceFiles} onAdd={handleEvidenceAdd} onRemove={handleEvidenceRemove} />

              {error && <span className="text-[11px] text-rose-600 font-semibold block">{error}</span>}

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
