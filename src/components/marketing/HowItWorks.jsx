import { motion } from 'framer-motion';
import { Megaphone, Search, Heart, Users, MessageCircle, CheckCircle2 } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

const STEPS = [
  { icon: Megaphone, title: 'Merchant posts an offer', desc: 'A local business publishes a deal in minutes.' },
  { icon: Search, title: 'Customers discover it', desc: 'Nearby shoppers find it in their feed.' },
  { icon: Heart, title: 'Customers show interest', desc: 'They join and signal what they want to pay.' },
  { icon: Users, title: 'Merchant sees demand', desc: 'Real, qualified customer leads roll in.' },
  { icon: MessageCircle, title: 'Merchant makes contact', desc: 'The business reaches out to close the deal.' },
  { icon: CheckCircle2, title: 'Deal completed', desc: 'Everyone meets, pays, and wins.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 bg-pairley-mist border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-purple">How Pairley Works</span>
          <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            From offer to done in six steps
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-inter">
            One simple flow connects both sides of the marketplace.
          </p>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={stagger}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4 relative"
        >
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-pairley-purple/30 via-pairley-green/30 to-pairley-orange/30" />

          {STEPS.map((step, i) => (
            <motion.li key={step.title} variants={fadeInUp} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0 lg:text-center">
              <div className="relative z-10 shrink-0 w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center lg:mx-auto">
                <step.icon size={22} className="text-pairley-purple" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-pairley-purple to-pairley-purple-light text-white text-[11px] font-bold flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <div className="lg:mt-4 lg:px-1">
                <h3 className="font-outfit text-[15px] font-extrabold text-pairley-ink leading-snug">{step.title}</h3>
                <p className="mt-1 text-[13px] text-slate-500 font-inter leading-relaxed">{step.desc}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
