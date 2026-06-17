import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShoppingBag, 
  Users, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  Printer,
  ChevronDown,
  Search,
  Check,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import BusinessNav from '../../components/BusinessNav';
import './BusinessOrdersPage.css';

// Mock business orders pre-population
const defaultBusinessOrders = [
  {
    id: 'ORD-A39B22',
    customerName: 'Arjun Mehta',
    customerPhone: '+91 98765 43210',
    customerEmail: 'arjun@example.com',
    partnerName: 'Sneha Patel',
    partnerPhone: '+91 91234 56789',
    partnerEmail: 'sneha@example.com',
    productTitle: 'Samsung Galaxy Buds FE — Buy 1 Get 1',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=400&fit=crop',
    quantity: 2, // 1 pair BOGO
    originalPrice: 13998,
    pairleyPrice: 6998, // total paid by both
    status: 'awaiting_dispatch', // awaiting_dispatch, shipped, completed
    date: '2026-06-16',
    pickupCode: '9021-F',
    deliveryMethod: 'shipping',
    address: 'Apt 402, Sea Breeze, Marine Drive, Mumbai - 400002'
  },
  {
    id: 'ORD-B92F11',
    customerName: 'Arjun Mehta',
    customerPhone: '+91 98765 43210',
    customerEmail: 'arjun@example.com',
    partnerName: 'Priya Sharma',
    partnerPhone: '+91 93456 78901',
    partnerEmail: 'priya@example.com',
    productTitle: 'Luxury Spa Day — Couples BOGO Package',
    productImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
    quantity: 2,
    originalPrice: 9000,
    pairleyPrice: 4500,
    status: 'completed',
    date: '2026-06-15',
    pickupCode: '489-A21',
    deliveryMethod: 'pickup',
    address: 'Store Pickup: GlowUp Salon & Spa, Bandra West'
  },
  {
    id: 'ORD-C88D44',
    customerName: 'Arjun Mehta',
    customerPhone: '+91 98765 43210',
    customerEmail: 'arjun@example.com',
    partnerName: 'Rahul Krishnan',
    partnerPhone: '+91 94567 89012',
    partnerEmail: 'rahul@example.com',
    productTitle: 'Nike Air Max 270 — BOGO Pair Deal',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    quantity: 2,
    originalPrice: 25990,
    pairleyPrice: 12990,
    status: 'shipped',
    date: '2026-05-10',
    pickupCode: '312-C90',
    deliveryMethod: 'shipping',
    address: 'Apt 402, Sea Breeze, Marine Drive, Mumbai - 400002',
    trackingNumber: 'DTDC-PK-8919A'
  }
];

