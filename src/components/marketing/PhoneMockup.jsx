import { motion } from 'framer-motion';
import { MapPin, Users, Zap, Search } from 'lucide-react';
import PhoneFrame from './PhoneFrame';

// A faithful recreation of the real deal-browsing screen — same visual
// language as src/components/DealCard.jsx (category tag, price + strike
// original, progress bar, savings badge). Not a literal screenshot (no
// screenshot-capture tooling was available), but deliberately not
// decorative illustration either: real colors, real layout, real sample
// data shape.
const SAMPLE_DEALS = [
  {
    title: 'Weekend Brunch Buffet',
    merchant: 'The Green Table',
    category: '🍽️ Dining',
    price: '₹499',
    original: '₹999',
    off: '50% OFF',
    joined: 7,
    total: 10,
  },
  {
    title: 'Premium Gym Membership',
    merchant: 'FitZone Studio',
    category: '💪 Fitness',
    price: '₹1,299',
    original: '₹2,500',
    off: '48% OFF',
    joined: 4,
    total: 8,
  },
];

export default function PhoneMockup({ className = '' }) {
  return (
    <div className={className}>
      <PhoneFrame>
        <div className="bg-white px-4 pt-8 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-slate-900">Pairley</span>
            <div className="w-7 h-7 rounded-full bg-brand-purple/10" />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <Search size={13} className="text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">Search deals near you</span>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-3">
          {SAMPLE_DEALS.map((deal, i) => (
            <motion.div
              key={deal.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="h-20 bg-gradient-to-br from-brand-purple/15 to-brand-green/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500">{deal.category}</span>
              </div>
              <div className="p-3">
                <h4 className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5">{deal.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium mb-2 flex items-center gap-0.5">
                  <MapPin size={9} /> {deal.merchant}
                </p>

                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <Users size={9} className="text-brand-purple" />
                    {deal.joined}/{deal.total} joined
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-green"
                    style={{ width: `${(deal.joined / deal.total) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-brand-green">{deal.price}</span>
                    <span className="text-[10px] text-slate-300 line-through">{deal.original}</span>
                  </div>
                  <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded-full">
                    <Zap size={8} />
                    {deal.off}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PhoneFrame>
    </div>
  );
}
