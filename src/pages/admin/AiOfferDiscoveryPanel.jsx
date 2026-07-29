import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot,
  Link2,
  Image as ImageIcon,
  FileText,
  Camera,
  Loader2,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api, API_URL, generateCorrelationId } from '../../utils/api';
import {
  DISCOVERY_SOURCES,
  getSourceById,
  getFailureMessage,
  normalizeSourceUrl,
  hasActiveJob,
  jobProducedCandidate,
} from '../../utils/discoverySource';

const SOURCE_ICONS = {
  website: Link2,
  poster: ImageIcon,
  pdf: FileText,
  screenshot: Camera,
};

const JOB_STATUS_META = {
  QUEUED: { label: 'Queued', icon: Clock, tone: 'bg-slate-100 border-slate-200 text-slate-500' },
  PROCESSING: { label: 'Processing', icon: Loader2, tone: 'bg-amber-50 border-amber-200 text-amber-700', spin: true },
  DONE: { label: 'Done', icon: CheckCircle2, tone: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  FAILED: { label: 'Failed', icon: XCircle, tone: 'bg-rose-50 border-rose-200 text-rose-700' },
};

const SOURCE_TYPE_ICONS = {
  WEBSITE: Link2,
  POSTER: ImageIcon,
  PDF: FileText,
};

function jobLabel(job) {
  if (job.source_type === 'WEBSITE') {
    try {
      return new URL(job.source_url).hostname;
    } catch {
      return job.source_url;
    }
  }
  // File imports carry an S3 URL, which is meaningless to an admin — the
  // filename is the part they recognise.
  const name = String(job.source_url || '').split('/').pop() || 'Uploaded file';
  return decodeURIComponent(name.replace(/^pending-upload:\/\//, ''));
}

function JobRow({ job, onOpenReview }) {
  const meta = JOB_STATUS_META[job.status] || JOB_STATUS_META.QUEUED;
  const StatusIcon = meta.icon;
  const SourceIcon = SOURCE_TYPE_ICONS[job.source_type] || FileText;
  const producedCandidate = jobProducedCandidate(job);

  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
        <SourceIcon size={13} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-700 truncate" title={job.source_url}>
          {jobLabel(job)}
        </div>
        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
          {new Date(job.created_at).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        {job.status === 'FAILED' && job.error && (
          <div className="text-[10px] text-rose-500 font-semibold mt-1 leading-snug" title={job.error}>
            {getFailureMessage(job.error)}
          </div>
        )}
        {job.status === 'DONE' && !producedCandidate && (
          <div className="text-[10px] text-amber-600 font-semibold mt-1 leading-snug">
            Nothing readable found on this source — no draft offer was created.
          </div>
        )}
      </div>

      {producedCandidate && (
        <button
          type="button"
          onClick={onOpenReview}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#5B12D6]/30 bg-[#5B12D6]/5 text-[#5B12D6] text-[9px] font-extrabold uppercase tracking-wide hover:bg-[#5B12D6]/10 flex-shrink-0"
        >
          Review <ArrowRight size={10} />
        </button>
      )}

      <span
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex-shrink-0 ${meta.tone}`}
      >
        <StatusIcon size={10} className={meta.spin ? 'animate-spin' : ''} />
        {meta.label}
      </span>
    </div>
  );
}

/**
 * Module 14 Phase 1 — the admin entry point for AI offer discovery.
 *
 * Every source here feeds the pipeline that has existed since Modules 9-10;
 * nothing about extraction, OCR, normalization, duplicate detection, or the
 * review queue is reimplemented. The website-import endpoint in particular
 * has been live since Module 9 with no UI at all — this screen is the first
 * way to reach it without calling the API by hand.
 *
 * Discovery (this screen, the input) is kept separate from Discovered Offers
 * (the review queue, the output) so neither panel has to do two unrelated
 * jobs; the per-job "Review" action is the bridge between them.
 */
export default function AiOfferDiscoveryPanel({ onOpenReviewQueue }) {
  const { showToast } = useToast();
  const [activeSource, setActiveSource] = useState('website');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [jobs, setJobs] = useState([]);
  const fileInputRef = useRef(null);

  const source = getSourceById(activeSource);

  const fetchJobs = useCallback(() => {
    api
      .get('/discovery/jobs?limit=10')
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load import jobs:', err));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Polls only while something is actually in flight, and stops itself the
  // moment every visible job is terminal — same restraint as the Module 10
  // upload card rather than a permanent 3s timer against the admin API.
  useEffect(() => {
    if (!hasActiveJob(jobs)) return undefined;
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [jobs, fetchJobs]);

  const handleSourceChange = (id) => {
    setActiveSource(id);
    setUrlError('');
  };

  const handleAnalyzeUrl = async () => {
    const normalized = normalizeSourceUrl(url);
    if (!normalized.valid) {
      setUrlError(normalized.error);
      return;
    }
    setUrlError('');
    setSubmitting(true);
    try {
      // Website import runs the whole pipeline before responding, so the
      // returned job is already terminal. A failed import — including a
      // robots.txt refusal — comes back as a FAILED job with HTTP 200, not
      // as a thrown error, so the outcome has to be read off the job rather
      // than inferred from the request succeeding.
      const job = await api.post('/discovery/import', { source_url: normalized.url });

      if (job?.status === 'FAILED') {
        setUrlError(getFailureMessage(job.error));
      } else if (jobProducedCandidate(job)) {
        showToast('Offer extracted — review it in Discovered Offers.', 'success');
        setUrl('');
      } else {
        setUrlError(
          'Nothing readable was found on that page. Try the offer’s own page, or upload a poster or screenshot instead.',
        );
      }
      fetchJobs();
    } catch (err) {
      console.error('Website import failed:', err);
      showToast(err.message || 'Import failed.', 'error');
      fetchJobs();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Multipart upload goes through fetch directly rather than the api
      // helper, which sets a JSON content type — same approach as the
      // Module 10 upload card.
      const res = await fetch(`${API_URL}/discovery/import-file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('pairley_token') || ''}`,
          'X-Request-Id': generateCorrelationId(),
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      showToast('Uploaded — extracting the offer in the background.', 'success');
      fetchJobs();
    } catch (err) {
      console.error('File import failed:', err);
      showToast('Upload failed: ' + (err.message || 'Request failed'), 'error');
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/50 border border-slate-200/40 rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B12D6]/10 border border-[#5B12D6]/20 flex items-center justify-center text-[#5B12D6] flex-shrink-0">
            <Bot size={17} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">AI Offer Discovery</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 max-w-lg">
              Turn a publicly promoted offer into a Pairley draft. Everything imported here lands in
              Discovered Offers for review — nothing is published without your approval.
            </p>
          </div>
        </div>

        {/* Source selector — one input visible at a time, since only one can
            be used per import. */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {DISCOVERY_SOURCES.map((item) => {
            const Icon = SOURCE_ICONS[item.id] || Link2;
            const isActive = item.id === activeSource;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSourceChange(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border transition-colors ${
                  isActive
                    ? 'bg-[#5B12D6] border-[#5B12D6] text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-[#5B12D6]/40 hover:text-[#5B12D6]'
                }`}
              >
                <Icon size={12} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4">
          {source?.kind === 'url' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="discovery-url" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Website URL
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="discovery-url"
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !submitting) handleAnalyzeUrl();
                  }}
                  placeholder={source.placeholder}
                  className={`flex-1 min-w-[220px] h-10 px-3 rounded-xl border text-xs font-semibold text-slate-700 outline-none focus:border-[#5B12D6] ${
                    urlError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleAnalyzeUrl}
                  className="px-4 h-10 bg-[#5B12D6] hover:bg-[#4A0FB0] text-white text-[10px] font-extrabold uppercase tracking-wide rounded-xl flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {submitting ? 'Analyzing...' : 'Analyze using AI'}
                </button>
              </div>
              {urlError && <p className="text-[10px] font-bold text-rose-500">{urlError}</p>}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Upload {source?.label}
                </span>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 max-w-md">{source?.hint}</p>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 h-10 bg-[#5B12D6] hover:bg-[#4A0FB0] text-white text-[10px] font-extrabold uppercase tracking-wide rounded-xl flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                {submitting ? 'Uploading...' : `Choose ${source?.label}`}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={source?.accept}
                hidden
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          )}

          {source?.kind === 'url' && (
            <p className="flex items-start gap-1.5 text-[10px] text-slate-400 font-semibold mt-3">
              <ShieldCheck size={12} className="flex-shrink-0 mt-0.5 text-emerald-500" />
              {source.hint}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white/50 border border-slate-200/40 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Recent Imports</span>
          {onOpenReviewQueue && (
            <button
              type="button"
              onClick={onOpenReviewQueue}
              className="text-[9px] font-extrabold uppercase tracking-wide text-[#5B12D6] hover:underline flex items-center gap-1"
            >
              Discovered Offers <ArrowRight size={10} />
            </button>
          )}
        </div>
        {jobs.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[11px] font-bold text-slate-400">No imports yet</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Paste a public offer page above, or upload a poster, PDF, or screenshot.
            </p>
          </div>
        ) : (
          jobs.map((job) => <JobRow key={job.id} job={job} onOpenReview={onOpenReviewQueue} />)
        )}
      </div>
    </div>
  );
}
