import { motion } from 'framer-motion';
import { Users, Tag, TrendingUp } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

const CARDS = [
  {
    icon: Users,
    title: 'Save Together',
    body: 'Join other customers with the same buying interest and unlock better group pricing than you ever could alone.',
    tint: 'from-pairley-purple to-pairley-purple-light',
    ring: 'bg-pairley-purple/10',
  },
  {
    icon: Tag,
    title: 'Choose Your Price',
    body: 'Tell merchants the price you are comfortable paying. No haggling — just honest, transparent demand.',
    tint: 'from-pairley-green to-pairley-green-dark',
    ring: 'bg-pairley-green/10',
  },
  {
    icon: TrendingUp,
    title: 'Help Businesses Sell Better',
    body: 'Merchants see real customer demand at every price point before they commit — smarter offers, more sales.',
    tint: 'from-pairley-orange to-amber-500',
    ring: 'bg-pairley-orange/10',
  },
];

export default function WhyPairley() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-purple">Why Pairley</span>
          <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            A smarter way to shop and sell locally
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-inter">
            Three simple ideas that make local commerce work better for everyone.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={stagger}
          className="mt-14 grid md:grid-cols-3 gap-6"
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeInUp}
              className="group relative rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_8px_40px_rgba(17,24,39,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-15px_rgba(109,40,217,0.22)]"
            >
              <div className={`w-14 h-14 rounded-2xl ${card.ring} flex items-center justify-center mb-6`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.tint} flex items-center justify-center shadow-lg`}>
                  <card.icon size={22} className="text-white" />
                </div>
              </div>
              <h3 className="font-outfit text-xl font-extrabold text-pairley-ink">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-500 font-inter">{card.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
