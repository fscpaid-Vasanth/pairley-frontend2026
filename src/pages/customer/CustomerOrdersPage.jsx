import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Handshake, 
  Users, 
  Wallet, 
  Clock, 
  ArrowRight, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  Share2,
  Clipboard,
  Search,
  Tag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import CustomerNav from '../../components/CustomerNav';
import './CustomerOrdersPage.css';

function CountdownTimer({ initialMinutes }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (timeLeft <= 0) {
    return (
      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 flex items-center gap-1">
        <Clock size={12} /> Expired
      </span>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')} mins left
    </span>
  );
}

export default function CustomerOrdersPage() {
  const { orders } = useCart();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('active'); // 'active' (searching), 'completed' (matched/shipped), 'past' (delivered)
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyLink = (orderId) => {
    navigator.clipboard.writeText(`https://pairley.com/deals/match-invite-${orderId}`);
    showToast('Match invite link copied! Share this with your friends to pair 3x faster.', 'success');
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'active') {
      return order.status === 'searching';
    } else if (activeTab === 'completed') {
      return order.status === 'matched' || order.status === 'shipped';
    } else {
      return order.status === 'delivered';
    }
  });

  // Calculate statistics
  const activeCount = orders.filter(o => o.status === 'searching').length;
  const completedCount = orders.filter(o => o.status === 'matched' || o.status === 'shipped').length;
  const pastCount = orders.filter(o => o.status === 'delivered').length;
  
  const totalSavings = orders.reduce((sum, o) => sum + ((o.originalPrice - o.pairleyPrice) * o.quantity), 0);

  return (
    <div className="customer-orders-page page-wrapper py-8 text-left">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
          <Link to="/customer/dashboard" className="hover:text-[#4E2BC4] transition">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-600">My Orders & Matches</span>
        </div>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">My Orders & Matches</h2>
            <p className="text-sm text-slate-500 mt-1">
              Track the progress of your social group purchases and chat with matched co-buyers.
            </p>
          </div>

          {/* Stats Summary Bubble */}
          <div className="flex items-center gap-3 bg-[#4E2BC4]/5 border border-[#4E2BC4]/10 px-4 py-3 rounded-2xl w-max">
            <div className="w-8 h-8 rounded-lg bg-[#4E2BC4] text-white flex items-center justify-center shadow-md shadow-indigo-600/10">
              <Wallet size={16} />
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Split Savings</div>
              <div className="text-sm font-extrabold text-emerald-600">{formatPrice(totalSavings)}</div>
            </div>
          </div>
        </div>

        {/* Customer Sub-Navigation */}
        <CustomerNav />

        {/* Toolbar: Tabs and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200/80 p-3 rounded-3xl shadow-sm">
          {/* Tab Selector */}
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-max">
            {[
              { id: 'active', label: 'Active Matches', count: activeCount },
              { id: 'completed', label: 'Completed', count: completedCount },
              { id: 'past', label: 'Past Orders', count: pastCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#4E2BC4] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-[#4E2BC4]/10 text-[#4E2BC4]' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by Title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-[#4E2BC4] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Orders List Grid */}
        <AnimatePresence mode="wait">
          {filteredOrders.length > 0 ? (
            <motion.div 
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredOrders.map(order => {
                const savedAmount = (order.originalPrice - order.pairleyPrice) * order.quantity;
                const isSearching = order.status === 'searching';
                const isShipped = order.status === 'shipped';
                const isMatched = order.status === 'matched';
                const isDelivered = order.status === 'delivered';

                return (
                  <div 
                    key={order.id} 
                    className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden"
                  >
                    {/* Status Top border line indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      isSearching ? 'bg-amber-500' :
                      isDelivered ? 'bg-slate-400' : 'bg-emerald-600'
                    }`}></div>

                    {/* Left side: Thumbnail & details */}
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex-shrink-0">
                        <img 
                          src={order.dealImage} 
                          alt={order.dealTitle} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Order {order.id}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Placed {order.date}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug mt-1 truncate">
                          {order.dealTitle}
                        </h4>
                        
                        {/* Prices & quantities */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-extrabold text-[#4E2BC4]">
                            {formatPrice(order.pairleyPrice * order.quantity)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            Qty: {order.quantity}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                            ⚡ Saved {formatPrice(savedAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Live Match/Status Tracker */}
                    <div className="flex flex-col gap-2 w-full md:w-48 border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wider">Matching Status</span>
                        {isSearching && <CountdownTimer initialMinutes={order.countdownMinutes} />}
                        {isMatched && <span className="text-emerald-600 font-extrabold">Matched & Secured!</span>}
                        {isShipped && <span className="text-indigo-600 font-extrabold">Out for Delivery</span>}
                        {isDelivered && <span className="text-slate-500 font-extrabold">Delivered</span>}
                      </div>

                      {/* Matching Progress bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSearching ? 'bg-gradient-to-r from-amber-400 to-amber-500 animate-pulse' :
                            isDelivered ? 'bg-slate-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          }`}
                          style={{ width: `${order.progressPercent}%` }}
                        ></div>
                      </div>

                      {/* Sub-label under progress bar */}
                      <span className="text-[9px] font-semibold text-slate-400 text-left">
                        {isSearching && '1 of 2 spots secured. Searching for partner...'}
                        {isMatched && 'Match verified! Preparing shipment.'}
                        {isShipped && 'Shipped via DTDC — Track ID: PK-8919A'}
                        {isDelivered && 'Package delivered to matching coordinates.'}
                      </span>
                    </div>

                    {/* Right side: Action CTAs */}
                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                      <Link 
                        to={`/customer/orders/${order.id}`}
                        className="flex-1 md:flex-initial btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        Track Match <ArrowRight size={14} />
                      </Link>

                      {isSearching ? (
                        <button
                          onClick={() => handleCopyLink(order.id)}
                          className="flex-1 md:flex-initial bg-[#4E2BC4]/5 hover:bg-[#4E2BC4]/10 border border-[#4E2BC4]/20 text-[#4E2BC4] font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <Share2 size={14} /> Boost Match
                        </button>
                      ) : (
                        <Link 
                          to={`/customer/chat/${order.id}`}
                          className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10 transition"
                        >
                          <MessageSquare size={14} /> Partner Chat
                        </Link>
                      )}
                    </div>

                  </div>
                );
              })}
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div 
              className="bg-white border border-slate-200 p-12 text-center rounded-3xl max-w-xl mx-auto flex flex-col items-center gap-4 shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {activeTab === 'active' && "You don't have any active matching requests right now. Create a BOGO order to begin matchmaking!"}
                {activeTab === 'completed' && "No completed matches yet. Share your active deals to secure matches faster!"}
                {activeTab === 'past' && "Your purchase history is empty. Split deals with partners and review savings here."}
              </p>
              <Link to="/deals" className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 mt-2">
                <Tag size={14} /> Browse Deals
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
