import { motion } from 'framer-motion';
import { revealViewport } from './animations';

const CATEGORIES = [
  { label: 'Restaurants', icon: '🍽️' },
  { label: 'Retail Stores', icon: '🛍️' },
  { label: 'Electronics', icon: '📱' },
  { label: 'Gyms', icon: '🏋️' },
  { label: 'Salons', icon: '💇' },
  { label: 'Supermarkets', icon: '🛒' },
  { label: 'Cafés', icon: '☕' },
  { label: 'Travel Agencies', icon: '✈️' },
  { label: 'Entertainment', icon: '🎬' },
  { label: 'Training Institutes', icon: '🎓' },
];

export default function TrustBar() {
  return (
    <section className="relative py-10 border-y border-slate-200/70 bg-pairley-mist">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
          Built for every kind of local business
        </p>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {CATEGORIES.map((c, i) => (
            <motion.span
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={revealViewport}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-600 shadow-sm"
            >
              <span aria-hidden>{c.icon}</span>
              {c.label}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
