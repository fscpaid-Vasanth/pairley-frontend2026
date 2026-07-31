import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  FileSpreadsheet,
  ImagePlus,
  FolderArchive,
  FolderOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Clock,
  History,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  Rocket,
  ImageOff,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { bulkImportApi, downloadErrorReport, matchesAccept } from '../../utils/bulkImportApi';
import { getDocumentPreviewUrl } from '../../utils/adminFilePreview';

const POLL_INTERVAL_MS = 2000;
const ACTIVE_STATUSES = ['CREATING', 'PUBLISHING'];

// Accepted image formats, per the Bulk Image Upload spec. Extensions are
// listed alongside MIME types because a folder/drag-drop selection often
// arrives with an empty `type`, and a ZIP entry never has one at all.
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const ZIP_ACCEPT = '.zip,application/zip,application/x-zip-compressed';

const STATUS_LABELS = {
  QUEUED: 'Queued',
  VALIDATING: 'Validating',
  VALIDATED: 'Validated — ready to create offers',
  CREATING: 'Creating offer drafts…',
  CREATED: 'Offers created — ready for images & publish',
  PUBLISHING: 'Publishing…',
  COMPLETED: 'Published',
  FAILED: 'Failed',
};

const STATUS_STYLES = {
  QUEUED: 'bg-slate-100 text-slate-600 border-slate-200',
  VALIDATING: 'bg-amber-50 text-amber-600 border-amber-200',
  VALIDATED: 'bg-blue-50 text-blue-600 border-blue-200',
  CREATING: 'bg-amber-50 text-amber-600 border-amber-200',
  CREATED: 'bg-blue-50 text-blue-600 border-blue-200',
  PUBLISHING: 'bg-amber-50 text-amber-600 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-600 border-rose-200',
};

const WIZARD_STEPS = [
  { n: 1, label: 'Upload Spreadsheet' },
  { n: 2, label: 'Upload Images' },
  { n: 3, label: 'Preview Offers' },
  { n: 4, label: 'Publish' },
];

/** Formats the bare integer offer_code the way it appears on image filenames. */
const formatOfferCode = (code) => `OFF${String(code).padStart(6, '0')}`;

/**
 * How far into the wizard this batch is allowed to go. Derived from batch
 * status rather than tracked separately, so a reload or a second admin
 * opening the same batch lands on the same place.
 *
 * Drafts must exist before images can map to anything (they map by
 * offer_code, which is assigned at creation), which is why everything past
 * step 1 is gated on CREATED and later.
 */
function maxReachableStep(batch) {
  if (!batch) return 1;
  if (['CREATED', 'PUBLISHING', 'COMPLETED'].includes(batch.status)) return 4;
  return 1;
}

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

