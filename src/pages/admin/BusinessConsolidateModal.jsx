import { useEffect, useState } from 'react';
import { X, GitMerge, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

// A business card the admin can select as "keep this one" — deliberately
// not a full business-detail view (name/city/category is enough to tell
// two candidate rows apart); the fuller KYC-style detail lives on the
// Shop Onboardings tab already if an admin needs to dig deeper first.
function BusinessOption({ business, selected, onSelect, pendingClaim }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(business.id)}
      disabled={pendingClaim}
      className={`flex-1 text-left rounded-2xl border p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        selected ? 'border-[#5B12D6] bg-[#5B12D6]/5 ring-1 ring-[#5B12D6]/30' : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">{business.business_name}</span>
        {selected && <CheckCircle2 size={16} className="text-[#5B12D6] flex-shrink-0" />}
      </div>
      <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
        <MapPin size={10} /> {business.city} · {business.category}
      </div>
      {pendingClaim && (
        <div className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
          <AlertTriangle size={11} /> Has a pending claim request
        </div>
      )}
    </button>
  );
}

// Pure so it's unit-testable without mounting the component: given the
// detail payload (this business + its suggested `duplicate_of`) and which
// id the admin picked to keep, returns the id of the one to remove.
export const resolveDuplicateToRemove = (detail, canonicalId) =>
  canonicalId === detail.id ? detail.duplicate_of.id : detail.id;

// Module 12 Phase 4 — the consolidation confirmation surface. `businessId`
// is the business flagged as a likely duplicate (the row clicked from
// BusinessDuplicatesPanel); getDuplicateDetail also returns its suggested
// canonical via the `duplicate_of` relation. The admin picks which of the
// two survives — defaults to the suggested canonical, matching
// duplicate_of_business_id's own "this is a duplicate OF that" direction —
// but can flip it if the AI got the direction backwards. Whichever one
// isn't selected is the one sent to POST .../consolidate and gets
// soft-removed.
export default function BusinessConsolidateModal({ businessId, onClose, onActionComplete }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canonicalId, setCanonicalId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDetail(null);
    setLoading(true);
    setError('');
    api
      .get(`/business/duplicates/${businessId}`)
      .then((data) => {
        setDetail(data);
        setCanonicalId(data.duplicate_of?.id || data.id);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load duplicate detail');
        setLoading(false);
      });
  }, [businessId]);

  const hasPendingClaim = detail && (detail.pending_claim_on_this || detail.pending_claim_on_canonical);
  const canConsolidate = detail?.duplicate_of && !hasPendingClaim;

  const handleConsolidate = () => {
    if (!detail?.duplicate_of || !canonicalId) return;
    const duplicateToRemoveId = resolveDuplicateToRemove(detail, canonicalId);
    setSubmitting(true);
    setError('');
    api
      .post(`/business/duplicates/${duplicateToRemoveId}/consolidate`, { canonical_business_id: canonicalId })
      .then(() => onActionComplete())
      .catch((err) => setError(err.message || 'Consolidation failed'))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={onClose}>
      <div
        className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-2xl w-full relative animate-modalSlideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-800">Consolidate Duplicate Businesses</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Choose which listing to keep</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 md:p-6 flex flex-col gap-4">
          {loading && <div className="text-center py-16 text-slate-400 font-bold text-sm">Loading...</div>}

          {!loading && detail && !detail.duplicate_of && (
            <p className="text-xs text-rose-600 font-semibold">
              The suggested canonical business for this record no longer exists — nothing to consolidate.
            </p>
          )}

          {!loading && detail?.duplicate_of && (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <BusinessOption
                  business={detail}
                  selected={canonicalId === detail.id}
                  onSelect={setCanonicalId}
                  pendingClaim={detail.pending_claim_on_this}
                />
                <BusinessOption
                  business={detail.duplicate_of}
                  selected={canonicalId === detail.duplicate_of.id}
                  onSelect={setCanonicalId}
                  pendingClaim={detail.pending_claim_on_canonical}
                />
              </div>

              <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                {Math.round((detail.duplicate_score ?? 0) * 100)}% match
                {detail.duplicate_reasons?.length > 0 && (
                  <span className="block font-normal text-amber-600 mt-0.5">{detail.duplicate_reasons.join(' • ')}</span>
                )}
              </div>

              {hasPendingClaim && (
                <div className="flex items-start gap-1.5 text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                  <span>A pending claim request exists on one of these businesses. Resolve it (approve/reject) before consolidating.</span>
                </div>
              )}

              {error && <p className="text-[11px] text-rose-600 font-semibold">{error}</p>}
            </>
          )}
        </div>

        {!loading && detail?.duplicate_of && (
          <div className="flex items-center justify-end gap-2 px-5 md:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button onClick={onClose} disabled={submitting} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={handleConsolidate}
              disabled={submitting || !canConsolidate}
              className="px-4 py-2 bg-[#5B12D6] hover:bg-[#430bb0] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <GitMerge size={13} /> {submitting ? 'Consolidating...' : 'Consolidate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
