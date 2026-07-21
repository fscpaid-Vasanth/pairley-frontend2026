import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const OPTIONS = [5, 10, 15, 20];
// Phase 0: generating chips one by one. Phase 1: customer selects (15%).
// Phase 2: qualified-lead confirmation. Loops back to phase 0.
const PHASE_DURATIONS = [1600, 1400, 1800];

export default function SmartDiscountAnimation() {
  const [phase, setPhase] = useState(0);
  const [visibleChips, setVisibleChips] = useState(0);

  useEffect(() => {
    if (phase !== 0) return;
    if (visibleChips >= OPTIONS.length) {
      const t = setTimeout(() => setPhase(1), PHASE_DURATIONS[0]);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleChips((v) => v + 1), 300);
    return () => clearTimeout(t);
  }, [phase, visibleChips]);

  useEffect(() => {
    if (phase === 0) return undefined;
    const t = setTimeout(() => {
      if (phase === 2) {
        setPhase(0);
        setVisibleChips(0);
      } else {
        setPhase((p) => p + 1);
      }
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const selected = 15;

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-green/15 text-brand-green text-[11px] font-bold uppercase tracking-wide">
          Smart Discount
        </span>
        <span className="text-[10px] text-white/40 font-semibold">List price ₹1,500</span>
      </div>

      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mb-3">Pairley generates options</p>
      <div className="flex gap-2 mb-6 min-h-[38px]">
        {OPTIONS.map((pct, i) => {
          const isVisible = i < visibleChips;
          const isSelected = phase >= 1 && pct === selected;
          return (
            <motion.div
              key={pct}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? (isSelected ? 1.1 : 1) : 0.7,
              }}
              transition={{ duration: 0.3 }}
              className={`px-3 py-2 rounded-xl text-sm font-black border transition-colors ${
                isSelected
                  ? 'bg-brand-green text-ink border-brand-green shadow-glow-green'
                  : 'bg-white/5 text-white/70 border-white/10'
              }`}
            >
              {pct}%
            </motion.div>
          );
        })}
      </div>

      <div className="min-h-[52px] flex items-center">
        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.p
              key="select"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-white/70 font-semibold"
            >
              Customer selects <span className="text-brand-green font-black">15% off</span>
            </motion.p>
          )}
          {phase === 2 && (
            <motion.div
              key="lead"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 text-sm text-white font-bold"
            >
              <CheckCircle2 size={18} className="text-brand-green" />
              Merchant receives a qualified lead
            </motion.div>
          )}
          {phase === 0 && (
            <motion.p
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white/40 font-semibold"
            >
              Generating discount options…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
