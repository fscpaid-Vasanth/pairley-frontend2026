import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const FAQS = [
  {
    q: 'Is Pairley free for customers?',
    a: 'Yes. Browsing deals, joining offers, and showing your interest are completely free for customers. You only pay the merchant directly when you complete a deal in person.',
  },
  {
    q: 'How do merchants receive leads?',
    a: 'The moment a customer shows interest, their details appear on the merchant dashboard — and merchants can also get instant WhatsApp notifications, so no qualified lead is ever missed.',
  },
  {
    q: 'Do customers pay online?',
    a: 'No. Pairley does not process online payments. All transactions happen offline, directly with the merchant, once they connect with you to complete the deal.',
  },
  {
    q: 'Can merchants contact interested customers?',
    a: 'Yes. Every interested customer’s contact details are shared with the merchant so they can reach out, confirm the deal, and arrange the store visit.',
  },
  {
    q: 'How does price selection work?',
    a: 'For eligible offers, customers choose the price they’re comfortable paying from the options a merchant sets. Merchants then see live demand at each price point before deciding.',
  },
  {
    q: 'Which cities are supported?',
    a: 'Pairley is rolling out across India, starting with Bangalore, Hubli, Hyderabad, Chennai, Pune and more. New cities are added as local merchants come on board.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-outfit text-[15px] sm:text-base font-bold text-pairley-ink">{item.q}</span>
        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-pairley-purple text-white' : 'bg-slate-100 text-slate-500'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 sm:px-6 pb-5 text-[14px] leading-relaxed text-slate-500 font-inter">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-purple">FAQ</span>
          <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            Questions, answered
          </h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <FaqItem key={item.q} item={item} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
