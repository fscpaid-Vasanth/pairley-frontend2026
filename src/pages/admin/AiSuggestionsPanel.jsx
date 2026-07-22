import { useEffect, useState } from 'react';
import { Sparkles, Check, Pencil, X as XIcon, ChevronDown } from 'lucide-react';
import { categories } from '../../data/categories';
import { LEGACY_OFFER_TYPES, STANDARD_OFFER_TYPES, getOfferTypeLabel } from '../../utils/offerTypes';

const OFFER_TYPE_OPTIONS = [...LEGACY_OFFER_TYPES, ...STANDARD_OFFER_TYPES];

const FIELD_LABELS = {
  category: 'Category',
  offerType: 'Offer Type',
  merchantType: 'Merchant Type',
  tags: 'Tags',
  keywords: 'Keywords',
};

// A suggestion is worth defaulting to "accept" only when the provider was
// reasonably confident — a low-confidence fallback (e.g. "no keywords
// matched, kept the default") shouldn't be silently applied just because
// the admin didn't touch it. Matches RuleBasedEnrichmentProvider's own
// MATCHED_CONFIDENCE/UNMATCHED_CONFIDENCE split (0.75 / 0.25).
const AUTO_ACCEPT_THRESHOLD = 0.5;

function initialAction(confidence) {
  return confidence >= AUTO_ACCEPT_THRESHOLD ? 'accept' : 'reject';
}

function formatValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function ActionToggle({ action, onChange }) {
  const options = [
    { key: 'accept', label: 'Accept', icon: Check },
    { key: 'edit', label: 'Edit', icon: Pencil },
    { key: 'reject', label: 'Reject', icon: XIcon },
  ];
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          title={label}
          className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors ${
            action === key
              ? key === 'accept'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : key === 'reject'
                  ? 'bg-slate-500 border-slate-500 text-white'
                  : 'bg-[#5B12D6] border-[#5B12D6] text-white'
              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Icon size={11} />
        </button>
      ))}
    </div>
  );
}

function EditControl({ field, value, onChange }) {
  if (field === 'category') {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white focus:outline-none focus:border-[#5B12D6]"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    );
  }
  if (field === 'offerType') {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white focus:outline-none focus:border-[#5B12D6]"
        >
          {OFFER_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{getOfferTypeLabel(t)}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    );
  }
  if (field === 'tags' || field === 'keywords') {
    return (
      <input
        type="text"
        value={Array.isArray(value) ? value.join(', ') : value}
        onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        placeholder="comma, separated, values"
        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white focus:outline-none focus:border-[#5B12D6]"
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white focus:outline-none focus:border-[#5B12D6]"
    />
  );
}

// Module 11 Phase 4 — the AI Suggestions panel: for each of the 5 fields
// RuleBasedEnrichmentProvider produces (category/offerType/merchantType/
// tags/keywords), lets the admin Accept, Edit, or Reject before approving.
// Nothing here calls the API directly — it only reports the effective
// override payload upward via onChange, so the parent modal can send it
// atomically with the approve request (Decision: no separate save-draft
// round trip).
export default function AiSuggestionsPanel({ enrichmentStatus, enrichmentMetadata, onChange }) {
  const fields = ['category', 'offerType', 'merchantType', 'tags', 'keywords'];
  const [state, setState] = useState(() => {
    const initial = {};
    for (const field of fields) {
      const suggestion = enrichmentMetadata?.[field];
      if (!suggestion) continue;
      initial[field] = {
        action: initialAction(suggestion.confidence ?? 0),
        value: suggestion.suggested,
      };
    }
    return initial;
  });

  useEffect(() => {
    const overrides = {};
    for (const field of fields) {
      const entry = state[field];
      if (entry && entry.action !== 'reject') {
        overrides[field] = entry.value;
      }
    }
    onChange?.(overrides);
  }, [state]);

  if (enrichmentStatus !== 'ENRICHED' || !enrichmentMetadata) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-[10px] font-semibold text-slate-400 flex items-center gap-2">
        <Sparkles size={13} />
        {enrichmentStatus === 'ENRICHMENT_FAILED'
          ? 'AI enrichment failed for this candidate — nothing to suggest.'
          : 'No AI suggestions available for this candidate.'}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
        <Sparkles size={13} className="text-[#5B12D6]" />
        <span className="text-[10px] font-black uppercase tracking-wider text-[#5B12D6]">AI Suggestions</span>
      </div>
      <div className="divide-y divide-indigo-100/70">
        {fields.map((field) => {
          const suggestion = enrichmentMetadata?.[field];
          if (!suggestion) return null;
          const entry = state[field] ?? { action: 'reject', value: suggestion.suggested };
          const pct = Math.round((suggestion.confidence ?? 0) * 100);
          const confidenceTone =
            pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-slate-400';

          return (
            <div key={field} className="px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-700">{FIELD_LABELS[field]}</span>
                    <span className={`text-[9px] font-extrabold ${confidenceTone}`}>{pct}% confidence</span>
                  </div>
                  {entry.action === 'edit' ? (
                    <div className="mt-1.5 max-w-xs">
                      <EditControl
                        field={field}
                        value={entry.value}
                        onChange={(value) =>
                          setState((prev) => ({ ...prev, [field]: { ...prev[field], value } }))
                        }
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                      <span className="text-slate-400 line-through">{formatValue(suggestion.original)}</span>
                      {' → '}
                      <span className={entry.action === 'accept' ? 'text-emerald-700' : 'text-slate-400'}>
                        {entry.action === 'accept' ? formatValue(suggestion.suggested) : formatValue(suggestion.original) + ' (kept)'}
                      </span>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 font-medium mt-1">{suggestion.rationale}</p>
                </div>
                <ActionToggle
                  action={entry.action}
                  onChange={(action) =>
                    setState((prev) => ({
                      ...prev,
                      [field]: {
                        action,
                        value: action === 'edit' && !prev[field] ? suggestion.suggested : (prev[field]?.value ?? suggestion.suggested),
                      },
                    }))
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
