import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

// Horizontal timeline on desktop, vertical stack on mobile. `steps` is an
// array of { icon, label }.
export default function JourneyTimeline({ id, title, tagline, steps, accent = 'purple' }) {
  const dot = accent === 'green' ? 'bg-brand-green' : 'bg-brand-purple';

  return (
    <section id={id} className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">{tagline}</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="flex flex-col lg:flex-row items-center lg:items-start"
        >
          {steps.map((step, i) => (
            <div key={step.label} className="contents">
              <motion.div variants={fadeInUp} custom={i} className="flex flex-col items-center text-center gap-3 lg:flex-1">
                <div className={`w-14 h-14 rounded-2xl ${dot} text-white flex items-center justify-center shadow-lg`}>
                  <step.icon size={22} />
                </div>
                <p className="text-sm font-bold text-slate-800 max-w-[140px]">{step.label}</p>
              </motion.div>

              {i < steps.length - 1 && (
                <>
                  <ArrowDown size={18} className="lg:hidden text-slate-300 my-3 flex-shrink-0" />
                  <ArrowRight size={18} className="hidden lg:block text-slate-300 mt-6 flex-shrink-0" />
                </>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
