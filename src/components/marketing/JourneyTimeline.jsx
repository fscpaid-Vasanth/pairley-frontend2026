import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

// Horizontal animated flow on desktop, vertical stack on mobile. `steps` is
// an array of { icon, label }. Arrows pulse continuously — a small, cheap
// (opacity/x transform only) cue that this is a live flow, not a static list.
export default function JourneyTimeline({ id, title, tagline, steps, accent = 'purple' }) {
  const dot = accent === 'green' ? 'bg-brand-green text-ink' : 'bg-brand-purple text-white';
  const arrowColor = accent === 'green' ? 'text-brand-green/60' : 'text-brand-purple-light/60';

  return (
    <section id={id} className="py-20 lg:py-28 bg-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{title}</h2>
          <p className="mt-3 text-white/50 max-w-lg mx-auto">{tagline}</p>
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
              <motion.div
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center text-center gap-3 lg:flex-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${dot} flex items-center justify-center shadow-lg`}>
                  <step.icon size={22} />
                </div>
                <p className="text-sm font-bold text-white/85 max-w-[130px]">{step.label}</p>
              </motion.div>

              {i < steps.length - 1 && (
                <>
                  <motion.div
                    animate={{ y: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className={`lg:hidden my-2 flex-shrink-0 ${arrowColor}`}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className={`hidden lg:block mt-6 flex-shrink-0 ${arrowColor}`}
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                </>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
