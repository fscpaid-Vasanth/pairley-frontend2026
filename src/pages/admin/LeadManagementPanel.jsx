import { useState, useEffect, useCallback } from 'react';
import { Users, Phone, Tag, Store, Clock, Globe, Smartphone } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
];

// NEW/CONTACTED/CONVERTED/NOT_INTERESTED is Lead's existing operational
// status — the same field Module 13's merchant-facing lead flow already
// keys off. Deliberately not renamed to a different label set here: doing
// so would mean either two different vocabularies for the same underlying
// enum (confusing) or changing the enum values platform-wide, which
// touches Module 13's merchant coordination flow and is a bigger, separate
// decision this table shouldn't make unilaterally.
const STATUS_STYLES = {
  NEW: 'bg-blue-50 text-blue-600 border-blue-200',
  CONTACTED: 'bg-amber-50 text-amber-600 border-amber-200',
  CONVERTED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  NOT_INTERESTED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const SOURCE_LABELS = {
  WEBSITE: 'Website',
  MOBILE_APP: 'Mobile App',
};

/**
 * Lead-generation revision — the admin lead management dashboard. Pairley
 * no longer brokers contact between customer and merchant directly; every
 * "Show Interest" click becomes a Lead here instead, platform-wide (not
 * scoped to one merchant, unlike the merchant-facing LeadsPage), for the
 * admin to follow up manually or hand off to the merchant.
 */
export default function LeadManagementPanel() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get(`/admin/leads${qs}`)
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to load leads.', 'error');
        setLoading(false);
      });
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex flex-wrap gap-1.5 bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold tracking-wide uppercase transition-all ${
              statusFilter === f.value
                ? 'bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-bold text-sm flex flex-col items-center gap-2">
          <Users size={28} className="text-slate-300" />
          No interested customers yet.
        </div>
      ) : (
        <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[940px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Mobile</th>
                <th className="px-4 py-4">Offer</th>
                <th className="px-4 py-4">Merchant</th>
                <th className="px-4 py-4">Date &amp; Time</th>
                <th className="px-4 py-4">Source</th>
                <th className="px-4 py-4">Follow-up Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors align-top">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                      <Users size={12} className="text-slate-400" />
                      {lead.customer_name}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" /> {lead.customer_mobile}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1">
                      <Tag size={11} className="text-slate-400" /> {lead.offer_name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1">
                      <Store size={11} className="text-slate-400" /> {lead.shop_name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      {new Date(lead.created_at).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      {lead.source === 'MOBILE_APP' ? (
                        <Smartphone size={11} className="text-slate-400" />
                      ) : (
                        <Globe size={11} className="text-slate-400" />
                      )}
                      {SOURCE_LABELS[lead.source] || SOURCE_LABELS.WEBSITE}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${STATUS_STYLES[lead.status] || STATUS_STYLES.NEW}`}
                    >
                      {lead.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
