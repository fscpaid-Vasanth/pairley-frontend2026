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
import { Link } from 'react-router-dom';
import { mockDeals } from '../../data/mockDeals';
import { mockBusinessOwners } from '../../data/mockUsers';
import { formatPrice } from '../../utils/constants';
import ImageWithFallback from '../../components/ImageWithFallback';
import BusinessNav from '../../components/BusinessNav';
import './BusinessDashboard.css';

/* Mock Merchant Live Activity Log */
const merchantActivities = [
  { id: 1, type: 'interest', text: 'Arjun Mehta showed interest in Samsung Galaxy Buds', time: '5 mins ago', badge: 'New Interest' },
  { id: 2, type: 'match', text: 'Pair Complete! Pooja and Priya matched for Spa Day BOGO', time: '40 mins ago', badge: 'Match Completed' },
  { id: 3, type: 'join', text: 'Rohan joined Kerala Group Tour circle (9/15 joined)', time: '2 hours ago', badge: 'Group Joined' },
  { id: 4, type: 'match', text: 'Pair Complete! Vicky and Sarah matched for Buffet BOGO', time: '1 day ago', badge: 'Match Completed' }
];

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
  const business = mockBusinessOwners[0]; // Rajesh Kumar - TechZone Electronics

  // Filter deals created by this business owner
  const myDeals = mockDeals.filter(deal => deal.businessOwner?.id === business.id);

  // Stats
  const stats = [
    { 
      label: 'Total Deals Listed', 
      value: business.totalDeals, 
      icon: ShoppingBag, 
      color: 'text-purple-600 bg-purple-100 border-purple-200/50', 
      trend: '+2 new this week', 
      trendColor: 'text-purple-600',
      gradient: 'from-purple-500 to-indigo-500'
    },
    { 
      label: 'Active Listings', 
      value: business.activeDeals, 
      icon: Zap, 
      color: 'text-emerald-600 bg-emerald-100 border-emerald-200/50', 
      trend: '94% match rate', 
      trendColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      label: 'Interests Received', 
      value: business.successfulPairs * 2 + 10, 
      icon: Users, 
      color: 'text-blue-600 bg-blue-100 border-blue-200/50', 
      trend: '+12% vs last month', 
      trendColor: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Successful matches', 
      value: business.successfulPairs, 
      icon: TrendingUp, 
      color: 'text-amber-600 bg-amber-100 border-amber-200/50', 
      trend: '₹48,000 GMV unlocked', 
      trendColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-500'
    },
  ];

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
              Welcome back, {business.businessName}! 📊
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
              {myDeals.slice(0, 4).map((deal) => {
                const isPair = deal.mode === 'pair';
                const completion = isPair
                  ? (deal.interestCount / 2) * 100
                  : Math.min(100, (deal.interestCount / deal.maxParticipants) * 100);

                return (
                  <div key={deal.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <ImageWithFallback
                        src={deal.images?.[0]}
                        alt={deal.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0 group-hover:scale-102 transition-transform duration-300"
                        fallbackType="deal"
                        category={deal.category}
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-[#4E2BC4] transition-colors duration-200 line-clamp-1">{deal.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isPair ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {isPair ? '🤝 Pair BOGO' : '👥 Group Tiers'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{deal.location}</span>
                        </div>
                      </div>
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
              })}
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
                {merchantActivities.map((act) => (
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
                ))}
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
