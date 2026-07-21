import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

export default function FinalCtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-purple to-brand-purple-dark px-6 py-16 sm:px-16 sm:py-20 text-center"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Join Pairley Today
            </h2>
            <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">
              Free for customers, one flat fee for merchants — no commission, ever.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup?role=customer')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white text-brand-purple font-bold text-base shadow-xl transition-transform"
              >
                Join as Customer
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup?role=business')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-colors"
              >
                <Store size={18} />
                Register as Merchant
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
