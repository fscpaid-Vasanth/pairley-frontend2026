import { useEffect, useState, useCallback } from 'react';
import { Check, X, Phone, Clock, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import ClaimDetailModal from './ClaimDetailModal';
import { STATUS_STYLES } from './claimStatusStyles';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING_ADMIN_REVIEW', label: 'Pending Review' },
  { value: 'ADMIN_APPROVED', label: 'Approved (awaiting OTP)' },
  { value: 'ADMIN_REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'EXPIRED', label: 'Expired' },
];

// Module 9 Phase 4 — admin side of the claim state machine. Approve/reject
// only ever act on PENDING_ADMIN_REVIEW requests (enforced server-side);
// this UI just reflects that by only showing the action buttons on rows
// where they're actually valid.
export default function ClaimRequestsPanel() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_ADMIN_REVIEW');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailTarget, setDetailTarget] = useState(null);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get(`/business/claim/requests${qs}`)
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load claim requests:', err);
        showToast('Failed to load claim requests.', 'error');
        setLoading(false);
      });
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = (id) => {
    setActioningId(id);
    api
      .put(`/business/claim/requests/${id}/approve`)
      .then(() => {
        showToast('Claim approved — merchant can now verify by OTP.', 'success');
        fetchRequests();
      })
      .catch((err) => showToast('Approve failed: ' + (err.message || 'Request failed'), 'error'))
      .finally(() => setActioningId(null));
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const id = rejectTarget;
    setRejectTarget(null);
    setActioningId(id);
    api
      .put(`/business/claim/requests/${id}/reject`, { reason: rejectReason || undefined })
      .then(() => {
        showToast('Claim rejected.', 'success');
        fetchRequests();
      })
      .catch((err) => showToast('Reject failed: ' + (err.message || 'Request failed'), 'error'))
      .finally(() => setActioningId(null));
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex flex-wrap gap-1.5 bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold tracking-wide uppercase transition-all ${
              statusFilter === f.value ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100/80 hover:bg-slate-200/60 text-slate-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading claim requests...</div>
      ) : requests.length > 0 ? (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-4">Business</th>
                <th className="px-4 py-4">Claimant Mobile</th>
                <th className="px-4 py-4">Requested</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Reviewed</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-bold text-sm">{r.business?.business_name || 'Unknown'}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{r.business?.category}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" /> {r.mobile}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[r.status]}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                    {r.rejection_reason && <div className="text-[9px] text-rose-500 font-semibold mt-1 max-w-[180px]">{r.rejection_reason}</div>}
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-medium">
                    {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setDetailTarget(r.id)}
                        title="View evidence & detail"
                        className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg"
                      >
                        <Eye size={12} />
                      </button>
                      {r.status === 'PENDING_ADMIN_REVIEW' && (
                        <>
                          <button
                            disabled={actioningId === r.id}
                            onClick={() => handleApprove(r.id)}
                            title="Approve"
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            disabled={actioningId === r.id}
                            onClick={() => {
                              setRejectReason('');
                              setRejectTarget(r.id);
                            }}
                            title="Reject"
                            className="p-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg disabled:opacity-50"
                          >
                            <X size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 border border-slate-200/30 rounded-3xl text-slate-400 font-bold text-sm">
          No claim requests matching this filter.
        </div>
      )}

      {detailTarget && (
        <ClaimDetailModal
          claimId={detailTarget}
          onClose={() => setDetailTarget(null)}
          onActionComplete={() => {
            setDetailTarget(null);
            fetchRequests();
          }}
        />
      )}

      {rejectTarget && (
        <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={() => setRejectTarget(null)}>
          <div
            className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl p-5 md:p-6 max-w-md w-full relative animate-modalSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-slate-800 mb-1">Reject this claim</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4">Optional — a reason helps if the merchant appeals.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Could not verify legitimacy of the request..."
              rows={3}
              className="w-full border border-slate-200 focus:border-[#5B12D6] rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setRejectTarget(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={confirmReject} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
