import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -10
  }
};

const pageTransition = {
  type: 'tween',
  ease: [0.25, 1, 0.5, 1], // Custom cubic-bezier for a organic transition ease
  duration: 0.35
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
}