export default function BusinessOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(defaultBusinessOrders);
  const [activeTab, setActiveTab] = useState('awaiting_dispatch'); // awaiting_dispatch, shipped, completed
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [fulfillingOrder, setFulfillingOrder] = useState(null);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingOrder, setVerifyingOrder] = useState(null);

  // Direct Sidebar verification input
  const [directCode, setDirectCode] = useState('');

  const handleVerifyCodeDirect = (e) => {
    e.preventDefault();
    if (!directCode.trim()) return;

    const matchedOrder = orders.find(
      o => o.pickupCode.toLowerCase() === directCode.trim().toLowerCase()
    );

    if (matchedOrder) {
      setOrders(prev => prev.map(o => o.id === matchedOrder.id ? { ...o, status: 'completed' } : o));
      showToast(`Code Verified! Order ${matchedOrder.id} marked as Completed.`, 'success');
      setDirectCode('');
    } else {
      showToast('Invalid customer verification code. Please check and try again.', 'error');
    }
  };

  const handleVerifyCodeModal = (e) => {
    e.preventDefault();
    if (!verifyingOrder) return;

    if (verificationCode.trim().toLowerCase() === verifyingOrder.pickupCode.toLowerCase()) {
      setOrders(prev => prev.map(o => o.id === verifyingOrder.id ? { ...o, status: 'completed' } : o));
      showToast(`Pickup code verified! Order marked as complete.`, 'success');
      setVerifyingOrder(null);
      setVerificationCode('');
    } else {
      showToast('Invalid pickup code.', 'error');
    }
  };

  const handleFulfillShipment = (e) => {
    e.preventDefault();
    if (!fulfillingOrder || !trackingIdInput.trim()) return;

    setOrders(prev => prev.map(o => 
      o.id === fulfillingOrder.id 
        ? { ...o, status: 'shipped', trackingNumber: trackingIdInput.trim() } 
        : o
    ));
    showToast(`Order ${fulfillingOrder.id} successfully marked as Shipped!`, 'success');
    setFulfillingOrder(null);
    setTrackingIdInput('');
  };

  const handlePrintLabel = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - ${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; border: 4px dashed #000; max-width: 400px; margin: auto; }
            h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin: 15px 0; font-size: 14px; }
            .barcode { background: #000; height: 50px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>PAIRLEY SHIPPING DISPATCH</h2>
          <div class="section"><strong>ORDER REFERENCE:</strong> ${order.id}</div>
          <div class="section"><strong>DATE PLACED:</strong> ${order.date}</div>
          <div class="section"><strong>RECIPIENTS:</strong><br/>1. ${order.customerName}<br/>2. ${order.partnerName}</div>
          <div class="section"><strong>DELIVERY ADDRESS:</strong><br/>${order.address}</div>
          <div class="section"><strong>PRODUCT:</strong><br/>${order.productTitle} x ${order.quantity}</div>
          <div class="barcode"></div>
          <div style="text-align: center; font-size: 11px;">RBI-Escrow Secured BOGO Logistics</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    return order.status === activeTab;
  });

  const awaitingCount = orders.filter(o => o.status === 'awaiting_dispatch').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="business-orders-page page-wrapper py-6 text-left">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Fulfillment & Orders 🚚
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Review buyer contact coordinates, coordinate BOGO matches, and mark leads as completed.
            </p>
          </div>
        </div>

        {/* Seller Sub-Navigation */}
        <BusinessNav />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns: Orders Feed (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Toolbar search & filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm">
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-max">
                {[
                  { id: 'awaiting_dispatch', label: 'Leads to Contact', count: awaitingCount },
                  { id: 'shipped', label: 'In Transit', count: shippedCount },
                  { id: 'completed', label: 'Delivered', count: completedCount }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition ${
                      activeTab === tab.id 
                        ? 'bg-white text-[#4E2BC4] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    {tab.label}
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search order or buyer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4E2BC4] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Orders Feed */}
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
                    const isAwaiting = order.status === 'awaiting_dispatch';
                    const isShipped = order.status === 'shipped';
                    const isPickup = order.deliveryMethod === 'pickup';

                    return (
                      <div key={order.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow hover:border-slate-300 transition duration-300">
                        {/* Title and ID banner */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID: {order.id}</span>
                            <span className="text-slate-300 mx-2">|</span>
                            <span className="text-[10px] text-slate-400 font-semibold">Matched: {order.date}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isPickup ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {isPickup ? '🏪 Store Pickup' : '🚚 Ship Split'}
                          </span>
                        </div>

                        {/* Product and Buyer cards */}
                        <div className="flex gap-4 items-start">
                          <img src={order.productImage} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-xs md:text-sm truncate">{order.productTitle}</h4>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-500">
                              <span>Qty: {order.quantity} (1 BOGO Pair)</span>
                              <span>•</span>
                              <span>Total Payout: {formatPrice(order.pairleyPrice)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Split recipient details */}
                        <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl text-[10px] text-slate-600 font-semibold leading-relaxed">
                          <p className="font-bold text-slate-700">Matched Recipient Partners (Contact to Fulfill BOGO):</p>
                          <div className="grid grid-cols-1 gap-2.5 mt-1.5 border-b border-slate-100/50 pb-2">
                            <div>
                              <span className="font-bold text-slate-800">👤 Buyer A:</span> {order.customerName} &nbsp;|&nbsp; 
                              📞 <a href={`tel:${order.customerPhone}`} className="text-[#4E2BC4] hover:underline font-bold">{order.customerPhone}</a> &nbsp;|&nbsp; 
                              ✉️ <a href={`mailto:${order.customerEmail}`} className="text-[#4E2BC4] hover:underline">{order.customerEmail}</a>
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">👤 Buyer B:</span> {order.partnerName} &nbsp;|&nbsp; 
                              📞 <a href={`tel:${order.partnerPhone}`} className="text-[#4E2BC4] hover:underline font-bold">{order.partnerPhone}</a> &nbsp;|&nbsp; 
                              ✉️ <a href={`mailto:${order.partnerEmail}`} className="text-[#4E2BC4] hover:underline">{order.partnerEmail}</a>
                            </div>
                          </div>
                          {!isPickup && (
                            <p className="mt-1.5 text-slate-400 truncate">📍 Ship Target: {order.address}</p>
                          )}
                        </div>

                        {/* Shipping tracking info */}
                        {isShipped && order.trackingNumber && (
                          <div className="bg-blue-50/20 border border-blue-100/50 p-2.5 rounded-xl text-[10px] text-blue-700 font-bold flex items-center gap-1.5">
                            <Truck size={14} /> Tracking: {order.trackingNumber}
                          </div>
                        )}

                        {/* Action buttons bar */}
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 justify-end">
                          <button
                            onClick={() => handlePrintLabel(order)}
                            className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                          >
                            <Printer size={13} /> Print Label
                          </button>

                          {isAwaiting && (
                            <>
                              {isPickup ? (
                                <button
                                  onClick={() => setVerifyingOrder(order)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1 transition"
                                >
                                  <Smartphone size={13} /> Verify Pickup Code
                                </button>
                              ) : (
                                <button
                                  onClick={() => setFulfillingOrder(order)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1 transition"
                                >
                                  <Truck size={13} /> Enter Tracking ID
                                </button>
                              )}
                            </>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                /* Empty state */
                <motion.div 
                  className="bg-white border border-slate-200 p-12 text-center rounded-2xl flex flex-col items-center gap-4 shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ShoppingBag size={32} className="text-slate-300" />
                  <h4 className="font-bold text-slate-800">No Orders in Tab</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    There are no orders that match your current status filter. Verify settings or update tabs to review.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Code Verification and Info sidebar */}
          <div className="flex flex-col gap-6">
            
            {/* Quick validation card */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Smartphone size={14} className="text-[#4E2BC4]" />
                Customer Code Verification
              </h4>
              
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
                Verify customer orders instantly by typing their 6-digit pickup verification code (e.g. 9021-F) at the store counter.
              </p>

              <form onSubmit={handleVerifyCodeDirect} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Pickup Code..." 
                  value={directCode}
                  onChange={(e) => setDirectCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#4E2BC4] focus:bg-white transition uppercase font-bold text-slate-800"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary w-full bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition"
                >
                  Verify Code
                </button>
              </form>
            </div>

            {/* Escrow payout guidelines */}
            <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl text-[10px] text-slate-400 leading-relaxed text-left flex gap-2">
              <ShieldCheck size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-500">Direct Lead Coordination</p>
                <p className="mt-0.5">
                  No billing is executed inside the app. Review buyer coordinates on the left cards to contact them directly, coordinate matches, and secure payouts offline.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ===== Ship tracking modal dialogue ===== */}
      {fulfillingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full text-left shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h4 className="font-bold text-slate-800 text-sm mb-2">Fulfill Shipping Dispatch</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Enter the carrier courier tracking number (e.g. DTDC-PK-8919A) to verify order shipping.
            </p>
            
            <form onSubmit={handleFulfillShipment} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500">Tracking Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. DTDC-PK-8919A" 
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  className="w-full border border-slate-200 focus:border-[#4E2BC4] rounded-xl px-3.5 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setFulfillingOrder(null)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                >
                  Confirm Ship
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===== Pickup verification code modal Dialogue ===== */}
      {verifyingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full text-left shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h4 className="font-bold text-slate-800 text-sm mb-2">Verify Customer Pickup Code</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Please enter the customer's 6-digit confirmation pickup code to release funds and fulfill the package.
            </p>
            
            <form onSubmit={handleVerifyCodeModal} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-500">Verification Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 9021-F" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full border border-slate-200 focus:border-[#4E2BC4] rounded-xl px-3.5 py-2 text-xs outline-none font-bold uppercase text-slate-800"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setVerifyingOrder(null)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                >
                  Verify & Fulfill
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
