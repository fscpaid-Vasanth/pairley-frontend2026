import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingDown } from 'lucide-react';

const STEPS = [
  { interested: 10, price: 900 },
  { interested: 20, price: 700 },
  { interested: 30, price: 500 },
];
const STEP_DURATION = 2200;

// Auto-cycling — the merchant's "BUY 2 GET 3" offer getting cheaper as more
// people join, looping continuously so the mechanic reads without needing
// a scroll interaction.
export default function GroupOfferAnimation() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((prev) => (prev + 1) % STEPS.length), STEP_DURATION);
    return () => clearInterval(t);
  }, []);

  const step = STEPS[i];

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-purple/15 text-brand-purple-light text-[11px] font-bold uppercase tracking-wide">
          BUY 2 GET 3
        </span>
        <span className="text-[10px] text-white/40 font-semibold">Merchant's offer</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-white/60 font-semibold mb-2">
        <Users size={13} className="text-brand-purple-light" />
        <AnimatePresence mode="wait">
          <motion.span
            key={step.interested}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
          >
            {step.interested} interested
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-purple to-brand-green rounded-full"
          animate={{ width: `${(step.interested / 30) * 100}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-1">Group price</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={step.price}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              className="text-3xl font-black text-white"
            >
              ₹{step.price}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1 text-brand-green text-[11px] font-bold bg-brand-green/10 px-2.5 py-1.5 rounded-full mb-1.5">
          <TrendingDown size={12} />
          Dropping
        </div>
      </div>
    </div>
  );
}
