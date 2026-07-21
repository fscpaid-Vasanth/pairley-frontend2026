import { motion } from 'framer-motion';
import { fadeInUp } from './animations';

export default function BenefitCard({ icon: Icon, title, description, accent = 'purple', index = 0 }) {
  const accentBg = accent === 'green' ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-purple/15 text-brand-purple-light';
  const glow = accent === 'green' ? 'hover:shadow-glow-green' : 'hover:shadow-glow-purple';

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] ${glow} transition-[border-color,background-color,box-shadow] duration-300`}
    >
      <motion.div
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
        transition={{ duration: 0.4 }}
        className={`w-11 h-11 rounded-xl ${accentBg} flex items-center justify-center mb-4`}
      >
        <Icon size={20} strokeWidth={2.2} />
      </motion.div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </motion.div>
  );
}
