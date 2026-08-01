import { useState, useEffect } from 'react';
import { Shield, Clock, History, RefreshCw, Save, Trash2, Plus } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { toDisplayDate, toDateOnly } from '../../utils/safeDate';

// Admin surface for the lead-unlock entitlement engine.
//
// This is where the "no deploy needed" promise is actually delivered: limits,
// eligibility, campaign windows and the standing default are all edited here,
// and the backend reads them on the very next unlock. Nothing about pricing
// lives in application code.

const RULE_TYPES = [
  { value: 'UNLIMITED', label: 'Unlimited', hint: 'Every unlock allowed — used for launch campaigns' },
  { value: 'MONTHLY_QUOTA', label: 'Monthly quota', hint: 'N unlocks per calendar month' },
  { value: 'CREDITS', label: 'Lead credits', hint: 'Consumes a granted credit balance' },
  { value: 'BLOCKED', label: 'Blocked', hint: 'Explicit paywall — no unlocks' },
];

const emptyPolicy = {
  name: '',
  ruleType: 'UNLIMITED',
  rules: {},
  appliesTo: {},
  priority: 0,
  isActive: true,
  startsAt: null,
  endsAt: null,
};

export default function EntitlementPanel() {
  const { showToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/entitlement/policies').catch(() => []),
      api.get('/admin/entitlement/audit').catch(() => []),
    ])
      .then(([p, a]) => {
        setPolicies(Array.isArray(p) ? p : []);
        setAudit(Array.isArray(a) ? a : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (p) => setDraft({
    id: p.id,
    name: p.name,
    ruleType: p.rule_type,
    rules: p.rules || {},
    appliesTo: p.applies_to || {},
    priority: p.priority,
    isActive: p.is_active,
    startsAt: toDateOnly(p.starts_at, ''),
    endsAt: toDateOnly(p.ends_at, ''),
  });

  const save = () => {
    const body = {
      name: draft.name,
      ruleType: draft.ruleType,
      rules: draft.rules,
      appliesTo: draft.appliesTo,
      priority: Number(draft.priority) || 0,
      isActive: draft.isActive,
      startsAt: draft.startsAt || null,
      endsAt: draft.endsAt || null,
    };
    const req = draft.id
      ? api.put(`/admin/entitlement/policies/${draft.id}`, body)
      : api.post('/admin/entitlement/policies', body);
    req
      .then(() => {
        showToast(`Policy "${draft.name}" saved.`, 'success');
        setDraft(null);
        load();
      })
      // The backend rejects meaningless configurations (a quota with no
      // positive limit, an end before a start) — surface its reason rather
      // than a generic failure, since it names the exact field.
      .catch((err) => showToast(err.message || 'Failed to save policy.', 'error'));
  };

  const remove = (p) => {
    api.delete(`/admin/entitlement/policies/${p.id}`)
      .then(() => {
        showToast(`Policy "${p.name}" deleted.`, 'info');
        load();
      })
      .catch((err) => showToast(err.message || 'Failed to delete policy.', 'error'));
  };

  const isLive = (p) => {
    if (!p.is_active) return false;
    const now = Date.now();
    if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
    if (p.ends_at && new Date(p.ends_at).getTime() <= now) return false;
    return true;
  };

  const input = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#5B12D6] focus:bg-white transition';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl">
        <div>
          <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm">
            <Shield size={16} /> Lead Unlock Entitlement
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            The highest-priority policy that is active, in its date window and matches the
            merchant decides. Campaigns expire automatically back to the default.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50" title="Refresh">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setDraft({ ...emptyPolicy })}
            className="bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={13} /> New Policy
          </button>
        </div>
      </div>

      {/* Policy editor */}
      {draft && (
        <div className="bg-white border-2 border-[#5B12D6]/30 p-4 rounded-2xl flex flex-col gap-3">
          <h4 className="font-extrabold text-xs text-slate-800">
            {draft.id ? 'Edit policy' : 'New policy'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Name</span>
              <input className={input} value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Diwali Launch Benefit" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Rule type</span>
              <select className={input} value={draft.ruleType}
                onChange={(e) => setDraft({ ...draft, ruleType: e.target.value })}>
                {RULE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span className="text-[10px] text-slate-400">
                {RULE_TYPES.find((r) => r.value === draft.ruleType)?.hint}
              </span>
            </label>

            {draft.ruleType === 'MONTHLY_QUOTA' && (
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Unlocks per month</span>
                <input type="number" min="1" className={input}
                  value={draft.rules.limit ?? ''}
                  onChange={(e) => setDraft({ ...draft, rules: { ...draft.rules, limit: Number(e.target.value) } })} />
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Priority (higher wins)</span>
              <input type="number" className={input} value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Starts (optional)</span>
              <input type="date" className={input} value={draft.startsAt || ''}
                onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Ends (blank = never)</span>
              <input type="date" className={input} value={draft.endsAt || ''}
                onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
              <input type="checkbox" checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
              Active
            </label>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
              <input type="checkbox" checked={draft.appliesTo.verifiedOnly === true}
                onChange={(e) => setDraft({
                  ...draft,
                  appliesTo: e.target.checked ? { ...draft.appliesTo, verifiedOnly: true }
                                              : (({ verifiedOnly, ...rest }) => rest)(draft.appliesTo),
                })} />
              Verified merchants only
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={save}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1.5">
              <Save size={13} /> Save
            </button>
            <button onClick={() => setDraft(null)}
              className="border border-slate-200 text-slate-600 font-extrabold text-[10px] px-3.5 py-2 rounded-xl">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Policy list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
          Policies ({policies.length})
        </div>
        {policies.length === 0 ? (
          <p className="p-6 text-xs text-slate-400 text-center">
            {loading ? 'Loading…' : 'No policies configured — unlocking is denied until one exists.'}
          </p>
        ) : policies.map((p) => (
          <div key={p.id} className="px-4 py-3 border-b border-slate-50 last:border-0 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-800">{p.name}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                  isLive(p) ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {isLive(p) ? 'In force' : p.is_active ? 'Scheduled/expired' : 'Inactive'}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-violet-50 text-violet-700 border-violet-200">
                  {p.rule_type}{p.rule_type === 'MONTHLY_QUOTA' && p.rules?.limit ? ` · ${p.rules.limit}/mo` : ''}
                </span>
                {p.applies_to?.verifiedOnly && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                    Verified only
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>Priority {p.priority}</span>
                {p.ends_at && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> ends {toDisplayDate(p.ends_at)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-[10px] px-3 py-1.5 rounded-xl">
                Edit
              </button>
              <button onClick={() => remove(p)} title="Delete policy — unlock history is preserved"
                className="border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Audit trail */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
          <History size={12} /> Unlock audit trail ({audit.length})
        </div>
        {audit.length === 0 ? (
          <p className="p-6 text-xs text-slate-400 text-center">
            {loading ? 'Loading…' : 'No leads have been unlocked yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-slate-400 uppercase text-[9px]">
                  <th className="px-4 py-2 font-bold">When</th>
                  <th className="px-4 py-2 font-bold">Business</th>
                  <th className="px-4 py-2 font-bold">Actor</th>
                  <th className="px-4 py-2 font-bold">Policy applied</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id} className="border-t border-slate-50">
                    <td className="px-4 py-2 whitespace-nowrap">{toDisplayDate(a.unlocked_at)}</td>
                    <td className="px-4 py-2 font-mono text-[10px] text-slate-500">{a.business_id?.slice(0, 8)}</td>
                    <td className="px-4 py-2">{a.actor_role}</td>
                    {/* The snapshot, not a live lookup — stays truthful after
                        the policy is renamed or deleted. */}
                    <td className="px-4 py-2">{a.policy_name} <span className="text-slate-400">({a.policy_rule_type})</span></td>
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
