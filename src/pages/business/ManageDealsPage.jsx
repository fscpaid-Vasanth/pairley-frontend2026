import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Pencil, 
  Pause,
  Trash2,
  Archive,
  Plus,
  Eye, 
  Users, 
  LayoutGrid, 
  List, 
  Play, 
  ArrowUpRight, 
  X,
  Undo2,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// Removed mock imports to prevent dashboard fallbacks
import { formatPrice } from '../../utils/constants';
import { api } from '../../utils/api';
import { getCategoryById } from '../../data/categories';
import { getDealMode, getOfferTypeIcon, getOfferTypeMeta } from '../../utils/offerTypes';
import ImageWithFallback from '../../components/ImageWithFallback';
import BusinessNav from '../../components/BusinessNav';
import './ManageDealsPage.css';

export default function ManageDealsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('pairley_token');
  const business = JSON.parse(localStorage.getItem('pairley_user') || 'null');

  useEffect(() => {
    if (!token || !business) {
      navigate('/login');
    }
  }, [token, business, navigate]);

  const [dealsList, setDealsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !business) return;
    const bId = business.id;
    api.get(`/offers/list?businessId=${bId}&status=ALL`)
      .then((data) => {
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          category: d.category ? d.category.toLowerCase() : 'shopping',
          offer_type: d.offer_type,
          mode: getDealMode(d.offer_type),
          originalPrice: d.original_price,
          pairleyPrice: d.offer_price,
          images: [d.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
          businessOwner: {
            id: d.business_id,
            name: d.business?.business_name || 'Local Seller',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (d.business?.business_name || 'Seller'),
            rating: 4.5
          },
          interestCount: d.joined_people || 0,
          maxParticipants: d.required_people || 2,
          location: d.business?.city || 'Select Location',
          validUntil: d.end_date || '2026-12-31',
          status: d.status ? d.status.toLowerCase() : 'active',
          createdAt: d.created_at || d.createdAt || '2026-06-01'
        }));
        setDealsList(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load merchant deals:', err);
        setDealsList([]);
        setLoading(false);
      });
  }, [business.id]);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'paused', 'paired', 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Modal Preview state
  const [previewDeal, setPreviewDeal] = useState(null);

  // Undo Delete state
  const [deletedDeal, setDeletedDeal] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Status handlers
  const handleToggleStatus = (dealId) => {
    const deal = dealsList.find(d => d.id === dealId);
    if (!deal) return;
    const nextStatus = deal.status === 'active' ? 'paused' : 'active';

    // Optimistic UI update
    setDealsList(prev => prev.map(d => d.id === dealId ? { ...d, status: nextStatus } : d));

    api.put(`/offers/${dealId}/status`, { status: nextStatus.toUpperCase() })
      .catch((err) => {
        console.error('Failed to update status on server:', err);
      });
  };

  const handleDelete = (dealId) => {
    const targetDeal = dealsList.find(d => d.id === dealId);
    if (targetDeal) {
      setDeletedDeal(targetDeal);
      setDealsList(prev => prev.filter(d => d.id !== dealId));
      setShowUndoToast(true);
      
      // Auto-hide undo notification after 6 seconds and execute backend delete
      const timeoutId = setTimeout(() => {
        setShowUndoToast(prev => {
          if (prev) {
            api.delete(`/offers/delete/${dealId}`)
              .catch(err => console.error('Failed to delete offer on server:', err));
            return false;
          }
          return prev;
        });
      }, 6000);
      
      targetDeal._deleteTimeoutId = timeoutId;
    }
  };

  const handleUndoDelete = () => {
    if (deletedDeal) {
      if (deletedDeal._deleteTimeoutId) {
        clearTimeout(deletedDeal._deleteTimeoutId);
      }
      setDealsList(prev => [...prev, deletedDeal].sort((a, b) => a.id.localeCompare(b.id)));
      setDeletedDeal(null);
      setShowUndoToast(false);
    }
  };

  // Status mapping to tab filters
  const filteredDeals = dealsList.filter((deal) => {
    // Tab matching
    if (activeTab === 'active' && deal.status !== 'active') return false;
    if (activeTab === 'paired' && deal.status !== 'paired') return false;
    if (activeTab === 'expired' && deal.status !== 'expired') return false;
    if (activeTab === 'paused' && deal.status !== 'paused') return false;

    // Search matching
    if (searchQuery && !deal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // Dynamic tab counts based on state
  const getTabCount = (tab) => {
    if (tab === 'all') return dealsList.length;
    return dealsList.filter(d => d.status === tab).length;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Paused
          </span>
        );
      case 'paired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Paired
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/50">
            {status}
          </span>
        );
    }
  };

  if (!token || !business) {
    return null;
  }

  return (
    <div className="manage-deals-page page-wrapper py-6">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* ===== Toast Notifications ===== */}
        <AnimatePresence>
          {showUndoToast && (
            <motion.div 
              className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-800"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400">Action Completed</span>
                <span className="text-sm font-bold mt-0.5">Listing archived successfully</span>
              </div>
              <button 
                onClick={handleUndoDelete}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#7C3AED] hover:text-[#8B5CF6] text-xs font-extrabold rounded-xl transition"
              >
                <Undo2 size={13} /> Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ===== Page Header ===== */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                Manage Listings 📋
              </h2>
              <p className="text-sm text-slate-500 mt-1">Review active groups, pause BOGO matches, or edit pricing.</p>
            </div>
            <Link to="/business/create-deal" className="btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold px-5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10">
              <Plus size={16} /> Create Listing
            </Link>
          </div>

          {/* Seller Sub-Navigation */}
          <BusinessNav />

          {/* ===== Toolbar Section ===== */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/40 p-3 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {['all', 'active', 'paused', 'paired', 'expired'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-[#5B12D6] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 bg-transparent'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span className="capitalize">{tab}</span>
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {getTabCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Layout Toggle */}
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#5B12D6] bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Grid/Table Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-[#5B12D6] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#5B12D6] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ===== List & Grid Display ===== */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold animate-pulse bg-white border border-slate-200 p-6 rounded-3xl">
              ⚡ Loading listings from server...
            </div>
          ) : filteredDeals.length > 0 ? (
            <AnimatePresence mode="wait">
              {viewMode === 'table' ? (
                // TABLE MODE (Falls back to grid on small screens via CSS wrapper)
                <motion.div 
                  key="table-view"
                  className="manage-deals-page__table-wrapper bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                        <th className="p-4">Title & Category</th>
                        <th className="p-4">Model</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Progress</th>
                        <th className="p-4">Pricing</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredDeals.map((deal) => {
                        const mode = getDealMode(deal);
                        const isPair = mode === 'pair';
                        const isStandard = mode === 'standard';
                        const cat = getCategoryById(deal.category);
                        const limit = isPair ? 2 : (deal.maxParticipants || 10);
                        const progress = Math.min(100, ((deal.interestCount || 0) / limit) * 100);

                        return (
                          <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Column 1: Info */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                  <ImageWithFallback src={deal.images?.[0]} alt={deal.title} fallbackType="deal" category={deal.category} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#5B12D6] font-extrabold uppercase tracking-wider">
                                    {cat?.icon} {cat?.name}
                                  </span>
                                  <h4 className="font-bold text-slate-800 line-clamp-1">{deal.title}</h4>
                                  <span className="text-[10px] text-slate-400 font-semibold">ID: #{deal.id}</span>
                                </div>
                              </div>
                            </td>
                            {/* Column 2: Model */}
                            <td className="p-4">
                              <span className="font-bold text-slate-700 capitalize flex items-center gap-1.5">
                                {isStandard
                                  ? `${getOfferTypeIcon(deal.offer_type)} ${getOfferTypeMeta(deal.offer_type).shortLabel}`
                                  : isPair ? '🤝 Pair' : '👥 Group'}
                              </span>
                            </td>
                            {/* Column 3: Status */}
                            <td className="p-4">
                              {getStatusBadge(deal.status)}
                            </td>
                            {/* Column 4: Progress */}
                            <td className="p-4">
                              {isStandard ? (
                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                  <Users size={12} />
                                  {deal.interestCount || 0} interested
                                </span>
                              ) : (
                                <div className="w-40 flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Users size={12} />
                                      {deal.interestCount || 0}/{limit}
                                    </span>
                                    <span>{Math.round(progress)}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#5B12D6] rounded-full" style={{ width: `${progress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </td>
                            {/* Column 5: Pricing */}
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-emerald-600 text-sm">
                                  {formatPrice(deal.pairleyPrice)}
                                </span>
                                <span className="text-xs text-slate-400 line-through">
                                  {formatPrice(deal.originalPrice)}
                                </span>
                              </div>
                            </td>
                            {/* Column 6: Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  className="p-2 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 text-slate-700 rounded-xl transition"
                                  onClick={() => setPreviewDeal(deal)}
                                  title="Quick Preview"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  className="p-2 bg-slate-50 border border-slate-200/50 hover:bg-indigo-50 text-[#5B12D6] rounded-xl transition"
                                  onClick={() => navigate(`/business/edit-deal/${deal.id}`)}
                                  title="Edit Listing"
                                >
                                  <Pencil size={14} />
                                </button>
                                {deal.status !== 'expired' && (
                                  <button
                                    className={`p-2 border rounded-xl transition ${
                                      deal.status === 'active'
                                        ? 'bg-amber-50 border-amber-200/50 text-amber-600 hover:bg-amber-100'
                                        : 'bg-emerald-50 border-emerald-200/50 text-emerald-600 hover:bg-emerald-100'
                                    }`}
                                    onClick={() => handleToggleStatus(deal.id)}
                                    title={deal.status === 'active' ? 'Pause Matchmaking' : 'Resume Matchmaking'}
                                  >
                                    {deal.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                  </button>
                                )}
                                <button
                                  className="p-2 bg-slate-50 border border-slate-200/50 hover:bg-red-50 text-red-500 rounded-xl transition"
                                  onClick={() => handleDelete(deal.id)}
                                  title="Archive Listing"
                                >
                                  <Archive size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                // GRID MODE
                <motion.div 
                  key="grid-view"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filteredDeals.map((deal) => {
                    const mode = getDealMode(deal);
                    const isPair = mode === 'pair';
                    const isStandard = mode === 'standard';
                    const cat = getCategoryById(deal.category);
                    const limit = isPair ? 2 : (deal.maxParticipants || 10);
                    const progress = Math.min(100, ((deal.interestCount || 0) / limit) * 100);

                    return (
                      <div key={deal.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div>
                          {/* Card Cover image */}
                          <div className="relative h-40 overflow-hidden bg-slate-100 border-b border-slate-100">
                            <ImageWithFallback src={deal.images?.[0]} alt={deal.title} fallbackType="deal" category={deal.category} className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 z-10">
                              {getStatusBadge(deal.status)}
                            </div>
                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-[#5B12D6] shadow-sm uppercase border border-slate-100">
                              {cat?.icon} {cat?.name}
                            </div>
                          </div>

                          {/* Content block */}
                          <div className="p-5">
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                              <span>ID: #{deal.id}</span>
                              <span className="font-bold uppercase tracking-wider text-slate-500">
                                {isStandard
                                  ? `${getOfferTypeIcon(deal.offer_type)} ${getOfferTypeMeta(deal.offer_type).shortLabel}`
                                  : isPair ? '🤝 Pair Split' : '👥 Group Tiers'}
                              </span>
                            </div>
                            
                            <h4 className="font-bold text-slate-800 text-md line-clamp-1 mb-3">{deal.title}</h4>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl mb-4 text-xs">
                              <div>
                                <span className="text-slate-400 block font-medium">Retail Price</span>
                                <span className="line-through text-slate-500 font-bold">{formatPrice(deal.originalPrice)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">Deal Price</span>
                                <span className="text-emerald-600 font-extrabold">{formatPrice(deal.pairleyPrice)}</span>
                              </div>
                            </div>

                            {/* Progress bar info */}
                            {isStandard ? (
                              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                <Users size={12} />
                                {deal.interestCount || 0} interested
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {deal.interestCount || 0}/{limit} Matching
                                  </span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#5B12D6]" style={{ width: `${progress}%` }}></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions footer */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100 gap-2">
                          <button
                            onClick={() => setPreviewDeal(deal)}
                            className="btn btn-outline border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                          >
                            <Eye size={13} /> Preview
                          </button>
                          
                          <div className="flex items-center gap-1">
                            <button
                              className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all"
                              onClick={() => navigate(`/business/edit-deal/${deal.id}`)}
                            >
                              <Pencil size={13} />
                            </button>
                            {deal.status !== 'expired' && (
                              <button
                                className={`p-2 border rounded-xl transition ${
                                  deal.status === 'active' 
                                    ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' 
                                    : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                }`}
                                onClick={() => handleToggleStatus(deal.id)}
                              >
                                {deal.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                              </button>
                            )}
                            <button
                              className="p-2 bg-slate-50 border border-slate-200 hover:bg-red-50 text-red-500 rounded-xl transition"
                              onClick={() => handleDelete(deal.id)}
                              title="Archive Listing"
                            >
                              <Archive size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* Empty State */
            <div className="bg-white border border-slate-200 p-12 text-center rounded-3xl flex flex-col items-center justify-center gap-4">
              <span className="text-5xl">📭</span>
              <h3 className="text-xl font-bold text-slate-800">No Listings Found</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                There are no matches for your current search or tab selection. Adjust filters or list a new deal.
              </p>
              <Link to="/business/create-deal" className="btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold px-6 py-2.5 rounded-xl mt-2">
                Create First Listing
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* ===== GORGEOUS GLASS DETAILS PREVIEW DIALOG ===== */}
      <AnimatePresence>
        {previewDeal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop Blur overlay */}
            <div 
              className="absolute inset-0 bg-[#000F22]/60 backdrop-blur-md" 
              onClick={() => setPreviewDeal(null)}
            ></div>
            
            {/* Modal Card Container */}
            <motion.div 
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-100"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Header Image Header banner */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <ImageWithFallback src={previewDeal.images?.[0]} alt={previewDeal.title} fallbackType="deal" category={previewDeal.category} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(previewDeal.status)}
                </div>
                <button 
                  onClick={() => setPreviewDeal(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contents scroll */}
              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto flex flex-col gap-6 text-left">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#5B12D6] uppercase tracking-wider mb-1.5">
                    <Tag size={13} /> {getCategoryById(previewDeal.category)?.name}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-tight">
                    {previewDeal.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {previewDeal.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Listed on {previewDeal.createdOn || 'Recent'}</span>
                    <span className="capitalize px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50">
                      {previewDeal.mode} Mode
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 bg-slate-50/50 rounded-2xl px-4 text-xs md:text-sm">
                  <div>
                    <span className="text-slate-400 block font-medium">Original Retail</span>
                    <span className="line-through text-slate-500 font-bold">{formatPrice(previewDeal.originalPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Deal Price</span>
                    <span className="text-emerald-600 font-extrabold">{formatPrice(previewDeal.pairleyPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Savings</span>
                    <span className="text-[#5B12D6] font-extrabold">
                      {Math.round(((previewDeal.originalPrice - previewDeal.pairleyPrice) / previewDeal.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5">Listing Description</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {previewDeal.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5">Usage Rules & Exclusions</h4>
                  <p className="text-slate-500 text-xs leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic">
                    {previewDeal.terms || 'Standard application matching terms apply.'}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Customer Matches: **{previewDeal.interestCount || 0}** users matching currently.
                </span>
                <button
                  onClick={() => setPreviewDeal(null)}
                  className="btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

