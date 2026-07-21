import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';
import MarketingButton from './MarketingButton';

export default function FinalCtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-ink">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="relative rounded-3xl overflow-hidden px-6 py-16 sm:px-16 sm:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, #5B12D6 0%, #430bb0 55%, #16a34a 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-72 h-72 bg-brand-yellow rounded-full blur-[100px] pointer-events-none motion-reduce:hidden"
          />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Ready to Unlock Better Deals Together?
            </h2>
            <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">
              Free for customers, one flat fee for merchants — no commission, ever.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <MarketingButton variant="white" onClick={() => navigate('/signup?role=customer')} className="w-full sm:w-auto">
                Join as Customer
              </MarketingButton>
              <MarketingButton variant="ghost" onClick={() => navigate('/signup?role=business')} className="w-full sm:w-auto">
                <Store size={18} />
                Register as Merchant
              </MarketingButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
