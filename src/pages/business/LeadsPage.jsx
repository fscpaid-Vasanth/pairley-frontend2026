import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, MessageCircle, Phone, Tag } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { buildContactLeadMessage, openWhatsApp } from '../../utils/whatsapp';
import BusinessNav from '../../components/BusinessNav';
import './LeadsPage.css';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'CONVERTED', label: 'Converted' },
  { id: 'NOT_INTERESTED', label: 'Not Interested' },
];

const STATUS_BADGE = {
  NEW: 'bg-amber-50 text-amber-700 border-amber-100',
  CONTACTED: 'bg-blue-50 text-blue-700 border-blue-100',
  CONVERTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  NOT_INTERESTED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function LeadsPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeads = () => {
    setLoading(true);
    api.get('/leads')
      .then((data) => {
        setLeads(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load leads:', err);
        setLeads([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = (leadId, status) => {
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    api.put(`/leads/${leadId}/status`, { status })
      .catch((err) => {
        console.error('Failed to update lead status:', err);
        showToast('Failed to update lead status.', 'error');
        setLeads(previous);
      });
  };

  const handleContact = (lead) => {
    const message = buildContactLeadMessage({
      customerName: lead.customer_name,
      offerName: lead.offer_name,
      shopName: lead.shop_name,
    });
    openWhatsApp(lead.customer_mobile, message);
    if (lead.status === 'NEW') {
      handleStatusChange(lead.id, 'CONTACTED');
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (activeTab !== 'all' && lead.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lead.customer_name?.toLowerCase().includes(q) ||
        lead.offer_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countFor = (status) =>
    status === 'all' ? leads.length : leads.filter((l) => l.status === status).length;

  return (
    <div className="leads-page page-wrapper py-6 text-left">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Leads 🎯
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Everyone who's shown interest in your offers — contact them and track where they are.
            </p>
          </div>
        </div>

        <BusinessNav />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm mb-4">
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-max overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-[#5B12D6] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                {tab.label}
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  {countFor(tab.id)}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search customer or offer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#5B12D6] focus:bg-white transition"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="bg-white border border-slate-200 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-4 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 border-4 border-[#5B12D6] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading leads...</p>
            </motion.div>
          ) : filteredLeads.length > 0 ? (
            <motion.div
              key="feed"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm hover:shadow hover:border-slate-300 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">{lead.customer_name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_BADGE[lead.status] || STATUS_BADGE.NEW}`}
                      >
                        {lead.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag size={11} /> {lead.offer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={11} /> {lead.customer_mobile}
                      </span>
                      <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="text-[10px] font-bold border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-[#5B12D6] bg-white text-slate-600"
                    >
                      {STATUS_TABS.filter((t) => t.id !== 'all').map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleContact(lead)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                    >
                      <MessageCircle size={13} /> Contact
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="bg-white border border-slate-200 p-12 text-center rounded-2xl flex flex-col items-center gap-4 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Users size={32} className="text-slate-300" />
              <h4 className="font-bold text-slate-800">No Leads Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                When a customer shows interest in one of your offers, they'll show up here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
