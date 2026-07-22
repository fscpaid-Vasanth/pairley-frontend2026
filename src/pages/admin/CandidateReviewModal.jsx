import { useEffect, useState } from 'react';
import { X, Check, RotateCcw, IndianRupee, FileText, ImageOff, ExternalLink, AlertTriangle, Copy } from 'lucide-react';
import { isValidImageSrc, getDocumentPreviewUrl, getDocumentDownloadUrl } from '../../utils/adminFilePreview';
import { formatPrice } from '../../utils/constants';
import { api } from '../../utils/api';

function ConfidenceBadge({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  const tone =
    pct >= 70 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : pct >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700';
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${tone}`}>{pct}% confidence</span>;
}

const DUPLICATE_WARNING_TEXT = new Set([
  'Possible duplicate offer detected — please verify',
  'Possible duplicate business detected — please verify',
]);

function genericWarnings(candidate) {
  return (candidate.warnings || []).filter((w) => !DUPLICATE_WARNING_TEXT.has(w));
}

// Module 11 Phase 2 — duplicate detection is a recommendation only (never
// auto-merged/rejected); this banner is where the admin actually sees it.
// Lazily fetches the suspected-original OFFER's title/business via the
// existing candidate-detail endpoint (no new backend surface needed) — kept
// out of the list endpoint entirely so listCandidates stays free of N+1s.
// No such lookup exists for the business-level flag (no admin
// single-business-by-id endpoint today), so that one shows score/reasons
// only, without a cross-link.
function DuplicateBanner({ candidate }) {
  const [originalOffer, setOriginalOffer] = useState(null);

  useEffect(() => {
    setOriginalOffer(null);
    if (!candidate.duplicate_of_offer_id) return;
    api
      .get(`/discovery/candidates/${candidate.duplicate_of_offer_id}`)
      .then((data) => setOriginalOffer(data))
      .catch(() => setOriginalOffer(null));
  }, [candidate.duplicate_of_offer_id]);

  if (!candidate.duplicate_of_offer_id && !candidate.business_duplicate_of_id) return null;

  return (
    <div className="flex flex-col gap-2 text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
      {candidate.duplicate_of_offer_id && (
        <div className="flex items-start gap-1.5">
          <Copy size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Possible duplicate offer ({Math.round((candidate.duplicate_score ?? 0) * 100)}% match)
            {originalOffer ? <> — likely the same as <strong>"{originalOffer.title}"</strong> ({originalOffer.business_name})</> : null}
            {candidate.duplicate_reasons?.length > 0 && <span className="block font-normal text-amber-600 mt-0.5">{candidate.duplicate_reasons.join(' • ')}</span>}
          </span>
        </div>
      )}
      {candidate.business_duplicate_of_id && (
        <div className="flex items-start gap-1.5">
          <Copy size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Possible duplicate business ({Math.round((candidate.business_duplicate_score ?? 0) * 100)}% match)
            {candidate.business_duplicate_reasons?.length > 0 && <span className="block font-normal text-amber-600 mt-0.5">{candidate.business_duplicate_reasons.join(' • ')}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

// Module 10 Phase 3 — the "compare original vs. extracted" surface required
// before an admin approves a poster/PDF/website-derived candidate. Preview
// rendering is source-aware: POSTER gets an inline image, PDF gets an
// open-in-new-tab link (browsers render PDFs natively), WEBSITE gets a link
// back to the source page — none of these are re-implemented here, they
// reuse the exact document-preview proxy already used for KYC docs.
export default function CandidateReviewModal({ candidate, actioning, onClose, onApprove, onReject, onTakedown }) {
  const [imageLoadError, setImageLoadError] = useState(false);
  if (!candidate) return null;

  const isPoster = candidate.source === 'POSTER';
  const isPdf = candidate.source === 'PDF';
  const isWebsite = candidate.source === 'WEBSITE';
  const hasFile = !!candidate.source_file_url;

  return (
    <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={onClose}>
      <div
        className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-3xl w-full relative animate-modalSlideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-800">Review Candidate</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">🏪 {candidate.business_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-0 max-h-[65vh] overflow-y-auto">
          {/* Original source preview */}
          <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">Original Source</span>
            {isPoster && hasFile && isValidImageSrc(candidate.source_file_url) && !imageLoadError ? (
              <img
                src={getDocumentPreviewUrl(candidate.source_file_url)}
                alt="Uploaded poster"
                className="w-full rounded-xl border border-slate-200 object-contain max-h-[320px] bg-white"
                onError={() => setImageLoadError(true)}
              />
            ) : isPdf && hasFile ? (
              <a
                href={getDocumentDownloadUrl(candidate.source_file_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-500 hover:text-[#5B12D6] hover:border-[#5B12D6]/40 transition-colors"
              >
                <FileText size={28} />
                <span className="text-xs font-bold flex items-center gap-1">
                  Open PDF <ExternalLink size={11} />
                </span>
              </a>
            ) : isWebsite && candidate.source_file_url ? (
              <a
                href={candidate.source_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-500 hover:text-[#5B12D6] hover:border-[#5B12D6]/40 transition-colors"
              >
                <ExternalLink size={24} />
                <span className="text-xs font-bold">Open source page</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-12 text-slate-300">
                <ImageOff size={24} />
                <span className="text-[10px] font-bold">Preview unavailable</span>
              </div>
            )}
          </div>

          {/* Extracted fields */}
          <div className="p-5 md:p-6 flex flex-col gap-3.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Extracted Data</span>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-[#5B12D6] px-2 py-0.5 rounded-md">
                {candidate.source}
              </span>
              <ConfidenceBadge score={candidate.confidence_score} />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400">Title</span>
              <p className="text-sm font-bold text-slate-800">{candidate.title || '—'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400">Description</span>
              <p className="text-xs font-medium text-slate-600 line-clamp-4">{candidate.description || '—'}</p>
            </div>

            <div className="flex gap-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400">Offer Price</span>
                <p className="flex items-center gap-0.5 text-sm font-bold text-slate-800">
                  <IndianRupee size={12} />
                  {candidate.offer_price ? formatPrice(candidate.offer_price).replace('₹', '') : '0'}
                </p>
              </div>
              {candidate.original_price ? (
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Original Price</span>
                  <p className="flex items-center gap-0.5 text-sm font-bold text-slate-400 line-through">
                    <IndianRupee size={12} />
                    {formatPrice(candidate.original_price).replace('₹', '')}
                  </p>
                </div>
              ) : null}
            </div>

            <DuplicateBanner candidate={candidate} />

            {/* Duplicate-specific warnings already have their own banner above with
                more detail — filtered out here to avoid saying the same thing twice. */}
            {genericWarnings(candidate).length > 0 && (
              <div className="flex items-start gap-1.5 text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                <span>{genericWarnings(candidate).join(' • ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 md:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {candidate.review_status !== 'REJECTED' && (
            <button
              disabled={actioning}
              onClick={() => onReject(candidate.id)}
              className="px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <X size={13} /> Reject
            </button>
          )}
          {candidate.review_status === 'APPROVED' && (
            <button
              disabled={actioning}
              onClick={() => onTakedown(candidate.id)}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw size={13} /> Take Down
            </button>
          )}
          {candidate.review_status !== 'APPROVED' && (
            <button
              disabled={actioning}
              onClick={() => onApprove(candidate.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check size={13} /> Approve &amp; Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
