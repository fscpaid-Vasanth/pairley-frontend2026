import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Store, 
  ShieldCheck, 
  MessageSquare, 
  Landmark, 
  Award, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Users, 
  HelpCircle,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Gift
} from 'lucide-react';
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
    a: 'No. Pairley does not charge you in-app. You express interest to join the pairing pool or group, and we share your contact details with the merchant. The shop owner will call or WhatsApp you directly to complete the match and complete payment offline.',
  },
  {
    q: 'Can I chat with my matched pair partner?',
    a: 'Yes! Once a pair is matched, a secure chat room opens between you two. You can coordinate collection, shipping, or details. You can also chat directly with the business owner.',
  },
  {
    q: 'Is Pairley free to use for customers?',
    a: 'Yes, Pairley is completely free for customers to join, browse deals, and pair up. We do not charge customers any service fee. We partner directly with merchants who benefit from bulk sales.',
  },
  {
    q: 'How do I create deals as a business owner?',
    a: 'Simple! Register your account as a Business Owner. Once logged in, you can go to your dashboard, click "Create New Deal", fill out the BOGO or tiered group details, upload images, and publish. Your deal goes live instantly for all customers to browse.',
  },
  {
    q: 'What happens if a pair match is not found before the deal expires?',
    a: 'If the deal deadline is reached and a partner isn\'t found, the request simply expires with no penalty or cost to you. You can try joining another active deal or share the deal link with a friend to get matched instantly!',
  }
];

