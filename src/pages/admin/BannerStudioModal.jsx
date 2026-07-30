import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Upload,
  History,
  ImageOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react';
import { api, API_URL, generateCorrelationId } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { getDocumentPreviewUrl } from '../../utils/adminFilePreview';
import {
  changeTypeLabel,
  suitabilityBand,
  SUITABILITY_BAND_LABELS,
  nextWatermarkState,
  watermarkStateLabel,
  buildWatermarkFlags,
  formatDimensions,
  formatDate,
} from '../../utils/bannerStudio';

const SUITABILITY_TONE = {
  HIGH: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  MEDIUM: 'bg-amber-50 border-amber-200 text-amber-700',
  LOW: 'bg-rose-50 border-rose-200 text-rose-700',
};

function SuitabilityBadge({ total }) {
  const band = suitabilityBand(total);
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${SUITABILITY_TONE[band]}`}>
      {Math.round(total ?? 0)}/100 · {SUITABILITY_BAND_LABELS[band]}
    </span>
  );
}

function WatermarkToggle({ value, onChange, disabled }) {
  const Icon = value === true ? ShieldAlert : value === false ? ShieldCheck : ShieldQuestion;
  const tone =
    value === true
      ? 'border-rose-300 bg-rose-50 text-rose-700'
      : value === false
        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-white text-slate-400';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(nextWatermarkState(value));
      }}
      title={`${watermarkStateLabel(value)} — click to change`}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold ${tone} disabled:opacity-50`}
    >
      <Icon size={11} />
      {watermarkStateLabel(value)}
    </button>
  );
}

/**
 * Module 14 Phase 3C — the Banner Studio.
 *
 * The full "import → generate → store → admin preview → publish" workflow
 * from one screen: template recommendation with per-template scores, a
 * quality-ranked image picker (with a manual, tri-state watermark flag —
 * there is no automatic detector, see the backend's
 * ImageAnalysisService.WATERMARK_DETECTION_STATUS), manual image upload,
 * regenerate, and version history with rollback.
 *
 * Every render is a real backend call — nothing here composes a banner
 * client-side. `preview` (GET) never renders; `generate`/`regenerate` (POST/
 * PUT) are the only calls that do, and both persist to
 * `generated_offer_card` server-side, so a later page load is a URL, not a
 * re-render.
 */
