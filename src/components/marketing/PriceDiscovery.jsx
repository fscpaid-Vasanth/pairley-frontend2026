import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Lightbulb, BadgeCheck } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const OPTIONS = [
  { price: 4900, interested: 18 },
  { price: 4800, interested: 37, popular: true },
  { price: 4700, interested: 24 },
  { price: 4600, interested: 11 },
];

const MAX = Math.max(...OPTIONS.map((o) => o.interested));
const TOTAL = OPTIONS.reduce((s, o) => s + o.interested, 0);
const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function PriceDiscovery() {
  const [selected, setSelected] = useState(4800);
  const chosen = OPTIONS.find((o) => o.price === selected);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-pairley-green/10 blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Narrative side */}
          <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp}>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-green">Demand Discovery</span>
            <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
              Customers decide the price
            </h2>
            <p className="mt-5 text-lg text-slate-500 font-inter leading-relaxed">
              Instead of guessing, merchants see exactly what customers are willing to pay. Every
              shopper picks the price they're comfortable with — and the demand curve appears in
              real time.
            </p>

            <div className="mt-8 rounded-2xl border border-pairley-purple/15 bg-pairley-purple/[0.05] p-5 flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pairley-purple/12 flex items-center justify-center shrink-0">
                <Lightbulb size={19} className="text-pairley-purple" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-pairley-purple">Merchant Insight</p>
                <p className="mt-1 text-[15px] font-semibold text-pairley-ink">
                  Most customers are willing to buy this product around{' '}
                  <span className="text-pairley-purple font-extrabold">₹4,800</span>.
                </p>
                <p className="mt-1.5 text-[13px] text-slate-500">
                  {TOTAL} interested customers across all price points — real demand, before a single sale.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interactive card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealViewport}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_24px_70px_-20px_rgba(17,24,39,0.2)]"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pairley-purple/10 text-pairley-purple text-[11px] font-bold uppercase tracking-wider">
                Merchant Offer
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pairley-green">
                <span className="w-1.5 h-1.5 rounded-full bg-pairley-green animate-pulse" /> Live Interest
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl shrink-0">🎧</div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-pairley-ink font-outfit leading-tight">Premium Earbuds Pro X</h3>
                <p className="text-[13px] text-slate-500 font-medium">Noise cancellation • 1 year warranty</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-semibold">Original</p>
                <p className="text-base font-extrabold text-slate-400 line-through font-outfit">₹5,000</p>
              </div>
            </div>

            <p className="mt-6 mb-3 text-[13px] font-bold text-slate-600">Customers choose their affordable price</p>

            <div className="flex flex-col gap-2.5">
              {OPTIONS.map((o) => {
                const active = o.price === selected;
                return (
                  <button
                    key={o.price}
                    onClick={() => setSelected(o.price)}
                    className={`group w-full rounded-2xl border p-3.5 text-left transition-all ${
                      active
                        ? 'border-pairley-green bg-pairley-green/[0.06] ring-1 ring-pairley-green/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            active ? 'border-pairley-green bg-pairley-green' : 'border-slate-300'
                          }`}
                        >
                          {active && <Check size={12} className="text-white" />}
                        </span>
                        <span className="text-base font-extrabold text-pairley-ink font-outfit">{inr(o.price)}</span>
                        {o.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-pairley-green/15 text-pairley-green-dark text-[10px] font-bold uppercase tracking-wide">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-[12px] font-bold text-slate-500 shrink-0">
                        <Users size={12} /> {o.interested}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(o.interested / MAX) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                        className={`h-full rounded-full ${o.popular ? 'bg-gradient-to-r from-pairley-green to-pairley-green-dark' : 'bg-gradient-to-r from-pairley-purple to-pairley-purple-light'}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center gap-3">
              <BadgeCheck size={20} className="text-pairley-purple shrink-0" />
              <p className="text-[13px] font-semibold text-slate-600">
                You'd join <span className="font-extrabold text-pairley-ink">{chosen.interested}</span> other
                customers interested at <span className="font-extrabold text-pairley-purple">{inr(chosen.price)}</span>.
                The merchant gets every interested customer's details.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
