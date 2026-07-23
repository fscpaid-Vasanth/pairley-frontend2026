import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// Shared scroll-triggered count-up used by the dashboard KPIs and the
// price-discovery interest counts. Eases 0 → target once the element
// scrolls into view; supports a prefix (₹), suffix (L / +), and decimals
// (for values like ₹1.4L). Reduced-motion users just see the final value.
export default function CountUp({ target, prefix = '', suffix = '', decimals = 0, duration = 1500, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [val, setVal] = useState(prefersReduced ? target : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, prefersReduced]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-IN');
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
