import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

// Secondary conversion path (Decision 3) — deliberately small and placed
// below the main content, not competing with the primary customer/merchant
// signup CTAs for attention.
export default function LaunchPassStrip() {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-slate-50 border-y border-slate-100">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
      >
        <p className="text-sm text-slate-600">
          <span className="font-bold text-slate-800">Launch Pass</span> — register early and be first in line when we launch in your city.
        </p>
        <button
          onClick={() => navigate('/launch')}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-purple hover:text-brand-purple-dark transition-colors"
        >
          Get your Launch Pass
          <ArrowRight size={15} />
        </button>
      </motion.div>
    </section>
  );
}
