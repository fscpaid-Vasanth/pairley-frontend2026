import { useState, useCallback } from 'react';
import {
  ImagePlus,
  FolderOpen,
  FolderArchive,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Eye,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { offerPublisherApi } from '../../utils/offerPublisherApi';
import { getDocumentPreviewUrl } from '../../utils/adminFilePreview';
import Dropzone from '../../components/admin/Dropzone';
import DraftOfferCard from './DraftOfferCard';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const ZIP_ACCEPT = '.zip,application/zip,application/x-zip-compressed';

const WIZARD_STEPS = [
  { n: 1, label: 'Upload Images' },
  { n: 2, label: 'Fill Details' },
  { n: 3, label: 'Approve' },
  { n: 4, label: 'Publish' },
];

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-600 border-rose-200',
  ACTIVE: 'bg-blue-50 text-blue-600 border-blue-200',
};

function StatBadge({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-[#5B12D6]/10 text-[#5B12D6]',
  };
  return (
    <div className={`rounded-2xl px-4 py-3 ${tones[tone]}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-75">{label}</div>
    </div>
  );
}

/** The ①②③④ rail — every step is reachable once at least one draft exists, since this flow has no batch gating (each draft is independent). */
function WizardProgress({ activeStep, hasDrafts, onSelect }) {
  return (
    <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-5">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
        {WIZARD_STEPS.map((step, i) => {
          const reachable = step.n === 1 || hasDrafts;
          const isActive = step.n === activeStep;
          return (
            <div key={step.n} className="flex items-center flex-shrink-0">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onSelect(step.n)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-colors ${
                  isActive
                    ? 'bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                    : reachable
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-extrabold flex-shrink-0 ${
                    isActive
                      ? 'bg-white text-[#5B12D6]'
                      : reachable
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  {step.n}
                </span>
                <span className="text-xs font-extrabold whitespace-nowrap">{step.label}</span>
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <ChevronRight size={14} className="text-slate-300 mx-0.5 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Offer Publisher — the image-first, single-offer admin publishing flow
 * that replaced spreadsheet bulk-import: ① Upload Images (each becomes a
 * draft offer) → ② Fill Details per draft → ③ Approve → ④ Publish.
 *
 * Unlike BulkImportPanel's wizard, there is no batch entity here — every
 * operation is a single synchronous request (one image -> one draft), so
 * the "session" is just the array of draft ids this panel created, held in
 * plain React state.
 */
export default function OfferPublisherPanel() {
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState([]); // full detail objects, keyed by array order
  const [activeStep, setActiveStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const hasDrafts = drafts.length > 0;

  const refreshDraft = useCallback((id) => {
    offerPublisherApi.getDraft(id).then((updated) => {
      setDrafts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    });
  }, []);

  const rejectImages = (files) =>
    showToast(
      files.length === 1
        ? `"${files[0].name}" isn't a supported image. Use JPG, JPEG, PNG or WEBP.`
        : `${files.length} file(s) skipped — only JPG, JPEG, PNG and WEBP are supported.`,
      'error',
    );
  const rejectZip = (files) => showToast(`"${files[0].name}" isn't a ZIP archive.`, 'error');

  const handleUploadResult = (result) => {
    setDrafts((prev) => [...prev, ...result.drafts.map((d) => placeholderToDetail(d))]);
    if (result.failed.length > 0) {
      showToast(
        `${result.drafts.length} draft(s) created — ${result.failed.length} image(s) failed: ${result.failed
          .map((f) => f.fileName)
          .join(', ')}`,
        result.drafts.length > 0 ? 'info' : 'error',
      );
    } else {
      showToast(`${result.drafts.length} draft offer(s) created from your images.`, 'success');
    }
    // Fetch the real detail for each new draft (placeholderToDetail is just
    // enough shape to render immediately; this fills in the rest).
    result.drafts.forEach((d) => refreshDraft(d.offerId));
    if (result.drafts.length > 0) setActiveStep(2);
  };

  const handleImageFiles = (files) => {
    if (!files?.length) return;
    setUploading(true);
    offerPublisherApi
      .createDraftsFromFiles(files)
      .then(handleUploadResult)
      .catch((err) => showToast(err.message || 'Upload failed.', 'error'))
      .finally(() => setUploading(false));
  };

  const handleImageZip = (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    offerPublisherApi
      .createDraftsFromZip(file)
      .then(handleUploadResult)
      .catch((err) => showToast(err.message || 'ZIP upload failed.', 'error'))
      .finally(() => setUploading(false));
  };

  const handleDraftUpdated = (updated) => {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleDeleteDraft = (id) => {
    offerPublisherApi
      .deleteDraft(id)
      .then(() => {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        showToast('Draft removed.', 'info');
      })
      .catch((err) => showToast(err.message || 'Failed to delete draft.', 'error'));
  };

  const handleApprove = (id) => {
    offerPublisherApi
      .approve(id)
      .then((updated) => {
        handleDraftUpdated(updated);
        showToast('Approved — ready to publish.', 'success');
      })
      .catch((err) => showToast(err.message || 'Failed to approve.', 'error'));
  };

  const handleReject = (id, reason) => {
    offerPublisherApi
      .reject(id, reason)
      .then((updated) => {
        handleDraftUpdated(updated);
        showToast('Rejected.', 'info');
      })
      .catch((err) => showToast(err.message || 'Failed to reject.', 'error'));
  };

  const handlePublish = (id) => {
    offerPublisherApi
      .publish(id)
      .then((updated) => {
        handleDraftUpdated(updated);
        showToast('Published to Pairley.', 'success');
      })
      .catch((err) => showToast(err.message || 'Failed to publish.', 'error'));
  };

  const approvedCount = drafts.filter((d) => d.status === 'APPROVED').length;
  const draftCount = drafts.filter((d) => d.status === 'DRAFT').length;
  const rejectedCount = drafts.filter((d) => d.status === 'REJECTED').length;
  const publishedCount = drafts.filter((d) => d.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <WizardProgress activeStep={activeStep} hasDrafts={hasDrafts} onSelect={setActiveStep} />

      {/* ---------------- STEP 1 — Upload Images ---------------- */}
      {activeStep === 1 && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-[#5B12D6]" /> Step 1 — Upload Images
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Every image you upload becomes its own draft offer — fill in the details next. Accepted: JPG · JPEG ·
              PNG · WEBP — as individual files, a folder, or a ZIP.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Dropzone
              icon={ImagePlus}
              title={uploading ? 'Uploading…' : 'Drop images here'}
              subtitle="Select multiple JPG / JPEG / PNG / WEBP"
              accept={IMAGE_ACCEPT}
              multiple
              onFiles={handleImageFiles}
              onReject={rejectImages}
              disabled={uploading}
            />
            <Dropzone
              icon={FolderOpen}
              title="Upload a folder"
              subtitle="Every image inside, in one go"
              accept={IMAGE_ACCEPT}
              multiple
              directory
              onFiles={handleImageFiles}
              onReject={rejectImages}
              disabled={uploading}
            />
            <Dropzone
              icon={FolderArchive}
              title="Drop a ZIP of images"
              subtitle="Streamed, so a large archive is fine"
              accept={ZIP_ACCEPT}
              onFiles={handleImageZip}
              onReject={rejectZip}
              disabled={uploading}
            />
          </div>

          {hasDrafts && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <span className="text-sm font-extrabold">
                  {drafts.length} draft offer{drafts.length === 1 ? '' : 's'} ready
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-700/80">
                Nothing is live yet — fill in merchant and offer details next, then approve and publish.
              </p>
              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors"
              >
                Continue to Step 2 <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STEP 2 — Fill Details ---------------- */}
      {activeStep === 2 && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <ImagePlus size={16} className="text-[#5B12D6]" /> Step 2 — Fill Details
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              One card per uploaded image. Save each draft once its details are filled in — you can come back and
              edit any of them later.
            </p>
          </div>

          {drafts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">
              No drafts yet — go to Step 1 and upload some images.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {drafts.map((draft) => (
                <DraftOfferCard
                  key={draft.id}
                  draft={draft}
                  onUpdated={handleDraftUpdated}
                  onDelete={() => handleDeleteDraft(draft.id)}
                />
              ))}
            </div>
          )}

          {hasDrafts && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#5B12D6] text-white text-xs font-extrabold shadow-md shadow-[#5B12D6]/20 hover:bg-[#4a0fb0] transition-colors"
              >
                Continue to Approve <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STEP 3 — Approve ---------------- */}
      {activeStep === 3 && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <Eye size={16} className="text-[#5B12D6]" /> Step 3 — Approve
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Review each draft before it can publish. Approving checks that every required field is filled in —
              editing an approved draft sends it back to Draft for re-review.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBadge label="Draft" value={draftCount} tone="slate" />
            <StatBadge label="Approved" value={approvedCount} tone="emerald" />
            <StatBadge label="Rejected" value={rejectedCount} tone="rose" />
            <StatBadge label="Published" value={publishedCount} tone="purple" />
          </div>

          {drafts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">No drafts to review yet.</div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <ApprovalRow
                  key={draft.id}
                  draft={draft}
                  onApprove={() => handleApprove(draft.id)}
                  onReject={(reason) => handleReject(draft.id, reason)}
                />
              ))}
            </div>
          )}

          {approvedCount > 0 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#5B12D6] text-white text-xs font-extrabold shadow-md shadow-[#5B12D6]/20 hover:bg-[#4a0fb0] transition-colors"
              >
                Continue to Publish <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STEP 4 — Publish ---------------- */}
      {activeStep === 4 && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <Rocket size={16} className="text-[#5B12D6]" /> Step 4 — Publish
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Only Approved drafts can publish. This makes an offer visible to customers immediately.
            </p>
          </div>

          {approvedCount === 0 && publishedCount === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">
              Nothing is Approved yet — go to Step 3 and approve a draft first.
            </div>
          ) : (
            <div className="space-y-3">
              {drafts
                .filter((d) => d.status === 'APPROVED' || d.status === 'ACTIVE')
                .map((draft) => (
                  <PublishRow key={draft.id} draft={draft} onPublish={() => handlePublish(draft.id)} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Enough shape to render a fresh card immediately, before refreshDraft() fills in the rest from the server. */
function placeholderToDetail(d) {
  return {
    id: d.offerId,
    status: 'DRAFT',
    title: 'Untitled offer',
    description: '',
    category: '',
    originalPrice: 0,
    offerPrice: 0,
    minParticipants: 1,
    startDate: null,
    endDate: null,
    terms: '',
    rejectionReason: null,
    coverImage: null,
    galleryImages: [],
    merchant: {
      businessId: d.businessId,
      merchantName: 'Untitled Merchant',
      mobile: '',
      whatsapp: '',
      email: '',
      city: '',
      area: '',
      address: '',
      state: '',
      pincode: '',
      googleMapsLink: '',
    },
  };
}

function ApprovalRow({ draft, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
          {draft.coverImage && (
            <img src={getDocumentPreviewUrl(draft.coverImage)} alt={draft.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-extrabold text-slate-800 truncate">{draft.title}</div>
          <div className="text-[10px] text-slate-400 font-semibold truncate">{draft.merchant.merchantName}</div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[draft.status] || STATUS_STYLES.DRAFT}`}
        >
          {draft.status}
        </span>
        {draft.status === 'DRAFT' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[10px] font-extrabold hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 size={12} /> Approve
            </button>
            <button
              onClick={() => setRejecting((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-[10px] font-extrabold hover:bg-rose-50 transition-colors"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        )}
      </div>
      {draft.status === 'REJECTED' && draft.rejectionReason && (
        <div className="mt-2 text-[10px] text-rose-500 font-semibold">Reason: {draft.rejectionReason}</div>
      )}
      {rejecting && (
        <div className="mt-3 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="flex-1 text-xs rounded-xl border border-slate-200 px-3 py-2"
          />
          <button
            onClick={() => { onReject(reason); setRejecting(false); setReason(''); }}
            className="px-3 py-2 rounded-xl bg-rose-600 text-white text-[10px] font-extrabold"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

function PublishRow({ draft, onPublish }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
        {draft.coverImage && (
          <img src={getDocumentPreviewUrl(draft.coverImage)} alt={draft.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-extrabold text-slate-800 truncate">{draft.title}</div>
        <div className="text-[10px] text-slate-400 font-semibold truncate">{draft.merchant.merchantName}</div>
      </div>
      {draft.status === 'ACTIVE' ? (
        <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wide">
          <CheckCircle2 size={12} /> Live on Pairley
        </span>
      ) : (
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B12D6] to-[#7C3AED] text-white text-[10px] font-extrabold hover:opacity-90 transition-opacity"
        >
          <Rocket size={12} /> Publish
        </button>
      )}
    </div>
  );
}
