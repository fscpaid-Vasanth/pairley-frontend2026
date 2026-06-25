import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ShoppingBag, 
  Zap, 
  Users, 
  TrendingUp, 
  Lightbulb,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// Removed mock imports to prevent dashboard fallbacks
import { formatPrice } from '../../utils/constants';
import ImageWithFallback from '../../components/ImageWithFallback';
import BusinessNav from '../../components/BusinessNav';
import { api } from '../../utils/api';
import './BusinessDashboard.css';

/* Stagger animation container */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('pairley_token');
  const business = JSON.parse(localStorage.getItem('pairley_user') || 'null');

  useEffect(() => {
    if (!token || !business) {
      navigate('/login');
    }
  }, [token, business, navigate]);

  const [metrics, setMetrics] = useState({
    activeOffers: 0,
    interestedCustomers: 0,
    readyToBuyCustomers: 0,
    completedDeals: 0
  });
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 0) return 'Just now';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'Just now';
  };

  useEffect(() => {
    if (!token || !business) return;
    setLoading(true);
    // 1. Fetch dashboard metrics
    api.get('/business/dashboard')
      .then((data) => {
        setMetrics(data);
      })
      .catch((err) => console.error('Failed to fetch business metrics:', err));

    const bId = business.id;
    api.get(`/offers/list?businessId=${bId}&status=ALL`)
      .then((data) => {
        const mappedDeals = data.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category ? d.category.toLowerCase() : 'shopping',
          mode: d.offer_type && (d.offer_type.toLowerCase() === 'bogo' || d.offer_type.toLowerCase() === 'pair') ? 'pair' : 'group',
          location: d.business?.city || d.city || business.city || 'Mumbai',
          interestCount: d.joined_people || 0,
          maxParticipants: d.required_people || 2,
          images: [d.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
          status: d.status ? d.status.toLowerCase() : 'active'
        }));
        setDeals(mappedDeals);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load storefront listings, trying interested-customers endpoint:', err);
        // Fallback: try the interested-customers endpoint
        api.get('/offers/interested-customers')
          .then((data) => {
            const mappedDeals = data.map((d) => ({
              id: d.id,
              title: d.title,
              category: d.category ? d.category.toLowerCase() : 'shopping',
              mode: d.offer_type && (d.offer_type.toLowerCase() === 'bogo' || d.offer_type.toLowerCase() === 'pair') ? 'pair' : 'group',
              location: d.city || business.city || 'Mumbai',
              interestCount: d.joined_people || 0,
              maxParticipants: d.required_people || 2,
              images: [d.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
              status: d.status ? d.status.toLowerCase() : 'active'
            }));
            setDeals(mappedDeals);

            // Generate activity items from interest data
            const acts = [];
            data.forEach((offer) => {
              (offer.interests || []).forEach((interest) => {
                const customerName = interest.customer?.name || 'A customer';
                const isPairOffer = offer.offer_type?.toLowerCase() === 'pair' || offer.offer_type?.toLowerCase() === 'bogo';
                let actText = `${customerName} joined the deal "${offer.title}"`;
                let badgeText = 'New Interest';
                let actType = 'interest';
                if (interest.status === 'READY_TO_BUY') {
                  actText = `Target met! ${customerName} and others matched for "${offer.title}"`;
                  badgeText = 'Match Completed';
                  actType = 'match';
                } else if (interest.status === 'COMPLETED') {
                  actText = `Match finalized for "${offer.title}" with ${customerName}`;
                  badgeText = 'Completed';
                  actType = 'match';
                } else if (!isPairOffer) {
                  actText = `${customerName} joined the group for "${offer.title}" (${offer.joined_people}/${offer.required_people})`;
                  badgeText = 'Group Joined';
                  actType = 'join';
                }
                acts.push({ id: interest.id, type: actType, text: actText, timestamp: new Date(interest.created_at || new Date()), time: formatTimeAgo(interest.created_at || new Date()), badge: badgeText });
              });
            });
            acts.sort((a, b) => b.timestamp - a.timestamp);
            setActivities(acts.slice(0, 10));
            setLoading(false);
          })
          .catch((err2) => {
            console.error('Both endpoints failed:', err2);
            setDeals([]);
            setActivities([]);
            setLoading(false);
          });
      });
  }, [business.id, business.city]);

  // Stats
  const stats = [
    { 
      label: 'Total Deals Listed', 
      value: loading ? '...' : (deals.length || metrics.activeOffers + metrics.completedDeals), 
      icon: ShoppingBag, 
      color: 'text-purple-600 bg-purple-100 border-purple-200/50', 
      trend: '+2 new this week', 
      trendColor: 'text-purple-600',
      gradient: 'from-purple-500 to-indigo-500'
    },
    { 
      label: 'Active Listings', 
      value: loading ? '...' : metrics.activeOffers, 
      icon: Zap, 
      color: 'text-emerald-600 bg-emerald-100 border-emerald-200/50', 
      trend: '94% match rate', 
      trendColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      label: 'Interests Received', 
      value: loading ? '...' : (metrics.interestedCustomers + metrics.readyToBuyCustomers + metrics.completedDeals), 
      icon: Users, 
      color: 'text-blue-600 bg-blue-100 border-blue-200/50', 
      trend: '+12% vs last month', 
      trendColor: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Successful matches', 
      value: loading ? '...' : (metrics.completedDeals + metrics.readyToBuyCustomers), 
      icon: TrendingUp, 
      color: 'text-amber-600 bg-amber-100 border-amber-200/50', 
      trend: `₹${(metrics.completedDeals + metrics.readyToBuyCustomers) * 800} saved`, 
      trendColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-500'
    },
  ];

  if (!token || !business) {
    return null;
  }

  // Block PENDING / REJECTED merchants from accessing the dashboard
  if (business.role === 'Business' && business.verification_status !== 'APPROVED') {
    const isRejected = business.verification_status === 'REJECTED';
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 520, width: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(78,43,196,0.1)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{isRejected ? '❌' : '⏳'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            {isRejected ? 'Account Not Approved' : 'Awaiting Admin Approval'}
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
            {isRejected
              ? 'Your merchant account application has been rejected. Please contact support at support@pairley.com for more details.'
              : 'Your shop registration is under review. Our team typically reviews applications within 24–48 hours. You will be notified once approved.'}
          </p>
          <div style={{ background: isRejected ? 'rgba(239,68,68,0.08)' : 'rgba(78,43,196,0.08)', border: `1px solid ${isRejected ? 'rgba(239,68,68,0.2)' : 'rgba(78,43,196,0.2)'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: isRejected ? '#ef4444' : '#4E2BC4', margin: '0 0 6px' }}>📋 What happens next?</p>
            {isRejected ? (
              <ul style={{ fontSize: 13, color: '#64748b', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Contact support to understand the rejection reason</li>
                <li>Address any compliance or documentation issues</li>
                <li>Re-apply after resolving the issues</li>
              </ul>
            ) : (
              <ul style={{ fontSize: 13, color: '#64748b', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Admin will review your shop details &amp; documents</li>
                <li>You'll receive a notification once approved</li>
                <li>Only then can you create deals and accept customers</li>
              </ul>
            )}
          </div>
          <button
            onClick={() => { localStorage.removeItem('pairley_token'); localStorage.removeItem('pairley_user'); navigate('/login'); }}
            style={{ padding: '12px 32px', borderRadius: 99, background: '#4E2BC4', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="business-dashboard page-wrapper py-6">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* ===== Header Block ===== */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Welcome back, {business.business_name || business.businessName || 'Merchant'}! 📊
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage your storefront BOGO deals and tiered group discounts.</p>
          </div>
          <Link to="/business/create-deal" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4E2BC4] hover:bg-[#6D4EE3] text-white font-bold rounded-xl text-xs shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-100">
            <Plus size={14} />
            Create New Deal
          </Link>
        </motion.div>

        {/* Seller Sub-Navigation */}
        <BusinessNav />

        {/* ===== Stats Row ===== */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={idx} 
                className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                variants={itemVariants}
              >
                {/* Glow ball decoration */}
                <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-slate-50/50 blur-xl"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr ${stat.gradient} text-white shadow-sm`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800 leading-none mb-1.5 font-display">
                    {stat.value}
                  </h3>
                  <div className={`text-[9px] font-bold ${stat.trendColor} bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block`}>
                    {stat.trend}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ===== Main Dashboard Layout ===== */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left / Center: Active Listings (2 Cols Wide) */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Storefront Listings
              </h3>
              <Link to="/business/manage-deals" className="inline-flex items-center gap-1 text-xs font-bold text-[#4E2BC4] hover:underline">
                Manage All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                  Loading listings from database...
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                  No storefront listings found. Publish a BOGO or group deal to see it here!
                </div>
              ) : (
                deals.slice(0, 4).map((deal) => {
                  const isPair = deal.mode === 'pair';
                  const completion = isPair
                    ? (deal.interestCount / 2) * 100
                    : Math.min(100, (deal.interestCount / deal.maxParticipants) * 100);

                  return (
                    <div key={deal.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <Link to={`/deals/${deal.id}`} className="flex items-center gap-4 hover:no-underline group/link">
                          <ImageWithFallback
                            src={deal.images?.[0]}
                            alt={deal.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                            fallbackType="deal"
                            category={deal.category}
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-[#4E2BC4] group-hover/link:text-[#4E2BC4] transition-colors duration-200 line-clamp-1">{deal.title}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                isPair ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {isPair ? '🤝 Pair BOGO' : '👥 Group Tiers'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">{deal.location}</span>
                            </div>
                          </div>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Interest</span>
                          <div className="text-xs font-bold text-slate-700 mt-0.5">
                            {deal.interestCount} {isPair ? '/ 2 waiting' : `joined`}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 items-end w-20">
                          <span className="text-[9px] text-slate-400 font-semibold">{Math.round(completion)}% filled</span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isPair ? 'bg-purple-500' : 'bg-indigo-500'}`} style={{ width: `${completion}%` }}></div>
                          </div>
                        </div>

                        <Link to={`/deals/${deal.id}`} className="p-2 bg-slate-50 text-slate-400 hover:text-[#4E2BC4] hover:bg-purple-50 rounded-xl transition-colors duration-200">
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Live Feed & Merchant tips */}
          <div className="space-y-6">
            
            {/* Live activity log */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-[#4E2BC4]" />
                Live Store Activity
              </h3>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    Loading activity...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    No buyer interactions yet.
                  </div>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="relative pl-4 border-l-2 border-slate-100 last:border-transparent py-1">
                      {/* Small dot */}
                      <div className={`absolute left-[-6px] top-2.5 w-2 h-2 rounded-full ring-2 ring-white ${
                        act.type === 'match' ? 'bg-emerald-500' : act.type === 'interest' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}></div>
                      
                      <div className="text-[11px] text-slate-700 leading-normal">{act.text}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] text-slate-400">{act.time}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          act.type === 'match' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                        }`}>{act.badge}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-[#4E2BC4]" />
                Store Performance Tips
              </h3>
              
              <div className="space-y-3.5">
                {[
                  {
                    title: '📸 Use HD Images',
                    desc: 'Real storefront or product photos attract 40% more matched pairs than stock vectors.'
                  },
                  {
                    title: '🏷️ Create Group Tiers',
                    desc: 'Adding 3+ pricing tiers encourages customers to invite friends to unlock lower prices.'
                  },
                  {
                    title: '💬 Direct Customer Chat',
                    desc: 'Quick responses in co-buyer matched chat rooms double order completion rates.'
                  }
                ].map((tip, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50/20 hover:border-purple-100/50 transition-colors duration-200">
                    <h5 className="font-bold text-slate-700 text-xs">{tip.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
