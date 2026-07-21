import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import MarketingStats from './MarketingStats';
import { fadeInUp, stagger } from './animations';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white">
      {/* Soft brand-tinted glow — accent only, not the dominant surface */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-brand-purple/[0.06] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy column */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold tracking-wide">
                India's Hyperlocal Group Buying Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-slate-900"
            >
              More Interest.
              <br />
              <span className="text-brand-purple">More Discounts.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Pairley connects nearby customers to local businesses — the more
              people show interest in an offer, the more everyone saves.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={3}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup?role=customer')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-brand-purple hover:bg-brand-purple-dark text-white font-bold text-base shadow-lg shadow-brand-purple/25 transition-colors"
              >
                I'm a Customer
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup?role=business')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border-2 border-slate-200 hover:border-brand-purple/40 bg-white text-slate-800 font-bold text-base transition-colors"
              >
                <Store size={18} />
                I'm a Merchant
              </motion.button>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4} className="mt-12">
              <MarketingStats />
            </motion.div>
          </motion.div>

          {/* Visual column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
