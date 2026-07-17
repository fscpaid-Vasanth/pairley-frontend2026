import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { merchantTestimonials } from '../../data/testimonials';

/**
 * Renders nothing until real merchant quotes exist in
 * src/data/testimonials.js — see that file for why. Drop real entries in
 * and this activates automatically; no other changes needed.
 */
export default function MerchantTestimonials() {
  if (!merchantTestimonials.length) return null;

  return (
    <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {merchantTestimonials.map(({ name, role, quote, photoUrl }, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-4"
        >
          <Quote className="w-5 h-5 text-brand-green" />
          <p className="text-white/80 text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-green flex items-center justify-center text-white text-xs font-bold">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-white text-sm font-bold">{name}</div>
              <div className="text-white/50 text-xs">{role}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
