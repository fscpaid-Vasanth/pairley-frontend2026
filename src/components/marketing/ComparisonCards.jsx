import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

const POINTS = [
  {
    problem: 'Prices stay fixed no matter how many people want the deal',
    solution: 'The more people show interest, the better the discount gets',
  },
  {
    problem: "Generic coupons that don't reflect real local demand",
    solution: 'Merchants see real, qualified interest before committing to a discount',
  },
  {
    problem: 'Advertising costs money whether or not it brings customers',
    solution: 'One flat monthly fee for merchants — no per-lead or per-click cost',
  },
  {
    problem: "Deals are city-wide, not specific to your neighborhood",
    solution: 'Discover offers from businesses actually near you',
  },
];

export default function ComparisonCards() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Pairley?
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Traditional shopping vs. how Pairley actually works.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="grid gap-4"
        >
          {POINTS.map((p, i) => (
            <motion.div
              key={p.problem}
              variants={fadeInUp}
              custom={i}
              className="grid sm:grid-cols-2 gap-3 sm:gap-4"
            >
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
                  <X size={13} className="text-slate-400" strokeWidth={3} />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{p.problem}</p>
              </div>
              <div className="flex items-start gap-3 p-5 rounded-2xl bg-white border border-brand-purple/20 shadow-sm shadow-brand-purple/5">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center mt-0.5">
                  <Check size={13} className="text-brand-green" strokeWidth={3} />
                </div>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">{p.solution}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
