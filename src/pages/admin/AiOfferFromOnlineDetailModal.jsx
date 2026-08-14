import { useEffect, useState } from 'react';
import { X, Check, Search, Building2, Loader2, Rocket, Ban } from 'lucide-react';
import { aiOffersFromOnlineApi } from '../../utils/aiOffersFromOnlineApi';
import { AI_OFFER_STATUS_STYLES, AI_OFFER_STATUS_LABELS } from './aiOffersFromOnlineStatusStyles';

const formatDate = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const EDITABLE_FIELDS = [
  { key: 'merchantName', dbKey: 'merchant_name', label: 'Merchant Name' },
  { key: 'mobile', dbKey: 'mobile', label: 'Mobile' },
  { key: 'whatsapp', dbKey: 'whatsapp', label: 'WhatsApp' },
  { key: 'category', dbKey: 'category', label: 'Category' },
  { key: 'address', dbKey: 'address', label: 'Address' },
  { key: 'city', dbKey: 'city', label: 'City' },
  { key: 'offerTitle', dbKey: 'offer_title', label: 'Offer Title' },
  { key: 'description', dbKey: 'description', label: 'Description' },
  { key: 'originalPrice', dbKey: 'original_price', label: 'Original Price', type: 'number' },
  { key: 'offerPrice', dbKey: 'offer_price', label: 'Offer Price', type: 'number', highlight: true },
  { key: 'terms', dbKey: 'terms', label: 'Terms' },
];

function fieldsFromOffer(offer) {
  const form = {};
  for (const f of EDITABLE_FIELDS) form[f.key] = offer[f.dbKey] ?? '';
  return form;
}

const TERMINAL = ['PUBLISHED', 'REJECTED'];

/**
 * One AI offer, in full, before the publishing decision.
 *
 * The banner is shown but never re-generated: it is the exact creative a
 * human already approved in the AI Offer Collector, and this screen has no
 * action that could replace it. The admin's decisions here are the merchant
 * (match an existing business or explicitly create one) and whether to
 * publish at all.
 */
