import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WelcomeCelebration({ onDismiss }) {
  useEffect(() => {
    let cancelled = false;
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return;
      const colors = ['#6D28D9', '#A78BFA', '#22C55E', '#ffffff'];
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 }, colors });
      setTimeout(() => {
        if (!cancelled) confetti({ particleCount: 80, spread: 120, origin: { y: 0.3 }, colors });
      }, 300);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="launch-celebration"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="launch-celebration__inner"
      >
        <div style={{ fontSize: 44 }}>🎉</div>
        <h2 className="launch-title" style={{ fontSize: 26, margin: '10px 0 6px' }}>
          Welcome to Pairley Launch Pass!
        </h2>
        <p className="launch-subtitle" style={{ marginBottom: 22 }}>
          You are among Bangalore's earliest members.
        </p>
        <button className="launch-btn launch-btn--primary launch-btn--block" onClick={onDismiss} type="button">
          View My Pass
        </button>
      </motion.div>
    </motion.div>
  );
}