function Dropzone({
  icon: Icon,
  title,
  subtitle,
  onFiles,
  onReject,
  multiple,
  directory,
  disabled,
  accept,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // `accept` only filters the OS browse dialog — a drag-and-dropped file
  // ignores it completely. Without this, dropping (say) a PNG on the
  // CSV/XLSX zone uploaded it just to have the server reject it, which read
  // as a server fault rather than the wrong file.
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const allowed = files.filter((f) => matchesAccept(f, accept));
    const rejected = files.filter((f) => !matchesAccept(f, accept));
    if (rejected.length > 0) {
      onReject?.(rejected);
      if (allowed.length === 0) return;
    }
    onFiles(allowed);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
          : dragging
            ? 'border-[#5B12D6] bg-[#5B12D6]/5'
            : 'border-slate-300 bg-white/60 hover:border-[#5B12D6]/50'
      }`}
    >
      <Icon size={26} className="text-[#5B12D6]" />
      <div className="text-sm font-bold text-slate-700">{title}</div>
      <div className="text-xs text-slate-400 font-medium">{subtitle}</div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        // `directory` is deliberately separate from `multiple`: setting
        // webkitdirectory makes Chromium offer ONLY a folder picker, so
        // tying the two together made it impossible to pick individual
        // image files. Folder upload is now its own zone.
        {...(directory ? { webkitdirectory: '', directory: '' } : {})}
        className="hidden"
        disabled={disabled}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

/** The ①②③④ rail. Completed steps are clickable so an admin can go back. */
function WizardProgress({ activeStep, maxStep, batchStatus, onSelect }) {
  return (
    <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-5">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
        {WIZARD_STEPS.map((step, i) => {
          const reachable = step.n <= maxStep;
          const isActive = step.n === activeStep;
          const isDone =
            step.n < activeStep ||
            (step.n === 4 && batchStatus === 'COMPLETED');
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
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : reachable
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  {isDone && !isActive ? <CheckCircle2 size={14} /> : step.n}
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
 * One offer as it will appear to customers: hero, then gallery.
 *
 * Images go through getDocumentPreviewUrl, not straight from the stored URL:
 * bulk-uploaded images land in the same private S3 bucket as every other
 * upload, so a direct s3.amazonaws.com src 403s in the browser and renders
 * as a broken image. The proxy fetches it server-side with AWS credentials —
 * the same path KYC docs and claim evidence already use.
 */
/** A gallery thumb that shows a neutral tile instead of a broken-image icon. */
function GalleryThumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        title="Mapped — preview unavailable"
        className="w-10 h-10 rounded-lg border border-amber-200 bg-amber-50 grid place-items-center flex-shrink-0"
      >
        <ImageOff size={12} className="text-amber-400" />
      </div>
    );
  }
  return (
    <img
      src={getDocumentPreviewUrl(src)}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
    />
  );
}

function OfferPreviewCard({ offer }) {
  // A hero that is stored but won't render is a different situation from no
  // hero at all, and the admin needs to tell them apart: the first means the
  // mapping worked and something downstream is wrong (today, the AWS
  // GetObject quarantine), the second means a filename never matched.
  const [heroFailed, setHeroFailed] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
      <div className="relative aspect-[16/10] bg-slate-100">
        {offer.cover_image && !heroFailed ? (
          <img
            src={getDocumentPreviewUrl(offer.cover_image)}
            alt={offer.title}
            loading="lazy"
            onError={() => setHeroFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-1 px-2 text-center ${
              heroFailed ? 'text-amber-500' : 'text-slate-300'
            }`}
          >
            <ImageOff size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">
              {heroFailed ? 'Mapped — preview unavailable' : 'No hero image'}
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-extrabold tracking-wide">
          {formatOfferCode(offer.offer_code)}
        </span>
      </div>
      <div className="p-3">
        <div className="text-xs font-extrabold text-slate-800 line-clamp-2">{offer.title}</div>
        {offer.merchant && (
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{offer.merchant}</div>
        )}
        {offer.gallery_images.length > 0 && (
          <div className="flex gap-1.5 mt-2 overflow-x-auto">
            {offer.gallery_images.map((src, i) => (
              <GalleryThumb key={src} src={src} alt={`${offer.title} gallery ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bulk Offer Import admin UI — the Diwali-launch replacement for AI Offer
 * Discovery, presented as a 4-step wizard so an onboarding executive always
 * knows what the next action is.
 *
 * The two-stage backend design (see bulk-import.service.ts) is what the
 * steps mirror: the spreadsheet creates DRAFT offers and assigns each an
 * offer_code, then images are matched to those offers by that code, and only
 * an explicit Publish makes anything live.
 */
export default function BulkImportPanel() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [batch, setBatch] = useState(null);
  const [preview, setPreview] = useState(null);
  const [batchOffers, setBatchOffers] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const maxStep = useMemo(() => maxReachableStep(batch), [batch]);

  const fetchHistory = useCallback(() => {
    setLoadingHistory(true);
    bulkImportApi
      .listHistory()
      .then(setHistory)
      .catch(() => showToast('Failed to load import history.', 'error'))
      .finally(() => setLoadingHistory(false));
  }, [showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const refreshOffers = useCallback((id) => {
    if (!id) return Promise.resolve(null);
    return bulkImportApi
      .getBatchOffers(id)
      .then((data) => { setBatchOffers(data); return data; })
      .catch(() => null);
  }, []);

  const openBatch = useCallback(
    (id, step) => {
      setActiveBatchId(id);
      setBatch(null);
      setPreview(null);
      setBatchOffers(null);
      Promise.all([bulkImportApi.getBatch(id), bulkImportApi.getPreview(id)])
        .then(([b, p]) => {
          setBatch(b);
          setPreview(p);
          // Land on the step this batch is actually at, so reopening a
          // half-finished import resumes rather than restarting.
          setActiveStep(step ?? (maxReachableStep(b) === 4 ? 2 : 1));
          if (maxReachableStep(b) === 4) refreshOffers(id);
        })
        .catch(() => showToast('Failed to load this import.', 'error'));
    },
    [showToast, refreshOffers],
  );

  // Poll while the scheduler is actively working through this batch in the
  // background — see bulk-import.scheduler.ts. Stops the moment status
  // leaves CREATING/PUBLISHING.
  useEffect(() => {
    if (!activeBatchId || !batch || !ACTIVE_STATUSES.includes(batch.status)) return undefined;
    const interval = setInterval(() => {
      bulkImportApi
        .getBatch(activeBatchId)
        .then((b) => {
          const wasCreating = batch.status === 'CREATING';
          setBatch(b);
          if (!ACTIVE_STATUSES.includes(b.status)) {
            fetchHistory();
            bulkImportApi.getPreview(activeBatchId).then(setPreview).catch(() => {});
            refreshOffers(activeBatchId);
            // Drafts just finished — Step 2 is now genuinely available, so
            // advance rather than leaving the admin on a finished step.
            if (wasCreating && b.status === 'CREATED') setActiveStep(2);
          }
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeBatchId, batch, fetchHistory, refreshOffers]);

  const rejectSheet = (files) =>
    showToast(
      `"${files[0].name}" isn't a spreadsheet. Step 1 takes the offer details as CSV or XLSX — offer images belong in Step 2.`,
      'error',
    );
  const rejectImages = (files) =>
    showToast(
      files.length === 1
        ? `"${files[0].name}" isn't a supported image. Use JPG, JPEG, PNG or WEBP.`
        : `${files.length} file(s) skipped — only JPG, JPEG, PNG and WEBP are supported.`,
      'error',
    );
  const rejectZip = (files) =>
    showToast(`"${files[0].name}" isn't a ZIP archive.`, 'error');

  const handleSheetFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    bulkImportApi
      .uploadSheet(file)
      .then((newBatch) => {
        showToast(
          newBatch.status === 'FAILED'
            ? newBatch.error || 'Import failed.'
            : `Validated: ${newBatch.valid_rows} valid, ${newBatch.invalid_rows} invalid, ${newBatch.duplicate_rows} duplicate of ${newBatch.total_rows} rows.`,
          newBatch.status === 'FAILED' ? 'error' : 'success',
        );
        fetchHistory();
        openBatch(newBatch.id, 1);
      })
      .catch((err) => showToast(err.message || 'Upload failed.', 'error'))
      .finally(() => setUploading(false));
  };

  const handleCreateDrafts = () => {
    bulkImportApi
      .createDrafts(activeBatchId)
      .then((b) => {
        setBatch(b);
        showToast('Creating offer drafts in the background…', 'info');
      })
      .catch((err) => showToast(err.message || 'Failed to start.', 'error'));
  };

  const handlePublish = () => {
    bulkImportApi
      .publish(activeBatchId)
      .then((b) => {
        setBatch(b);
        showToast('Publishing offers in the background…', 'info');
      })
      .catch((err) => showToast(err.message || 'Failed to start.', 'error'));
  };

  const handleImageFiles = (files) => {
    if (!files?.length) return;
    setImageUploading(true);
    bulkImportApi
      .uploadImageFiles(activeBatchId, files)
      .then((b) => {
        setBatch(b);
        refreshOffers(activeBatchId);
        showToast(`Images processed — ${b.mapped_images} mapped, ${b.failed_images} unmatched.`, 'success');
      })
      .catch((err) => showToast(err.message || 'Image upload failed.', 'error'))
      .finally(() => setImageUploading(false));
  };

  const handleImageZip = (files) => {
    const file = files?.[0];
    if (!file) return;
    setImageUploading(true);
    bulkImportApi
      .uploadImageZip(activeBatchId, file)
      .then((b) => {
        setBatch(b);
        refreshOffers(activeBatchId);
        showToast(`ZIP processed — ${b.mapped_images} mapped, ${b.failed_images} unmatched.`, 'success');
      })
      .catch((err) => showToast(err.message || 'ZIP upload failed.', 'error'))
      .finally(() => setImageUploading(false));
  };

  const handleDownloadErrors = () => {
    bulkImportApi
      .getErrorRows(activeBatchId)
      .then((rows) => {
        if (rows.length === 0) {
          showToast('No error rows to download.', 'info');
          return;
        }
        downloadErrorReport(rows, `bulk-import-errors-${activeBatchId}.csv`);
      })
      .catch(() => showToast('Failed to build the error report.', 'error'));
  };

  const stats = batchOffers?.imageStats;
  const offers = batchOffers?.offers ?? [];

  const stepNav = (back, next, nextLabel) => (
    <div className="flex items-center justify-between gap-3 pt-2">
      {back ? (
        <button
          onClick={() => setActiveStep(back)}
          className="flex items-center gap-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-extrabold hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={14} /> Back
        </button>
      ) : <span />}
      {next && (
        <button
          onClick={() => setActiveStep(next)}
          className="flex items-center gap-1 px-5 py-2.5 rounded-2xl bg-[#5B12D6] text-white text-xs font-extrabold shadow-md shadow-[#5B12D6]/20 hover:bg-[#4a0fb0] transition-colors"
        >
          {nextLabel} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <WizardProgress
        activeStep={activeStep}
        maxStep={maxStep}
        batchStatus={batch?.status}
        onSelect={setActiveStep}
      />

      {/* ---------------- STEP 1 — Spreadsheet ---------------- */}
      {activeStep === 1 && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-[#5B12D6]" /> Step 1 — Upload Spreadsheet
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              The offer <strong className="text-slate-500">details</strong> only — merchant, title, prices, dates — as
              CSV or XLSX. Every row is validated before anything is created.{' '}
              <strong className="text-slate-500">Images are uploaded in Step 2</strong>, once each offer has a code to
              match them against.
            </p>
          </div>

          <Dropzone
            icon={FileSpreadsheet}
            title={uploading ? 'Uploading…' : 'Drop a CSV/XLSX file here, or click to browse'}
            subtitle="Spreadsheet only — not images. Up to 10,000 offers per file."
            accept=".csv,.xlsx"
            onFiles={handleSheetFiles}
            onReject={rejectSheet}
            disabled={uploading}
          />

          {batch && batch.status === 'FAILED' && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs font-semibold">
              <XCircle size={16} /> {batch.error}
            </div>
          )}

          {preview && batch && batch.status !== 'FAILED' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <StatBadge label="Total Offers" value={preview.totalOffers} tone="slate" />
                <StatBadge label="Valid" value={preview.validOffers} tone="emerald" />
                <StatBadge label="Invalid" value={preview.invalidOffers} tone="rose" />
                <StatBadge label="Duplicate" value={preview.duplicateOffers} tone="rose" />
                <StatBadge label="Merchants" value={preview.distinctMerchants} tone="purple" />
              </div>

              {preview.rowsWithWarnings > 0 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs font-semibold">
                  <AlertTriangle size={16} />
                  {preview.rowsWithWarnings} row(s) have warnings (e.g. an unusually steep discount) — still valid, worth a look.
                </div>
              )}
              {(preview.invalidOffers > 0 || preview.duplicateOffers > 0) && (
                <button
                  onClick={handleDownloadErrors}
                  className="flex items-center gap-2 text-xs font-bold text-[#5B12D6] hover:underline"
                >
                  <Download size={14} /> Download error report (CSV)
                </button>
              )}

              {batch.status === 'VALIDATED' && (
                <button
                  onClick={handleCreateDrafts}
                  disabled={preview.validOffers === 0}
                  className="w-full py-3 rounded-2xl bg-[#5B12D6] text-white text-sm font-extrabold shadow-md shadow-[#5B12D6]/20 hover:bg-[#4a0fb0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create {preview.validOffers} Offer Draft{preview.validOffers === 1 ? '' : 's'}
                </button>
              )}

              {batch.status === 'CREATING' && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <Clock size={16} className="text-amber-500 animate-pulse" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-amber-700">
                      Creating offers — {batch.created_rows} / {batch.valid_rows}
                    </div>
                    <div className="h-1.5 bg-amber-100 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (batch.created_rows / Math.max(1, batch.valid_rows)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 complete — the hand-off the spec asks for. */}
              {maxStep === 4 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-extrabold">Step 1 Completed</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700/80">
                    Imported {batch.created_rows} offer{batch.created_rows === 1 ? '' : 's'} as drafts, each with an
                    offer code. Nothing is live yet — add images next, then publish.
                  </p>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors"
                  >
                    Continue to Step 2 <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------------- STEP 2 — Images ---------------- */}
      {activeStep === 2 && batch && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <ImagePlus size={16} className="text-[#5B12D6]" /> Step 2 — Bulk Image Upload
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Images map to offers automatically by the code in the filename —{' '}
              <code className="bg-slate-100 px-1 rounded">{formatOfferCode(1)}.jpg</code> becomes the hero image,{' '}
              <code className="bg-slate-100 px-1 rounded">{formatOfferCode(1)}_1.jpg</code> and{' '}
              <code className="bg-slate-100 px-1 rounded">{formatOfferCode(1)}_2.jpg</code> become gallery images. No
              image is required — an offer without one shows a placeholder.
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1.5">
              Accepted: JPG · JPEG · PNG · WEBP — as individual files, a folder, or a ZIP.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Dropzone
              icon={ImagePlus}
              title={imageUploading ? 'Uploading…' : 'Drop images here'}
              subtitle="Select multiple JPG / JPEG / PNG / WEBP"
              accept={IMAGE_ACCEPT}
              multiple
              onFiles={handleImageFiles}
              onReject={rejectImages}
              disabled={imageUploading}
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
              disabled={imageUploading}
            />
            <Dropzone
              icon={FolderArchive}
              title="Drop a ZIP of images"
              subtitle="Streamed, so a large archive is fine"
              accept={ZIP_ACCEPT}
              onFiles={handleImageZip}
              onReject={rejectZip}
              disabled={imageUploading}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatBadge label="Images Uploaded" value={stats?.uploaded ?? 0} tone="slate" />
            <StatBadge label="Images Matched" value={stats?.matched ?? 0} tone="emerald" />
            <StatBadge label="Offers Without Images" value={batchOffers?.offersWithoutImages ?? 0} tone="amber" />
            <StatBadge label="No Matching Offer" value={stats?.missingOffer ?? 0} tone="rose" />
            <StatBadge label="Duplicate Images" value={stats?.duplicate ?? 0} tone="rose" />
            <StatBadge label="Invalid / Failed" value={(stats?.invalidFile ?? 0) + (stats?.failed ?? 0)} tone="rose" />
          </div>

          {stats?.missingOffer > 0 && (
            <div className="flex items-start gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs font-semibold">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                {stats.missingOffer} image(s) carry a code with no matching offer in this import. Check the filenames
                against the offer codes below — only codes created by this batch can match.
              </span>
            </div>
          )}

          {stepNav(1, 3, 'Continue to Preview')}
        </div>
      )}

      {/* ---------------- STEP 3 — Preview ---------------- */}
      {activeStep === 3 && batch && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <Eye size={16} className="text-[#5B12D6]" /> Step 3 — Preview Offers
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Exactly what customers will see once published — hero image, then gallery. Still nothing live.
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1.5">
              A card reading &ldquo;Mapped — preview unavailable&rdquo; means the image uploaded and matched correctly
              but can&apos;t be read back for display. That&apos;s a storage-permissions problem, not a mapping one —
              the offer will still publish with its image attached.
            </p>
          </div>

          {batchOffers?.offersWithoutImages > 0 && (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs font-semibold">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                {batchOffers.offersWithoutImages} of {offers.length} offer(s) have no hero image and will show a Pairley
                placeholder. Go back to Step 2 to add them, or publish as-is.
              </span>
            </div>
          )}

          {offers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm">No offers to preview yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {offers.map((o) => <OfferPreviewCard key={o.id} offer={o} />)}
            </div>
          )}

          {stepNav(2, 4, 'Continue to Publish')}
        </div>
      )}

      {/* ---------------- STEP 4 — Publish ---------------- */}
      {activeStep === 4 && batch && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
              <Rocket size={16} className="text-[#5B12D6]" /> Step 4 — Publish
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Makes every draft in this import visible to customers. This is the only irreversible step.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBadge label="Offers Ready" value={offers.length} tone="purple" />
            <StatBadge label="With Hero Image" value={offers.length - (batchOffers?.offersWithoutImages ?? 0)} tone="emerald" />
            <StatBadge label="Without Image" value={batchOffers?.offersWithoutImages ?? 0} tone="amber" />
            <StatBadge label="Published" value={batch.published_rows} tone="slate" />
          </div>

          {batch.status === 'PUBLISHING' && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <Clock size={16} className="text-amber-500 animate-pulse" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-700">
                  Publishing — {batch.published_rows} / {batch.valid_rows}
                </div>
                <div className="h-1.5 bg-amber-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (batch.published_rows / Math.max(1, batch.valid_rows)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {batch.status === 'CREATED' && (
            <button
              onClick={handlePublish}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#5B12D6] to-[#7C3AED] text-white text-sm font-extrabold shadow-md shadow-[#5B12D6]/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Publish {batch.valid_rows} Offer{batch.valid_rows === 1 ? '' : 's'} to Pairley
            </button>
          )}

          {batch.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-xs font-bold">
              <CheckCircle2 size={16} /> {batch.published_rows} offer(s) are live on Pairley.
            </div>
          )}

          {stepNav(3, null, null)}
        </div>
      )}

      {/* ---------------- Import history ---------------- */}
      <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6">
        <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
          <History size={16} className="text-[#5B12D6]" /> Import History
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">
          Click any import to reopen it — it resumes at whichever step it reached.
        </p>
        {loadingHistory ? (
          <div className="text-center py-10 text-slate-400 font-bold text-sm">Loading…</div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold text-sm">No imports yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[930px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Offers</th>
                  <th className="px-4 py-3 text-center">Valid / Invalid / Dup</th>
                  <th className="px-4 py-3 text-center">Published</th>
                  <th className="px-4 py-3 text-center">Images</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3 w-px" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => openBatch(b.id)}
                    className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${b.id === activeBatchId ? 'bg-[#5B12D6]/5' : ''}`}
                  >
                    <td className="px-4 py-3 text-slate-800 font-bold">{b.file_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[b.status] || STATUS_STYLES.QUEUED}`}
                      >
                        {STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{b.total_rows}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-emerald-600">{b.valid_rows}</span> /{' '}
                      <span className="text-rose-500">{b.invalid_rows}</span> /{' '}
                      <span className="text-amber-500">{b.duplicate_rows}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#5B12D6]">{b.published_rows}</td>
                    <td className="px-4 py-3 text-center">
                      {b.mapped_images}/{b.total_images}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {new Date(b.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          b.id === activeBatchId ? 'text-[#5B12D6]' : 'text-slate-400'
                        }`}
                      >
                        {b.id === activeBatchId ? 'Open' : 'Resume'}
                        <ChevronRight size={13} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