export default function HowItWorksPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [simMode, setSimMode] = useState('bogo'); // 'bogo' or 'group'
  const [bogoStep, setBogoStep] = useState(0);
  const [groupPeople, setGroupPeople] = useState(1);
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'merchant'

  // Auto-progress BOGO simulation
  useEffect(() => {
    if (simMode !== 'bogo') return;
    const timer = setInterval(() => {
      setBogoStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [simMode]);

  // Auto-progress Group simulation
  useEffect(() => {
    if (simMode !== 'group') return;
    const timer = setInterval(() => {
      setGroupPeople((prev) => {
        if (prev >= 10) return 1;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [simMode]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Pricing calculation helper for Group Simulation
  const getGroupPrice = (people) => {
    if (people >= 8) return 900;
    if (people >= 4) return 1200;
    return 1500;
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

      {/* Interactive Simulator Section */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#5B12D6]/5 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <Sparkles className="text-purple-600" size={24} />
              Interactive Deal Simulator
            </h2>
            <p className="text-sm text-slate-500 mt-1">Select a mode below to see how Pairley matches buyers and drops prices.</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner border border-slate-200">
              <button
                onClick={() => setSimMode('bogo')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  simMode === 'bogo'
                    ? 'bg-[#5B12D6] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users size={16} />
                BOGO Split Mode
              </button>
              <button
                onClick={() => setSimMode('group')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  simMode === 'group'
                    ? 'bg-[#5B12D6] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TrendingDown size={16} />
                Group Savings Mode
              </button>
            </div>
          </div>

          {/* Simulation Viewport */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 md:p-10 min-h-[300px] flex flex-col justify-between shadow-inner">
            {simMode === 'bogo' ? (
              /* BOGO Simulation */
              <div className="flex flex-col items-center justify-between h-full w-full">
                <div className="flex justify-between items-center w-full max-w-md mb-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">BOGO Deal: Buy 1 Get 1 Free Shoes</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
                    Live Matching
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 md:gap-12 py-6 relative w-full max-w-lg">
                  {/* Connector Line */}
                  <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-slate-200 -translate-y-1/2 z-0">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: bogoStep >= 2 ? '100%' : '0%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>

                  {/* Buyer 1: Arjun */}
                  <div className="flex flex-col items-center z-10 w-24">
                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-purple-100 flex items-center justify-center text-2xl relative">
                      🧑🏽
                      {bogoStep >= 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[9px]">
                          <CheckCircle2 size={12} />
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-slate-700 mt-2">Arjun (You)</div>
                    <div className="text-[10px] text-slate-400">Searching</div>
                  </div>

                  {/* Match Indicator */}
                  <div className="z-10 w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg">
                    {bogoStep === 0 && <span className="text-slate-300 font-bold text-lg">?</span>}
                    {bogoStep === 1 && <span className="text-[#5B12D6] font-bold text-xs animate-pulse">Matching</span>}
                    {bogoStep >= 2 && <span className="text-emerald-500 font-bold text-lg">🤝</span>}
                  </div>

                  {/* Buyer 2: Priya */}
                  <div className="flex flex-col items-center z-10 w-24">
                    <div className={`w-16 h-16 rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl relative transition-all duration-500 ${
                      bogoStep >= 2 ? 'bg-emerald-100 opacity-100 scale-100' : 'bg-slate-200 opacity-40 scale-90'
                    }`}>
                      👩🏻
                      {bogoStep >= 2 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[9px]">
                          <CheckCircle2 size={12} />
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-slate-700 mt-2">Priya</div>
                    <div className="text-[10px] text-slate-400">{bogoStep >= 2 ? 'Matched!' : 'Waiting...'}</div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="text-center mt-6 min-h-[50px] max-w-md">
                  <AnimatePresence mode="wait">
                    {bogoStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-slate-600"
                      >
                        🛍️ You show interest in the Buy-1-Get-1 deal. The price is ₹2,000 for BOGO. You only pay <strong>₹1,000</strong> if a partner is found.
                      </motion.div>
                    )}
                    {bogoStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-purple-600 font-medium"
                      >
                        🔍 Pairley's intelligent matchmaker scans for other buyers interested in this deal in your city...
                      </motion.div>
                    )}
                    {bogoStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-emerald-600 font-semibold"
                      >
                        ✨ Matched! Priya is paired with you. You both unlock the 50% split.
                      </motion.div>
                    )}
                    {bogoStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-slate-800"
                      >
                        🎉 <strong>BOGO Unlocked!</strong> You pay ₹1,000, Priya pays ₹1,000. Shop owner ships one item to each! You saved 50%!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2 mt-4">
                  {[0, 1, 2, 3].map((step) => (
                    <button
                      key={step}
                      onClick={() => setBogoStep(step)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        bogoStep === step ? 'bg-[#5B12D6] w-6' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Group Simulation */
              <div className="flex flex-col items-center justify-between h-full w-full">
                <div className="flex justify-between items-center w-full max-w-md mb-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Group Booking: Kerala Resort Tour</div>
                  <div className="text-xs font-bold text-[#5B12D6]">
                    {groupPeople} Joined
                  </div>
                </div>

                {/* Main Progress Indicator */}
                <div className="w-full max-w-xl py-4">
                  {/* Dynamic Price Tag */}
                  <div className="flex justify-between items-end mb-4 px-2">
                    <div>
                      <div className="text-xs text-slate-400 uppercase">Current Price per head</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        ₹{getGroupPrice(groupPeople)}
                        <span className="text-xs text-slate-400 font-normal"> / head</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase">Tier Discount</div>
                      <div className="text-sm font-semibold text-[#5B12D6]">
                        {groupPeople >= 8 ? '40% Off Unlocked! 🔥' : groupPeople >= 4 ? '20% Off Unlocked!' : 'Base Price'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="h-4 bg-slate-200 rounded-full relative overflow-hidden mb-6 border border-slate-300/40">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 rounded-full"
                      animate={{ width: `${(groupPeople / 10) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 60 }}
                    />
                    
                    {/* Tiers Markers */}
                    <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-white/60"></div>
                    <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white/60"></div>
                  </div>

                  {/* Tier Labels */}
                  <div className="grid grid-cols-3 text-center text-xs font-medium text-slate-500">
                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${groupPeople < 4 ? 'bg-purple-100 text-purple-700 font-bold' : ''}`}>
                      Base: ₹1,500<br/>(1-3 people)
                    </div>
                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${groupPeople >= 4 && groupPeople < 8 ? 'bg-indigo-100 text-indigo-700 font-bold' : ''}`}>
                      Tier 1: ₹1,200<br/>(4-7 people)
                    </div>
                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${groupPeople >= 8 ? 'bg-emerald-100 text-emerald-700 font-bold' : ''}`}>
                      Tier 2: ₹900<br/>(8+ people)
                    </div>
                  </div>
                </div>

                {/* Animated Avatars List */}
                <div className="flex justify-center -space-x-3 overflow-hidden py-4 min-h-[60px] items-center">
                  {Array.from({ length: groupPeople }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: -20, opacity: 0 }}
                      animate={{ scale: 1, x: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                    >
                      {['🧑🏽', '👩🏻', '👨🏼', '👧🏾', '👦🏻', '👱‍♀️', '👨🏽', '👵🏼', '👴🏾', '👩🏽'][i % 10]}
                    </motion.div>
                  ))}
                  {groupPeople < 10 && (
                    <div className="h-9 w-9 rounded-full ring-2 ring-white bg-[#5B12D6]/10 text-[#5B12D6] flex items-center justify-center text-xs font-bold animate-pulse">
                      +
                    </div>
                  )}
                </div>

                {/* Info Text */}
                <div className="text-sm text-slate-600 text-center max-w-md">
                  👥 When group size hits <strong>4 people</strong>, price falls to ₹1,200. At <strong>8 people</strong>, price crashes to <strong>₹900</strong> for everyone! Invite friends to unlock lowest price.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Journeys Switcher Tabs */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800">Choose Your Path</h2>
          <p className="text-slate-500 mt-2">Whether you want to buy items or sell products, we've designed it to be effortless.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'customer'
                  ? 'bg-white text-[#5B12D6] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User size={16} />
              For Customers
            </button>
            <button
              onClick={() => setActiveTab('merchant')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'merchant'
                  ? 'bg-white text-[#5B12D6] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store size={16} />
              For Business Owners
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'customer' ? (
              <motion.div
                key="customer-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-10 items-center"
              >
                {/* Steps Cards */}
                <div className="space-y-6">
                  {[
                    {
                      num: '01',
                      title: 'Browse Active Deals',
                      desc: 'Check out local stores offering BOGO splits or group discount packages (tours, salon, buffet, services).',
                      iconColor: 'bg-indigo-100 text-indigo-600',
                    },
                    {
                      num: '02',
                      title: 'Express Interest & Invite',
                      desc: 'Click "Show Interest" to enter the pairing pool. Share the deal page with friends to match even faster.',
                      iconColor: 'bg-purple-100 text-purple-600',
                    },
                    {
                      num: '03',
                      title: 'Direct Merchant Contact',
                      desc: 'Once matched, the shop owner will contact both co-buyers directly to finalize the BOGO deal offline.',
                      iconColor: 'bg-emerald-100 text-emerald-600',
                    },
                    {
                      num: '04',
                      title: 'Save up to 50%',
                      desc: 'Redeem your voucher directly at the shop or get your item shipped. Enjoy BOGO benefits without buying double!',
                      iconColor: 'bg-amber-100 text-amber-600',
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg ${step.iconColor}`}>
                        {step.num}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base group-hover:text-[#5B12D6] transition-colors duration-200">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature Graphic */}
                <div className="bg-gradient-to-tr from-[#5B12D6]/10 to-[#7C3AED]/5 border border-purple-100 p-8 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden h-[420px]">
                  <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">Benefits for you</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-3 mb-4">Smart Shopping & Verified Savings</h3>
                    
                    <ul className="space-y-4">
                      {[
                        { title: 'BOGO Splits', text: 'Halve the cost of single item purchases without buy-double pressure.' },
                        { title: 'Organic Groups', text: 'No need to organize large groups on your own; our platform fills slots automatically.' },
                        { title: 'Verified Merchants', size: 16, text: 'Every restaurant, resort, and shop owner is verified with legitimate business documentation.' },
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-3">
                          <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <strong className="text-xs text-slate-800 block">{item.title}</strong>
                            <span className="text-[11px] text-slate-500">{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-purple-100/50 flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-500">Ready to start?</div>
                    <Link to={ROUTES.DEALS} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B12D6] hover:underline">
                      Explore Active Deals <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="merchant-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-10 items-center"
              >
                {/* Feature Graphic */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-100 p-8 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden h-[420px] order-2 md:order-1">
                  <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Merchant Perks</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-3 mb-4">Scale Sales & Clear Inventory Faster</h3>
                    
                    <ul className="space-y-4">
                      {[
                        { title: 'Boost Order Volume', text: 'Customers behave as your sales advocates, sharing your deals with peers to complete pairs.' },
                        { title: 'Zero Advertising Spend', text: 'Targeted reach connects you with active shoppers already exploring your categories.' },
                        { title: 'No Hidden Fees', text: 'Listing deals is completely free. Set your price margins and retain full control.' },
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-3">
                          <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <strong className="text-xs text-slate-800 block">{item.title}</strong>
                            <span className="text-[11px] text-slate-500">{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-emerald-100/50 flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-500">Got a business?</div>
                    <Link to={ROUTES.SIGNUP} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline">
                      Register as Merchant <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Steps Cards */}
                <div className="space-y-6 order-1 md:order-2">
                  {[
                    {
                      num: '01',
                      title: 'Register Your Shop',
                      desc: 'Create a free business account and fill out basic tax credentials to build trust with local customers.',
                      iconColor: 'bg-emerald-100 text-emerald-600',
                    },
                    {
                      num: '02',
                      title: 'Configure Your Deal Tiers',
                      desc: 'Use the Deal Creator to upload product images, set prices, and configure BOGO pair limits or Group pricing tiers.',
                      iconColor: 'bg-teal-100 text-teal-600',
                    },
                    {
                      num: '03',
                      title: 'Approve & Coordinate Matches',
                      desc: 'We auto-match buyers. When a pair completes, you get notified. Chat with customers to coordinate pick-up or shipping details.',
                      iconColor: 'bg-indigo-100 text-indigo-600',
                    },
                    {
                      num: '04',
                      title: 'Attract Repeat Customers',
                      desc: 'Delight buyers with your products. Customers who save together are 3x more likely to return for future listings.',
                      iconColor: 'bg-purple-100 text-purple-600',
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg ${step.iconColor}`}>
                        {step.num}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base group-hover:text-emerald-600 transition-colors duration-200">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

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


