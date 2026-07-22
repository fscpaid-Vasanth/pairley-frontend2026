import { motion } from 'framer-motion';
import { Quote, Store, User } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

const ITEMS = [
  {
    quote: 'Pairley helped us understand what customers were actually willing to pay before we ever ran the offer. We stopped guessing.',
    name: 'Restaurant Owner',
    role: 'Sample merchant story',
    icon: Store,
    accent: 'purple',
  },
  {
    quote: "I never thought group buying could be this simple. I joined a deal, met the shop, and saved more than I expected.",
    name: 'Pairley User',
    role: 'Sample customer story',
    icon: User,
    accent: 'green',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-20 lg:py-28 bg-pairley-mist border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-purple">Voices</span>
          <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            What people are saying
          </h2>
          <p className="mt-4 text-sm text-slate-400 font-inter">Illustrative sample stories shown until verified customer testimonials are live.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={stagger} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {ITEMS.map((t) => {
            const isPurple = t.accent === 'purple';
            return (
              <motion.figure
                key={t.name}
                variants={fadeInUp}
                className="relative rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_8px_40px_rgba(17,24,39,0.05)]"
              >
                <Quote size={34} className={`${isPurple ? 'text-pairley-purple/20' : 'text-pairley-green/25'}`} />
                <blockquote className="mt-3 text-[17px] leading-relaxed font-medium text-slate-700 font-inter">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg ${
                      isPurple ? 'bg-gradient-to-br from-pairley-purple to-pairley-purple-light' : 'bg-gradient-to-br from-pairley-green to-pairley-green-dark'
                    }`}
                  >
                    <t.icon size={19} />
                  </span>
                  <div>
                    <p className="font-outfit font-extrabold text-pairley-ink text-sm">{t.name}</p>
                    <p className="text-[12px] font-semibold text-slate-400">{t.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
