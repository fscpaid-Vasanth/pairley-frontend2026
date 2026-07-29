import { useEffect, useState } from 'react';
import { X, Check, RotateCcw, FileText, ImageOff, ExternalLink, AlertTriangle, Copy, Save, Loader2 } from 'lucide-react';
import { isValidImageSrc, getDocumentPreviewUrl, getDocumentDownloadUrl } from '../../utils/adminFilePreview';
import { api } from '../../utils/api';
import { confidenceBand, CONFIDENCE_BANDS } from '../../utils/discoverySource';
import {
  buildCandidateOverrides,
  validateCandidateEdits,
  fieldValue,
} from '../../utils/candidateOverrides';
import AiSuggestionsPanel from './AiSuggestionsPanel';

function ConfidenceBadge({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  const band = confidenceBand(score);
  const tone =
    band === 'HIGH'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : band === 'MEDIUM'
        ? 'bg-amber-50 border-amber-200 text-amber-700'
        : 'bg-rose-50 border-rose-200 text-rose-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${tone}`}>
      {pct}% · {CONFIDENCE_BANDS[band].label}
    </span>
  );
}

// Module 14 Phase 1 — every extracted field becomes editable before publish.
// A controlled input whose value falls back to the extracted one until the
// admin actually changes it, so an untouched field sends nothing at all and
// the backend's "omitted means unchanged" contract keeps holding.
function Field({ label, name, value, onChange, type = 'text', textarea, options, hint, span }) {
  const id = `candidate-${name}`;
  const shared =
    'w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#5B12D6]';

  return (
    <div className={span === 2 ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} className={`${shared} resize-y`} />
      ) : options ? (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} className={shared}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(name, type === 'number' ? e.target.value : e.target.value)}
          className={shared}
        />
      )}
      {hint && <p className="text-[9px] font-semibold text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const OFFER_TYPE_OPTIONS = [
  'STANDARD',
  'PERCENTAGE_DISCOUNT',
  'FLAT_DISCOUNT',
  'FLASH_DEAL',
  'BOGO',
  'BOGT',
  'GROUP_DISCOUNT',
  'BULK_PURCHASE',
  'MEMBERSHIP_CAMPAIGN',
  'PACKAGE_DEAL',
].map((value) => ({ value, label: value.replace(/_/g, ' ') }));

const CATEGORY_OPTIONS = [
  'dining',
  'shopping',
  'beauty',
  'fitness',
  'entertainment',
  'travel',
  'services',
  'education',
  'health',
  'automotive',
  'electronics',
  'groceries',
].map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));

