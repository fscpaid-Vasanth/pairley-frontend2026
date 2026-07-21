import { motion } from 'framer-motion';
import { fadeInUp, revealViewport } from './animations';

// One "how it works" flow — a title, a short one-line explainer, an
// optional live animation (GroupOfferAnimation / SmartDiscountAnimation),
// and a numbered step list underneath it.
export default function ProcessFlowCard({ title, tagline, steps, accent = 'purple', delay = 0, children }) {
  const accentClasses = accent === 'green'
    ? { badge: 'bg-brand-green/15 text-brand-green border-brand-green/20', dot: 'bg-brand-green text-ink' }
    : { badge: 'bg-brand-purple/15 text-brand-purple-light border-brand-purple/25', dot: 'bg-brand-purple text-white' };

  return (
    <motion.div
      variants={fadeInUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      whileHover={{ y: -4 }}
      className="rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-7 shadow-card-dark hover:shadow-card-dark-hover transition-shadow duration-300 h-full"
    >
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${accentClasses.badge}`}>
        {title}
      </span>
      <p className="mt-3 text-white/50 text-sm">{tagline}</p>

      {children && <div className="mt-5">{children}</div>}

      <div className="mt-6 flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full ${accentClasses.dot} text-[11px] font-black flex items-center justify-center`}>
              {i + 1}
            </div>
            <p className="text-sm font-semibold text-white/80">{step}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
