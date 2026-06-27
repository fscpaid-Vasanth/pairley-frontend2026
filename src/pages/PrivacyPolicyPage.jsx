import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Clock,
  Eye,
  Mail,
  MapPin,
  Lock
} from 'lucide-react';
import './PrivacyPolicyPage.css';

const PRIVACY_FAQ = [
  {
    id: 1,
    question: 'What personal information does Pairley collect?',
    answer: 'We collect your Name, Email address, and Mobile Number when you sign up or log in. We also request location permissions to help you find nearby group-buying offers and BOGO deals.'
  },
  {
    id: 2,
    question: 'How is my contact information shared?',
    answer: 'Pairley operates on a lead-matching direct coordination model. Your contact details (Name, Email, Phone number) are shared ONLY with the specific merchant whose deal you have registered interest in, once a BOGO or group match is initiated, so they can contact you directly offline to complete the transaction.'
  },
  {
    id: 3,
    question: 'Does Pairley store my payment or billing details?',
    answer: 'No. Pairley does not process or store any financial transactions, credit cards, or UPI details inside this application. All transactions and split payments are conducted directly offline with the merchant at the time of pickup or delivery.'
  },
  {
    id: 4,
    question: 'How does the app use my location data?',
    answer: 'We access your foreground and background location data to discover local merchants, calculate distances to deals, filter group offers by city, and send notifications when you are near active group-buying discounts.'
  }
];

export default function PrivacyPolicyPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (id) => {
    setActiveFaq(prev => prev === id ? null : id);
  };

  return (
    <div className="privacy-policy-page page-wrapper py-8 text-left">
      <SEO 
        title="Privacy Policy | Pairley" 
        description="Learn how Pairley collects, uses, and protects your personal data and coordinates matching details securely."
        canonicalUrl="https://www.pairley.com/privacy-policy"
      />
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#4E2BC4] transition">Home</Link>
          <span>/</span>
          <span className="text-slate-600">Privacy Policy</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 pb-5 border-b border-slate-100">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Privacy Policy</h2>
          <p className="text-sm text-slate-500 mt-1">
            Last Updated: June 27, 2026. Learn how we handle your personal coordinates and location data.
          </p>
        </div>

        {/* Introduction Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-8 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4E2BC4] flex items-center justify-center flex-shrink-0 border border-purple-100">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">Our Privacy Promise</h3>
            Your privacy is crucial to us. Pairley connects local buyers to share deals. We only collect essential information required to coordinate group-buying matches and share them directly with merchants. No payment details are ever saved.
          </div>
        </div>

        {/* Core Sections */}
        <div className="space-y-6 mb-10 text-xs md:text-sm leading-relaxed text-slate-500 font-semibold">
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-3 flex items-center gap-1.5">
              <Eye size={16} className="text-[#4E2BC4]" />
              1. Information We Collect
            </h4>
            <p>
              To provide a functional group-buying matching platform, we collect:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li><strong>Account Details:</strong> Full Name, Email Address, and Password Hash.</li>
              <li><strong>Contact Coordinates:</strong> Mobile Phone Number (required for OTP login and merchant offline calls).</li>
              <li><strong>Profile Information:</strong> Optional photo, gender, and city preference.</li>
              <li><strong>Merchant Documents:</strong> Aadhaar, GSTIN, PAN, and shop photos (for merchant partners only).</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-3 flex items-center gap-1.5">
              <MapPin size={16} className="text-emerald-500" />
              2. Location Data Usage
            </h4>
            <p>
              Pairley is a local commerce app. We require location permissions to operate properly:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>We access foreground location to calculate distance to shops and show nearby offers.</li>
              <li>We request background location access (mobile app only) to match you with nearby group-buyers and alert you to active local deals.</li>
              <li>You can disable location access at any time through your device settings, but some features may not function.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-3 flex items-center gap-1.5">
              <Lock size={16} className="text-amber-500" />
              3. Data Sharing & Security
            </h4>
            <p>
              We protect your data and do not sell it. It is only shared in matching contexts:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>When you show interest in a BOGO/Group deal, your Name, Email, and Phone are shared with the merchant to coordinate offline delivery/pickup.</li>
              <li>We use industry-standard encryption to protect your data stored via Firebase and Render servers.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base mb-3 flex items-center gap-1.5">
              <Mail size={16} className="text-blue-500" />
              4. Contact Us
            </h4>
            <p>
              If you have any questions about this Privacy Policy, your data permissions, or request data deletion, please contact us:
            </p>
            <ul className="list-none mt-2 space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Email:</span>
                <a href="mailto:support@pairley.com" className="text-[#4E2BC4] hover:underline">support@pairley.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Website:</span>
                <Link to="/privacy-policy" className="text-[#4E2BC4] hover:underline">www.pairley.com/privacy-policy</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* FAQs Accordion */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <HelpCircle size={16} className="text-[#4E2BC4]" />
            Privacy FAQ
          </h4>

          <div className="divide-y divide-slate-100">
            {PRIVACY_FAQ.map(faq => (
              <div key={faq.id} className="py-4 first:pt-2 last:pb-2">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center text-xs md:text-sm font-bold text-slate-700 hover:text-[#4E2BC4] transition text-left"
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
