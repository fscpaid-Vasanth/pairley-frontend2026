import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Store, Users, Tag, Clock } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

// Self-contained count-up: eases from 0 to `target` once the stat scrolls
// into view. Non-numeric stats (e.g. "24×7") pass `static` and skip it.
function StatCounter({ target, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1500;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(val).toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

const STATS = [
  { icon: Store, target: 500, suffix: '+', label: 'Merchant Partners Target' },
  { icon: Users, target: 100000, suffix: '+', label: 'Founding Members Goal' },
  { icon: Tag, target: 5000, suffix: '+', label: 'Live Offers Goal' },
  { icon: Clock, staticValue: '24×7', label: 'Smart Deal Discovery' },
];

export default function StatsBand() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={stagger}
          className="relative rounded-[2rem] bg-gradient-to-br from-pairley-purple to-pairley-purple-dark p-10 sm:p-14 overflow-hidden"
        >
          {/* Decorative glows */}
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-pairley-green/20 blur-[100px]" />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-white/10 blur-[100px]" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeInUp} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white/12 backdrop-blur-sm flex items-center justify-center mb-4">
                  <s.icon size={22} className="text-white" />
                </div>
                <p className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {s.staticValue ? s.staticValue : <StatCounter target={s.target} suffix={s.suffix} />}
                </p>
                <p className="mt-2 text-[13px] font-semibold text-white/70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
