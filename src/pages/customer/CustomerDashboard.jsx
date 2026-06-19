import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, 
  Handshake, 
  Users, 
  Wallet, 
  Clock, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { mockDeals } from '../../data/mockDeals';
import { mockCustomers } from '../../data/mockUsers';
import { getTimeGreeting, formatPrice, ROUTES } from '../../utils/constants';
import { getCategoryById } from '../../data/categories';
import ImageWithFallback from '../../components/ImageWithFallback';
import CustomerNav from '../../components/CustomerNav';
import { api } from '../../utils/api';
import './CustomerDashboard.css';

/* Stagger animation container */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem('pairley_user') || 'null') || mockCustomers[0];

  const [loading, setLoading] = useState(true);
  const [activeInterests, setActiveInterests] = useState([]);
  const [pairedDeals, setPairedDeals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    activeInterestsCount: 0,
    pairedDealsCount: 0,
    groupsJoinedCount: 0,
    totalSaved: 0
  });

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
    setLoading(true);

    // 1. Fetch customer participation history
    api.get('/customers/history')
      .then((history) => {
        // Compute stats
        const activeInts = history.filter(h => h.offer.status === 'ACTIVE' && h.status === 'INTERESTED');
        const pairs = history.filter(h => h.offer.offer_type === 'BOGO' && (h.status === 'READY_TO_BUY' || h.status === 'COMPLETED'));
        const groups = history.filter(h => h.offer.offer_type === 'GROUP_DISCOUNT' && (h.status === 'READY_TO_BUY' || h.status === 'COMPLETED'));
        const saved = history.filter(h => h.status === 'READY_TO_BUY' || h.status === 'COMPLETED')
          .reduce((acc, h) => acc + (h.offer.original_price - h.offer.offer_price), 0);

        setStats({
          activeInterestsCount: history.filter(h => h.status === 'INTERESTED').length,
          pairedDealsCount: pairs.length,
          groupsJoinedCount: groups.length,
          totalSaved: saved
        });

        // Map active interests
        setActiveInterests(
          activeInts.map(h => ({
            id: h.offer.id,
            title: h.offer.title,
            category: h.offer.category ? h.offer.category.toLowerCase() : 'shopping',
            pairleyPrice: h.offer.offer_price,
            images: [h.offer.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop']
          })).slice(0, 3)
        );

        // Map paired deals
        setPairedDeals(
          history.filter(h => h.status === 'READY_TO_BUY' || h.status === 'COMPLETED').map((h) => {
            return {
              id: h.offer.id,
              title: h.offer.title,
              category: h.offer.category ? h.offer.category.toLowerCase() : 'shopping',
              pairleyPrice: h.offer.offer_price,
              images: [h.offer.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
              partnerName: 'Matched Partner',
              status: h.status
            };
          }).slice(0, 4)
        );

        // Map activity timeline
        const timeline = history.map(h => {
          let text = `Expressed interest in "${h.offer.title}"`;
          let type = 'interest';
          let dotColor = 'bg-purple-500 shadow-purple-500/30';

          if (h.status === 'READY_TO_BUY') {
            text = `Matched & Paired for "${h.offer.title}"! Ready to buy.`;
            type = 'pair';
            dotColor = 'bg-emerald-500 shadow-emerald-500/30';
          } else if (h.status === 'COMPLETED') {
            text = `Completed BOGO purchase of "${h.offer.title}". Saved ${formatPrice(h.offer.original_price - h.offer.offer_price)}!`;
            type = 'save';
            dotColor = 'bg-amber-500 shadow-amber-500/30';
          }

          return {
            id: h.id,
            text,
            time: formatTimeAgo(h.created_at),
            type,
            dotColor
          };
        });
        setActivities(timeline.slice(0, 5));
      })
      .catch((err) => {
        console.error('Failed to fetch customer history:', err);
        setActiveInterests([]);
        setPairedDeals([]);
        setActivities([]);
      });

    // 2. Fetch recommended deals
    api.get('/offers/list?status=ACTIVE')
      .then((data) => {
        setRecommended(data.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load recommended deals:', err);
        setRecommended([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="customer-dashboard page-wrapper py-6">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* ===== Header Block ===== */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              {getTimeGreeting()}, {user.name ? user.name.split(' ')[0] : 'User'}! 👋
            </h2>
            <p className="text-sm text-slate-500 mt-1">Here's your live pairing status and co-buying savings summary.</p>
          </div>
          <Link to="/deals" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4E2BC4] hover:bg-[#6D4EE3] text-white font-bold rounded-xl text-xs shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-100">
            <Zap size={14} />
            Explore New Deals
          </Link>
        </motion.div>

        {/* Customer Sub-Navigation */}
        <CustomerNav />

        {/* ===== Stats Row ===== */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {[
            {
              title: 'Active Interests',
              val: loading ? '...' : stats.activeInterestsCount,
              icon: ShoppingBag,
              color: 'text-purple-600 bg-purple-500/10 border-purple-100',
              gradient: 'from-purple-500 to-indigo-500',
              shadow: 'shadow-purple-500/10'
            },
            {
              title: 'Paired Deals',
              val: loading ? '...' : stats.pairedDealsCount,
              icon: Handshake,
              color: 'text-emerald-600 bg-emerald-500/10 border-emerald-100',
              gradient: 'from-emerald-500 to-teal-500',
              shadow: 'shadow-emerald-500/10'
            },
            {
              title: 'Groups Joined',
              val: loading ? '...' : stats.groupsJoinedCount,
              icon: Users,
              color: 'text-blue-600 bg-blue-500/10 border-blue-100',
              gradient: 'from-blue-500 to-cyan-500',
              shadow: 'shadow-blue-500/10'
            },
            {
              title: 'Total Saved',
              val: loading ? '...' : formatPrice(stats.totalSaved),
              icon: Wallet,
              color: 'text-amber-600 bg-amber-500/10 border-amber-100',
              gradient: 'from-amber-500 to-orange-500',
              shadow: 'shadow-amber-500/10'
            }
          ].map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <Link 
                key={idx} 
                to={ROUTES.CUSTOMER_ORDERS}
                className="block"
              >
                <motion.div 
                  className={`bg-white border border-slate-100 hover:border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full`}
                  variants={itemVariants}
                >
                {/* Glow blob behind */}
                <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-slate-100/50 blur-xl`}></div>
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr ${stat.gradient} text-white shadow-md ${stat.shadow}`}>
                  <IconComponent size={20} />
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{stat.title}</div>
                  <div className="text-lg md:text-xl font-extrabold text-slate-800 mt-0.5">{stat.val}</div>
                </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* ===== My Active Interests ===== */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping"></span>
              My Active Interests
            </h3>
            <Link to="/deals" className="inline-flex items-center gap-1 text-xs font-bold text-[#4E2BC4] hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-semibold">
                Loading active interests...
              </div>
            ) : activeInterests.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-semibold bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                No active interests found. Explore deals and tap "Show Interest" to match!
              </div>
            ) : (
              activeInterests.map((deal) => {
                const cat = getCategoryById(deal.category);
                return (
                  <motion.div
                    key={deal.id}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                    whileHover={{ y: -4 }}
                  >
                    <div>
                      <div className="relative overflow-hidden h-40 bg-slate-100">
                        <ImageWithFallback className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={deal.images?.[0]} alt={deal.title} fallbackType="deal" category={deal.category} />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm shadow-sm rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            {cat?.icon || '🛍️'} {cat?.name || 'General'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 bg-purple-600 text-white rounded-full text-[9px] font-bold tracking-wider uppercase shadow-sm">
                            BOGO Split
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[40px]">{deal.title}</h4>
                        
                        <div className="flex items-center gap-1.5 mt-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/60">
                            🔍 Searching for Pair...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400">Split Price</span>
                        <div className="text-sm font-bold text-emerald-600 mt-0.5">{formatPrice(deal.pairleyPrice)}</div>
                      </div>
                      <Link to={`/deals/${deal.id}`} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-[#4E2BC4] hover:bg-purple-50 transition-colors duration-200">
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ===== Two Column: Paired Deals + Activity ===== */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          
          {/* Column 1: Paired Deals */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">My Paired Deals</h3>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  Loading matches...
                </div>
              ) : pairedDeals.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                  No matches completed yet.
                </div>
              ) : (
                pairedDeals.map((deal) => {
                  const cat = getCategoryById(deal.category);
                  return (
                    <div key={deal.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex">
                      <div className="w-28 h-auto flex-shrink-0 bg-slate-50 relative">
                        <ImageWithFallback className="w-full h-full object-cover" src={deal.images?.[0]} alt={deal.title} fallbackType="deal" category={deal.category} />
                        <div className="absolute top-2 left-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">✓</span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">{cat?.name || 'General'}</div>
                          <h4 className="font-bold text-slate-800 text-xs mt-0.5 line-clamp-1">{deal.title}</h4>
                          
                          {/* Paired Partner Indicator */}
                          <div className="flex items-center gap-2 mt-2 p-1.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                            <img className="w-6 h-6 rounded-full border border-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.partnerName}`} alt="partner" />
                            <div className="text-[9px] text-slate-500 leading-tight">
                              Paired with <span className="font-bold text-slate-700">{deal.partnerName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-100/60 pt-2.5 mt-2.5">
                          <div>
                            <span className="text-[9px] text-slate-400">Each paid</span>
                            <div className="text-xs font-bold text-emerald-600">{formatPrice(deal.pairleyPrice)}</div>
                          </div>
                          <Link 
                            to={`/customer/chat/${deal.id}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-[#4E2BC4] hover:bg-[#4E2BC4] hover:text-white rounded-lg text-[10px] font-bold transition-all duration-200"
                          >
                            <MessageSquare size={10} />
                            Open Chat
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Column 2: Recent Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-100">
                {loading ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    Loading activity timeline...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    No activity registered yet.
                  </div>
                ) : (
                  activities.map((item) => (
                    <div key={item.id} className="relative">
                      {/* Circle Node */}
                      <div className={`absolute left-[-31px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${item.dotColor} z-10`}></div>
                      
                      <div>
                        <p className="text-slate-700 text-xs md:text-sm leading-relaxed">{item.text}</p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                          <Clock size={10} />
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

        </div>

        {/* ===== Recommended For You ===== */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} />
              Recommended For You
            </h3>
            <Link to="/deals" className="inline-flex items-center gap-1 text-xs font-bold text-[#4E2BC4] hover:underline">
              Explore All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-semibold">
                Loading recommendations...
              </div>
            ) : recommended.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 text-xs font-semibold bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                No recommended deals at the moment.
              </div>
            ) : (
              recommended.map((deal) => {
                const cat = getCategoryById(deal.category);
                const progress = deal.offer_type?.toLowerCase() === 'group_discount'
                  ? Math.round((deal.joined_people / deal.required_people) * 100)
                  : null;
                const isGroup = deal.offer_type?.toLowerCase() === 'group_discount';

                return (
                  <motion.div
                    key={deal.id}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                    whileHover={{ y: -4 }}
                  >
                    <div>
                      <div className="relative overflow-hidden h-40 bg-slate-100">
                        <ImageWithFallback className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={deal.offer_image} alt={deal.title} fallbackType="deal" category={deal.category} />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm shadow-sm rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            {cat?.icon || '🛍️'} {cat?.name || 'General'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase shadow-sm text-white ${
                            isGroup ? 'bg-indigo-600' : 'bg-emerald-600'
                          }`}>
                            {isGroup ? 'Group Deal' : 'Pair BOGO'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[40px]">{deal.title}</h4>

                        {isGroup && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60 flex items-center gap-1">
                                👥 {deal.joined_people}/{deal.required_people} Joined
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        )}
                        
                        {!isGroup && (
                          <div className="flex items-center gap-1.5 mt-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60">
                              🤝 Matching Pool Open
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400">Starting Price</span>
                        <div className="text-sm font-bold text-emerald-600 mt-0.5">{formatPrice(deal.offer_price)}</div>
                      </div>
                      <Link to={`/deals/${deal.id}`} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-[#4E2BC4] hover:bg-purple-50 transition-colors duration-200">
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
