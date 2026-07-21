import { motion } from 'framer-motion';

// Ambient background layer for the dark marketing page. Two intensities:
// "hero" (orbs + particles + faint connection lines, the one big moment)
// and "subtle" (a single soft corner glow) — repeating the full effect on
// every section would hurt Lighthouse for no real gain, so most sections
// get the light version and let their own content carry the motion.
// Every animated element here only ever transforms transform/opacity
// (GPU-friendly, no layout thrash), and the whole layer is skipped when
// prefers-reduced-motion is set (Tailwind's `motion-reduce:` variants).
export default function AmbientBackground({ variant = 'subtle', accent = 'purple' }) {
  const accentColor = accent === 'green' ? 'bg-brand-green' : accent === 'yellow' ? 'bg-brand-yellow' : 'bg-brand-purple';

  if (variant === 'subtle') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className={`absolute -top-24 right-0 w-[420px] h-[420px] ${accentColor}/10 rounded-full blur-[100px] motion-reduce:hidden`}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-20 w-[520px] h-[520px] bg-brand-purple/20 rounded-full blur-[110px] motion-reduce:!transform-none"
      />
      <motion.div
        animate={{ x: [0, -28, 0], y: [0, 22, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/3 -right-32 w-[460px] h-[460px] bg-brand-green/15 rounded-full blur-[110px] motion-reduce:!transform-none"
      />
      <motion.div
        animate={{ x: [0, 18, 0], y: [0, -18, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 left-1/3 w-[360px] h-[360px] bg-brand-yellow/10 rounded-full blur-[100px] motion-reduce:!transform-none"
      />

      {/* Faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Sparse floating particles — kept to a handful, not a full canvas system */}
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -16, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          className="hidden sm:block absolute w-1.5 h-1.5 rounded-full bg-white/60 motion-reduce:hidden"
          style={{ top: `${15 + i * 13}%`, left: `${8 + i * 15}%` }}
        />
      ))}
    </div>
  );
}
