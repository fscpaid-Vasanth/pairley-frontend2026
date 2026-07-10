import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

import { 
  Wallet, 
  ShieldCheck, 
  Users, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Target,
  Heart,
  TrendingUp,
  Sparkles,
  Award
} from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import './AboutPage.css';

const TEAM = [
  {
    name: 'Vasanth Raj',
    role: 'Co-Founder & CEO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vasanth',
    bio: 'Product visionary passionate about building collaborative solutions that redefine social e-commerce.',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Co-Founder & COO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    bio: 'Operations specialist with 8+ years scaling consumer tech platforms and managing business alliances.',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Kabir Kapoor',
    role: 'Head of Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir',
    bio: 'Full stack architect focused on building highly responsive real-time matching and chat infrastructures.',
    linkedin: 'https://linkedin.com',
  },
];

const ADVANTAGES = [
  {
    icon: Wallet,
    title: 'Save up to 50%',
    description: 'Split BOGO deals with matching partners directly. Get premium items for half price.',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Deals',
    description: 'Every deal listed is vetted for genuine split-pricing integrity and brand authenticity.',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: Users,
    title: 'Organic Matching',
    description: 'No friends to split with? Our real-time matchmaking queue finds you partners in minutes.',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-100',
  },
  {
    icon: Store,
    title: 'Direct Shop Support',
    description: 'Chat directly with business owners to clarify delivery, options, or booking dates.',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
  },
];

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  
  const [stats, setStats] = useState([
    { value: '...', label: 'Deals Listed', desc: 'Across 12 categories' },
    { value: '...', label: 'Users Paired', desc: 'Splitting costs weekly' },
    { value: '...', label: 'Money Saved', desc: 'Directly in customer pockets' },
    { value: '...', label: 'Match Rate', desc: 'For top active cities' },
  ]);

  useEffect(() => {
    api.get('/public/stats')
      .then((data) => {
        let moneyStr = '₹0';
        if (data.moneySaved >= 10000000) {
          moneyStr = `₹${(data.moneySaved / 10000000).toFixed(2)}Cr`;
        } else if (data.moneySaved >= 100000) {
          moneyStr = `₹${(data.moneySaved / 100000).toFixed(2)}L`;
        } else {
          moneyStr = `₹${data.moneySaved.toLocaleString('en-IN')}`;
        }

        setStats([
          { value: data.dealsListed.toString(), label: 'Deals Listed', desc: 'Across 12 categories' },
          { value: data.usersPaired.toString(), label: 'Users Paired', desc: 'Registered customers' },
          { value: moneyStr, label: 'Money Saved', desc: 'Directly in customer pockets' },
          { value: `${data.matchRate}%`, label: 'Match Rate', desc: 'For top active cities' },
        ]);
      })
      .catch((err) => {
        console.error('Failed to fetch public stats:', err);
        setStats([
          { value: '12', label: 'Deals Listed', desc: 'Across 12 categories' },
          { value: '25', label: 'Users Paired', desc: 'Registered customers' },
          { value: '₹4,500', label: 'Money Saved', desc: 'Directly in customer pockets' },
          { value: '95%', label: 'Match Rate', desc: 'For top active cities' },
        ]);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
      alert('Thank you for contacting us! We will get back to you shortly.');
    }, 1000);
  };

  return (
    <div className="about-page page-wrapper py-8">
      <SEO
        title="About Pairley — India's Group Buying Marketplace"
        description="Pairley is India's smart local group-buying platform connecting customers with the best deals from restaurants, gyms, salons and retailers. Learn our mission and story."
        keywords="about Pairley, Pairley India, group buying platform, Pairley story, local marketplace India"
        canonical="https://www.pairley.com/about"
      />
      {/* Hero Header */}

      <section className="about-page__hero relative overflow-hidden mb-12 py-16 text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl filter animate-pulse"></div>
          <div className="w-[300px] h-[300px] bg-indigo-500 rounded-full blur-3xl filter ml-40"></div>
        </div>
        
        <div className="container max-w-4xl mx-auto px-4">
          <motion.span 
            className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#5B12D6] bg-[#5B12D6]/10 border border-[#5B12D6]/20 inline-block mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            About Us
          </motion.span>
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0F172A] mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We are Redefining <span className="bg-gradient-to-r from-[#5B12D6] to-[#7C3AED] bg-clip-text text-transparent">Collaborative Commerce</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Pairley is built on a simple belief: you shouldn't have to choose between buying more than you need or missing out on the best bulk rates. We connect buyers to save together.
          </motion.p>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-lg">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-3 border-r last:border-0 border-slate-200/60 last:border-r-0">
              <div className="text-2xl md:text-3xl font-extrabold text-[#5B12D6]">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">{stat.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Vision split section */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2.5 mb-4 text-[#5B12D6]">
              <Sparkles size={20} className="text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider">How we started</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Our Story</h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
              Pairley was born from a simple realization: Buy-One-Get-One (BOGO) deals are highly attractive, but buying two quantities is often wasteful or expensive for a single buyer. Similarly, booking custom tours or sports events becomes incredibly cheap only when groups are formed — but coordinating a group of friends can be a logistical nightmare.
            </p>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              We set out to create a social e-commerce platform that matches buyers who have identical tastes. By allowing buyers to split BOGO packages 50/50, or join travel groups to unlock bulk rates, we help people save thousands of rupees, reduce retail waste, and discover a fun way to shop.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/80 border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">Our Mission</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    To democratize bulk pricing. We aim to enable single consumers to access commercial scale discounts by teaming them up instantly with local co-buyers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base">Our Core Values</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Transparency, merchant collaboration, and buyer trust. We never charge hidden matching fees, and only partner with verified local merchant credentials.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Pairley Edge Advantages */}
      <section className="bg-slate-50 border-y border-slate-200/60 py-16 mb-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">The Pairley Edge</h2>
            <p className="text-sm text-slate-500 mt-1.5">How we differ from traditional social commerce tools.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-white border border-slate-100 p-6 rounded-2xl text-center flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <div className={`p-3.5 rounded-xl mb-4 border flex items-center justify-center transition-all duration-300 ${adv.colorClass}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-[#5B12D6] transition-colors duration-200">{adv.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{adv.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founders Team */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Meet the Founders</h2>
          <p className="text-sm text-slate-500 mt-1.5">The team driving the collaborative buying revolution.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TEAM.map((member, idx) => (
            <motion.div
              key={idx}
              className="bg-white border border-slate-200/80 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#5B12D6] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              
              <ImageWithFallback
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full border-4 border-slate-100 mx-auto mb-4 bg-purple-50"
                fallbackType="avatar"
                name={member.name}
              />
              
              <h3 className="font-bold text-slate-800 text-base flex justify-center items-center gap-1.5">
                {member.name}
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#5B12D6] hover:text-[#7C3AED] inline-flex items-center">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </h3>
              <p className="text-xs font-semibold text-[#5B12D6] uppercase tracking-wider mt-1 mb-3">{member.role}</p>
              <p className="text-xs text-slate-500 italic leading-relaxed">"{member.bio}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="container max-w-5xl mx-auto px-4 mb-8">
        <div className="bg-white/80 border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-lg">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Get in Touch</h2>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-8">
                  Have questions about listing deals, partner integration APIs, or general feedback? Reach out to our customer support desk and we'll reply within 24 hours.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">Email Support</h5>
                      <p className="text-xs text-slate-500">support@pairley.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">Phone Call</h5>
                      <p className="text-xs text-slate-500">+91 861 085 5337</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 mt-8">
                © 2026 Pairley Technologies Private Limited. All Rights Reserved.
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              className="bg-slate-50/80 border border-slate-200/60 p-6 md:p-8 rounded-2xl"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Send size={18} className="text-purple-600" />
                Send a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Arjun Mehta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="arjun@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#5B12D6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  disabled={submitted}
                >
                  Submit Inquiry
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}


