import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const OFFERS = [
  { icon: '🍕', title: 'Buy 2 Get 3 Pizza', tag: 'Food & Dining', original: '₹999', price: '₹599' },
  { icon: '📱', title: 'iPhone Buy One Get One', tag: 'Electronics', original: '₹1,40,000', price: '₹70,000' },
  { icon: '🎧', title: 'Premium Earbuds', tag: 'Electronics', original: '₹5,000', price: '₹4,800' },
  { icon: '💇', title: 'Hair Spa Combo', tag: 'Salon', original: '₹2,500', price: '₹1,299' },
  { icon: '🏋️', title: 'Annual Gym Membership', tag: 'Fitness', original: '₹18,000', price: '₹11,999' },
  { icon: '🛒', title: 'Grocery Mega Combo', tag: 'Supermarket', original: '₹3,000', price: '₹1,999' },
  { icon: '✈️', title: 'Family Travel Deal', tag: 'Travel', original: '₹45,000', price: '₹32,000' },
];

function OfferCard({ offer }) {
  return (
    <div className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl">{offer.icon}</div>
        <span className="px-2.5 py-1 rounded-full bg-pairley-purple/[0.07] text-pairley-purple text-[10px] font-bold uppercase tracking-wide">{offer.tag}</span>
      </div>
      <h3 className="mt-4 font-outfit text-base font-extrabold text-pairley-ink leading-snug">{offer.title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-lg font-black text-pairley-purple font-outfit">{offer.price}</span>
        <span className="text-sm text-slate-400 line-through font-semibold">{offer.original}</span>
      </div>
    </div>
  );
}

export default function LiveOffers() {
  const navigate = useNavigate();
  const track = [...OFFERS, ...OFFERS];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-green">Live on Pairley</span>
            <h2 className="mt-3 font-outfit text-3xl sm:text-4xl font-black tracking-tight text-pairley-ink text-balance">
              Deals customers are joining now
            </h2>
          </div>
          <button
            onClick={() => navigate('/deals')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-pairley-purple hover:gap-2.5 transition-all self-start sm:self-auto"
          >
            Explore all deals <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Auto-scrolling marquee — full-bleed, fades at both edges */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-white to-transparent" />
        <motion.div
          className="flex gap-5 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 34, ease: 'linear', repeat: Infinity }}
        >
          {track.map((offer, i) => (
            <OfferCard key={`${offer.title}-${i}`} offer={offer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
