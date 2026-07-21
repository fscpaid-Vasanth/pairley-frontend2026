import { motion } from 'framer-motion';
import { User, Heart, Users, Bell, Wallet } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const NODES = [
  { icon: User, label: 'Customer' },
  { icon: Heart, label: 'Shows Interest' },
  { icon: Users, label: 'More People Join' },
  { icon: Bell, label: 'Merchant Notified' },
  { icon: Wallet, label: 'Everyone Saves' },
];

const CYCLE = 4; // seconds — a full pass reads clearly within ~4-5s, on loop

// A single continuously-looping flow (not a scroll-stepped timeline) — the
// whole point is that a first-time visitor grasps the mechanic in one
// glance, so it plays on its own rather than waiting for scroll steps.
export default function ExplainFlowAnimation() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className="relative py-6"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-2">
        {NODES.map((node, i) => (
          <div key={node.label} className="flex flex-col sm:flex-row items-center sm:flex-1">
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.div
                animate={{
                  scale: [1, 1.18, 1],
                  boxShadow: [
                    '0 0 0 rgba(91,18,214,0)',
                    '0 0 28px rgba(91,18,214,0.55)',
                    '0 0 0 rgba(91,18,214,0)',
                  ],
                }}
                transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (i / NODES.length) * CYCLE,
                  times: [0, 0.5, 1],
                }}
                className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm flex items-center justify-center"
              >
                <node.icon size={24} className="text-brand-purple-light" />
              </motion.div>
              <p className="text-xs font-bold text-white/80 max-w-[100px]">{node.label}</p>
            </div>

            {i < NODES.length - 1 && (
              <div className="hidden sm:block flex-1 h-px mx-2 mt-8 bg-white/10 relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brand-purple-light to-transparent"
                  animate={{ x: ['-100%', '400%'] }}
                  transition={{
                    duration: CYCLE,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: (i / NODES.length) * CYCLE,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
