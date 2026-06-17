import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ArrowLeft, 
  MapPin, 
  MessageSquare, 
  Info,
  Calendar,
  Lock,
  Compass,
  CheckCircle,
  HelpCircle,
  Users
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import './CustomerChatPage.css';

// Initial preloaded chat messages map by order status/partner
const getInitialMessages = (partnerName) => [
  { 
    id: 1, 
    sender: 'partner', 
    text: `Hey! Super excited that we matched for this deal! 🙌 How would you like to split the delivery?`, 
    time: '10:30 AM' 
  },
  { 
    id: 2, 
    sender: 'user', 
    text: `Hey ${partnerName}! Glad we got paired. I was thinking we can have it shipped to my address since we're in the same sector, and then we can meet up?`, 
    time: '10:32 AM' 
  },
  { 
    id: 3, 
    sender: 'partner', 
    text: `That works perfectly for me! I live right near the central park, so meeting there would be super convenient. Let me know when the package arrives!`, 
    time: '10:35 AM' 
  }
];

export default function CustomerChatPage() {
  const { id: orderId } = useParams();
  const { orders } = useCart();
  const { showToast } = useToast();
  const messagesEndRef = useRef(null);

  const order = orders.find(o => o.id === orderId);
  const partnerName = order?.matchPartner?.name || 'Priya Sharma';
  const partnerAvatar = order?.matchPartner?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize messages
  useEffect(() => {
    setMessages(getInitialMessages(partnerName.split(' ')[0]));
  }, [partnerName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Trigger mock partner reply after 1.5s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        `Awesome! I've confirmed our split settings in the app. Let me know if you need anything else. 👍`,
        `Sounds like a plan! I just got the notification that the merchant is processing it.`,
        `Perfect, thank you! Glad we paired up and saved so much money together! ⚡`,
        `That works. Keep me posted on the dispatch updates!`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const partnerMessage = {
        id: messages.length + 2,
        sender: 'partner',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, partnerMessage]);
      showToast(`New message from ${partnerName.split(' ')[0]}`, 'info');
    }, 1800);
  };

  const handleUtilityAction = (actionType) => {
    if (actionType === 'location') {
      showToast('Meeting coordinate pinned and shared in chat!', 'success');
      const systemMsg = {
        id: messages.length + 1,
        sender: 'system',
        text: '📍 Meeting coordinate pinned: Sector 62 Park Entrance, Noida',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, systemMsg]);
    } else if (actionType === 'confirm') {
      showToast('Co-buying split confirmed successfully!', 'success');
      const systemMsg = {
        id: messages.length + 1,
        sender: 'system',
        text: '✅ BOGO Split Confirmation locked by both parties.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, systemMsg]);
    } else if (actionType === 'code') {
      showToast('Merchant verification pickup code generated: 489-A21', 'success');
    }
  };

  if (!order || order.status === 'searching') {
    return (
      <div className="customer-chat-page page-wrapper py-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Users className="text-slate-400 mb-3" size={48} />
        <h3 className="text-xl font-bold text-slate-800">Match Chat Unavailable</h3>
        <p className="text-sm text-slate-500 mt-1">
          {order ? 'You are still in the matching pool. Chat unlocks once a partner joins!' : 'We couldn\'t find a valid match session.'}
        </p>
        <Link to="/customer/orders" className="btn btn-primary bg-[#4E2BC4] text-white px-5 py-2.5 rounded-xl text-xs font-bold mt-4">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const savedAmount = (order.originalPrice - order.pairleyPrice) * order.quantity;

  return (
    <div className="customer-chat-page page-wrapper py-6 text-left">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Navigation header row */}
        <div className="mb-4 flex items-center gap-3">
          <Link to={`/customer/orders/${orderId}`} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              BOGO Split Chat Room
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Match Reference ID: {orderId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left Column: Chat Thread Container */}
          <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[550px] relative">
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={partnerAvatar} alt={partnerName} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{partnerName}</h4>
                  <span className="text-[10px] font-semibold text-emerald-600">Active BOGO Partner</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Lock size={12} /> Secure Match Link
              </span>
            </div>

            {/* Chat Bubble Thread */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col gap-4">
              {messages.map(msg => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-1">
                      <span className="bg-indigo-50 border border-indigo-100/60 px-3.5 py-1.5 rounded-xl text-[10px] font-bold text-[#4E2BC4] shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isUser && (
                        <img src={partnerAvatar} alt="" className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                          isUser 
                            ? 'bg-[#4E2BC4] text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`block text-[9px] text-slate-400 font-bold mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white border border-slate-200/80 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <img src={partnerAvatar} alt="" className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0" />
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Toolbar */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-100 p-4 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${partnerName.split(' ')[0]}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-[#4E2BC4] focus:bg-white transition"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-600/10 transition flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Right Column: Context Information and Action sidebar */}
          <div className="flex flex-col gap-6">
            
            {/* BOGO Offer Context Card */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Info size={14} /> Split Listing
              </h4>

              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={order.dealImage} alt={order.dealTitle} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-800 text-xs truncate">{order.dealTitle}</h5>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#4E2BC4]/5 text-[#4E2BC4] border border-[#4E2BC4]/10">
                    🤝 BOGO Partner Paired
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-xs font-semibold leading-relaxed text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400">Your Share Cost</span>
                  <span className="text-sm font-extrabold text-[#4E2BC4]">{formatPrice(order.pairleyPrice * order.quantity)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400">Total Savings</span>
                  <span className="text-xs font-extrabold text-emerald-600">⚡ {formatPrice(savedAmount)} Saved</span>
                </div>
              </div>
            </div>

            {/* Split coordination utilities */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-left flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Compass size={14} /> Coordination Actions
              </h4>

              <button
                onClick={() => handleUtilityAction('location')}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs py-3 rounded-xl flex items-center justify-start px-4 gap-2.5 transition shadow-sm"
              >
                📍 Share Meetup Location
              </button>

              <button
                onClick={() => handleUtilityAction('confirm')}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs py-3 rounded-xl flex items-center justify-start px-4 gap-2.5 transition shadow-sm"
              >
                ✅ Confirm Split Complete
              </button>

              <button
                onClick={() => handleUtilityAction('code')}
                className="w-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100/85 text-slate-700 font-bold text-xs py-3 rounded-xl flex items-center justify-start px-4 gap-2.5 transition shadow-sm"
              >
                🔑 Get Merchant Pickup Code
              </button>
            </div>

            {/* Matching Rules Info Alert */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-3xl text-[10px] text-slate-400 leading-relaxed text-left flex gap-2">
              <CheckCircle size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-500">Matching Safety Regulations</p>
                <p className="mt-0.5">
                  Confirm split agreements only when you have physically split the products or coordinates. Use the pickup codes at the merchant counter for store pickups.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
