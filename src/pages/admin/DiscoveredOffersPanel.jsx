import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Radar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Link2,
  IndianRupee,
  FileText,
  Image as ImageIcon,
  Eye,
  Copy,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { formatPrice } from '../../utils/constants';
import { isValidImageSrc, getDocumentPreviewUrl } from '../../utils/adminFilePreview';
import PosterUploadCard from './PosterUploadCard';
import CandidateReviewModal from './CandidateReviewModal';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'REVIEW_REQUIRED', label: 'Review Required' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'TAKEN_DOWN', label: 'Taken Down' },
];

const STATUS_STYLES = {
  REVIEW_REQUIRED: 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse',
  APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  REJECTED: 'bg-rose-50 border-rose-200 text-rose-700',
  TAKEN_DOWN: 'bg-slate-100 border-slate-200 text-slate-500',
};

function ConfidenceBadge({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  const tone =
    pct >= 70 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : pct >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${tone}`}>{pct}% confidence</span>
  );
}

// Module 10 Phase 3 — POSTER gets a lazy-loaded inline thumbnail (falling
// back to a generic file icon if the S3 read is blocked — see the
// AWSCompromisedKeyQuarantineV3 note in RUNBOOK.md), PDF gets a document
// icon, and WEBSITE has no uploaded file at all so shows nothing here (its
// source link lives in the review modal instead).
function CandidateThumbnail({ candidate }) {
  const [errored, setErrored] = useState(false);
  if (candidate.source === 'POSTER' && candidate.source_file_url && isValidImageSrc(candidate.source_file_url) && !errored) {
    return (
      <img
        src={getDocumentPreviewUrl(candidate.source_file_url)}
        alt=""
        loading="lazy"
        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
        onError={() => setErrored(true)}
      />
    );
  }
  if (candidate.source === 'POSTER' || candidate.source === 'PDF') {
    return (
      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
        {candidate.source === 'PDF' ? <FileText size={16} /> : <ImageIcon size={16} />}
      </div>
    );
  }
  return <div className="w-10 h-10" />;
}

// Module 9 Phase 3 — the admin review-first workflow: every AI-imported
// offer lands here as REVIEW_REQUIRED and stays invisible to customers
// (backend gates on Offer.status, not just this UI) until an admin
// approves it. Search/status filtering and pagination are server-side
// (unlike the other AdminDashboard tabs, which fetch everything and filter
// client-side) since this queue is expected to grow with import volume.
export default function DiscoveredOffersPanel() {
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actioningId, setActioningId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { ids: string[] } | null
  const [rejectReason, setRejectReason] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null); // candidate object | null

  const fetchCandidates = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);

    api
      .get(`/discovery/candidates?${params.toString()}`)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load discovered offers:', err);
        showToast('Failed to load the review queue.', 'error');
        setLoading(false);
      });
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Debounced so the search box doesn't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, fetchCandidates]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
  };

  const runAction = (id, promise, successMessage) => {
    setActioningId(id);
    promise
      .then(() => {
        showToast(successMessage, 'success');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        fetchCandidates();
      })
      .catch((err) => {
        console.error('Review queue action failed:', err);
        showToast('Action failed: ' + (err.message || 'Request failed'), 'error');
      })
      .finally(() => setActioningId(null));
  };

  const handleApprove = (id) => {
    setReviewTarget(null);
    runAction(id, api.put(`/discovery/candidates/${id}/approve`), 'Offer approved and published.');
  };
  const handleTakedown = (id) => {
    setReviewTarget(null);
    runAction(id, api.put(`/discovery/candidates/${id}/takedown`), 'Offer taken down.');
  };

  const openReject = (ids) => {
    setReviewTarget(null);
    setRejectReason('');
    setRejectTarget({ ids });
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const { ids } = rejectTarget;
    setRejectTarget(null);
    if (ids.length === 1) {
      runAction(ids[0], api.put(`/discovery/candidates/${ids[0]}/reject`, { reason: rejectReason || undefined }), 'Offer rejected.');
    } else {
      setActioningId('bulk');
      api
        .post('/discovery/candidates/bulk-reject', { ids, reason: rejectReason || undefined })
        .then((res) => {
          showToast(`Rejected ${res.succeeded.length} offer(s)${res.failed.length ? `, ${res.failed.length} failed` : ''}.`, res.failed.length ? 'error' : 'success');
          setSelectedIds(new Set());
          fetchCandidates();
        })
        .catch((err) => showToast('Bulk reject failed: ' + (err.message || 'Request failed'), 'error'))
        .finally(() => setActioningId(null));
    }
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setActioningId('bulk');
    api
      .post('/discovery/candidates/bulk-approve', { ids })
      .then((res) => {
        showToast(`Approved ${res.succeeded.length} offer(s)${res.failed.length ? `, ${res.failed.length} failed` : ''}.`, res.failed.length ? 'error' : 'success');
        setSelectedIds(new Set());
        fetchCandidates();
      })
      .catch((err) => showToast('Bulk approve failed: ' + (err.message || 'Request failed'), 'error'))
      .finally(() => setActioningId(null));
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Module 10 — poster/PDF upload entry point, feeds this same queue */}
      <PosterUploadCard onCandidateReady={fetchCandidates} />

      {/* Search & filter console */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
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
        <div className="relative w-full lg:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 focus:outline-none focus:border-[#5B12D6] text-xs font-semibold"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3">
          <span className="text-xs font-bold text-[#5B12D6]">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <button
              disabled={actioningId === 'bulk'}
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
            >
              <Check size={12} /> Bulk Approve
            </button>
            <button
              disabled={actioningId === 'bulk'}
              onClick={() => openReject(Array.from(selectedIds))}
              className="px-3.5 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg flex items-center gap-1 disabled:opacity-50"
            >
              <X size={12} /> Bulk Reject
            </button>
          </div>
        </div>
      )}

      {/* Candidate list */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading discovered offers...</div>
      ) : items.length > 0 ? (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[1080px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5"
                  />
                </th>
                <th className="px-4 py-4"></th>
                <th className="px-4 py-4">Offer / Business</th>
                <th className="px-4 py-4">Source</th>
                <th className="px-4 py-4">Confidence</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Imported</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelected(c.id)} className="w-3.5 h-3.5" />
                  </td>
                  <td className="px-4 py-4">
                    <CandidateThumbnail candidate={c} />
                  </td>
                  <td className="px-4 py-4 max-w-[260px]">
                    <div className="text-slate-800 font-bold text-sm line-clamp-1">{c.title}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">🏪 {c.business_name}</div>
                    {c.warnings?.length > 0 && (
                      <div className="flex items-start gap-1 mt-1.5 text-[9px] text-amber-600 font-semibold" title={c.warnings.join(' • ')}>
                        <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{c.warnings.join(' • ')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-[#5B12D6] px-2 py-0.5 rounded-md">
                      <Link2 size={10} /> {c.source}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <ConfidenceBadge score={c.confidence_score} />
                      {(c.duplicate_of_offer_id || c.business_duplicate_of_id) && (
                        <span
                          title="Possible duplicate — see Review for details"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 border border-amber-200 text-amber-700"
                        >
                          <Copy size={9} /> Possible duplicate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-0.5 text-slate-700 font-bold">
                      <IndianRupee size={11} />
                      {c.offer_price ? formatPrice(c.offer_price).replace('₹', '') : '0'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-medium">
                    {c.imported_at ? new Date(c.imported_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[c.review_status]}`}>
                      {c.review_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setReviewTarget(c)}
                        title="Review — compare original vs. extracted"
                        className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg"
                      >
                        <Eye size={12} />
                      </button>
                      {c.review_status !== 'APPROVED' && (
                        <button
                          disabled={actioningId === c.id}
                          onClick={() => handleApprove(c.id)}
                          title="Approve & publish"
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      {c.review_status !== 'REJECTED' && (
                        <button
                          disabled={actioningId === c.id}
                          onClick={() => openReject([c.id])}
                          title="Reject"
                          className="p-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg disabled:opacity-50"
                        >
                          <X size={12} />
                        </button>
                      )}
                      {c.review_status === 'APPROVED' && (
                        <button
                          disabled={actioningId === c.id}
                          onClick={() => handleTakedown(c.id)}
                          title="Take down (soft — reversible)"
                          className="p-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg disabled:opacity-50"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
            <span>
              {total} discovered offer{total === 1 ? '' : 's'} • Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 border border-slate-200/30 rounded-3xl text-slate-400 font-bold text-sm flex flex-col items-center gap-2">
          <Radar size={28} className="text-slate-300" />
          No discovered offers matching this filter.
        </div>
      )}

      {/* Reject reason modal */}
      {rejectTarget && (
        <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={() => setRejectTarget(null)}>
          <div
            className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl p-5 md:p-6 max-w-md w-full relative animate-modalSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-slate-800 mb-1">
              Reject {rejectTarget.ids.length > 1 ? `${rejectTarget.ids.length} offers` : 'offer'}
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-4">Optional — a reason helps future review decisions.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Pricing looks fabricated, not a real merchant offer..."
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

      {/* Review / comparison modal */}
      <CandidateReviewModal
        candidate={reviewTarget}
        actioning={actioningId === reviewTarget?.id}
        onClose={() => setReviewTarget(null)}
        onApprove={handleApprove}
        onReject={(id) => openReject([id])}
        onTakedown={handleTakedown}
      />
    </div>
  );
}
