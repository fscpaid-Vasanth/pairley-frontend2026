import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { 

  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Info,
  Clock,
  AlertTriangle
} from 'lucide-react';
import './RefundPolicyPage.css';

const MOCK_POLICY_FAQ = [
  {
    id: 1,
    question: 'How does the direct merchant contact matching work?',
    answer: 'Pairley operates on a lead-matching direct coordination model. When you express interest, no money is charged. We send your contact coordinates directly to the shop owner, who will call or WhatsApp you to complete the BOGO match and process the sale offline.'
  },
  {
    id: 2,
    question: 'Can I withdraw my interest after registering?',
    answer: 'Yes! You can manually withdraw your matching interest from your customer dashboard at any time before the merchant contacts you and finalizes the sale.'
  },
  {
    id: 3,
    question: 'What if the merchant fails to contact me or cancels the deal?',
    answer: 'If the merchant removes the deal or does not reach out within the matching window, your registration is simply cancelled. There are no fees or billing penalties.'
  },
  {
    id: 4,
    question: 'Are there any hidden service fees or charges?',
    answer: 'No! Expressing interest on Pairley is 100% free. You only pay the merchant directly (via Cash, UPI, or Card at pickup/delivery) when they contact you offline to finalize the split sale.'
  }
];

export default function RefundPolicyPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (id) => {
    setActiveFaq(prev => prev === id ? null : id);
  };

  return (
    <div className="refund-policy-page page-wrapper py-8 text-left">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#5B12D6] transition">Home</Link>
          <span>/</span>
          <span className="text-slate-600">Refund & Matching Policy</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 pb-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Refunds & Matching Policy</h2>
            <p className="text-sm text-slate-500 mt-1">
              Understand our direct contact matching coordinates sharing and offline fulfillment guidelines.
            </p>
          </div>
        </div>

        {/* Introduction Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-8 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B12D6] flex items-center justify-center flex-shrink-0 border border-purple-100">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Direct Merchant Contact Model</h3>
            Pairley operates on a **Lead Matching Direct Coordination** model. We do not bill or process payment details inside this app. You only register matching interest for BOGO splits, which is shared directly with the shop owner to fulfill the match and sale offline.
          </div>
        </div>

        {/* Core Rules Sections */}
        <div className="space-y-6 mb-10 text-xs md:text-sm leading-relaxed text-slate-500 font-semibold">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-3 flex items-center gap-1.5">
              <Clock size={16} className="text-[#5B12D6]" />
              1. Direct Lead Sharing
            </h4>
            <p>
              Once you submit interest, your contact credentials (Name, Phone, Email) are shared securely with the shop owner so they can reach you directly.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>No billing coordinates are saved or stored in-app.</li>
              <li>You can withdraw your matching interest anytime prior to contact.</li>
              <li>There are no service charges or processing fees.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-3 flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-500" />
              2. Offline Completion
            </h4>
            <p>
              The merchant is responsible for matching the buyers, contacting you to complete billing, and distributing your split BOGO packages offline:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>Payments are made directly to the merchant (UPI/Cash/Card) at fulfillment.</li>
              <li>Disputes or shipment tracking should be coordinated directly with the store owner.</li>
            </ul>
          </div>
        </div>

        {/* Legal Policy accordion */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <HelpCircle size={16} className="text-[#5B12D6]" />
            Frequently Asked Questions
          </h4>

          <div className="divide-y divide-slate-100">
            {MOCK_POLICY_FAQ.map(faq => (
              <div key={faq.id} className="py-4 first:pt-2 last:pb-2">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center text-xs md:text-sm font-bold text-slate-700 hover:text-[#5B12D6] transition text-left"
                >
                  {faq.question}
                  {activeFaq === faq.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {activeFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed mt-2.5 font-semibold">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

