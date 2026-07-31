import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  ImagePlus,
  FolderArchive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Clock,
  History,
  Users,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { bulkImportApi, downloadErrorReport, matchesAccept } from '../../utils/bulkImportApi';

const POLL_INTERVAL_MS = 2000;
const ACTIVE_STATUSES = ['CREATING', 'PUBLISHING'];

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

function Dropzone({ icon: Icon, title, subtitle, onFiles, onReject, multiple, disabled, accept }) {
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
        // Folder upload: same input, Chromium/Firefox honor this attribute
        // to let the OS picker choose a directory whose files then arrive
        // as a normal FileList — same handler as ordinary multi-file select.
        webkitdirectory={multiple ? '' : undefined}
        directory={multiple ? '' : undefined}
        className="hidden"
        disabled={disabled}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

/**
 * Bulk Offer Import admin UI — the Diwali-launch replacement for AI Offer
 * Discovery. Two-stage per the backend design (see bulk-import.service.ts):
 * Excel/CSV creates DRAFT offers with a generated offer_code, then a
 * separate Bulk Image Upload step matches image files to those offers by
 * code, before an explicit Publish makes them live.
 */
export default function BulkImportPanel() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [batch, setBatch] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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

  const openBatch = useCallback(
    (id) => {
      setActiveBatchId(id);
      setBatch(null);
      setPreview(null);
      Promise.all([bulkImportApi.getBatch(id), bulkImportApi.getPreview(id)])
        .then(([b, p]) => {
          setBatch(b);
          setPreview(p);
        })
        .catch(() => showToast('Failed to load this import.', 'error'));
    },
    [showToast],
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
          setBatch(b);
          if (!ACTIVE_STATUSES.includes(b.status)) {
            fetchHistory();
            bulkImportApi.getPreview(activeBatchId).then(setPreview).catch(() => {});
          }
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeBatchId, batch, fetchHistory]);

  // Named per dropzone so the message says what that zone actually wants —
  // a generic "invalid file" would leave an admin guessing which of the
  // three zones they got wrong.
  const rejectSheet = (files) =>
    showToast(
      `"${files[0].name}" isn't a spreadsheet. This step takes the offer details as CSV or XLSX — upload offer images in Step 2, after the drafts exist.`,
      'error',
    );
  const rejectImages = (files) =>
    showToast(
      files.length === 1
        ? `"${files[0].name}" isn't a supported image. Use JPG, PNG or WEBP.`
        : `${files.length} files skipped — only JPG, PNG and WEBP images are supported.`,
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
        openBatch(newBatch.id);
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
        showToast(`Images processed — ${b.mapped_images} mapped, ${b.failed_images} failed so far.`, 'success');
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
        showToast(`ZIP processed — ${b.mapped_images} mapped, ${b.failed_images} failed so far.`, 'success');
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

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* New import */}
      <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6">
        <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
          <Sparkles size={16} className="text-[#5B12D6]" /> Step 1 — Offer Details (spreadsheet)
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">
          This step takes the offer <strong className="text-slate-500">text</strong> only — merchant, title, prices,
          dates — as a CSV or XLSX file (generated with ChatGPT or curated manually). Every row is validated
          deterministically before anything is created.{' '}
          <strong className="text-slate-500">Offer images are not uploaded here</strong> — they come in Step 2, after
          the drafts exist.
        </p>
        <Dropzone
          icon={FileSpreadsheet}
          title={uploading ? 'Uploading…' : 'Drop a CSV/XLSX file here, or click to browse'}
          subtitle="Spreadsheet only — not images. Up to 10,000 offers per file."
          accept=".csv,.xlsx"
          onFiles={handleSheetFiles}
          onReject={rejectSheet}
          disabled={uploading}
        />
      </div>

      {/* Active batch detail */}
      {activeBatchId && batch && (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-sm font-extrabold text-slate-700">{batch.file_name}</div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Uploaded {new Date(batch.created_at).toLocaleString('en-IN')}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[batch.status] || STATUS_STYLES.QUEUED}`}
            >
              {STATUS_LABELS[batch.status] || batch.status}
            </span>
          </div>

          {batch.status === 'FAILED' && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs font-semibold">
              <XCircle size={16} /> {batch.error}
            </div>
          )}

          {/* Validation preview */}
          {preview && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatBadge label="Total Offers" value={preview.totalOffers} tone="slate" />
              <StatBadge label="Valid" value={preview.validOffers} tone="emerald" />
              <StatBadge label="Invalid" value={preview.invalidOffers} tone="rose" />
              <StatBadge label="Duplicate" value={preview.duplicateOffers} tone="rose" />
              <StatBadge label="Merchants" value={preview.distinctMerchants} tone="purple" />
            </div>
          )}
          {preview?.rowsWithWarnings > 0 && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs font-semibold">
              <AlertTriangle size={16} />
              {preview.rowsWithWarnings} row(s) have warnings (e.g. an unusually steep discount) — still valid, worth a look.
            </div>
          )}
          {(preview?.invalidOffers > 0 || preview?.duplicateOffers > 0) && (
            <button
              onClick={handleDownloadErrors}
              className="flex items-center gap-2 text-xs font-bold text-[#5B12D6] hover:underline"
            >
              <Download size={14} /> Download error report (CSV)
            </button>
          )}

          {/* Stage: create drafts */}
          {batch.status === 'VALIDATED' && (
            <button
              onClick={handleCreateDrafts}
              disabled={preview?.validOffers === 0}
              className="w-full py-3 rounded-2xl bg-[#5B12D6] text-white text-sm font-extrabold shadow-md shadow-[#5B12D6]/20 hover:bg-[#4a0fb0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create {preview?.validOffers || 0} Offer Draft{preview?.validOffers === 1 ? '' : 's'}
            </button>
          )}

          {(batch.status === 'CREATING' || batch.status === 'PUBLISHING') && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <Clock size={16} className="text-amber-500 animate-pulse" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-700">
                  {batch.status === 'CREATING'
                    ? `Creating offers — ${batch.created_rows} / ${batch.valid_rows}`
                    : `Publishing — ${batch.published_rows} / ${batch.valid_rows}`}
                </div>
                <div className="h-1.5 bg-amber-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((batch.status === 'CREATING' ? batch.created_rows : batch.published_rows) /
                          Math.max(1, batch.valid_rows)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stage: images + publish, once offers exist */}
          {['CREATED', 'PUBLISHING', 'COMPLETED'].includes(batch.status) && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <ImagePlus size={14} /> Step 2 — Bulk Image Upload
              </h4>
              <p className="text-[11px] text-slate-400 font-medium -mt-2">
                Match images to offers by filename — e.g. <code className="bg-slate-100 px-1 rounded">OFF{String(1).padStart(6, '0')}.jpg</code> for
                the hero image, <code className="bg-slate-100 px-1 rounded">OFF{String(1).padStart(6, '0')}_1.jpg</code> for gallery. No image is
                required — offers without one show a placeholder to customers.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Dropzone
                  icon={ImagePlus}
                  title="Drop image files, or a folder"
                  subtitle="JPG, PNG, WEBP"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  multiple
                  onFiles={handleImageFiles}
                  onReject={rejectImages}
                  disabled={imageUploading}
                />
                <Dropzone
                  icon={FolderArchive}
                  title="Drop a ZIP of images"
                  subtitle="Streamed, so a large archive is fine"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onFiles={handleImageZip}
                  onReject={rejectZip}
                  disabled={imageUploading}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatBadge label="Total Images" value={batch.total_images} tone="slate" />
                <StatBadge label="Mapped" value={batch.mapped_images} tone="emerald" />
                <StatBadge label="Failed / Unmatched" value={batch.failed_images} tone="rose" />
              </div>

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
                  <CheckCircle2 size={16} /> {batch.published_rows} offers are live on Pairley.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Import history */}
      <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md p-6">
        <h3 className="text-sm font-extrabold text-slate-700 mb-1 flex items-center gap-2">
          <History size={16} className="text-[#5B12D6]" /> Import History
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">
          Click any import below to open it — that&apos;s where you upload offer images (Step 2) and publish.
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
                        {b.status}
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
                        {b.id === activeBatchId ? 'Open' : 'Add images'}
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
