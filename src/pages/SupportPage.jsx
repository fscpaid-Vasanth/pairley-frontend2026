import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  Send, 
  MessageSquare, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Users, 
  Mail, 
  Phone,
  MessageCircle,
  Headphones
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ROUTES } from '../utils/constants';
import './SupportPage.css';

// Mock Knowledge Base FAQs
const MOCK_FAQS = [
  {
    id: 1,
    category: 'matching',
    question: 'How long does a BOGO matching pool search last?',
    answer: 'Most BOGO split matches align within 2 to 24 hours depending on the category. The default maximum duration is set to 7 days, after which the pool expires and all authorized hold payments are automatically released.'
  },
  {
    id: 2,
    category: 'matching',
    question: 'Can I choose my BOGO split partner?',
    answer: 'To protect customer privacy, Pairley performs automated matchmaking based on location proximity and interest preferences. You can converse securely in the Paired Chat Room to coordinate delivery split locations.'
  },
  {
    id: 3,
    category: 'payments',
    question: 'Is my money debited when I show interest?',
    answer: 'No! Pairley is completely free to express interest. No payments or card details are collected inside the app. You only pay the merchant directly offline once they contact you and complete the BOGO match.'
  },
  {
    id: 4,
    category: 'payments',
    question: 'What if a BOGO match fails or the merchant cancels?',
    answer: 'If a BOGO match fails to align or the merchant removes the listing, your interest registration is simply cancelled. There are no charges or payment releases required.'
  },
  {
    id: 5,
    category: 'shipping',
    question: 'Who pays for BOGO split shipping charges?',
    answer: 'Pairley matches include standard shipping free of charge. Merchants package and dispatch bulk BOGO bundles directly to the designated target split addresses, or prepare them for store pickups.'
  },
  {
    id: 6,
    category: 'merchant',
    question: 'How do I list my shop deals on Pairley?',
    answer: 'Register as a Business Owner during Sign Up! Once verified, you can access your merchant dashboard panel to construct BOGO campaigns, build dynamic discount tiers, and verify customer pickup codes.'
  }
];

