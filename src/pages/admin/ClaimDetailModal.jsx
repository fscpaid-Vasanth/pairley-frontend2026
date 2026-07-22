import { useEffect, useState } from 'react';
import { X, Check, Phone, User, Clock, FileText, ExternalLink, ImageOff, Copy } from 'lucide-react';
import { isValidImageSrc, getDocumentPreviewUrl, getDocumentDownloadUrl } from '../../utils/adminFilePreview';
import { api } from '../../utils/api';
import { STATUS_STYLES } from './claimStatusStyles';

const formatDate = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// Evidence has no stored content-type — ClaimRequestService names each
// upload `evidence-N.<ext>` from the validated mimetype (see
// claim-request.service.ts), so the URL extension is a reliable enough
// signal for image vs. PDF here.
export const isPdfEvidence = (url) => url.toLowerCase().endsWith('.pdf');

function EvidenceThumb({ url, index }) {
  const [loadError, setLoadError] = useState(false);

  if (isPdfEvidence(url)) {
    return (
      <a
        href={getDocumentDownloadUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:border-[#5B12D6]/40 hover:text-[#5B12D6] text-slate-500 transition-colors"
      >
        <FileText size={22} />
        <span className="text-[9px] font-bold flex items-center gap-0.5">
          Open PDF <ExternalLink size={10} />
        </span>
      </a>
    );
  }

  if (!isValidImageSrc(url) || loadError) {
    return (
      <div className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-white text-slate-300">
        <ImageOff size={20} />
        <span className="text-[9px] font-bold">Preview unavailable</span>
      </div>
    );
  }

  return (
    <a href={getDocumentDownloadUrl(url)} target="_blank" rel="noopener noreferrer" className="aspect-square block rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
      <img
        src={getDocumentPreviewUrl(url)}
        alt={`Evidence ${index + 1}`}
        className="w-full h-full object-cover"
        onError={() => setLoadError(true)}
      />
    </a>
  );
}

// Module 11 Phase 2's duplicate flag, surfaced here purely for admin
// awareness (Module 12 Phase 3) — never changes the approve/reject
// workflow. No admin single-business-by-id lookup endpoint exists yet
// (same limitation CandidateReviewModal's business-level banner has), so
// this shows score/reasons and the candidate business's own id rather than
// resolving the canonical business's name.
function DuplicateBanner({ business }) {
  if (!business?.duplicate_of_business_id) return null;
  const pct = Math.round((business.duplicate_score ?? 0) * 100);
  return (
    <div className="flex items-start gap-1.5 text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
      <Copy size={13} className="flex-shrink-0 mt-0.5" />
      <span>
        Possible duplicate of an existing business ({pct}% match)
        <span className="block font-normal text-amber-600 mt-0.5">
          Suspected canonical business ID: <span className="font-mono">{business.duplicate_of_business_id}</span>
        </span>
        {business.duplicate_reasons?.length > 0 && (
          <span className="block font-normal text-amber-600 mt-0.5">{business.duplicate_reasons.join(' • ')}</span>
        )}
      </span>
    </div>
  );
}

// Module 12 Phase 3 — the evidence-review surface. Follows the same
// "list row -> fetch full detail via :id -> render in modal" pattern as
// CandidateReviewModal (Module 10/11), reusing the same document-preview
// helpers KYC and poster/PDF review already use. Approve/Reject here call
// the exact same endpoints ClaimRequestsPanel's inline buttons do — no
// state-machine change, just a richer place to make the same decision.
export default function ClaimDetailModal({ claimId, onClose, onActionComplete }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setClaim(null);
    setLoading(true);
    setRejecting(false);
    setRejectReason('');
    api
      .get(`/business/claim/requests/${claimId}`)
      .then((data) => setClaim(data))
      .catch((err) => setError(err.message || 'Failed to load claim detail'))
      .finally(() => setLoading(false));
  }, [claimId]);

  const handleApprove = () => {
    setActioning(true);
    api
      .put(`/business/claim/requests/${claimId}/approve`)
      .then(() => onActionComplete())
      .catch((err) => setError(err.message || 'Approve failed'))
      .finally(() => setActioning(false));
  };

  const handleReject = () => {
    setActioning(true);
    api
      .put(`/business/claim/requests/${claimId}/reject`, { reason: rejectReason || undefined })
      .then(() => onActionComplete())
      .catch((err) => setError(err.message || 'Reject failed'))
      .finally(() => setActioning(false));
  };

  return (
    <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={onClose}>
      <div
        className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-2xl w-full relative animate-modalSlideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-800">Claim Review</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">🏪 {claim?.business?.business_name || (loading ? 'Loading…' : 'Unknown business')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 md:p-6 flex flex-col gap-4">
          {loading && <div className="text-center py-16 text-slate-400 font-bold text-sm">Loading claim detail...</div>}

          {!loading && claim && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[claim.status]}`}>
                  {claim.status.replace(/_/g, ' ')}
                </span>
                {claim.rejection_reason && <span className="text-[10px] text-rose-500 font-semibold">{claim.rejection_reason}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <User size={11} /> Claimant Name
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{claim.claimant_name || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Phone size={11} /> Mobile Number
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{claim.mobile}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> Submitted
                  </span>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{formatDate(claim.created_at)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> Reviewed
                  </span>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{formatDate(claim.reviewed_at)}</p>
                </div>
              </div>

              <DuplicateBanner business={claim.business} />

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Evidence {claim.evidence_urls?.length > 0 ? `(${claim.evidence_urls.length})` : ''}
                </span>
                {claim.evidence_urls?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2">
                    {claim.evidence_urls.map((url, i) => (
                      <EvidenceThumb key={url} url={url} index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium mt-1.5">No evidence was submitted with this claim.</p>
                )}
              </div>

              {error && <p className="text-[11px] text-rose-600 font-semibold">{error}</p>}

              {rejecting && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Rejection reason (optional)</span>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Could not verify legitimacy of the request..."
                    rows={2}
                    className="w-full mt-1 border border-slate-200 focus:border-[#5B12D6] rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {!loading && claim?.status === 'PENDING_ADMIN_REVIEW' && (
          <div className="flex items-center justify-end gap-2 px-5 md:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {rejecting ? (
              <>
                <button onClick={() => setRejecting(false)} disabled={actioning} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleReject} disabled={actioning} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                  Confirm Reject
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={actioning}
                  onClick={() => setRejecting(true)}
                  className="px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <X size={13} /> Reject
                </button>
                <button
                  disabled={actioning}
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={13} /> Approve
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