// Formats a backend ISO date for a native <input type="date">, which only
// accepts YYYY-MM-DD.
function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function ExtractedRow({ label, value }) {
  return (
    <div className="flex gap-2 text-[10px]">
      <span className="font-bold text-slate-400 w-20 flex-shrink-0">{label}</span>
      <span className={`font-semibold ${value ? 'text-slate-600' : 'text-slate-300 italic'}`}>
        {value || 'not detected'}
      </span>
    </div>
  );
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
//
// Module 11 Phase 4 — the row object passed in as `candidate` comes from
// listCandidates' lean summary, which deliberately omits tags/keywords/
// enrichment_metadata to keep the paginated table light. This modal fetches
// the full getCandidate() detail on open and upgrades to it once loaded
// (`data` below), so the AI Suggestions panel has what it needs without
// bloating every row of every page of the table.
export default function CandidateReviewModal({ candidate, actioning, onClose, onApprove, onReject, onTakedown, onSaved }) {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [detail, setDetail] = useState(null);
  // AI suggestion accept/edit/reject decisions (Module 11 Phase 4) and the
  // admin's own field edits (Module 14 Phase 1) are tracked separately so
  // the suggestions panel keeps owning its own state, then merged at submit.
  const [suggestionOverrides, setSuggestionOverrides] = useState({});
  const [edits, setEdits] = useState({});
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setDetail(null);
    setSuggestionOverrides({});
    setEdits({});
    setSaveError('');
    if (!candidate?.id) return;
    api
      .get(`/discovery/candidates/${candidate.id}`)
      .then((data) => setDetail(data))
      .catch((err) => console.error('Failed to load candidate detail:', err));
  }, [candidate?.id]);

  if (!candidate) return null;
  const data = detail || candidate;

  const isPoster = data.source === 'POSTER';
  const isPdf = data.source === 'PDF';
  const isWebsite = data.source === 'WEBSITE';
  const hasFile = !!data.source_file_url;

  const handleEdit = (name, value) => {
    setEdits((prev) => ({ ...prev, [name]: value }));
    if (saveError) setSaveError('');
  };

  const get = (name, extracted) => fieldValue(edits, name, extracted);

  // Field edits win over an accepted AI suggestion for the same field —
  // an explicit typed value is a later, more deliberate decision than
  // accepting a suggestion earlier in the same session.
  const combinedOverrides = { ...suggestionOverrides, ...buildCandidateOverrides(edits) };
  const hasOverrides = Object.keys(combinedOverrides).length > 0;
  const validationError = validateCandidateEdits(edits, data);
  const blocked = Boolean(validationError) || actioning || savingDraft;
  const rawExtraction = detail?.import_job?.extracted_fields || null;

  const handleSaveDraft = async () => {
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setSavingDraft(true);
    try {
      await api.put(`/discovery/candidates/${data.id}/draft`, {
        overrides: combinedOverrides,
      });
      const refreshed = await api.get(`/discovery/candidates/${data.id}`);
      setDetail(refreshed);
      setEdits({});
      setSaveError('');
      onSaved?.();
    } catch (err) {
      console.error('Failed to save draft:', err);
      setSaveError(err.message || 'Could not save changes.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleApprove = () => {
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    onApprove(data.id, hasOverrides ? combinedOverrides : undefined);
  };

  return (
    <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={onClose}>
      <div
        className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-4xl w-full relative animate-modalSlideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-800">Review Candidate</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">🏪 {data.business_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Original source preview */}
            <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">Original Source</span>
              {isPoster && hasFile && isValidImageSrc(data.source_file_url) && !imageLoadError ? (
                <img
                  src={getDocumentPreviewUrl(data.source_file_url)}
                  alt="Uploaded poster"
                  className="w-full rounded-xl border border-slate-200 object-contain max-h-[320px] bg-white"
                  onError={() => setImageLoadError(true)}
                />
              ) : isPdf && hasFile ? (
                <a
                  href={getDocumentDownloadUrl(data.source_file_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-500 hover:text-[#5B12D6] hover:border-[#5B12D6]/40 transition-colors"
                >
                  <FileText size={28} />
                  <span className="text-xs font-bold flex items-center gap-1">
                    Open PDF <ExternalLink size={11} />
                  </span>
                </a>
              ) : isWebsite && data.source_file_url ? (
                <a
                  href={data.source_file_url}
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

              {/* What the pipeline actually read off the source, before
                  Pairley formatting — the comparison that lets an admin
                  judge an extraction rather than just read its result. */}
              {rawExtraction && (
                <div className="mt-4">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">AI Extracted Content</span>
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-2">
                    <ExtractedRow label="Title" value={rawExtraction.title} />
                    <ExtractedRow label="Description" value={rawExtraction.description} />
                    <ExtractedRow
                      label="Price"
                      value={rawExtraction.price === null || rawExtraction.price === undefined ? null : `₹${rawExtraction.price}`}
                    />
                    {typeof rawExtraction.ocr_confidence === 'number' && (
                      <ExtractedRow label="OCR confidence" value={`${Math.round(rawExtraction.ocr_confidence * 100)}%`} />
                    )}
                    {rawExtraction.rawText && (
                      <details className="mt-1">
                        <summary className="text-[10px] font-bold text-[#5B12D6] cursor-pointer">
                          View raw extracted text
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[10px] font-medium text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
                          {rawExtraction.rawText}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pairley-formatted offer — every field editable before publish */}
            <div className="p-5 md:p-6 flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pairley Offer</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-100 text-[#5B12D6] px-2 py-0.5 rounded-md">
                    {data.source}
                  </span>
                  <ConfidenceBadge score={data.confidence_score} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Offer name" name="title" value={get('title', data.title)} onChange={handleEdit} span={2} />
                <Field
                  label="Description"
                  name="description"
                  textarea
                  value={get('description', data.description)}
                  onChange={handleEdit}
                  span={2}
                />
                <Field label="Subtitle" name="subtitle" value={get('subtitle', detail?.subtitle)} onChange={handleEdit} span={2} />
                <Field label="Category" name="category" options={CATEGORY_OPTIONS} value={get('category', data.category)} onChange={handleEdit} />
                <Field label="Offer type" name="offerType" options={OFFER_TYPE_OPTIONS} value={get('offerType', detail?.offer_type)} onChange={handleEdit} />
                <Field label="Original price (₹)" name="originalPrice" type="number" value={get('originalPrice', data.original_price)} onChange={handleEdit} />
                <Field label="Offer price (₹)" name="offerPrice" type="number" value={get('offerPrice', data.offer_price)} onChange={handleEdit} />
                <Field
                  label="Minimum customers"
                  name="requiredPeople"
                  type="number"
                  value={get('requiredPeople', detail?.required_people)}
                  onChange={handleEdit}
                />
                <div />
                <Field label="Starts" name="startDate" type="date" value={get('startDate', toDateInput(detail?.start_date))} onChange={handleEdit} />
                <Field label="Ends" name="endDate" type="date" value={get('endDate', toDateInput(detail?.end_date))} onChange={handleEdit} />
              </div>

              <div className="pt-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Business</span>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <Field label="Business name" name="businessName" value={get('businessName', detail?.business?.business_name ?? data.business_name)} onChange={handleEdit} span={2} />
                  <Field label="Business category" name="businessCategory" value={get('businessCategory', detail?.business?.category)} onChange={handleEdit} />
                  <Field label="Business type" name="merchantType" value={get('merchantType', detail?.business?.business_type)} onChange={handleEdit} />
                  <Field
                    label="Phone"
                    name="businessMobile"
                    value={get('businessMobile', detail?.business?.mobile)}
                    onChange={handleEdit}
                    hint="Verify before publishing — an extracted number may belong to someone else."
                  />
                  <Field label="Website" name="businessWebsite" value={get('businessWebsite', detail?.business?.website)} onChange={handleEdit} />
                  <Field label="Address" name="businessAddress" value={get('businessAddress', detail?.business?.address)} onChange={handleEdit} span={2} />
                  <Field label="City" name="businessCity" value={get('businessCity', detail?.business?.city)} onChange={handleEdit} />
                  <Field label="State" name="businessState" value={get('businessState', detail?.business?.state)} onChange={handleEdit} />
                  <Field label="Pincode" name="businessPincode" value={get('businessPincode', detail?.business?.pincode)} onChange={handleEdit} />
                  <Field label="GST number" name="businessGstNumber" value={get('businessGstNumber', detail?.business?.gst_number)} onChange={handleEdit} />
                </div>
              </div>
            </div>
          </div>

          {/* Full-width: duplicate warnings, extraction warnings, AI suggestions */}
          <div className="p-5 md:p-6 pt-4 flex flex-col gap-3 border-t border-slate-100">
            <DuplicateBanner candidate={data} />

            {/* Duplicate-specific warnings already have their own banner above with
                more detail — filtered out here to avoid saying the same thing twice. */}
            {genericWarnings(data).length > 0 && (
              <div className="flex items-start gap-1.5 text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                <span>{genericWarnings(data).join(' • ')}</span>
              </div>
            )}

            <AiSuggestionsPanel
              enrichmentStatus={detail?.enrichment_status}
              enrichmentMetadata={detail?.enrichment_metadata}
              onChange={setSuggestionOverrides}
            />
          </div>
        </div>

        <div className="px-5 md:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {(validationError || saveError) && (
            <p className="text-[10px] font-bold text-rose-600 mb-2.5 text-right">{validationError || saveError}</p>
          )}
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {data.review_status !== 'REJECTED' && (
              <button
                disabled={actioning || savingDraft}
                onClick={() => onReject(data.id)}
                className="px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <X size={13} /> Reject
              </button>
            )}
            {data.review_status === 'APPROVED' && (
              <button
                disabled={actioning || savingDraft}
                onClick={() => onTakedown(data.id)}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} /> Take Down
              </button>
            )}
            {/* Save Draft keeps the candidate in the review queue — the
                stopping point for an admin who has corrected some fields
                but isn't ready to publish. */}
            {data.review_status !== 'APPROVED' && (
              <button
                disabled={blocked || !hasOverrides}
                onClick={handleSaveDraft}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingDraft ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {savingDraft ? 'Saving...' : 'Save Draft'}
              </button>
            )}
            {data.review_status !== 'APPROVED' && (
              <button
                disabled={blocked}
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={13} /> Approve &amp; Publish{hasOverrides ? ' (with edits)' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
