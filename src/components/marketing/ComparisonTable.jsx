import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const COMPETITORS = ['Pairley', 'Coupon Apps', 'Food Delivery Apps', 'Marketplaces', 'Ad Platforms'];

// true = full check, false = cross, 'partial' = dash/some support
const ROWS = [
  { feature: 'Community-driven demand', values: [true, false, false, false, false] },
  { feature: 'Group buying discounts', values: [true, false, false, false, false] },
  { feature: 'Smart discount options', values: [true, 'partial', false, false, false] },
  { feature: 'Qualified purchase intent', values: [true, false, 'partial', 'partial', false] },
  { feature: 'Hyperlocal discovery', values: [true, 'partial', true, false, false] },
  { feature: 'Zero commission on sales', values: [true, true, false, false, 'partial'] },
];

function ValueIcon({ value }) {
  if (value === true) return <Check size={16} className="text-brand-green mx-auto" strokeWidth={3} />;
  if (value === 'partial') return <Minus size={16} className="text-amber-400 mx-auto" strokeWidth={3} />;
  return <X size={16} className="text-slate-300 mx-auto" strokeWidth={3} />;
}

export default function ComparisonTable() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Pairley is Different
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Not another coupon app, delivery app, or ad platform.
          </p>
        </motion.div>

        {/* Desktop/tablet table */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left font-semibold text-slate-500 px-5 py-4 min-w-[200px]">Feature</th>
                {COMPETITORS.map((c, i) => (
                  <th
                    key={c}
                    className={`px-4 py-4 font-bold text-center ${i === 0 ? 'text-brand-purple bg-brand-purple/5' : 'text-slate-600'}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4 text-slate-700 font-medium">{row.feature}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={`px-4 py-4 ${i === 0 ? 'bg-brand-purple/5' : ''}`}>
                      <ValueIcon value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile — stacked cards, one per competitor */}
        <div className="sm:hidden flex flex-col gap-4">
          {COMPETITORS.map((c, ci) => (
            <div
              key={c}
              className={`rounded-2xl border p-5 ${ci === 0 ? 'border-brand-purple/30 bg-brand-purple/5' : 'border-slate-200 bg-white'}`}
            >
              <h3 className={`font-bold mb-3 ${ci === 0 ? 'text-brand-purple' : 'text-slate-800'}`}>{c}</h3>
              <ul className="flex flex-col gap-2">
                {ROWS.map((row) => (
                  <li key={row.feature} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{row.feature}</span>
                    <ValueIcon value={row.values[ci]} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
