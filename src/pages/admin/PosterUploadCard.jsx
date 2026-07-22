import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, Loader2, FileText, Image as ImageIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { API_URL, generateCorrelationId } from '../../utils/api';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';

const TERMINAL_STATUSES = new Set(['DONE', 'FAILED']);

const JOB_STATUS_META = {
  QUEUED: { label: 'Queued', icon: Clock, tone: 'bg-slate-100 border-slate-200 text-slate-500' },
  PROCESSING: { label: 'Processing', icon: Loader2, tone: 'bg-amber-50 border-amber-200 text-amber-700', spin: true },
  DONE: { label: 'Done', icon: CheckCircle2, tone: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  FAILED: { label: 'Failed', icon: XCircle, tone: 'bg-rose-50 border-rose-200 text-rose-700' },
};

// Maps the backend's ImportOrchestrationService failure reason codes (see
// FileImportError) to language an admin — not a developer — can act on.
// Falls back to the raw reason if a new one is added backend-side and this
// list drifts out of sync, rather than hiding it.
const FAILURE_MESSAGES = {
  INVALID_FILE_TYPE: 'Unsupported file type — use JPEG, PNG, WebP, or a text-based PDF.',
  FILE_TOO_LARGE: 'File is too large (15MB limit).',
  INVALID_FILE_SIGNATURE: "File content doesn't match a supported image/PDF format.",
  FILE_TYPE_MISMATCH: 'File extension does not match its actual content — re-export and retry.',
  STORAGE_FAILED: 'Upload storage error — please retry in a moment.',
  PDF_PARSE_FAILED: 'Could not parse this PDF — it may be corrupted.',
  UNSUPPORTED_SCANNED_PDF: 'This PDF appears to be scanned/image-only — text-layer PDFs only.',
  OCR_FAILED: 'Text recognition failed on this image — try a clearer photo.',
};

function JobRow({ job }) {
  const meta = JOB_STATUS_META[job.status] || JOB_STATUS_META.QUEUED;
  const Icon = meta.icon;
  const isPdf = job.source_type === 'PDF';
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
        {isPdf ? <FileText size={13} /> : <ImageIcon size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-700 truncate">
          {job.source_type || 'FILE'} import • {new Date(job.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {job.status === 'FAILED' && job.error && (
          <div className="text-[10px] text-rose-500 font-semibold mt-0.5 line-clamp-1" title={job.error}>
            {FAILURE_MESSAGES[job.error.split(':')[0]] || job.error}
          </div>
        )}
      </div>
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex-shrink-0 ${meta.tone}`}>
        <Icon size={10} className={meta.spin ? 'animate-spin' : ''} />
        {meta.label}
      </span>
    </div>
  );
}

// Module 10 Phase 3 — upload entry point for poster/flyer/menu/PDF imports,
// feeding the same ImportJob → CandidateOffer → review-queue pipeline as
// website import (Module 9). Polling is intentionally lightweight: it only
// re-fetches while at least one tracked job is non-terminal, and stops
// itself the moment every visible job reaches DONE/FAILED.
export default function PosterUploadCard({ onCandidateReady }) {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const prevStatusesRef = useRef({});

  const fetchJobs = useCallback(() => {
    api
      .get('/discovery/jobs?limit=8')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const prev = prevStatusesRef.current;
        const next = {};
        let anyNewlyDone = false;
        list.forEach((job) => {
          next[job.id] = job.status;
          if (job.status === 'DONE' && prev[job.id] && prev[job.id] !== 'DONE') {
            anyNewlyDone = true;
          }
        });
        prevStatusesRef.current = next;
        setJobs(list);
        if (anyNewlyDone) onCandidateReady?.();
      })
      .catch((err) => console.error('Failed to load import jobs:', err));
  }, [onCandidateReady]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const hasActiveJob = jobs.some((j) => !TERMINAL_STATUSES.has(j.status));
    if (!hasActiveJob) return undefined;
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [jobs, fetchJobs]);

  const handleFileSelect = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const correlationId = generateCorrelationId();
      const res = await fetch(`${API_URL}/discovery/import-file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('pairley_token') || ''}`,
          'X-Request-Id': correlationId,
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      showToast('File uploaded — processing in the background.', 'success');
      fetchJobs();
    } catch (err) {
      console.error('Poster/PDF upload failed:', err);
      showToast('Upload failed: ' + (err.message || 'Request failed'), 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-xs font-black text-slate-700">Upload Poster / PDF</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            JPEG, PNG, WebP, or text-based PDF — up to 15MB. Extracted via OCR into a draft offer for review.
          </p>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 bg-[#5B12D6] hover:bg-[#4A0FB0] text-white text-[10px] font-extrabold uppercase tracking-wide rounded-xl flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          hidden
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {jobs.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-3.5 py-2 bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Recent Imports
          </div>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
