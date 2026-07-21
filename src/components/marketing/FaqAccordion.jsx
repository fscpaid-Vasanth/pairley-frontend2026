import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeInUp, revealViewport } from './animations';

const CUSTOMER_FAQS = [
  { q: 'What is Pairley?', a: 'A hyperlocal platform where nearby customers and local businesses connect — you discover real discounts from shops and services near you.' },
  { q: 'How do I save money?', a: 'The more people show interest in an offer, the bigger the discount. You can also pick a smart-discount price that works for you.' },
  { q: 'Why should I join?', a: "You get access to local deals you won't find on generic coupon sites, from businesses that have been verified." },
  { q: 'How is Pairley different?', a: 'Discounts respond to real, local demand instead of being fixed in advance — and everything is hyperlocal, not city-wide.' },
  { q: 'Is it free?', a: 'Yes. Joining and browsing offers is completely free for customers, with no subscription or hidden charges.' },
  { q: 'How do I start?', a: "Create a free account, browse offers near you, and tap 'Show Interest' on anything you like." },
];

const MERCHANT_FAQS = [
  { q: 'How does Pairley bring me customers?', a: 'Nearby customers browsing Pairley discover your offers directly — no ad spend required to be seen.' },
  { q: 'Why should I list my offers?', a: 'You reach customers who are already looking for a deal like yours, and only hear from people who showed real interest.' },
  { q: 'Why is Pairley better than traditional advertising?', a: "You pay one flat monthly fee, not per click or impression — so your cost doesn't rise just because more people see your offer." },
  { q: 'What does it cost?', a: 'A simple monthly subscription with no commission on your sales, ever.' },
  { q: 'How quickly can I start?', a: 'Register your business, get verified, and publish your first offer the same day.' },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-semibold text-slate-800">{q}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqAccordion() {
  const [audience, setAudience] = useState('customer');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = audience === 'customer' ? CUSTOMER_FAQS : MERCHANT_FAQS;

  const handleAudienceChange = (value) => {
    setAudience(value);
    setOpenIndex(0);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => handleAudienceChange('customer')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              audience === 'customer' ? 'bg-brand-purple text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            For Customers
          </button>
          <button
            onClick={() => handleAudienceChange('merchant')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              audience === 'merchant' ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            For Merchants
          </button>
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="rounded-2xl border border-slate-200 px-5 sm:px-6"
        >
          {faqs.map((faq, i) => (
            <FaqItem
              key={faq.q}
              {...faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
