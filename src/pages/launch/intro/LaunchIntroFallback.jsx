import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ['DISCOVER', 'CONNECT', 'GROW'];

/**
 * Lightweight, no-WebGL intro shown on reduced-motion or low-end devices in
 * place of ParticleLogoIntro. Same beats (logo, three words, done) at a
 * fraction of the cost.
 */
export default function LaunchIntroFallback({ onComplete }) {
  const [wordIndex, setWordIndex] = useState(-1);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setWordIndex(0), 500));
    timers.push(setTimeout(() => setWordIndex(1), 1300));
    timers.push(setTimeout(() => setWordIndex(2), 2100));
    timers.push(setTimeout(() => onComplete?.(), 3100));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="launch-intro-fallback">
      <motion.img
        src="/logo.svg"
        alt="Pairley"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="launch-intro-fallback__logo"
      />
      <AnimatePresence mode="wait">
        {wordIndex >= 0 && (
          <motion.div
            key={WORDS[wordIndex]}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="launch-intro-fallback__word"
          >
            {WORDS[wordIndex]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
