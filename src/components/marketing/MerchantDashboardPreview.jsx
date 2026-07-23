import { motion } from 'framer-motion';
import { Users, Heart, IndianRupee, TrendingUp, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';
import CountUp from './CountUp';

const KPIS = [
  { label: "Today's Leads", count: { target: 48 }, delta: '+12%', icon: Users, tint: 'text-pairley-purple', ring: 'bg-pairley-purple/10' },
  { label: 'Interested Customers', count: { target: 312 }, delta: '+8%', icon: Heart, tint: 'text-pairley-green-dark', ring: 'bg-pairley-green/12' },
  { label: 'Most Popular Price', count: { target: 4800, prefix: '₹' }, delta: '37 want it', icon: IndianRupee, tint: 'text-pairley-orange', ring: 'bg-pairley-orange/12' },
  { label: 'Revenue Opportunity', count: { target: 1.4, prefix: '₹', suffix: 'L', decimals: 1 }, delta: '+21%', icon: TrendingUp, tint: 'text-pairley-purple', ring: 'bg-pairley-purple/10' },
];

const SECONDARY = [
  { label: 'Nearby Leads', value: '26', icon: MapPin },
  { label: 'Pending Customers', value: '9', icon: Clock },
  { label: 'Business Growth', value: '+34%', icon: TrendingUp },
];

const TOP_OFFERS = [
  { name: 'Premium Earbuds Pro X', interested: 37, pct: 100 },
  { name: 'Weekend Family Pizza Combo', interested: 29, pct: 78 },
  { name: 'Annual Gym Membership', interested: 21, pct: 57 },
];

export default function MerchantDashboardPreview() {
  return (
    <section className="relative py-20 lg:py-28 bg-pairley-mist border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-purple">For Merchants</span>
          <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            Real demand, on one dashboard
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-inter">
            Every interested customer, every price signal, every lead — the moment it happens.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={revealViewport}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_-28px_rgba(17,24,39,0.25)] overflow-hidden"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-amber-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-400/70" />
            <span className="ml-3 text-[12px] font-semibold text-slate-400">Pairley Merchant Dashboard</span>
          </div>

          <div className="p-5 sm:p-7">
            {/* KPI grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              variants={stagger}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {KPIS.map((k) => (
                <motion.div
                  key={k.label}
                  variants={fadeInUp}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${k.ring} flex items-center justify-center`}>
                      <k.icon size={17} className={k.tint} />
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-pairley-green-dark">
                      <ArrowUpRight size={12} /> {k.delta}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-pairley-ink font-outfit">
                    <CountUp {...k.count} />
                  </p>
                  <p className="text-[12px] font-semibold text-slate-400">{k.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-4 grid lg:grid-cols-[1.4fr_1fr] gap-4">
              {/* Top performing offers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-pairley-ink font-outfit">Top Performing Offers</h3>
                  <span className="text-[11px] font-semibold text-pairley-purple">This week</span>
                </div>
                <div className="flex flex-col gap-4">
                  {TOP_OFFERS.map((o) => (
                    <div key={o.name}>
                      <div className="flex items-center justify-between text-[13px] mb-1.5">
                        <span className="font-semibold text-slate-600 truncate pr-3">{o.name}</span>
                        <span className="font-bold text-slate-500 shrink-0">{o.interested} interested</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${o.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-pairley-purple to-pairley-green"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary stats */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                {SECONDARY.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 flex lg:items-center gap-3 flex-col lg:flex-row">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <s.icon size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-pairley-ink font-outfit leading-none">{s.value}</p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
