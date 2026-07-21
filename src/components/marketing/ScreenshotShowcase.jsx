import { motion } from 'framer-motion';
import { Search, Heart, Share2, CheckCircle2, TrendingUp, Users, Tag, User, Bookmark } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';
import PhoneFrame from './PhoneFrame';

// Faithful, simplified recreations of the real screens — same colors/
// layout language as the actual app components (DealCard, BusinessDashboard
// stat cards, etc.) rather than decorative illustrations. See PhoneMockup.jsx
// for the same rationale (no screenshot-capture tooling available).

function HomeScreen() {
  return (
    <div className="bg-white h-full">
      <div className="px-3 pt-7 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
          <Search size={12} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 font-medium">Search deals...</span>
        </div>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-12 bg-gradient-to-br from-brand-purple/15 to-brand-green/10" />
            <div className="p-2">
              <div className="h-1.5 bg-slate-200 rounded w-4/5 mb-1" />
              <div className="h-1.5 bg-brand-green/40 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferDetailsScreen() {
  return (
    <div className="bg-white h-full">
      <div className="h-32 bg-gradient-to-br from-brand-purple/20 to-brand-green/15 relative">
        <div className="absolute top-8 right-3 flex gap-1.5">
          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
            <Heart size={11} className="text-slate-500" />
          </div>
          <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
            <Share2 size={11} className="text-slate-500" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="h-2 bg-slate-800 rounded w-4/5 mb-1.5" style={{ opacity: 0.85 }} />
        <div className="h-1.5 bg-slate-300 rounded w-1/2 mb-3" />
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm font-black text-brand-green">₹699</span>
          <span className="text-[10px] text-slate-300 line-through">₹1,400</span>
        </div>
        <div className="h-1 w-full bg-slate-100 rounded-full mb-3">
          <div className="h-full w-2/3 bg-brand-purple rounded-full" />
        </div>
        <div className="w-full py-2.5 rounded-xl bg-brand-purple text-white text-[11px] font-bold text-center">
          Show Interest
        </div>
      </div>
    </div>
  );
}

function InterestFlowScreen() {
  return (
    <div className="bg-white h-full flex flex-col items-center justify-center px-5 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center mb-4">
        <CheckCircle2 size={26} className="text-brand-green" />
      </div>
      <p className="text-[13px] font-bold text-slate-800 mb-1">You're interested!</p>
      <p className="text-[10px] text-slate-400 mb-4">The merchant has been notified.</p>
      <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1.5">
          <span className="flex items-center gap-1"><Users size={9} /> 6/10 joined</span>
          <span className="text-brand-purple font-bold">60%</span>
        </div>
        <div className="h-1 w-full bg-slate-200 rounded-full">
          <div className="h-full w-3/5 bg-brand-purple rounded-full" />
        </div>
      </div>
    </div>
  );
}

function MerchantDashboardScreen() {
  return (
    <div className="bg-slate-50 h-full p-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 mt-6">Overview</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="rounded-xl bg-white border border-slate-100 p-2.5">
          <TrendingUp size={13} className="text-brand-purple mb-1" />
          <div className="text-sm font-black text-slate-800">24</div>
          <div className="text-[8px] text-slate-400 font-semibold uppercase">New Leads</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-2.5">
          <Tag size={13} className="text-brand-green mb-1" />
          <div className="text-sm font-black text-slate-800">6</div>
          <div className="text-[8px] text-slate-400 font-semibold uppercase">Active Offers</div>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-slate-100 p-3">
        <div className="h-1.5 bg-slate-200 rounded w-3/5 mb-2" />
        <div className="flex items-end gap-1 h-12">
          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-purple/70 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="bg-white h-full">
      <div className="flex flex-col items-center pt-8 pb-4 border-b border-slate-100">
        <div className="w-14 h-14 rounded-full bg-brand-purple/10 flex items-center justify-center mb-2">
          <User size={22} className="text-brand-purple" />
        </div>
        <div className="h-2 bg-slate-800 rounded w-20 mb-1" style={{ opacity: 0.85 }} />
        <div className="h-1.5 bg-slate-200 rounded w-16" />
      </div>
      <div className="p-3">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Bookmark size={10} /> Saved Offers
        </p>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple/15 to-brand-green/10 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-1.5 bg-slate-200 rounded w-3/4 mb-1" />
              <div className="h-1.5 bg-brand-green/40 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS = [
  { label: 'Home', Screen: HomeScreen },
  { label: 'Offer Details', Screen: OfferDetailsScreen },
  { label: 'Interest Flow', Screen: InterestFlowScreen },
  { label: 'Merchant Dashboard', Screen: MerchantDashboardScreen },
  { label: 'Profile', Screen: ProfileScreen },
];

export default function ScreenshotShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            See Pairley in Action
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            The customer and merchant experience, side by side.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="flex gap-6 overflow-x-auto pb-4 lg:justify-center lg:overflow-visible snap-x snap-mandatory"
        >
          {SCREENS.map(({ label, Screen }, i) => (
            <motion.div
              key={label}
              variants={fadeInUp}
              custom={i}
              className="flex-shrink-0 snap-center flex flex-col items-center gap-4"
            >
              <PhoneFrame width={200} height={400}>
                <Screen />
              </PhoneFrame>
              <span className="text-xs font-bold text-slate-600">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
