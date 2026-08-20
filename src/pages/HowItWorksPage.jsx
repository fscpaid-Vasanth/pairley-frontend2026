import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import HowPairleyWorksSection from '../components/marketing/HowPairleyWorksSection';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import './HowItWorksPage.css';

const FAQS = [
  {
    q: 'What is Pairley?',
    a: 'Pairley is a group buying and deal-sharing platform. We connect people with the same buying interests so they can pair up or form groups to unlock massive discounts (like BOGO splits or tiered group pricing) directly from businesses.',
  },
  {
    q: 'How does a Pair Deal work?',
    a: 'Pair deals are designed for Buy One Get One (BOGO) offers. When you show interest, we look for another buyer. Once matched, you each pay 50% of the price and both get one quantity of the item. It is a win-win: the business sells 2 items, and you get a 50% discount!',
  },
  {
    q: 'How does Group Pricing work for tours or bookings?',
    a: 'For tours and service deals, businesses set discount tiers based on group sizes (e.g. ₹15,000/head for 4 people, ₹10,000/head for 10 people). Any interested user can join the group. As more people join, the price per head drops for everyone in the group.',
  },
  {
    q: 'Do I have to pay immediately?',
    a: 'No. Pairley does not charge you in-app. You express interest to join the pairing pool or group, and your details stay private — the merchant only sees your contact info if they explicitly choose to unlock it from their dashboard. Payment happens directly with the merchant, offline.',
  },
  {
    q: 'Can I chat with other interested customers?',
    a: 'Yes! Once you show interest in an offer, you can join that offer\'s anonymous group chat with every other customer who\'s interested — under a stable "Pairley Member" identity, never your real name or number. The merchant is never part of this conversation; they only see how many people are interested, never the messages.',
  },
  {
    q: 'Is Pairley free to use for customers?',
    a: 'Yes, Pairley is completely free for customers to join, browse deals, and pair up. We do not charge customers any service fee. We partner directly with merchants who benefit from bulk sales.',
  },
  {
    q: 'How do I create deals as a business owner?',
    a: 'Simple! Register your account as a Business Owner. Once logged in, you can go to your dashboard, click "Create Your Offer", fill out the BOGO or tiered group details, upload images, and publish. Your deal goes live instantly for all customers to browse.',
  },
  {
    q: 'What happens if a pair match is not found before the deal expires?',
    a: 'If the deal deadline is reached and a partner isn\'t found, the request simply expires with no penalty or cost to you. You can try joining another active deal or share the deal link with a friend to get matched instantly!',
  }
];

export default function HowItWorksPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="how-it-works-page page-wrapper py-8">
      <SEO
        title="How It Works — Group Buying with Pairley"
        description="Learn how Pairley's group buying works. Customers join local deals from restaurants, gyms, salons and retailers. Reach the group target together and unlock exclusive savings."
        keywords="how group buying works, how Pairley works, group deal explained, pair up deals India"
        canonical="https://www.pairley.com/how-it-works"
      />
      {/* Hero Header */}

      <section className="how-it-works-page__hero relative overflow-hidden mb-12 py-16 text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl filter animate-pulse"></div>
          <div className="w-[300px] h-[300px] bg-emerald-500 rounded-full blur-3xl filter ml-40"></div>
        </div>
        
        <div className="container max-w-4xl mx-auto px-4">
          <motion.span 
            className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#5B12D6] bg-[#5B12D6]/10 border border-[#5B12D6]/20 inline-block mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            How it works
          </motion.span>
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0F172A] mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Shopping is Better <span className="bg-gradient-to-r from-[#5B12D6] to-[#7C3AED] bg-clip-text text-transparent">Together</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Pairley is India's premier co-buying platform. Split Buy-One-Get-One (BOGO) deals with partners or join group circles to unlock steeper discounts as more people join.
          </motion.p>
        </div>
      </section>

      <HowPairleyWorksSection />


      {/* FAQ Accordion Section */}
      <section className="container max-w-4xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
            <HelpCircle className="text-[#5B12D6]" size={28} />
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 mt-2">Have a question? We have answered the most common inquiries below.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-purple-300 bg-purple-50/20 shadow-md' 
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 transition-colors duration-200 hover:text-[#5B12D6]"
                >
                  <span className="text-sm md:text-base pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    isOpen ? 'bg-[#5B12D6] text-white border-transparent rotate-180' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="p-5 pt-0 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Conversion Box */}
      <section className="container max-w-5xl mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-[#5B12D6] to-[#7C3AED] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
          {/* Floating abstract decorative blobs */}
          <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Saving Together Today</h2>
            <p className="text-sm md:text-base text-purple-100/90 mb-8 leading-relaxed">
              Unlock the best prices on dinners, activities, electronics, and hotel bookings. Sign up in under 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={ROUTES.SIGNUP} className="w-full sm:w-auto px-8 py-4 bg-white text-[#5B12D6] font-bold rounded-2xl shadow-lg hover:bg-slate-50 hover:scale-[1.02] active:scale-100 transition-all duration-200">
                Join Pairley Free
              </Link>
              <Link to={ROUTES.DEALS} className="w-full sm:w-auto px-8 py-4 bg-purple-600/30 text-white font-bold border border-white/20 rounded-2xl hover:bg-purple-600/50 hover:scale-[1.02] active:scale-100 transition-all duration-200">
                Explore Deals
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


