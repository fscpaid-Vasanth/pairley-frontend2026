import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const FEATURES = [
  'Community-driven demand',
  'Group buying discounts',
  'Smart discount options',
  'Qualified purchase intent',
  'Hyperlocal discovery',
  'Zero commission on sales',
];

const COMPETITORS = [
  { name: 'Pairley', pairley: true, values: [true, true, true, true, true, true] },
  { name: 'Coupon Apps', values: [false, false, 'partial', false, 'partial', true] },
  { name: 'Food Delivery Apps', values: [false, false, false, 'partial', true, false] },
  { name: 'Marketplaces', values: [false, false, false, 'partial', false, false] },
  { name: 'Ad Platforms', values: [false, false, false, false, false, 'partial'] },
];

function ValueIcon({ value }) {
  if (value === true) return <Check size={14} className="text-brand-green flex-shrink-0" strokeWidth={3} />;
  if (value === 'partial') return <Minus size={14} className="text-brand-yellow flex-shrink-0" strokeWidth={3} />;
  return <X size={14} className="text-white/20 flex-shrink-0" strokeWidth={3} />;
}

export default function WhyDifferentSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="py-20 lg:py-28 bg-ink-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why Pairley is Different
          </h2>
          <p className="mt-3 text-white/50 max-w-lg mx-auto">
            Not another coupon app, delivery app, or ad platform. Hover to compare.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="flex flex-col lg:flex-row gap-3 items-stretch"
        >
          {COMPETITORS.map((c) => {
            const isPairley = c.pairley;
            const isHovered = hovered === c.name;
            const isExpanded = isPairley || isHovered;

            return (
              <motion.div
                key={c.name}
                onMouseEnter={() => setHovered(c.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setHovered((prev) => (prev === c.name ? null : c.name))}
                animate={{ flexGrow: isExpanded ? 2.4 : 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`relative rounded-3xl border p-5 flex flex-col overflow-hidden ${
                  isPairley
                    ? 'bg-gradient-to-b from-brand-purple/15 to-brand-green/5 border-brand-purple/40 shadow-glow-purple'
                    : 'bg-white/[0.03] border-white/10'
                }`}
                style={{ flexBasis: 0, minWidth: isExpanded ? 200 : 90 }}
              >
                <h3 className={`font-black text-sm mb-4 whitespace-nowrap ${isPairley ? 'text-white' : 'text-white/70'}`}>
                  {c.name}
                </h3>

                <div className="flex flex-col gap-3 flex-1">
                  {FEATURES.map((feature, i) => (
                    <div key={feature} className="flex items-center gap-2">
                      <ValueIcon value={c.values[i]} />
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className={`text-xs whitespace-nowrap overflow-hidden ${isPairley ? 'text-white/85 font-medium' : 'text-white/50'}`}
                        >
                          {feature}
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-6 lg:hidden">Tap a card to compare its features.</p>
      </div>
    </section>
  );
}
