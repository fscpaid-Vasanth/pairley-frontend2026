import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bell, TrendingDown } from 'lucide-react';
import PhoneFrame from './PhoneFrame';

// The hero's animated centerpiece — replaces the static phone mockup.
// Loops through the group-offer price-drop story (₹1500 → ₹900 as
// interest climbs), then a brief "merchant notified" beat, then resets.
// State-machine driven by one interval; every visual change is a
// transform/opacity transition (AnimatePresence key-swap), nothing here
// triggers layout.
const STEPS = [
  { interested: 0, price: 1500 },
  { interested: 10, price: 1300 },
  { interested: 20, price: 1100 },
  { interested: 32, price: 900 },
];
const STEP_DURATION = 2200;
const NOTIFY_DURATION = 1800;

export default function PriceDropShowcase({ className = '' }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showNotify, setShowNotify] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          setShowNotify(true);
          window.setTimeout(() => setShowNotify(false), NOTIFY_DURATION);
          return 0;
        }
        return next;
      });
    }, STEP_DURATION);
    return () => clearInterval(timer);
  }, []);

  const step = STEPS[stepIndex];

  return (
    <div className={className}>
      <PhoneFrame>
        <div className="bg-white px-4 pt-8 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-900">Pairley</span>
            <AnimatePresence>
              {showNotify && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="flex items-center gap-1 bg-brand-green/10 text-brand-green-dark text-[9px] font-bold px-2 py-1 rounded-full"
                >
                  <Bell size={9} />
                  Merchant notified
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-green/5 h-28 flex items-center justify-center mb-4">
            <span className="text-[11px] font-bold text-slate-500">🎉 BUY 2 GET 3 — Combo Deal</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-2">
            <Users size={12} className="text-brand-purple" />
            <AnimatePresence mode="wait">
              <motion.span
                key={step.interested}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3 }}
              >
                {step.interested} interested
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-purple to-brand-green rounded-full"
              animate={{ width: `${(step.interested / 32) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Current price</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={step.price}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-2xl font-black text-brand-green-dark"
                >
                  ₹{step.price.toLocaleString('en-IN')}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1 text-brand-purple text-[10px] font-bold bg-brand-purple/10 px-2 py-1.5 rounded-full mb-1">
              <TrendingDown size={11} />
              Live
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-medium mt-1">Based on customer interest</p>
        </div>
      </PhoneFrame>
    </div>
  );
}
