import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Check, 
  Smartphone, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/constants';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotalPairley, clearCart, createOrder } = useCart();
  const { showToast } = useToast();

  // Form fields state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [agreedToHold, setAgreedToHold] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full Name is required';
    
    if (!form.email.trim()) errs.email = 'Email Address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    
    if (!form.phone.trim()) errs.phone = 'Mobile Number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Phone must be exactly 10 digits';
    
    if (!form.address.trim()) errs.address = 'Delivery address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    
    if (!form.zipCode.trim()) errs.zipCode = 'ZIP / Postal Code is required';
    else if (!/^\d{6}$/.test(form.zipCode)) errs.zipCode = 'Postal code must be 6 digits';

    if (!agreedToHold) {
      errs.agreement = 'You must agree to share your contact details to submit interest';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please correct validation errors on the form.', 'error');
      return;
    }

    // Generate random Order ID (e.g. ORD-981F4B)
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const orderId = `ORD-${randomHex}`;

    // Add to global orders list
    createOrder(orderId, cartItems, cartSubtotalPairley, form);

    // Clear cart, show success toast, and route to order success page
    clearCart();
    showToast('Interest registered! Matchmaking active.', 'success');
    navigate(`/order-success/${orderId}`);
  };

  // Prevent accessing checkout with empty cart
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page page-wrapper py-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="text-slate-400 mb-3" size={48} />
        <h3 className="text-xl font-bold text-slate-800">Your cart is empty</h3>
        <p className="text-sm text-slate-500 mt-1">Add items to your cart before checking out.</p>
        <Link to="/deals" className="btn btn-primary bg-[#5B12D6] text-white px-5 py-2 mt-4 rounded-xl font-bold">
          View Active Offers
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page page-wrapper py-8">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Header Back button */}
        <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
          <Link to="/cart" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Secure checkout 🔐
          </span>
        </div>

        <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
          
          {/* Left Column: Delivery Details & Payments */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Delivery address Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <MapPin size={18} className="text-[#5B12D6]" />
                Delivery Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 text-xs outline-none transition ${errors.name ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    placeholder="e.g. Arjun Mehta"
                  />
                  {errors.name && <span className="text-[10px] text-red-500 font-bold">{errors.name}</span>}
                </div>

                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 text-xs outline-none transition ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    placeholder="arjun@example.com"
                  />
                  {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email}</span>}
                </div>

                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 text-xs outline-none transition ${errors.phone ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    placeholder="9876543210"
                  />
                  {errors.phone && <span className="text-[10px] text-red-500 font-bold">{errors.phone}</span>}
                </div>

                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Address Line</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 text-xs outline-none transition ${errors.address ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    placeholder="Apt, Suite, Street name"
                  />
                  {errors.address && <span className="text-[10px] text-red-500 font-bold">{errors.address}</span>}
                </div>

                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 text-xs outline-none transition ${errors.city ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    placeholder="e.g. Bangalore"
                  />
                  {errors.city && <span className="text-[10px] text-red-500 font-bold">{errors.city}</span>}
                </div>

                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 text-xs outline-none transition ${errors.zipCode ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    placeholder="560001"
                  />
                  {errors.zipCode && <span className="text-[10px] text-red-500 font-bold">{errors.zipCode}</span>}
                </div>
              </div>
            </div>

            {/* Direct Contact Matching Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <ShieldCheck size={18} className="text-[#5B12D6]" />
                Direct Merchant Match Fulfillment
              </h3>

              <div className="bg-[#5B12D6]/5 border border-[#5B12D6]/10 p-4.5 rounded-2xl text-[11px] text-slate-600 font-semibold leading-relaxed text-left flex gap-2.5">
                <AlertCircle className="text-[#5B12D6] flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-extrabold text-slate-800 text-xs">Direct Offline Contact Model</p>
                  <p className="mt-1 leading-relaxed text-slate-500">
                    Pairley has deactivated online payment checkouts. No amount will be charged inside this application. 
                    Once you submit your matching interest, your delivery and contact details will be shared directly with the shop owner. 
                    The merchant will call or WhatsApp you directly to complete the BOGO match and coordinate your payment offline (Cash/UPI/Card).
                  </p>
                </div>
              </div>

              {/* Matchmaker hold agreement */}
              <div className="mt-2 flex flex-col gap-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToHold}
                    onChange={(e) => {
                      setAgreedToHold(e.target.checked);
                      if (errors.agreement) setErrors({ ...errors, agreement: null });
                    }}
                    className="mt-1 flex-shrink-0 accent-[#5B12D6]"
                  />
                  <span className="text-xs text-slate-500 leading-relaxed font-semibold">
                    I agree to share my contact information (Name, Phone Number, Email) with the shop owner to coordinate the BOGO match and final offline sale.
                  </span>
                </label>
                {errors.agreement && (
                  <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.agreement}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order summary and Place order CTAs */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-6">
            <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3">
              Fulfillment Summary
            </h3>
            
            {/* Tiny list of cart items */}
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs text-slate-700">
                  <span className="font-bold flex-1 line-clamp-1 pr-4">{item.title}</span>
                  <span className="text-slate-400 font-semibold whitespace-nowrap">x {item.quantity}</span>
                  <span className="font-bold text-slate-800 pl-4 whitespace-nowrap">{formatPrice(item.pairleyPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items:</span>
                <span className="font-semibold">{cartItems.length} items</span>
              </div>
              
              <div className="flex justify-between text-slate-800 font-bold">
                <span>Matcher Total Price:</span>
                <span className="text-[#5B12D6] font-extrabold text-sm">{formatPrice(cartSubtotalPairley)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Shipping:</span>
                <span className="text-emerald-600 font-extrabold uppercase">Free</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <button
                type="submit"
                className="btn btn-primary w-full bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition"
              >
                <ShieldCheck size={18} /> Confirm Interest & Connect 🤝
              </button>
              
              <div className="text-[10px] text-slate-400 leading-relaxed text-center">
                🔒 Your coordinates are encrypted. They are only shared with the verified merchant listing this BOGO deal.
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

