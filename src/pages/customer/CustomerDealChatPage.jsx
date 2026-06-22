import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Lock, 
  Users, 
  Send,
  Calendar,
  Clock,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info,
  CalendarDays
} from 'lucide-react';
import { getDealById } from '../../data/mockDeals';
import { api } from '../../utils/api';
import { formatPrice } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import './CustomerDealChatPage.css';

// Initial preloaded anonymous group messages about the deal
const getInitialMessages = (dealTitle) => [
  { 
    id: 1, 
    sender: 'partner_1', 
    senderName: 'Buyer #342', 
    text: `Hey, I'm ready to buy this BOGO deal. Anyone wants to split 50-50?`, 
    time: '10:30 AM' 
  },
  { 
    id: 2, 
    sender: 'partner_2', 
    senderName: 'Buyer #108', 
    text: `Yes, I can split this, but I'm only available on the weekend. Let's meet at the store's billing desk.`, 
    time: '10:32 AM' 
  }
];

// Predefined statements categorized
const STATEMENT_CATEGORIES = [
  {
    title: '💬 Availability & Intent',
    statements: [
      'I am ready to buy this today.',
      'I will visit the store this weekend.',
      'Who is ready to split right now?',
      'Looking for a partner to buy this right now.'
    ]
  },
  {
    title: '🤝 Split Options',
    statements: [
      'Let\'s split this BOGO deal 50-50.',
      'I only need one of the two items.',
      'I am fine with splitting the bill in half.',
      'Let\'s share the coupon codes.'
    ]
  },
  {
    title: '📍 Meetup Coordinates',
    statements: [
      'Let\'s meet at the store\'s billing counter.',
      'I am near the mall entrance/parking.',
      'Can we coordinate at the merchant desk?',
      'Let\'s check in together at the store manager\'s counter.'
    ]
  },
  {
    title: '📅 Date & Time',
    statements: [
      'When are you available to meet?',
      'I can meet today evening.',
      'Does this weekend work for you?',
      'I am flexible on timings.'
    ]
  },
  {
    title: '✅ BOGO Confirmation',
    statements: [
      'I have my pickup code ready.',
      'Let\'s confirm the split in our apps.',
      'Heading to the merchant counter now!'
    ]
  },
  {
    title: '❓ Yes or No',
    statements: [
      'Yes, that works for me.',
      'No, that won\'t work.',
      'Yes, I agree.',
      'No, let\'s find another option.'
    ]
  }
];

