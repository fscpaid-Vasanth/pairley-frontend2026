// Shared Framer Motion variants for the marketing/landing page — kept in
// one place so every section scrolls in consistently instead of each
// component hand-rolling its own timing.
export const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Default viewport options for scroll-triggered reveals — `once: true` so
// sections don't re-animate every time they scroll back into view.
export const revealViewport = { once: true, amount: 0.25 };
