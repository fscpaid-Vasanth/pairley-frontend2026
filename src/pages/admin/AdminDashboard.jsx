import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  Shield,
  Search,
  Building2,
  Tag,
  ChevronRight,
  Calendar,
  MapPin,
  Sparkles,
  Clock,
  Briefcase,
  Sliders,
  Check,
  X,
  Headphones,
  Download,
  UserCheck,
  GitMerge
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { formatPrice } from '../../utils/constants';
import LaunchPassAdminPanel from './LaunchPassAdminPanel';
import ClaimRequestsPanel from './ClaimRequestsPanel';
import OfferPublisherPanel from './OfferPublisherPanel';
import AiOffersFromOnlinePanel from './AiOffersFromOnlinePanel';
import EntitlementPanel from './EntitlementPanel';
import LeadManagementPanel from './LeadManagementPanel';
import BusinessDuplicatesPanel from './BusinessDuplicatesPanel';
import SystemHealthTile from './SystemHealthTile';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active tab state: 'overview' | 'customers' | 'deals'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading & metrics states
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalBusinesses: 0,
    verifiedBusinesses: 0,
    pendingApprovals: 0,
    activeOffers: 0,
    completedDeals: 0,
    subscriptionRevenue: 0,
    monthlyRevenue: 0,
  });

  // Customer states
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Deal states
  const [deals, setDeals] = useState([]);
  const [dealSearch, setDealSearch] = useState('');
  const [loadingDeals, setLoadingDeals] = useState(false);

  // Support Helpdesk States
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  // Check auth roles
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('pairley_user') || 'null');
    const token = localStorage.getItem('pairley_token');
    if (!token || user?.role?.toLowerCase() !== 'admin') {
      showToast('Access denied: Admin credentials required.', 'error');
      navigate('/login?role=admin');
    }
  }, [navigate]);

  // Fetch metrics on load
  const fetchMetrics = () => {
    setLoading(true);
    api.get('/admin/dashboard')
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin metrics:', err);
        showToast('Failed to load dashboard metrics. Check backend connection.', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('pairley_user') || 'null');
    const token = localStorage.getItem('pairley_token');
    if (token && user?.role?.toLowerCase() === 'admin') {
      fetchMetrics();
    }
  }, []);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'customers') fetchCustomers();
    else if (tab === 'deals') fetchDeals();
    else if (tab === 'tickets') fetchTickets();
  };

  const fetchTickets = () => {
    setLoadingTickets(true);
    api.get('/support/tickets')
      .then((data) => {
        setTickets(data);
        setLoadingTickets(false);
      })
      .catch((err) => {
        console.error('Failed to fetch support tickets:', err);
        showToast('Error loading support tickets.', 'error');
        setLoadingTickets(false);
      });
  };

  const handleReplyTicket = (ticketId, status) => {
    if (!replyMessage.trim() && status === 'CLOSED') {
      // Allow closing without message
    } else if (!replyMessage.trim()) {
      showToast('Please enter a reply message.', 'error');
      return;
    }
    setReplying(true);
    api.put('/support/reply', { ticketId, status, replyMessage })
      .then((updatedTicket) => {
        showToast(`Ticket status updated to ${status}!`, 'success');
        setReplyMessage('');
        setReplying(false);
        fetchTickets();
        setSelectedTicket(updatedTicket);
      })
      .catch((err) => {
        console.error('Failed to reply to ticket:', err);
        showToast('Failed to send reply: ' + (err.message || 'Request failed'), 'error');
        setReplying(false);
      });
  };

  // Poll active support chat ticket for Admin in real-time
  useEffect(() => {
    if (!selectedTicket || !selectedTicket.subject.startsWith('[CHAT]') || selectedTicket.status === 'CLOSED') return;

    const interval = setInterval(() => {
      api.get(`/support/ticket/${selectedTicket.id}`)
        .then((res) => {
          setSelectedTicket(res);
        })
        .catch((err) => console.error('Failed to poll admin support chat:', err));
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedTicket?.id, selectedTicket?.status]);

  // Fetch Customers
  const fetchCustomers = () => {
    setLoadingCustomers(true);
    api.get('/admin/customers')
      .then((data) => {
        setCustomers(data);
        setLoadingCustomers(false);
      })
      .catch((err) => {
        console.error('Failed to load customer list:', err);
        showToast('Error loading customer onboarding directory.', 'error');
        setLoadingCustomers(false);
      });
  };

  // Fetch Active/All Deals
  const fetchDeals = () => {
    setLoadingDeals(true);
    api.get('/offers/list?status=ALL')
      .then((data) => {
        // Map backend deals to local keys
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          originalPrice: d.original_price,
          offerPrice: d.offer_price,
          requiredPeople: d.required_people,
          joinedPeople: d.joined_people,
          status: d.status,
          businessName: d.business?.business_name || 'Store',
          city: d.business?.city || 'Bangalore',
          end_date: d.end_date,
        }));
        setDeals(mapped);
        setLoadingDeals(false);
      })
      .catch((err) => {
        console.error('Failed to load deals list:', err);
        showToast('Error fetching deals details.', 'error');
        setLoadingDeals(false);
      });
  };

  // Moderate Deal Status
  const handleModerateOffer = (offerId, newStatus, dealTitle) => {
    api.put(`/admin/offers/moderate/${offerId}`, { status: newStatus })
      .then(() => {
        showToast(`Deal "${dealTitle}" is now ${newStatus}!`, 'success');
        fetchDeals();
        fetchMetrics(); // Refresh active deals count
      })
      .catch((err) => {
        console.error('Failed to moderate offer:', err);
        showToast('Failed to update deal status.', 'error');
      });
  };

  // Filters
  const filteredCustomers = customers.filter((c) => {
    const search = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.mobile.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search)) ||
      (c.city && c.city.toLowerCase().includes(search))
    );
  });

  const filteredDeals = deals.filter((d) => {
    const search = dealSearch.toLowerCase();
    return (
      d.title.toLowerCase().includes(search) ||
      d.businessName.toLowerCase().includes(search) ||
      d.category.toLowerCase().includes(search)
    );
  });

  return (
    <div className="page-wrapper min-h-screen py-10">
      <div className="admin-dashboard-container container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              🛡️ Admin Management Console
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Verify Onboardings • Moderate Deals • Analyze Operations
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/60 border border-slate-200/50 backdrop-blur-md rounded-2xl p-2 shadow-sm">
            <span className="material-symbols-outlined text-[#5B12D6] text-lg">admin_panel_settings</span>
            <span className="text-xs font-bold text-slate-700">Super Admin Mode</span>
          </div>
        </div>

        {/* Tab Controllers */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-200/60 pb-4">
          <button
            onClick={() => handleTabChange('overview')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            Performance Overview
          </button>
          {/* 2026-08-12 — moved up front: the AI Offer Collector is now
              Pairley's primary acquisition engine (public-offer volume, not
              a secondary admin convenience), so it gets top billing right
              after the overview. */}
          <button
            onClick={() => handleTabChange('ai-offers-from-online')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'ai-offers-from-online'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} />
            AI Offers From Online
          </button>
          <button
            onClick={() => handleTabChange('customers')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'customers'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Users size={14} />
            Customer Directory
          </button>
          <button
            onClick={() => handleTabChange('deals')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'deals'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Tag size={14} />
            Deals Moderation
          </button>
          <button
            onClick={() => handleTabChange('offer-publisher')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'offer-publisher'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} />
            Offer Publisher
          </button>
          <button
            onClick={() => handleTabChange('leads')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'leads'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Users size={14} />
            Leads
          </button>
          <button
            onClick={() => handleTabChange('claims')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'claims'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <UserCheck size={14} />
            Claim Requests
          </button>
          <button
            onClick={() => handleTabChange('duplicates')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'duplicates'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <GitMerge size={14} />
            Business Duplicates
          </button>
          <button
            onClick={() => handleTabChange('tickets')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Headphones size={14} />
            Support Helpdesk
          </button>
          <button
            onClick={() => handleTabChange('launchpass')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'launchpass'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} />
            Launch Pass
          </button>
          {/* 2026-08-12 — de-prioritized, not removed: still the real
              diagnostic tool for "why can't this merchant unlock" (claim
              credits, Basic/Pro/Premium policies, Diwali while it ran —
              all just rows here), moved to the end now that it's no longer
              part of the primary day-to-day workflow. */}
          <button
            onClick={() => handleTabChange('entitlement')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'entitlement'
                ? 'active-tab bg-[#5B12D6] text-white shadow-md shadow-[#5B12D6]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Shield size={14} />
            Entitlement
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#5B12D6]/10 to-[#22C55E]/5 border border-[#5B12D6]/20 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#5B12D6]/5 rounded-full blur-xl"></div>
                <Users className="text-[#5B12D6] mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.totalCustomers}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Customers</div>
              </div>

              <div className="bg-gradient-to-br from-[#5B12D6]/10 to-[#22C55E]/5 border border-[#5B12D6]/20 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#22C55E]/5 rounded-full blur-xl"></div>
                <Store className="text-[#22C55E] mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.totalBusinesses}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Shops ({metrics.verifiedBusinesses} Verified)</div>
              </div>

              <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-200/30 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl"></div>
                <AlertCircle className="text-rose-500 mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.pendingApprovals}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pending Approvals</div>
              </div>

              <div className="bg-gradient-to-br from-[#5B12D6]/10 to-[#22C55E]/5 border border-[#5B12D6]/20 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                <Tag className="text-indigo-600 mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.activeOffers}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Active Deal Listings</div>
              </div>
            </div>

            {/* Revenue Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl p-6 shadow-md text-left flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Subscription Revenue</h3>
                  <div className="text-3xl font-black text-slate-800 flex items-center gap-1">
                    <IndianRupee size={22} className="text-[#22C55E]" />
                    {formatPrice(metrics.subscriptionRevenue).replace('₹', '')}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2">Active business sub collections</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                  💰
                </div>
              </div>

              <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl p-6 shadow-md text-left flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">This Month Revenue Collection</h3>
                  <div className="text-3xl font-black text-slate-800 flex items-center gap-1">
                    <IndianRupee size={22} className="text-[#5B12D6]" />
                    {formatPrice(metrics.monthlyRevenue).replace('₹', '')}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2">Collected since 1st of this month</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-2xl">
                  📈
                </div>
              </div>
            </div>

            <SystemHealthTile />
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Search Customer */}
            <div className="flex justify-between items-center bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 hidden sm:block">Customer Registry List ({filteredCustomers.length})</h3>
              <div className="relative w-full sm:max-w-xs ml-auto">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 focus:outline-none focus:border-[#5B12D6] text-xs font-semibold"
                />
              </div>
            </div>

            {/* Customers table */}
            {loadingCustomers ? (
              <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading customers...</div>
            ) : filteredCustomers.length > 0 ? (
              <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">City Location</th>
                      <th className="px-6 py-4">State/Pincode</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100"
                              src={c.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                              alt={c.name}
                            />
                            <div>
                              <div className="text-slate-800 font-bold">{c.name}</div>
                              <div className="text-[9px] text-slate-400 font-semibold">{c.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>📞 {c.mobile}</div>
                          {c.email && <div className="text-slate-400 mt-0.5">✉️ {c.email}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] text-slate-500">{c.city || 'Not Specified'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>{c.state || 'N/A'}</div>
                          {c.pincode && <div className="text-slate-400 mt-0.5">Pin: {c.pincode}</div>}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {new Date(c.created_at || c.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 border border-slate-200/30 rounded-3xl text-slate-400 font-bold text-sm">
                No customer accounts found matching search filters.
              </div>
            )}
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Deals search console */}
            <div className="flex justify-between items-center bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 hidden sm:block">Store Deals Moderation ({filteredDeals.length})</h3>
              <div className="relative w-full sm:max-w-xs ml-auto">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search deals or stores..."
                  value={dealSearch}
                  onChange={(e) => setDealSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 focus:outline-none focus:border-[#5B12D6] text-xs font-semibold"
                />
              </div>
            </div>

            {/* Deals List */}
            {loadingDeals ? (
              <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading active offers...</div>
            ) : filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.map((d) => (
                  <div key={d.id} className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                    <div className="space-y-4">
                      {/* Deal title, status & store */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide border ${
                            d.status === 'active' || d.status === 'ACTIVE'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : d.status === 'draft' || d.status === 'DRAFT'
                              ? 'bg-slate-50 border-slate-200 text-slate-500'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {d.status}
                          </span>
                          <span className="text-[9px] text-[#5B12D6] font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{d.category}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">{d.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">🏪 {d.businessName} • {d.city}</p>
                      </div>

                      {/* Pricing Tiers & Joins */}
                      <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-3 text-xs font-semibold">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Discount Pricing</p>
                          <span className="text-slate-800 font-bold">{formatPrice(d.offerPrice)}</span>
                          <span className="text-[10px] text-slate-400 font-semibold line-through ml-1.5">{formatPrice(d.originalPrice)}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Group Co-buy progress</p>
                          <span className="text-[#5B12D6] font-extrabold">{d.joinedPeople}</span>
                          <span className="text-slate-400 font-bold"> / {d.requiredPeople} Joined</span>
                        </div>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex gap-2.5 mt-5">
                      {(d.status === 'CLOSED' || d.status === 'DRAFT' || d.status === 'REJECTED') && (
                        <button
                          onClick={() => handleModerateOffer(d.id, 'ACTIVE', d.title)}
                          className="flex-1 btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <Check size={12} />
                          Activate Deal
                        </button>
                      )}
                      {(d.status === 'ACTIVE' || d.status === 'DRAFT' || d.status === 'PENDING_APPROVAL') && (
                        <button
                          onClick={() => handleModerateOffer(d.id, 'CLOSED', d.title)}
                          className="flex-1 btn border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <X size={12} />
                          Close Listing
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 border border-slate-200/30 rounded-3xl text-slate-400 font-bold text-sm">
                No active store deal listings found.
              </div>
            )}
          </div>
        )}

        {activeTab === 'offer-publisher' && <OfferPublisherPanel />}
        {activeTab === 'entitlement' && <EntitlementPanel />}

        {activeTab === 'leads' && <LeadManagementPanel />}

        {activeTab === 'claims' && <ClaimRequestsPanel />}
        {activeTab === 'ai-offers-from-online' && <AiOffersFromOnlinePanel />}

        {activeTab === 'duplicates' && <BusinessDuplicatesPanel />}

        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <h3 className="text-lg font-black text-slate-800">Help Desk Support Tickets</h3>
            
            {loadingTickets ? (
              <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading support tickets...</div>
            ) : tickets.length > 0 ? (
              <div className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl shadow-md overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600 min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Ticket Type</th>
                      <th className="px-6 py-4">Subject / Ref ID</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((t) => {
                      const isChat = t.subject.startsWith('[CHAT]');
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            {isChat ? (
                              <span className="bg-indigo-50 border border-indigo-150 text-[#5B12D6] text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">💬 Live Chat</span>
                            ) : (
                              <span className="bg-amber-50 border border-amber-150 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">🎫 Help Ticket</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-800 font-bold text-sm">{t.subject}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-[400px]">
                              {t.description.split('\n')[0]}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(t.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                              t.status === 'OPEN'
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-700 animate-pulse'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedTicket(t);
                                setReplyMessage('');
                              }}
                              className="px-3.5 py-1.5 bg-[#5B12D6] hover:bg-[#430bb0] text-white text-[10px] font-extrabold rounded-xl shadow-sm transition-all"
                            >
                              Open console
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 border border-slate-200 rounded-3xl text-slate-400 font-bold text-sm">
                🎉 No support tickets in queue!
              </div>
            )}
          </div>
        )}

        {/* Support Ticket Detail Overlay Modal */}
        {selectedTicket && (
          <div className="review-modal-overlay flex items-center justify-center p-4 animate-modalFadeIn" onClick={() => setSelectedTicket(null)}>
            <div className="review-modal-container bg-white border border-slate-200 shadow-2xl rounded-3xl p-5 md:p-6 max-w-2xl w-full relative overflow-hidden flex flex-col animate-modalSlideUp" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-800">
                      {selectedTicket.subject.startsWith('[CHAT]') ? '💬 Live Support Chat' : '🎫 Support Helpdesk'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                      selectedTicket.status === 'OPEN'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    Created: {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition" onClick={() => setSelectedTicket(null)}>
                  <X size={18} />
                </button>
              </div>

              {/* Content Panel */}
              <div className="overflow-y-auto max-h-[50vh] pr-1 mb-4 text-left font-semibold text-xs text-slate-600">
                {selectedTicket.subject.startsWith('[CHAT]') ? (
                  // Conversational bubbles view
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[180px] max-h-[300px] overflow-y-auto flex flex-col">
                    {selectedTicket.description.split('\n').filter(line => line.includes(' [') && line.includes(']: ')).map((line, idx) => {
                      const match = line.match(/^(User|Support|Bot)\s+\[([^\]]+)\]:\s+(.*)$/);
                      if (match) {
                        const sender = match[1].toLowerCase();
                        const time = match[2];
                        const text = match[3];
                        const isSupport = sender === 'support';
                        return (
                          <div key={idx} className={`flex ${isSupport ? 'justify-end' : 'justify-start'} w-full`}>
                            <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[80%] ${
                              isSupport ? 'bg-[#5B12D6] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                            }`}>
                              <div className="text-[8px] opacity-75 font-bold mb-0.5">{match[1]} • {time}</div>
                              {text}
                            </div>
                          </div>
                        );
                      }
                      return <div key={idx} className="text-center text-[10px] text-slate-400">{line}</div>;
                    })}
                  </div>
                ) : (
                  // Regular email/ticket description
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 whitespace-pre-wrap leading-relaxed text-slate-700">
                    {selectedTicket.description}
                  </div>
                )}

                {/* Reply Form */}
                {selectedTicket.status === 'OPEN' && (
                  <div className="mt-4 space-y-2">
                    <label className="text-[10px] uppercase text-slate-400 font-bold block">
                      {selectedTicket.subject.startsWith('[CHAT]') ? 'Type Live Chat Reply' : 'Type Ticket Email Reply'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={selectedTicket.subject.startsWith('[CHAT]') ? "Type message..." : "Type reply details..."}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="flex-1 border border-slate-200 focus:border-[#5B12D6] rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleReplyTicket(selectedTicket.id, 'OPEN');
                          }
                        }}
                      />
                      <button
                        disabled={replying}
                        onClick={() => handleReplyTicket(selectedTicket.id, 'OPEN')}
                        className="px-4 py-2.5 bg-[#5B12D6] hover:bg-[#430bb0] text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center border-t border-slate-150 pt-4">
                {selectedTicket.status === 'OPEN' ? (
                  <button
                    disabled={replying}
                    onClick={() => handleReplyTicket(selectedTicket.id, 'CLOSED')}
                    className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Close Help Ticket
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 uppercase font-bold">🔒 Session Completed</span>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'launchpass' && (
          <div className="animate-fadeIn">
            <LaunchPassAdminPanel />
          </div>
        )}

      </div>
    </div>
  );
}

