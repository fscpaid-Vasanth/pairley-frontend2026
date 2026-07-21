import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import PriceDropShowcase from './PriceDropShowcase';
import MarketingStats from './MarketingStats';
import MarketingButton from './MarketingButton';
import AmbientBackground from './AmbientBackground';
import { fadeInUp, stagger } from './animations';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-ink">
      <AmbientBackground variant="hero" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/70 text-xs font-semibold tracking-wide">
                India's Hyperlocal Group Buying Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white"
            >
              More Interest.
              <br />
              <span className="bg-gradient-to-r from-brand-purple-light via-brand-purple to-brand-green bg-clip-text text-transparent">
                More Discounts.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 text-lg text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Pairley connects nearby customers to local businesses — the more
              people show interest in an offer, the more everyone saves.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={3}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <MarketingButton variant="primary" onClick={() => navigate('/signup?role=customer')} className="w-full sm:w-auto">
                I'm a Customer
              </MarketingButton>
              <MarketingButton variant="secondary" onClick={() => navigate('/signup?role=business')} className="w-full sm:w-auto">
                <Store size={18} />
                I'm a Merchant
              </MarketingButton>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4} className="mt-12">
              <MarketingStats />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <PriceDropShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
