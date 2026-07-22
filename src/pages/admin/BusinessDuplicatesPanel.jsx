import { useEffect, useState, useCallback } from 'react';
import { Eye, Copy, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import BusinessConsolidateModal from './BusinessConsolidateModal';

// Module 12 Phase 4 — the admin surface for Module 11 Phase 2's business
// duplicate_of_business_id/score/reasons, which until now were purely
// advisory and never surfaced anywhere an admin could act on them. Lists
// only ever contains still-UNCLAIMED businesses (see
// BusinessConsolidationService.listDuplicates — the underlying detector
// only ever compares UNCLAIMED-vs-UNCLAIMED listings), so this never
// touches a real merchant's claimed business.
export default function BusinessDuplicatesPanel() {
  const { showToast } = useToast();
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchDuplicates = useCallback(() => {
    setLoading(true);
    api
      .get('/business/duplicates')
      .then((data) => {
        setDuplicates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load business duplicates:', err);
        showToast('Failed to load business duplicates.', 'error');
        setLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 font-semibold">
          AI-imported businesses flagged as likely duplicates of an existing listing. Review each pair and, if confirmed, consolidate them —
          offers move to the business you keep, and the other is soft-removed (never deleted).
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading business duplicates...</div>
      ) : duplicates.length > 0 ? (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-4">Flagged Business</th>
                <th className="px-4 py-4">Suspected Canonical</th>
                <th className="px-4 py-4">Match</th>
                <th className="px-4 py-4">Reasons</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {duplicates.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-bold text-sm">{d.business_name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {d.city}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-bold text-sm">{d.duplicate_of?.business_name || 'Unknown'}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {d.duplicate_of?.city}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-amber-50 border-amber-200 text-amber-700">
                      {Math.round((d.duplicate_score ?? 0) * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[10px] text-slate-500 font-medium max-w-[220px]">
                    {(d.duplicate_reasons || []).join(' • ') || '—'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setReviewTarget(d.id)}
                      title="Review & consolidate"
                      className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg inline-flex items-center gap-1"
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 border border-slate-200/30 rounded-3xl text-slate-400 font-bold text-sm flex flex-col items-center gap-2">
          <Copy size={20} className="text-slate-300" />
          No flagged duplicate businesses right now.
        </div>
      )}

      {reviewTarget && (
        <BusinessConsolidateModal
          businessId={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onActionComplete={() => {
            setReviewTarget(null);
            fetchDuplicates();
          }}
        />
      )}
    </div>
  );
}