export default function AiOfferFromOnlineDetailModal({ offerId, onClose, onChanged }) {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const load = () => {
    setLoading(true);
    aiOffersFromOnlineApi
      .get(offerId)
      .then((data) => {
        setOffer(data);
        setForm(fieldsFromOffer(data));
        setSearchQuery((q) => q || data.merchant_name || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load this offer');
        setLoading(false);
      });
  };

  useEffect(load, [offerId]);

  const provenanceFor = (key) => offer?.field_provenance?.[key];
  const isTerminal = offer && TERMINAL.includes(offer.status);
  const businessId = offer?.matched_business_id || offer?.created_business_id;

  const saveEdits = () => {
    setSaving(true);
    const changed = {};
    for (const f of EDITABLE_FIELDS) {
      const original = offer[f.dbKey] ?? '';
      if (String(form[f.key] ?? '') !== String(original)) {
        changed[f.key] = f.type === 'number' ? Number(form[f.key]) : form[f.key];
      }
    }
    if (Object.keys(changed).length === 0) {
      setSaving(false);
      return;
    }
    aiOffersFromOnlineApi
      .correct(offerId, changed)
      .then(() => {
        setSaving(false);
        load();
      })
      .catch((err) => {
        setError(err.message || 'Could not save changes');
        setSaving(false);
      });
  };

  const runSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    aiOffersFromOnlineApi
      .searchBusinesses(searchQuery.trim())
      .then((data) => {
        setSearchResults(Array.isArray(data) ? data : []);
        setSearching(false);
      })
      .catch(() => setSearching(false));
  };

  const act = (label, fn) => {
    setBusy(label);
    setError(null);
    fn()
      .then(() => {
        setBusy(null);
        if (label === 'publish' || label === 'reject') onChanged?.();
        else load();
      })
      .catch((err) => {
        setError(err.message || `Could not ${label}`);
        setBusy(null);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{offer?.merchant_name || 'AI Offer'}</h3>
            <p className="text-xs text-gray-500">From the AI Offer Collector · exported {formatDate(offer?.exported_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            {offer && (
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${AI_OFFER_STATUS_STYLES[offer.status] || ''}`}>
                {AI_OFFER_STATUS_LABELS[offer.status] || offer.status}
              </span>
            )}
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#5B12D6]" />
          </div>
        ) : !offer ? (
          <div className="p-6 text-center text-rose-600">{error || 'Not found'}</div>
        ) : (
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,340px)_1fr]">
            {/* ---- The approved creative --------------------------------- */}
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img src={offer.banner_image_url} alt={`${offer.merchant_name} approved banner`} className="w-full object-contain" />
              </div>
              <p className="text-xs leading-relaxed text-gray-500">
                This is the exact banner approved in the AI Offer Collector. Pairley does not regenerate or replace it — publishing uses this
                image as the offer's cover.
              </p>
              {offer.source_url && (
                <a
                  href={offer.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-xs font-medium text-[#5B12D6] underline"
                  title={offer.source_url}
                >
                  Source: {offer.source_url}
                </a>
              )}
            </div>

            <div className="space-y-6">
              {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              {/* ---- Merchant decision --------------------------------- */}
              <section>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Building2 className="h-4 w-4" /> Merchant
                </h4>
                {businessId ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <Check className="h-4 w-4" />
                    {offer.matched_business_id ? 'Matched to existing business' : 'New merchant created'} · <code className="text-xs">{businessId}</code>
                  </div>
                ) : (
                  <p className="mb-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
                    No merchant selected yet — that's fine. Publishing will match an existing business automatically (same phone, or same
                    name + city), or create a new UNCLAIMED one from this offer's own details. It shows on Pairley with a "Claim it" prompt
                    until the real owner claims it.
                  </p>
                )}

                {!isTerminal && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                        placeholder="Search existing businesses…"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5B12D6] focus:outline-none"
                      />
                      <button
                        onClick={runSearch}
                        disabled={searching}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <ul className="max-h-44 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                        {searchResults.map((b) => (
                          <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-gray-900">{b.business_name}</span>
                              <span className="block truncate text-xs text-gray-500">
                                {b.mobile || 'no mobile'} · {b.city || 'no city'} · {b.business_status}
                              </span>
                            </span>
                            <button
                              onClick={() => act('match', () => aiOffersFromOnlineApi.matchBusiness(offerId, b.id))}
                              disabled={busy === 'match'}
                              className="flex-shrink-0 rounded-lg border border-[#5B12D6] px-3 py-1 text-xs font-semibold text-[#5B12D6] hover:bg-[#5B12D6]/5"
                            >
                              Use Existing
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => act('create merchant', () => aiOffersFromOnlineApi.createMerchant(offerId))}
                      disabled={busy === 'create merchant'}
                      className="w-full rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#5B12D6] hover:text-[#5B12D6]"
                    >
                      {busy === 'create merchant' ? 'Creating…' : 'No match — Create New Merchant'}
                    </button>
                  </div>
                )}
              </section>

              {/* ---- Fields, each provenance-labeled ------------------- */}
              <section>
                <h4 className="mb-2 text-sm font-bold text-gray-900">Offer details</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {EDITABLE_FIELDS.map((f) => (
                    <div key={f.key} className={f.key === 'description' || f.key === 'terms' ? 'sm:col-span-2' : ''}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-gray-600">{f.label}</label>
                        {provenanceFor(f.key) && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                            {provenanceFor(f.key).replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <input
                        type={f.type || 'text'}
                        value={form[f.key] ?? ''}
                        disabled={isTerminal}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
                          f.highlight ? 'border-[#5B12D6]/40 font-semibold' : 'border-gray-300'
                        } focus:border-[#5B12D6]`}
                      />
                    </div>
                  ))}
                </div>
                {!isTerminal && (
                  <button
                    onClick={saveEdits}
                    disabled={saving}
                    className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                )}
              </section>

              {/* ---- Publishing decision ------------------------------- */}
              {!isTerminal && (
                <section className="border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => act('publish', () => aiOffersFromOnlineApi.publish(offerId))}
                      disabled={busy === 'publish'}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#5B12D6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a0fb0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                      {offer.status === 'DUPLICATE_SUPPRESSED' ? 'Re-check & Publish' : 'Publish to Pairley'}
                    </button>
                    <button
                      onClick={() => setShowReject((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Ban className="h-4 w-4" /> Reject
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Publishing runs the existing Offer Publisher pipeline — the offer is created, validated, approved and set live in one step.
                    A duplicate check runs first; a high-confidence match is flagged instead of published.
                  </p>

                  {offer.status === 'DUPLICATE_SUPPRESSED' && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p className="font-semibold">Flagged as a likely duplicate — not published.</p>
                      {offer.duplicate_of_offer_id && (
                        <p className="mt-1 text-xs">
                          Matches existing offer <code className="text-xs">{offer.duplicate_of_offer_id}</code>
                          {offer.duplicate_score != null ? ` · confidence ${Math.round(offer.duplicate_score * 100)}%` : ''}
                        </p>
                      )}
                      {(offer.duplicate_reasons || []).length > 0 && (
                        <p className="mt-1 text-xs">{offer.duplicate_reasons.join(', ')}</p>
                      )}
                      <p className="mt-1 text-xs">If this is wrong, correct a field above (e.g. the title) and publish again to re-check.</p>
                    </div>
                  )}

                  {offer.status === 'PRICE_REQUIRED' && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p className="font-semibold">⚠ Price Required</p>
                      <p className="mt-1 text-xs">{offer.failure_reason || 'Source price could not be verified.'}</p>
                      <p className="mt-2 text-xs">
                        {offer.source_url ? (
                          <>
                            <a href={offer.source_url} target="_blank" rel="noreferrer" className="font-semibold underline">
                              Open Source
                            </a>{' '}
                            → verify the real price → enter it in <strong>Offer Price</strong> below → Save changes → Publish.
                          </>
                        ) : (
                          <>Enter a verified price in <strong>Offer Price</strong> below → Save changes → Publish.</>
                        )}
                      </p>
                    </div>
                  )}

                  {offer.status === 'CATEGORY_REQUIRED' && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p className="font-semibold">⚠ Category Required</p>
                      <p className="mt-1 text-xs">{offer.failure_reason}</p>
                      <p className="mt-2 text-xs">Correct <strong>Category</strong> below to a valid Pairley category → Save changes → Publish.</p>
                    </div>
                  )}

                  {offer.status === 'EXPIRED' && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <p className="font-semibold">Expired</p>
                      <p className="mt-1 text-xs">{offer.failure_reason}</p>
                      <p className="mt-1 text-xs">There's no automatic recovery for an expired offer — Reject it, or re-export a fresh one from the Collector if the deal is still running.</p>
                    </div>
                  )}

                  {showReject && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                      />
                      <button
                        onClick={() => act('reject', () => aiOffersFromOnlineApi.reject(offerId, rejectReason))}
                        disabled={busy === 'reject'}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  )}
                </section>
              )}

              {offer.status === 'PUBLISHED' && offer.created_offer_id && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Live on Pairley — offer <code className="text-xs">{offer.created_offer_id}</code>
                </p>
              )}
              {offer.status === 'REJECTED' && (
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Rejected{offer.rejection_reason ? `: ${offer.rejection_reason}` : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