export default function SupportPage() {
  const { showToast } = useToast();
  const chatEndRef = useRef(null);

  // FAQ Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    orderId: '',
    category: 'matching',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am Pairley Bot. 🤖 How can I assist you with your co-buying matches today?', time: '12:00 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Scroll support chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  // FAQ filter logic
  const filteredFaqs = MOCK_FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Ticket validation & submit
  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!ticketForm.name.trim()) errs.name = 'Full Name is required';
    if (!ticketForm.email.trim()) errs.email = 'Email Address is required';
    if (!ticketForm.description.trim()) errs.description = 'Message description is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      showToast('Please correct form validation errors.', 'error');
      return;
    }

    const tktRef = `TKT-${Math.random().toString(16).substring(2, 6).toUpperCase()}`;
    showToast(`Support ticket submitted! Reference: ${tktRef}`, 'success');
    setTicketForm({ name: '', email: '', orderId: '', category: 'matching', description: '' });
  };

  // Chat Widget message send
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Trigger Bot Automated Response
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const botReplies = [
        "Thanks for letting me know! A support agent is currently being assigned to review your match details.",
        "Got it! For card pre-authorization holds, funds are captured only when matched. If the pool expires, the hold is released immediately.",
        "To check active matching timers, please visit your Orders list in the Customer Dashboard.",
        "You can read our full legal terms under the Refunds & Matching Policy page."
      ];
      const botResponse = botReplies[Math.floor(Math.random() * botReplies.length)];

      const botMsg = {
        id: chatMessages.length + 2,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  return (
    <div className="support-page page-wrapper py-8 text-left relative">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#4E2BC4] transition">Home</Link>
          <span>/</span>
          <span className="text-slate-600">Help & Support</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 pb-5 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Help & Support Center</h2>
            <p className="text-sm text-slate-500 mt-1">
              Search help articles, submit tickets, or chat live with our support team.
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition"
            >
              <MessageSquare size={14} /> Live Support Chat
            </button>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All FAQs', icon: HelpCircle },
              { id: 'matching', label: 'Matchmaking', icon: Users },
              { id: 'payments', label: 'Offline Contact', icon: CreditCard },
              { id: 'shipping', label: 'Logistics', icon: Truck },
              { id: 'merchant', label: 'Merchant Panel', icon: ShieldCheck }
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition ${
                    activeCategory === cat.id 
                      ? 'bg-[#4E2BC4]/5 text-[#4E2BC4] border border-[#4E2BC4]/10' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon size={13} /> {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4E2BC4] focus:bg-white transition"
            />
          </div>
        </div>

        {/* FAQs Knowledge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <div key={faq.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow transition duration-200 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#4E2BC4]/5 text-[#4E2BC4] flex items-center justify-center flex-shrink-0 border border-[#4E2BC4]/10">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm">{faq.question}</h4>
                  <p className="text-[11px] md:text-xs text-slate-400 font-semibold leading-relaxed mt-2">{faq.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-8 bg-white border border-slate-200 rounded-2xl text-slate-400 font-semibold text-xs">
              No matching help articles found. Try adjusting your search query!
            </div>
          )}
        </div>

        {/* Support Ticket Submission Form */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm max-w-2xl mx-auto text-left">
          <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-1.5">
            <Headphones size={18} className="text-[#4E2BC4]" />
            Submit a Help Desk Ticket
          </h3>

          <form onSubmit={handleTicketSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Arjun Mehta"
                value={ticketForm.name}
                onChange={handleTicketChange}
                className={`border rounded-xl p-2.5 outline-none transition ${formErrors.name ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'}`}
              />
              {formErrors.name && <span className="text-[10px] text-red-500 font-bold">{formErrors.name}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="arjun@example.com"
                value={ticketForm.email}
                onChange={handleTicketChange}
                className={`border rounded-xl p-2.5 outline-none transition ${formErrors.email ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'}`}
              />
              {formErrors.email && <span className="text-[10px] text-red-500 font-bold">{formErrors.email}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Order Reference (Optional)</label>
              <input
                type="text"
                name="orderId"
                placeholder="e.g. ORD-A39B22"
                value={ticketForm.orderId}
                onChange={handleTicketChange}
                className="border border-slate-200 focus:border-[#4E2BC4] rounded-xl p-2.5 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Support Topic</label>
              <select
                name="category"
                value={ticketForm.category}
                onChange={handleTicketChange}
                className="border border-slate-200 focus:border-[#4E2BC4] rounded-xl p-2.5 outline-none"
              >
                <option value="matching">Matchmaking Pool Issue</option>
                <option value="payments">Offline Matching & Contact</option>
                <option value="shipping">Logistics & Split Deliveries</option>
                <option value="merchant">Merchant Shop Setup</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5 mt-1">
              <label className="text-slate-600">Describe Your Problem</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe your issue in detail. If relating to a match, explain split options..."
                value={ticketForm.description}
                onChange={handleTicketChange}
                className={`border rounded-xl p-2.5 outline-none transition ${formErrors.description ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'}`}
              ></textarea>
              {formErrors.description && <span className="text-[10px] text-red-500 font-bold">{formErrors.description}</span>}
            </div>

            <div className="md:col-span-2 mt-3 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* ===== Expanding Support Chat Widget bubble ===== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen ? (
            /* Support Chat Window Card */
            <motion.div 
              className="bg-white border border-slate-200 rounded-2xl w-80 md:w-88 shadow-2xl flex flex-col h-[420px] overflow-hidden mb-3 relative"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
            >
              {/* Header */}
              <div className="bg-[#4E2BC4] p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Headphones size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-none">Live Support Assistant</h4>
                    <span className="text-[9px] text-indigo-200 font-bold mt-1 block">Online • Ticks 1s Reply</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages feed */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
                {chatMessages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-2.5 rounded-xl text-[11px] font-semibold leading-relaxed max-w-[80%] ${
                        isUser ? 'bg-[#4E2BC4] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl rounded-tl-none flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendChatMessage} className="border-t border-slate-100 p-3 bg-white flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a support question..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[11px] outline-none focus:border-[#4E2BC4]"
                />
                <button 
                  type="submit"
                  className="w-8 h-8 bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white rounded-xl flex items-center justify-center transition"
                >
                  <Send size={12} />
                </button>
              </form>

            </motion.div>
          ) : (
            /* Support widget bubble button */
            <motion.button
              onClick={() => setIsChatOpen(true)}
              className="w-12 h-12 bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/20 transition hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
