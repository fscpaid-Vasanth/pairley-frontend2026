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
  Eye,
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
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { formatPrice } from '../../utils/constants';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active tab state: 'overview' | 'shops' | 'customers' | 'deals'
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

  // Shop onboarding states
  const [businesses, setBusinesses] = useState([]);
  const [selectedShopFilter, setSelectedShopFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [shopSearch, setShopSearch] = useState('');
  const [loadingShops, setLoadingShops] = useState(false);

  // Customer states
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Deal states
  const [deals, setDeals] = useState([]);
  const [dealSearch, setDealSearch] = useState('');
  const [loadingDeals, setLoadingDeals] = useState(false);

  // Modal view states for documents
  const [docModal, setDocModal] = useState(null); // { type: 'aadhaar'|'pan'|'shop', title: string, src: string } | null

  // Check auth roles
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('pairley_user') || 'null');
    const token = localStorage.getItem('pairley_token');
    if (!token || user?.role?.toLowerCase() !== 'admin') {
      showToast('Access denied: Admin credentials required.', 'error');
      navigate('/login');
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
    fetchMetrics();
  }, []);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'shops') fetchBusinesses();
    else if (tab === 'customers') fetchCustomers();
    else if (tab === 'deals') fetchDeals();
  };

  // Fetch Businesses/Shop Owners
  const fetchBusinesses = () => {
    setLoadingShops(true);
    api.get(`/admin/businesses?status=${selectedShopFilter === 'ALL' ? '' : selectedShopFilter}`)
      .then((data) => {
        setBusinesses(data);
        setLoadingShops(false);
      })
      .catch((err) => {
        console.error('Failed to load shop owners:', err);
        showToast('Error loading shop onboarding list.', 'error');
        setLoadingShops(false);
      });
  };

  // Trigger businesses refetch when filter tab changes
  useEffect(() => {
    if (activeTab === 'shops') {
      fetchBusinesses();
    }
  }, [selectedShopFilter, activeTab]);

  // Verify Shop Owner Onboarding
  const handleVerifyBusiness = (businessId, newStatus, businessName) => {
    api.put(`/admin/business/verify/${businessId}`, { status: newStatus })
      .then(() => {
        showToast(`Business "${businessName}" successfully marked as ${newStatus}!`, 'success');
        fetchBusinesses();
        fetchMetrics(); // Refresh approvals counter
      })
      .catch((err) => {
        console.error('Failed to verify business:', err);
        showToast('Failed to update business verification status.', 'error');
      });
  };

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
  const filteredBusinesses = businesses.filter((b) => {
    const search = shopSearch.toLowerCase();
    return (
      b.business_name.toLowerCase().includes(search) ||
      b.owner_name.toLowerCase().includes(search) ||
      b.mobile.includes(search) ||
      b.email.toLowerCase().includes(search)
    );
  });

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
            <span className="material-symbols-outlined text-[#4E2BC4] text-lg">admin_panel_settings</span>
            <span className="text-xs font-bold text-slate-700">Super Admin Mode</span>
          </div>
        </div>

        {/* Tab Controllers */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-200/60 pb-4">
          <button
            onClick={() => handleTabChange('overview')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'active-tab bg-[#4E2BC4] text-white shadow-md shadow-[#4E2BC4]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            Performance Overview
          </button>
          <button
            onClick={() => handleTabChange('shops')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'shops'
                ? 'active-tab bg-[#4E2BC4] text-white shadow-md shadow-[#4E2BC4]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Store size={14} />
            Shop Onboardings {metrics.pendingApprovals > 0 && <span className="admin-tab-badge bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">{metrics.pendingApprovals}</span>}
          </button>
          <button
            onClick={() => handleTabChange('customers')}
            className={`admin-tab-btn flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'customers'
                ? 'active-tab bg-[#4E2BC4] text-white shadow-md shadow-[#4E2BC4]/20'
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
                ? 'active-tab bg-[#4E2BC4] text-white shadow-md shadow-[#4E2BC4]/20'
                : 'bg-white/75 border border-slate-200/40 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Tag size={14} />
            Deals Moderation
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#4E2BC4]/10 to-[#10B981]/5 border border-[#4E2BC4]/20 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#4E2BC4]/5 rounded-full blur-xl"></div>
                <Users className="text-[#4E2BC4] mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.totalCustomers}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Customers</div>
              </div>

              <div className="bg-gradient-to-br from-[#4E2BC4]/10 to-[#10B981]/5 border border-[#4E2BC4]/20 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#10B981]/5 rounded-full blur-xl"></div>
                <Store className="text-[#10B981] mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.totalBusinesses}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Shops ({metrics.verifiedBusinesses} Verified)</div>
              </div>

              <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-200/30 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl"></div>
                <AlertCircle className="text-rose-500 mb-4" size={24} />
                <div className="text-3xl font-black text-slate-800">{metrics.pendingApprovals}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pending Approvals</div>
              </div>

              <div className="bg-gradient-to-br from-[#4E2BC4]/10 to-[#10B981]/5 border border-[#4E2BC4]/20 backdrop-blur-md rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
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
                    <IndianRupee size={22} className="text-[#10B981]" />
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
                    <IndianRupee size={22} className="text-[#4E2BC4]" />
                    {formatPrice(metrics.monthlyRevenue).replace('₹', '')}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2">Collected since 1st of this month</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-2xl">
                  📈
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shops' && (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Filter Tabs & Search Console */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 border border-slate-200/40 rounded-3xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedShopFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-extrabold tracking-wide uppercase transition-all ${
                      selectedShopFilter === filter
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100/80 hover:bg-slate-200/60 text-slate-600'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Shop Owners' : filter}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stores or owners..."
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 focus:outline-none focus:border-[#4E2BC4] text-xs font-semibold"
                />
              </div>
            </div>

            {/* Shop list */}
            {loadingShops ? (
              <div className="text-center py-20 text-slate-400 font-bold text-sm">Loading onboarding stores...</div>
            ) : filteredBusinesses.length > 0 ? (
              <div className="space-y-4">
                {filteredBusinesses.map((b) => (
                  <div key={b.id} className="bg-white/80 border border-slate-200/50 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-md transition-all duration-300 hover:shadow-lg relative overflow-hidden flex flex-col xl:flex-row justify-between gap-6">
                    {/* Basic info */}
                    <div className="flex-1 space-y-4 text-left">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-black text-slate-800">{b.business_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                          b.verification_status === 'APPROVED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : b.verification_status === 'REJECTED'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'
                        }`}>
                          {b.verification_status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">{b.business_type}</span>
                      </div>

                      {/* Store detail fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Shop Owner</p>
                          <p className="text-slate-700 font-bold flex items-center gap-1">👤 {b.owner_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Mobile Contact</p>
                          <a href={`tel:${b.mobile}`} className="text-[#4E2BC4] hover:underline font-bold">📞 {b.mobile}</a>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                          <a href={`mailto:${b.email}`} className="text-[#4E2BC4] hover:underline font-bold">✉️ {b.email || 'No email'}</a>
                        </div>
                        <div className="md:col-span-2 xl:col-span-3">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Physical Store Address</p>
                          <p className="text-slate-700 font-bold flex items-center gap-1">
                            📍 {b.address}, {b.city}, {b.state} - {b.pincode}
                            {b.mall_name && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 text-[10px] ml-1">🏪 {b.mall_name}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Document numbers */}
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Aadhaar Number</span>
                          <span className="text-slate-700 font-bold">{b.aadhaar_number || 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">PAN Card Number</span>
                          <span className="text-slate-700 font-bold">{b.pan_number || 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">GSTIN Registration</span>
                          <span className="text-slate-700 font-bold">{b.gst_number || 'Not Provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents attachment & action buttons */}
                    <div className="flex flex-col justify-between gap-4 xl:w-64 flex-shrink-0">
                      {/* Onboarding Documents previews */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1 mb-2">Verification Documents</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            disabled={!b.shop_photo}
                            onClick={() => setDocModal({ type: 'shop', title: 'Shop Photo', src: b.shop_photo })}
                            className={`p-2 rounded-xl border text-[9px] font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                              b.shop_photo ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>🏪</span>
                            <span>Shop Photo</span>
                          </button>
                          <button
                            disabled={!b.aadhaar_photo}
                            onClick={() => setDocModal({ type: 'aadhaar', title: 'Aadhaar Card Photo', src: b.aadhaar_photo })}
                            className={`p-2 rounded-xl border text-[9px] font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                              b.aadhaar_photo ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>👤</span>
                            <span>Aadhaar</span>
                          </button>
                          <button
                            disabled={!b.pan_photo}
                            onClick={() => setDocModal({ type: 'pan', title: 'PAN Card Photo', src: b.pan_photo })}
                            className={`p-2 rounded-xl border text-[9px] font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                              b.pan_photo ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>📇</span>
                            <span>PAN Card</span>
                          </button>
                        </div>
                      </div>

                      {/* Onboarding approvals actions */}
                      <div className="flex gap-2.5 mt-auto">
                        {(b.verification_status === 'PENDING' || b.verification_status === 'REJECTED') && (
                          <button
                            onClick={() => handleVerifyBusiness(b.id, 'APPROVED', b.business_name)}
                            className="flex-1 btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Check size={14} />
                            Approve
                          </button>
                        )}
                        {(b.verification_status === 'PENDING' || b.verification_status === 'APPROVED') && (
                          <button
                            onClick={() => handleVerifyBusiness(b.id, 'REJECTED', b.business_name)}
                            className="flex-1 btn border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 border border-slate-200/30 rounded-3xl text-slate-400 font-bold text-sm">
                No stores found matching active status filter.
              </div>
            )}
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 focus:outline-none focus:border-[#4E2BC4] text-xs font-semibold"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 focus:outline-none focus:border-[#4E2BC4] text-xs font-semibold"
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
                          <span className="text-[9px] text-[#4E2BC4] font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{d.category}</span>
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
                          <span className="text-[#4E2BC4] font-extrabold">{d.joinedPeople}</span>
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

        {/* Expandable Documents Image Modal */}
        {docModal && (
          <div className="admin-doc-modal-overlay flex items-center justify-center p-4" onClick={() => setDocModal(null)}>
            <div className="admin-doc-modal bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 max-w-xl w-full relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button className="admin-doc-modal-close absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition" onClick={() => setDocModal(null)}>
                <X size={20} />
              </button>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{docModal.title}</h3>
              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center min-h-[300px]">
                {docModal.src ? (
                  <img src={docModal.src} alt={docModal.title} className="max-w-full max-h-[500px] object-contain" />
                ) : (
                  <span className="text-slate-400 font-bold text-xs">No attachment image uploaded</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
