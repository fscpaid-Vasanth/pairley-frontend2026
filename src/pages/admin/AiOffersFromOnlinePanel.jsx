import { useEffect, useState, useCallback, useMemo } from 'react';
import { CheckSquare, Square, Eye, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { aiOffersFromOnlineApi } from '../../utils/aiOffersFromOnlineApi';
import AiOfferFromOnlineDetailModal from './AiOfferFromOnlineDetailModal';
import { AI_OFFER_STATUS_STYLES, AI_OFFER_STATUS_LABELS } from './aiOffersFromOnlineStatusStyles';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING_ADMIN_REVIEW', label: 'Pending Review' },
  { value: 'MERCHANT_MATCHED', label: 'Merchant Matched' },
  { value: 'READY_TO_PUBLISH', label: 'Ready to Publish' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
];

/** Only an offer that isn't already live (or declined) can be part of a publish batch. */
const SELECTABLE_STATUSES = ['PENDING_ADMIN_REVIEW', 'MERCHANT_MATCHED', 'READY_TO_PUBLISH', 'FAILED'];

/**
 * "AI Offers From Online" — offers exported from the standalone AI Offer
 * Collector, each already carrying the exact banner a human approved over
 * there.
 *
 * Deliberately a VISUAL bulk-review screen rather than a data table: the
 * banner is the thing being judged, so the grid leads with the image at a
 * readable size and every card is individually selectable. The admin's job
 * here is the publishing decision ("should this become a Pairley deal?"),
 * not fixing the creative — that already happened in the Collector.
 */
export default function AiOffersFromOnlinePanel() {
  const { showToast } = useToast();
  const [offers, setOffers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_ADMIN_REVIEW');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [publishing, setPublishing] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const fetchOffers = useCallback(() => {
    setLoading(true);
    aiOffersFromOnlineApi
      .list(statusFilter || undefined)
      .then((data) => {
        setOffers(Array.isArray(data) ? data : []);
        setLoading(false);
        // Drop any selection that is no longer on screen, so the count can
        // never claim more than what's actually selectable right now.
        setSelectedIds((prev) => {
          const visible = new Set((Array.isArray(data) ? data : []).map((o) => o.id));
          return new Set([...prev].filter((id) => visible.has(id)));
        });
      })
      .catch((err) => {
        showToast(err.message || 'Could not load AI offers', 'error');
        setLoading(false);
      });
  }, [statusFilter, showToast]);

  useEffect(fetchOffers, [fetchOffers]);

  const selectableOffers = useMemo(() => offers.filter((o) => SELECTABLE_STATUSES.includes(o.status)), [offers]);
  const allSelectableSelected = selectableOffers.length > 0 && selectableOffers.every((o) => selectedIds.has(o.id));

  const toggleOne = (offer) => {
    if (!SELECTABLE_STATUSES.includes(offer.status)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(offer.id)) next.delete(offer.id);
      else next.add(offer.id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(selectableOffers.map((o) => o.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const publishSelected = async () => {
    if (selectedIds.size === 0) return;
    setPublishing(true);
    setBatchResult(null);
    try {
      const result = await aiOffersFromOnlineApi.publishSelected([...selectedIds]);
      setBatchResult(result);
      // Successes stand on their own — anything that didn't publish stays
      // selected so the admin can act on exactly those.
      const unresolved = (result.results || []).filter((r) => r.outcome !== 'PUBLISHED').map((r) => r.id);
      setSelectedIds(new Set(unresolved));
      showToast(
        `${result.published} published${result.needsMerchant ? `, ${result.needsMerchant} need a merchant` : ''}${result.failed ? `, ${result.failed} failed` : ''}`,
        result.failed || result.needsMerchant ? 'info' : 'success',
      );
      fetchOffers();
    } catch (err) {
      showToast(err.message || 'Publish failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Offers From Online</h2>
          <p className="text-sm text-gray-500">
            Offers discovered and prepared by the AI Offer Collector. Banners are already human-approved — select the ones to publish.
          </p>
        </div>
        <button
          onClick={fetchOffers}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
              statusFilter === f.value ? 'border-[#5B12D6] bg-[#5B12D6] text-white' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Selection toolbar — sticky so the Publish action stays reachable
          while scrolling a long grid of banners. */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={allSelectableSelected ? clearSelection : selectAll}
            disabled={selectableOffers.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            {allSelectableSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {allSelectableSelected ? 'Clear' : 'Select All'}
          </button>
          {selectedIds.size > 0 && (
            <button onClick={clearSelection} className="text-sm font-medium text-gray-500 underline hover:text-gray-700">
              Clear selection
            </button>
          )}
          <span className="text-sm font-semibold text-gray-700">
            {selectedIds.size} offer{selectedIds.size === 1 ? '' : 's'} selected
          </span>
        </div>
        <button
          onClick={publishSelected}
          disabled={selectedIds.size === 0 || publishing}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5B12D6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a0fb0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish Selected{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
        </button>
      </div>

      {batchResult && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <span className="text-emerald-700">✓ {batchResult.published} Published</span>
            {batchResult.needsMerchant > 0 && <span className="text-amber-700">⚠ {batchResult.needsMerchant} Needs Merchant</span>}
            {batchResult.failed > 0 && <span className="text-rose-700">✕ {batchResult.failed} Failed</span>}
          </div>
          {(batchResult.results || []).some((r) => r.outcome !== 'PUBLISHED') && (
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              {(batchResult.results || [])
                .filter((r) => r.outcome !== 'PUBLISHED')
                .map((r) => {
                  const offer = offers.find((o) => o.id === r.id);
                  return (
                    <li key={r.id} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                      <span>
                        <strong>{offer?.merchant_name || r.id}</strong> — {r.error}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
          <p className="mt-3 text-xs text-gray-500">
            Offers that did not publish are still in the queue and stay selected — fix the cause and press Publish Selected again.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#5B12D6]" />
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-gray-500">
          No AI offers{statusFilter ? ` with status ${AI_OFFER_STATUS_LABELS[statusFilter] || statusFilter}` : ''} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {offers.map((offer) => {
            const selectable = SELECTABLE_STATUSES.includes(offer.status);
            const selected = selectedIds.has(offer.id);
            return (
              <div
                key={offer.id}
                className={`group relative overflow-hidden rounded-xl border bg-white transition ${
                  selected ? 'border-[#5B12D6] ring-2 ring-[#5B12D6]/30' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* The banner itself is the primary control — clicking it
                    toggles selection, which is what an admin scanning a wall
                    of creatives actually wants to do. */}
                <button
                  type="button"
                  onClick={() => toggleOne(offer)}
                  disabled={!selectable}
                  aria-pressed={selected}
                  aria-label={`${selected ? 'Deselect' : 'Select'} ${offer.merchant_name}`}
                  className="block w-full cursor-pointer disabled:cursor-default"
                >
                  <div className="relative aspect-[4/5] w-full bg-gray-100">
                    <img src={offer.banner_image_url} alt={`${offer.merchant_name} offer banner`} className="h-full w-full object-cover" loading="lazy" />
                    {selectable && (
                      <span
                        className={`absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border-2 shadow-sm transition ${
                          selected ? 'border-[#5B12D6] bg-[#5B12D6] text-white' : 'border-white bg-white/85 text-transparent group-hover:text-gray-300'
                        }`}
                      >
                        <CheckSquare className="h-4 w-4" strokeWidth={3} />
                      </span>
                    )}
                    <span
                      className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        AI_OFFER_STATUS_STYLES[offer.status] || 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      {AI_OFFER_STATUS_LABELS[offer.status] || offer.status}
                    </span>
                  </div>
                </button>

                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-semibold text-gray-900" title={offer.merchant_name}>
                    {offer.merchant_name}
                  </p>
                  <p className="line-clamp-2 text-xs text-gray-500" title={offer.offer_title}>
                    {offer.offer_title}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-[#5B12D6]">₹{offer.offer_price}</span>
                    <button
                      onClick={() => setDetailTarget(offer.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#5B12D6]"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </button>
                  </div>
                  {offer.status === 'FAILED' && offer.failure_reason && (
                    <p className="pt-1 text-[11px] text-rose-600" title={offer.failure_reason}>
                      {offer.failure_reason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailTarget && (
        <AiOfferFromOnlineDetailModal
          offerId={detailTarget}
          onClose={() => setDetailTarget(null)}
          onChanged={() => {
            setDetailTarget(null);
            fetchOffers();
          }}
        />
      )}
    </div>
  );
}