export default function BannerStudioModal({ offerId, businessName, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedHeroUrl, setSelectedHeroUrl] = useState(null);
  const [watermarkFlags, setWatermarkFlags] = useState({});
  // null = use the merchant's stored preference; a value previews the other
  // mode without changing what the merchant chose.
  const [brandingOverride, setBrandingOverride] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rollingBack, setRollingBack] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);

  const loadPreview = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get(`/discovery/candidates/${offerId}/banner/preview`)
      .then((data) => {
        setPreview(data);
        setSelectedTemplateId((prev) => prev ?? data.current?.templateId ?? data.suggestedTemplateId);
        setSelectedHeroUrl((prev) => prev ?? data.current?.heroImageUrl ?? data.heroImageUrl ?? null);
      })
      .catch((err) => {
        console.error('Failed to load banner preview:', err);
        setError(err.message || 'Could not load the banner studio.');
      })
      .finally(() => setLoading(false));
  }, [offerId]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleWatermarkChange = (url, value) => {
    setWatermarkFlags((prev) => ({ ...prev, [url]: value }));
  };

  const render = async (mode) => {
    setRendering(true);
    setError('');
    try {
      const body = {
        templateId: selectedTemplateId,
        heroImageUrl: selectedHeroUrl,
        watermarkFlags: buildWatermarkFlags(watermarkFlags),
        ...(brandingOverride ? { brandingMode: brandingOverride } : {}),
      };
      const endpoint = `/discovery/candidates/${offerId}/banner${mode === 'regenerate' ? '/regenerate' : ''}`;
      if (mode === 'regenerate') {
        await api.put(endpoint, body);
      } else {
        await api.post(endpoint, body);
      }
      showToast('Banner updated.', 'success');
      loadPreview();
    } catch (err) {
      console.error('Banner render failed:', err);
      setError(err.message || 'Could not generate the banner.');
    } finally {
      setRendering(false);
    }
  };

  const handleUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/discovery/candidates/${offerId}/banner/hero-upload`, {
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
      showToast('Image uploaded — banner rebuilt.', 'success');
      loadPreview();
    } catch (err) {
      console.error('Hero upload failed:', err);
      setError(err.message || 'Could not upload the replacement image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRollback = async (versionNo) => {
    setRollingBack(versionNo);
    try {
      await api.put(`/discovery/candidates/${offerId}/banner/rollback`, { versionNo });
      showToast(`Rolled back to version ${versionNo}.`, 'success');
      loadPreview();
    } catch (err) {
      console.error('Rollback failed:', err);
      showToast(err.message || 'Rollback failed.', 'error');
    } finally {
      setRollingBack(null);
    }
  };

  const currentBannerUrl = preview?.current?.bannerUrl;
  const hasBanner = Boolean(currentBannerUrl);
  const recommendation = preview?.recommendation;
  const templates = preview?.templates || [];
  const ranking = preview?.heroRanking || [];

  return (
    <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={onClose}>
      <div
        className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-5xl w-full relative animate-modalSlideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Sparkles size={16} className="text-[#5B12D6]" /> Banner Studio
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">🏪 {businessName}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 ${showHistory ? 'bg-slate-100 text-[#5B12D6]' : ''}`}
              title="Version history"
            >
              <History size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-xs font-bold">Analysing images and scoring templates…</span>
          </div>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="mx-5 md:mx-6 mt-4 flex items-start gap-1.5 text-[10px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-0">
              {/* Compare: original source thumbnail vs generated banner */}
              <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  {hasBanner ? 'Current Banner' : 'No Banner Yet'}
                </span>
                {hasBanner ? (
                  <img
                    src={getDocumentPreviewUrl(currentBannerUrl)}
                    alt="Generated Pairley banner"
                    className="w-full rounded-xl border border-slate-200 bg-white object-contain max-h-[420px]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-16 text-slate-300">
                    <ImageOff size={28} />
                    <span className="text-[10px] font-bold">Generate a banner to see it here</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    disabled={rendering}
                    onClick={() => render(hasBanner ? 'regenerate' : 'generate')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#5B12D6] hover:bg-[#4A0FB0] text-white text-[10px] font-extrabold uppercase tracking-wide rounded-xl disabled:opacity-50"
                  >
                    {rendering ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    {rendering ? 'Rendering…' : hasBanner ? 'Regenerate Banner' : 'Generate Banner'}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold mt-2">
                  Regeneration only re-renders the banner — it never re-crawls, re-runs OCR, or
                  re-extracts the offer.
                </p>

                {showHistory && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Version History
                    </div>
                    {(preview?.versions || []).length === 0 ? (
                      <div className="px-3 py-4 text-[10px] text-slate-400 font-semibold text-center">
                        No versions yet.
                      </div>
                    ) : (
                      [...(preview.versions || [])].reverse().map((version) => {
                        const isCurrent = version.bannerUrl === currentBannerUrl;
                        return (
                          <div
                            key={version.versionNo}
                            className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100 last:border-0"
                          >
                            <img
                              src={getDocumentPreviewUrl(version.bannerUrl)}
                              alt={`Version ${version.versionNo}`}
                              className="w-10 h-10 rounded-lg border border-slate-200 object-cover flex-shrink-0 bg-slate-50"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-slate-700">
                                v{version.versionNo} · {changeTypeLabel(version.changeType)}
                                {isCurrent && (
                                  <span className="ml-1.5 text-emerald-600">(current)</span>
                                )}
                              </div>
                              <div className="text-[9px] text-slate-400 font-semibold">
                                {formatDate(version.createdAt)} · Template {version.templateId}
                              </div>
                            </div>
                            {!isCurrent && (
                              <button
                                disabled={rollingBack === version.versionNo}
                                onClick={() => handleRollback(version.versionNo)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-500 hover:border-[#5B12D6] hover:text-[#5B12D6] disabled:opacity-50 flex-shrink-0"
                              >
                                {rollingBack === version.versionNo ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={10} />
                                )}
                                Rollback
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Template picker + hero image picker */}
              <div className="p-5 md:p-6 flex flex-col gap-4">
                {/* Branding preference. The merchant owns this choice — the
                    admin is previewing it, not setting it, so the default
                    always reflects what the merchant actually stored. */}
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Branding
                  </span>
                  <div className="flex gap-1.5">
                    {[
                      { value: null, label: "Merchant's choice" },
                      { value: 'PAIRLEY', label: 'Pairley' },
                      { value: 'MERCHANT', label: 'Merchant' },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setBrandingOverride(option.value)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                          brandingOverride === option.value
                            ? 'border-[#5B12D6] bg-[#5B12D6]/5 text-[#5B12D6]'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-[#5B12D6]/40'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {brandingOverride && (
                    <p className="text-[9px] text-slate-400 font-semibold mt-1.5">
                      Previewing only — this does not change the merchant&apos;s saved preference.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Template</span>
                    {recommendation && (
                      <span className="text-[9px] font-bold text-slate-400">
                        {Math.round((recommendation.confidence ?? 0) * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {templates.map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      const isRecommended = recommendation?.templateId === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                            isSelected
                              ? 'border-[#5B12D6] bg-[#5B12D6]/5'
                              : 'border-slate-200 bg-white hover:border-[#5B12D6]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-slate-700">
                              {template.id}. {template.name}
                            </span>
                            {isRecommended && (
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-[#5B12D6] text-white">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  {recommendation?.reasons?.length > 0 && (
                    <p className="text-[9px] text-slate-400 font-semibold mt-2">
                      Why recommended: {recommendation.reasons.join(' · ')}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Hero Image</span>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-[#5B12D6] hover:underline disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      {uploading ? 'Uploading…' : 'Upload Replacement'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => handleUpload(e.target.files)}
                    />
                  </div>

                  {preview?.heroNeedsReview && (
                    <div className="flex items-start gap-1.5 text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
                      <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                      {preview.heroReviewReason || 'Please confirm the selected image.'}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {ranking.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold">
                        No images were found for this offer.
                      </p>
                    ) : (
                      ranking.map((ranked) => {
                        const url = ranked.candidate.url;
                        const isSelected = selectedHeroUrl === url;
                        const manualFlag = Object.prototype.hasOwnProperty.call(watermarkFlags, url)
                          ? watermarkFlags[url]
                          : (ranked.candidate.watermarkSuspected ?? null);
                        return (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setSelectedHeroUrl(url)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-colors ${
                              isSelected
                                ? 'border-[#5B12D6] bg-[#5B12D6]/5'
                                : 'border-slate-200 bg-white hover:border-[#5B12D6]/40'
                            }`}
                          >
                            <img
                              src={getDocumentPreviewUrl(url)}
                              alt={ranked.candidate.role}
                              className="w-14 h-14 rounded-lg border border-slate-200 object-cover flex-shrink-0 bg-slate-50"
                              onError={(e) => {
                                e.currentTarget.style.visibility = 'hidden';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-extrabold uppercase text-slate-500">
                                  {ranked.candidate.role.replace(/_/g, ' ')}
                                </span>
                                {isSelected && <CheckCircle2 size={12} className="text-[#5B12D6]" />}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                <SuitabilityBadge total={ranked.suitability?.total} />
                                {formatDimensions(ranked.candidate.width, ranked.candidate.height) && (
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    {formatDimensions(ranked.candidate.width, ranked.candidate.height)}
                                  </span>
                                )}
                              </div>
                              {ranked.reasons?.length > 0 && (
                                <p className="text-[9px] text-amber-600 font-semibold mt-1 line-clamp-1">
                                  {ranked.reasons[0]}
                                </p>
                              )}
                              <div className="mt-1.5">
                                <WatermarkToggle
                                  value={manualFlag}
                                  onChange={(value) => handleWatermarkChange(url, value)}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