export const getStaticCode = (dealId) => {
  if (!dealId) return '000-A00';
  let hash = 0;
  for (let i = 0; i < dealId.length; i++) {
    hash = dealId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const part1 = 100 + (hash % 900); // 3 digits
  const part2 = 10 + ((hash >> 3) % 90); // 2 digits
  return `${part1}-A${part2}`;
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const CATEGORY_THEMES = [
  {
    active: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100',
    inactive: 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/10',
    stmtBg: 'hover:border-indigo-500 hover:bg-indigo-50/20 hover:text-indigo-700'
  },
  {
    active: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100',
    inactive: 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/10',
    stmtBg: 'hover:border-emerald-500 hover:bg-emerald-50/20 hover:text-emerald-700'
  },
  {
    active: 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-100',
    inactive: 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/10',
    stmtBg: 'hover:border-amber-500 hover:bg-amber-50/20 hover:text-amber-700'
  },
  {
    active: 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-100',
    inactive: 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/10',
    stmtBg: 'hover:border-cyan-500 hover:bg-cyan-50/20 hover:text-cyan-700'
  },
  {
    active: 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100',
    inactive: 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/10',
    stmtBg: 'hover:border-purple-500 hover:bg-purple-50/20 hover:text-purple-700'
  },
  {
    active: 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100',
    inactive: 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/10',
    stmtBg: 'hover:border-rose-500 hover:bg-rose-50/20 hover:text-rose-700'
  }
];


export default function CustomerDealChatPage() {
  const { dealId } = useParams();
  const { showToast } = useToast();
  const chatFeedRef = useRef(null);

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [pickupCode, setPickupCode] = useState('');

  // Propose Time States
  const [proposeDay, setProposeDay] = useState('Today');
  const [proposeTime, setProposeTime] = useState('18:00');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');
  const isBusiness = currentUser?.role?.toLowerCase() === 'business' || !!currentUser?.business_name;

  const userInterest = deal?.interests?.find(
    (i) => i.customer_id === currentUser?.id || 
           i.customer_id === currentUser?.sub || 
           i.customer?.id === currentUser?.id || 
           i.customer?.id === currentUser?.sub
  );
  const isCompleted = userInterest?.status === 'COMPLETED';

  // Stable anonymization generator
  const getAnonymousName = (senderId, senderName) => {
    if (!senderId) return 'Buyer';
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) {
      hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const num = Math.abs(hash % 900) + 100; // stable 100-999
    return `Buyer #${num}`;
  };

  const fetchMessages = () => {
    if (!dealId) return;
    api.get(`/offers/chat/${dealId}`)
      .then((data) => {
        const mapped = data.map((msg) => {
          const isUser = msg.sender_id === currentUser?.id;
          return {
            id: msg.id,
            sender: msg.is_system ? 'system' : (isUser ? 'user' : msg.sender_id),
            senderName: isUser ? 'You' : getAnonymousName(msg.sender_id, msg.sender_name),
            text: msg.text,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isScheduleCard: msg.is_schedule_card,
            day: msg.day,
            timeSlot: msg.time_slot
          };
        });
        setMessages(mapped);
      })
      .catch((err) => {
        console.error('Failed to fetch messages:', err);
      });
  };

  // Load deal details
  useEffect(() => {
    setLoading(true);
    api.get(`/offers/details/${dealId}`)
      .then((data) => {
        const mapped = {
          id: data.id,
          title: data.title,
          originalPrice: data.original_price,
          pairleyPrice: data.offer_price,
          category: data.category ? data.category.toLowerCase() : 'shopping',
          images: [data.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
          businessOwner: {
            name: data.business?.business_name || 'Local Seller',
            location: data.business?.city || data.business?.address || 'Bangalore'
          },
          interestCount: data.joined_people || 0,
          interests: data.interests || []
        };
        setDeal(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load deal from backend, falling back to mock:', err);
        const mock = getDealById(dealId);
        if (mock) {
          setDeal(mock);
        }
        setLoading(false);
      });
  }, [dealId]);

  // Polling messages every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [dealId]);

  // Scroll to bottom on new messages inside the chat feed container only
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendPredefined = (text) => {
    api.post(`/offers/chat/${dealId}`, {
      text: text,
      is_schedule_card: false,
      is_system: false
    })
    .then(() => {
      fetchMessages();
    })
    .catch((err) => {
      console.error('Failed to send predefined message:', err);
      showToast('Failed to send message: ' + (err.message || 'Request failed'), 'error');
    });
  };

  const handleProposeTime = () => {
    const formattedTime = formatTime12h(proposeTime);
    const text = `📅 Proposed Meetup: ${proposeDay} at ${formattedTime}`;
    api.post(`/offers/chat/${dealId}`, {
      text: text,
      is_schedule_card: true,
      day: proposeDay,
      time_slot: formattedTime,
      is_system: false
    })
    .then(() => {
      fetchMessages();
      showToast(`Meetup proposal shared!`, 'success');
    })
    .catch((err) => {
      console.error('Failed to propose meetup time:', err);
      showToast('Failed to propose meetup time: ' + (err.message || 'Request failed'), 'error');
    });
  };

  const handleUtilityAction = (actionType) => {
    if (actionType === 'location') {
      api.post(`/offers/chat/${dealId}`, {
        text: `📍 Coordination point pinned: ${deal?.businessOwner?.location || 'Store Billing Desk'}`,
        is_system: true
      })
      .then(() => {
        fetchMessages();
        showToast('Mall meetup location shared in chat!', 'success');
      })
      .catch((err) => {
        console.error('Failed to share meetup location:', err);
      });
    } else if (actionType === 'confirm') {
      api.post(`/offers/chat/${dealId}`, {
        text: '✅ BOGO Split Confirmation locked by co-buyers.',
        is_system: true
      })
      .then(() => {
        fetchMessages();
        showToast('BOGO co-buying split locked!', 'success');
      })
      .catch((err) => {
        console.error('Failed to lock BOGO split:', err);
      });
    } else if (actionType === 'code') {
      const code = getStaticCode(dealId);
      setPickupCode(code);
      setShowCodeModal(true);
      showToast('Merchant verification code retrieved!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper py-24 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200/80 p-10 rounded-3xl text-center">
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#4E2BC4] animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Initializing Secure Room...</h3>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="page-wrapper py-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Users className="text-slate-400 mb-3" size={48} />
        <h3 className="text-xl font-bold text-slate-800">Deal Not Found</h3>
        <Link to="/deals" className="btn btn-primary bg-[#4E2BC4] text-white px-5 py-2.5 rounded-xl text-xs font-bold mt-4">
          Back to Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="customer-deal-chat-page page-wrapper py-6 text-left">
      <div className="container max-w-6xl mx-auto px-4 chat-page-container">
        
        {/* Navigation header row */}
        <div className="mb-4 flex items-center gap-3 flex-shrink-0">
          <Link to={`/deals/${dealId}`} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              Co-Buy Coordination Chat
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Deal Reference ID: {dealId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch chat-grid">
          
          {/* Left Column: Chat Container */}
          <div className="lg:col-span-2 flex flex-col bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm h-full chat-box-column relative">
            
            {/* Anonymous Header */}
            <div className="bg-white/80 border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden p-0.5">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">B1</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">B2</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">B3</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs leading-snug">Anonymous Pool Chat</h4>
                  <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    3 Active Buyers Online
                  </span>
                </div>
              </div>

              <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock size={10} /> Fully Encrypted & Private
              </span>
            </div>

            {/* Chat Messages */}
            <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-4 bg-slate-50/40 flex flex-col gap-4">
              <div className="flex justify-center my-1">
                <span className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-[9px] font-extrabold text-slate-500 shadow-sm flex items-center gap-1.5">
                  🔒 System: Free typing is locked to protect identity. Use predefined messages.
                </span>
              </div>

              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-1">
                      <span className="bg-purple-50 border border-purple-100/60 px-3.5 py-1.5 rounded-xl text-[9px] font-extrabold text-[#4E2BC4] shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2.5 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {msg.senderName.slice(-2)}
                        </div>
                      )}
                      <div>
                        <span className="block text-[9px] text-slate-400 font-extrabold mb-1">
                          {msg.senderName}
                        </span>
                        
                        {msg.isScheduleCard ? (
                          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tr-none shadow-sm flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
                            <CalendarDays className="text-[#4E2BC4] flex-shrink-0" size={18} />
                            <div>
                              <span className="block text-[#4E2BC4] font-extrabold text-[10px] uppercase tracking-wider mb-0.5">Meetup Timing Proposal</span>
                              <span className="block font-bold text-slate-700 text-xs">Day: {msg.day}</span>
                              <span className="block font-bold text-slate-700 text-xs">Time: {msg.timeSlot}</span>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                            isUser 
                              ? 'bg-[#4E2BC4] text-white rounded-tr-none shadow-sm' 
                              : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm'
                          }`}>
                            {msg.text}
                          </div>
                        )}
                        
                        <span className={`block text-[8px] text-slate-400 font-bold mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white border border-slate-200/80 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[9px] font-bold flex-shrink-0">34</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Tabbed Predefined Messages Grill (CHAT BOX) */}
            <div className="bg-slate-50/70 border-t border-slate-100 p-4">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#4E2BC4]" /> CHAT BOX
              </span>

              {isCompleted && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-2xl text-[10px] font-extrabold mb-3 flex items-center gap-2 shadow-sm">
                  <Lock size={12} className="text-rose-500 flex-shrink-0" />
                  <span>This deal has been completed in the merchant portal. Chat room is now archived and read-only.</span>
                </div>
              )}
              
              {/* Category Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar border-b border-slate-100">
                {STATEMENT_CATEGORIES.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isCompleted}
                    onClick={() => setActiveCategoryIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold whitespace-nowrap transition-all ${
                      activeCategoryIdx === idx
                        ? CATEGORY_THEMES[idx].active
                        : CATEGORY_THEMES[idx].inactive
                    } ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
              
              {/* Statements Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {STATEMENT_CATEGORIES[activeCategoryIdx].statements.map((stmt, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    disabled={isCompleted}
                    onClick={() => handleSendPredefined(stmt)}
                    className={`bg-white border border-slate-200/80 text-slate-700 font-semibold text-[10px] px-3 py-2.5 rounded-xl text-left transition leading-normal shadow-sm whitespace-normal break-words h-auto flex items-center min-h-[44px] ${
                      isCompleted ? 'opacity-50 cursor-not-allowed' : CATEGORY_THEMES[activeCategoryIdx].stmtBg
                    }`}
                    title={stmt}
                  >
                    {stmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Locked Input Bar */}
            <div className="bg-white border-t border-slate-100 p-4 flex gap-2 items-center bg-slate-50/50">
              <div className="flex-1 bg-slate-100 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-400 font-semibold flex items-center gap-2 cursor-not-allowed">
                <Lock size={12} className="text-slate-400" />
                <span>Text input locked. Click statement pills below to coordinate.</span>
              </div>
              <button
                disabled
                className="w-10 h-10 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center cursor-not-allowed flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Context & Actions Sidebar */}
          <div className="flex flex-col gap-4 sidebar-column">
            
            {/* Deal Summary */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 p-5 rounded-3xl shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Info size={14} /> Split Listing
              </h4>

              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={deal.images?.[0] || 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=100&h=100&fit=crop'} alt={deal.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-800 text-xs truncate leading-snug">{deal.title}</h5>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#4E2BC4]/5 text-[#4E2BC4] border border-[#4E2BC4]/10">
                    🤝 Co-Buy Interest Room
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-xs font-semibold leading-relaxed text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400">Pairley Price</span>
                  <span className="text-sm font-extrabold text-[#4E2BC4]">{formatPrice(deal.pairleyPrice)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400">Original Price</span>
                  <span className="text-xs font-bold text-slate-400 line-through">{formatPrice(deal.originalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Date & Time Coordination Widget */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 p-5 rounded-3xl shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#4E2BC4]" /> Meetup Date & Time Coordinator
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Day</label>
                  <select
                    value={proposeDay}
                    disabled={isCompleted}
                    onChange={(e) => setProposeDay(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#4E2BC4] outline-none ${
                      isCompleted ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Saturday">This Saturday</option>
                    <option value="This Sunday">This Sunday</option>
                    <option value="Next Monday">Next Monday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Time</label>
                  <input
                    type="time"
                    value={proposeTime}
                    disabled={isCompleted}
                    onChange={(e) => setProposeTime(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#4E2BC4] outline-none ${
                      isCompleted ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <button
                  onClick={handleProposeTime}
                  disabled={isCompleted}
                  className={`w-full font-extrabold text-[11px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm mt-1 ${
                    isCompleted
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-50 border-indigo-200 hover:bg-[#4E2BC4] hover:text-white hover:border-[#4E2BC4] text-[#4E2BC4]'
                  }`}
                >
                  <CalendarDays size={14} /> Share Meetup Proposal
                </button>
              </div>
            </div>

            {/* Coordination actions */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 p-5 rounded-3xl shadow-sm text-left flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-500" /> Room Actions
              </h4>

              <button
                onClick={() => handleUtilityAction('location')}
                disabled={isCompleted}
                className={`w-full border font-bold text-xs py-3 rounded-xl flex items-center justify-start px-4 gap-2.5 transition shadow-sm ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                📍 Share Mall Meetup Location
              </button>

              <button
                onClick={() => handleUtilityAction('confirm')}
                disabled={isCompleted}
                className={`w-full border font-bold text-xs py-3 rounded-xl flex items-center justify-start px-4 gap-2.5 transition shadow-sm ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                ✅ Confirm BOGO Split Complete
              </button>

              <button
                onClick={() => handleUtilityAction('code')}
                disabled={isCompleted}
                className={`w-full border font-bold text-xs py-3 rounded-xl flex items-center justify-start px-4 gap-2.5 transition shadow-sm ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/85 text-slate-700'
                }`}
              >
                🔑 Get Merchant Verification Code
              </button>
            </div>

          </div>

        </div>



      </div>

      {/* Code Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCodeModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white/90 backdrop-blur-lg border border-slate-200/80 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center relative z-10"
            >
              <div className="w-12 h-12 bg-purple-50 text-[#4E2BC4] rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Lock size={20} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">Merchant Verification Code</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Show this code at the merchant counter to complete the split order and receive your product.
              </p>
              
              <div className="my-6 bg-slate-50 border border-slate-200/60 py-4 px-6 rounded-2xl">
                <span className="text-2xl font-black tracking-widest text-[#4E2BC4] font-mono block">
                  {pickupCode}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  verification pin
                </span>
              </div>
              
              <button
                onClick={() => setShowCodeModal(false)}
                className="w-full btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white py-3 rounded-xl text-xs font-bold transition"
              >
                Close Verification Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
