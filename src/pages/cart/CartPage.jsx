import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, Tag, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/constants';
import { getCategoryById } from '../../data/categories';
import ImageWithFallback from '../../components/ImageWithFallback';
import './CartPage.css';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartSubtotalOriginal,
    cartSubtotalPairley,
    cartSavings,
    cartSavingsPercentage
  } = useCart();

  return (
    <div className="cart-page page-wrapper py-8">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <ShoppingBag className="text-[#5B12D6]" size={28} />
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Shopping Cart</h2>
            <p className="text-sm text-slate-500 mt-0.5">Review your matching purchases and unlock split pricing.</p>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart Items list */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => {
                  const cat = getCategoryById(item.category);
                  const isPair = item.mode === 'pair';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm hover:shadow transition"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <ImageWithFallback src={item.images?.[0]} alt={item.title} fallbackType="deal" category={item.category} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-[#5B12D6] font-extrabold uppercase tracking-wider">
                            {cat?.icon} {cat?.name}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">
                            {item.title}
                          </h4>
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200/50">
                            {isPair ? '🤝 Pair BOGO Split' : '👥 Group Pricing'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Quantity controls & Price */}
                      <div className="flex sm:flex-col md:flex-row items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Quantity picker */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 border border-slate-200/50 transition"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-700">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 border border-slate-200/50 transition"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price tags */}
                        <div className="text-right">
                          <span className="block font-extrabold text-[#5B12D6] text-base">
                            {formatPrice(item.pairleyPrice * item.quantity)}
                          </span>
                          <span className="block text-xs text-slate-400 line-through">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </span>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Column: Checkout Summary box */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-6">
              <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Retail Price Subtotal:</span>
                  <span className="line-through font-semibold">{formatPrice(cartSubtotalOriginal)}</span>
                </div>
                
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>Pairley Match Subtotal:</span>
                  <span>{formatPrice(cartSubtotalPairley)}</span>
                </div>
                
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Shipping:</span>
                  <span className="text-emerald-600 font-extrabold uppercase">Free</span>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-800">You Save:</span>
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    ⚡ {formatPrice(cartSavings)} ({cartSavingsPercentage}% OFF)
                  </span>
                </div>
              </div>

              {/* Matchmaking alert banner */}
              <div className="bg-[#5B12D6]/5 border border-[#5B12D6]/10 p-4 rounded-2xl flex gap-2 text-left">
                <AlertCircle className="text-[#5B12D6] flex-shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-[#5B12D6] font-semibold leading-relaxed">
                  <p className="font-bold">Direct Contact BOGO Policy</p>
                  <p className="text-indigo-950/80 mt-1 font-medium">
                    No payment is collected within this app. Once you submit interest, your details are shared with the merchant, who will call or WhatsApp you directly to complete the BOGO match and final sale.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <Link to="/checkout" className="btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 transition">
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
                <Link to="/deals" className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition">
                  Continue Browsing
                </Link>
              </div>
            </div>

          </div>
        ) : (
          /* Empty state */
          <motion.div
            className="bg-white border border-slate-200 p-12 text-center rounded-3xl max-w-xl mx-auto flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-5xl">🛒</span>
            <h3 className="text-xl font-bold text-slate-800">Your Cart is Empty</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Unlock better pricing by pairing up with others. Discover trending gadgets, spa services, or dining deals.
            </p>
            <Link to="/deals" className="btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold px-6 py-2.5 rounded-xl mt-2 flex items-center gap-1.5 shadow-md shadow-indigo-600/10">
              <Tag size={16} /> Find Deals Now
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

