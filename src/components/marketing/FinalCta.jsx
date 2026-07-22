import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import LandingButton from './LandingButton';
import { fadeInUp, revealViewport } from './animations';

export default function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-pairley-purple via-pairley-purple to-pairley-purple-dark px-8 py-14 sm:px-14 sm:py-20 text-center"
        >
          <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-pairley-green/25 blur-[100px]" />
          <div className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-white/10 blur-[110px]" />

          <div className="relative">
            <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white text-balance max-w-2xl mx-auto">
              Ready to save more, together?
            </h2>
            <p className="mt-5 text-lg text-white/80 font-inter max-w-2xl mx-auto leading-relaxed">
              Whether you're a customer looking for better local deals or a merchant looking for
              more customers, Pairley connects both sides of the marketplace.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <LandingButton
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto !bg-white !border-white hover:!bg-white/90"
                onClick={() => navigate('/deals')}
              >
                Explore Deals <ArrowRight size={17} />
              </LandingButton>
              <button
                onClick={() => navigate('/signup?role=business')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-[15px] font-bold font-outfit text-white border border-white/40 hover:bg-white/10 transition-all"
              >
                <Store size={17} /> Become a Merchant
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
