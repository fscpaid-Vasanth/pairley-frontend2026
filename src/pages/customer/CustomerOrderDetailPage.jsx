import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowLeft, 
  MessageSquare, 
  Printer, 
  HelpCircle,
  Truck,
  Building2,
  Calendar,
  Wallet,
  Share2,
  Clipboard,
  Users
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import './CustomerOrderDetailPage.css';

export default function CustomerOrderDetailPage() {
  const { id: orderId } = useParams();
  const { orders } = useCart();
  const { showToast } = useToast();

  const order = orders.find(o => o.id === orderId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://pairley.com/deals/match-invite-${orderId}`);
    showToast('Match invite link copied to clipboard!', 'success');
  };

  const handleOpenTicket = () => {
    showToast('Support ticket opened! Our help desk will respond shortly.', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="customer-order-detail-page page-wrapper py-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-slate-800">Order Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">We couldn't locate an order with ID {orderId}.</p>
        <Link to="/customer/orders" className="btn btn-primary bg-[#5B12D6] text-white px-5 py-2.5 rounded-xl text-xs font-bold mt-4">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const savedAmount = (order.originalPrice - order.pairleyPrice) * order.quantity;
  const isSearching = order.status === 'searching';
  const isMatched = order.status === 'matched';
  const isShipped = order.status === 'shipped';
  const isDelivered = order.status === 'delivered';

  // Config for vertical timeline status
  const getTimelineSteps = () => {
    return [
      { 
        label: 'Interest Shared', 
        desc: 'Contact details shared with the shop owner.', 
        date: order.date,
        isDone: true, 
        isActive: false 
      },
      { 
        label: 'Searching for Partner', 
        desc: isSearching ? 'Matching with a BOGO split partner. Share link to boost speed!' : 'BOGO partner successfully matched!', 
        date: isSearching ? 'Ongoing' : order.matchPartner?.matchDate,
        isDone: !isSearching, 
        isActive: isSearching 
      },
      { 
        label: 'Direct Contact Match Finalized', 
        desc: isSearching ? 'Waiting for matching co-buyer' : 'Merchant has connected with both co-buyers to complete BOGO split sale.', 
        date: isSearching ? 'Pending' : order.matchPartner?.matchDate,
        isDone: isMatched || isShipped || isDelivered, 
        isActive: isMatched 
      },
      { 
        label: 'Order Delivered / Picked Up', 
        desc: isShipped || isDelivered ? 'Transaction completed offline.' : 'Awaiting offline confirmation', 
        date: isShipped || isDelivered ? order.date : 'Pending',
        isDone: isDelivered, 
        isActive: isDelivered 
      }
    ];
  };

  const steps = getTimelineSteps();

  return (
    <div className="customer-order-detail-page page-wrapper py-8 text-left">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header navigation back link */}
        <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4 print:hidden">
          <Link to="/customer/orders" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={14} /> Back to My Orders
          </Link>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
              title="Print Receipt"
            >
              <Printer size={14} />
            </button>
            <button 
              onClick={handleOpenTicket}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
              title="Contact Support"
            >
              <HelpCircle size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns: Status Timeline and details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Order Info Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Order Reference
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{order.id}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-semibold">
                    <Calendar size={12} /> Placed on {order.date}
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isSearching ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  isDelivered ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {isSearching && '🔍 Searching for Pair'}
                  {isMatched && '🤝 Match Secured'}
                  {isShipped && '🚚 Out for Delivery'}
                  {isDelivered && '✅ Delivered'}
                </span>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-1.5">
                <Clock size={16} className="text-[#5B12D6]" />
                Transaction Progression Timeline
              </h4>

              <div className="flex flex-col gap-6 relative pl-6 border-l border-slate-100 ml-3.5">
                {steps.map((step, idx) => {
                  return (
                    <div key={idx} className="relative flex flex-col gap-1">
                      {/* Step icon dot placement */}
                      <span className={`absolute -left-[37px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                        step.isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 
                        step.isActive ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {step.isDone ? <Check size={10} strokeWidth={3} /> : idx + 1}
                      </span>

                      <div className="flex justify-between items-start gap-4">
                        <span className={`text-xs font-bold ${
                          step.isDone ? 'text-slate-800' : 
                          step.isActive ? 'text-amber-600 font-extrabold' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {step.date}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Details Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <Truck size={16} className="text-[#5B12D6]" />
                Delivery Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed font-semibold">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient Name</span>
                      <span className="text-slate-700">{order.deliveryDetails.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number</span>
                      <span className="text-slate-700">{order.deliveryDetails.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Coordinates</span>
                      <span className="text-slate-700">{order.deliveryDetails.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipping Coordinates</span>
                      <span className="text-slate-700 block">{order.deliveryDetails.address}</span>
                      <span className="text-slate-700 block">{order.deliveryDetails.city} - {order.deliveryDetails.zipCode}</span>
                    </div>
                  </div>
                  
                  {(isShipped || isDelivered) && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipping Carrier Details</span>
                        <span className="text-slate-700">DTDC Standard (Track ID: PK-8919A)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Columns: Match Partner Card and Receipt Summary */}
          <div className="flex flex-col gap-6">
            
            {/* Matched Partner Box */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left relative overflow-hidden">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Users size={14} /> Partner Matching Details
              </h4>

              {!isSearching ? (
                /* Partner exists */
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <img 
                      src={order.matchPartner.avatar} 
                      alt={order.matchPartner.name}
                      className="w-12 h-12 rounded-full border border-slate-200/80 bg-white" 
                    />
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">
                        {order.matchPartner.name.split(' ')[0]} {order.matchPartner.name.split(' ')[1]?.[0]}.
                      </h5>
                      <span className="block text-[10px] text-slate-400 font-bold">
                        📍 {order.matchPartner.city}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    You're paired with this BOGO co-buyer! You can coordinate pickup split locations, shipping splits, or bulk packages in the chat room.
                  </div>

                  <Link 
                    to={`/customer/chat/${orderId}`}
                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10 transition"
                  >
                    <MessageSquare size={14} /> Open Partner Chat
                  </Link>
                </div>
              ) : (
                /* Searching state */
                <div className="flex flex-col gap-4">
                  {/* Floating placeholders */}
                  <div className="flex justify-center -space-x-4 mb-1">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shadow-sm">
                      AM
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-bold text-slate-400 shadow-sm animate-pulse">
                      ?
                    </div>
                  </div>

                  <div className="text-center">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Searching for Partner</h5>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                      We are searching for a co-buyer in your location to split this BOGO package. Boost your match speed by sharing!
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      onClick={handleCopyLink}
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Clipboard size={12} /> Copy Invite Link
                    </button>
                    
                    <a
                      href={`https://api.whatsapp.com/send?text=Hey! Join me on Pairley to split this BOGO deal!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Share2 size={12} /> Share to WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Building2 size={14} /> Fulfillment Summary
              </h4>

              <div className="flex gap-3 items-center border-b border-slate-100 pb-4 mb-4">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={order.dealImage} alt={order.dealTitle} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-800 text-xs truncate">{order.dealTitle}</h5>
                  <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                    Qty: {order.quantity} × {formatPrice(order.pairleyPrice)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                <div className="flex justify-between">
                  <span>Retail Price:</span>
                  <span className="line-through">{formatPrice(order.originalPrice * order.quantity)}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>BOGO Split Total:</span>
                  <span>{formatPrice(order.pairleyPrice * order.quantity)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-600 font-extrabold uppercase">Free</span>
                </div>
                
                <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center text-sm font-extrabold">
                  <span className="text-slate-800">Split Price (Pay Merchant):</span>
                  <span className="text-[#5B12D6]">{formatPrice(order.totalPaid)}</span>
                </div>
              </div>

              {/* Secure holds note */}
              <div className="mt-4 bg-[#5B12D6]/5 border border-[#5B12D6]/10 p-3 rounded-2xl flex gap-2 text-[10px] text-[#5B12D6] font-semibold leading-relaxed">
                <ShieldCheck className="flex-shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold">Direct Call Matching</p>
                  <p className="text-indigo-950/80 mt-0.5">
                    No online payments are billed in this app. The shop owner will contact you directly to process your BOGO match and coordinate the transaction offline.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

