import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

// One "how it works" flow — a title, a short one-line explainer, and a
// vertical sequence of steps connected by arrows. Used twice (Group Offers,
// Smart Discounts) with different step data and an accent color.
export default function ProcessFlowCard({ title, tagline, steps, accent = 'purple', delay = 0 }) {
  const accentClasses = accent === 'green'
    ? { badge: 'bg-brand-green/10 text-brand-green-dark border-brand-green/20', dot: 'bg-brand-green' }
    : { badge: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20', dot: 'bg-brand-purple' };

  return (
    <motion.div
      variants={fadeInUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className="rounded-3xl bg-white border border-slate-200 p-7 sm:p-8 shadow-sm h-full"
    >
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${accentClasses.badge}`}>
        {title}
      </span>
      <p className="mt-3 text-slate-500 text-sm">{tagline}</p>

      <div className="mt-7 flex flex-col items-stretch">
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center">
            <div className="w-full flex items-center gap-3 py-1">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full ${accentClasses.dot} text-white text-xs font-black flex items-center justify-center`}>
                {i + 1}
              </div>
              <p className="text-sm font-semibold text-slate-800">{step}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowDown size={16} className="text-slate-300 my-1 ml-[13px] self-start" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
