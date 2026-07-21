import { useState } from 'react';
import { motion } from 'framer-motion';

// Shared CTA button — primary (purple gradient), secondary (green outline),
// white (for use on the purple final-CTA banner). Lift + glow on hover,
// scale on tap, and a real ripple-from-click-point effect, all built on
// transform/opacity so it stays GPU-friendly.
const VARIANTS = {
  primary: 'bg-gradient-to-r from-brand-purple to-brand-purple-light text-white shadow-lg shadow-brand-purple/30 hover:shadow-glow-purple',
  secondary: 'bg-transparent border-2 border-brand-green/50 text-brand-green hover:bg-brand-green/10 hover:border-brand-green hover:shadow-glow-green',
  white: 'bg-white text-brand-purple hover:shadow-xl',
  ghost: 'bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:border-white/25',
};

export default function MarketingButton({ children, variant = 'primary', onClick, className = '', type = 'button', ...rest }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`relative overflow-hidden flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base transition-[background,box-shadow,border-color] duration-200 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_0.6s_ease-out]"
          style={{ left: r.x, top: r.y, width: 10, height: 10, marginLeft: -5, marginTop: -5 }}
        />
      ))}
    </motion.button>
  );
}
