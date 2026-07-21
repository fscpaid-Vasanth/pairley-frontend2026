import { motion } from 'framer-motion';
import { fadeInUp } from './animations';

export default function BenefitCard({ icon: Icon, title, description, accent = 'purple', index = 0 }) {
  const accentBg = accent === 'green' ? 'bg-brand-green/10 text-brand-green-dark' : 'bg-brand-purple/10 text-brand-purple';

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
    >
      <div className={`w-11 h-11 rounded-xl ${accentBg} flex items-center justify-center mb-4`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}
