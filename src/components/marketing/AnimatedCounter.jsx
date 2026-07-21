import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// Counts up from 0 to `value` once the counter scrolls into view. Renders
// the real, live number passed in — this component has no opinion about
// where that number came from (see MarketingStats, which sources it from
// GET /public/stats) so it can never itself become a source of inflated
// numbers.
export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1200 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}
