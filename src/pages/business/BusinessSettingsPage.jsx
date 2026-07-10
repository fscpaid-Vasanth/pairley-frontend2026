import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck,
  CheckCircle,
  Save,
  Mail,
  Phone,
  Settings,
  Sparkles,
  Info
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import BusinessNav from '../../components/BusinessNav';
import { MALLS } from '../../utils/constants';
import './BusinessSettingsPage.css';

export default function BusinessSettingsPage() {
  const { showToast } = useToast();

  const [store, setStore] = useState({
    businessName: '',
    email: '',
    phone: '',
    gstin: '',
    type: 'shopping',
    address: '',
    city: 'Mumbai',
    mallName: '',
    openTime: '10:00 AM',
    closeTime: '09:00 PM',
    autoConfirm: true,
    notificationEmails: true,
    smsNumber1: '',
    smsNumber2: '',
    smsNumber3: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load profile from backend
    api.get('/business/profile')
      .then((data) => {
        const smsNumbers = (data.notification_mobiles || '').split(',').map(s => s.trim());
        setStore({
          businessName: data.business_name || data.owner_name || '',
          email: data.email || '',
          phone: data.mobile || '',
          gstin: data.gst_number || '',
          type: data.category || 'shopping',
          address: data.address || '',
          city: data.city || 'Mumbai',
          mallName: data.mall_name || '',
          openTime: '10:00 AM',
          closeTime: '09:00 PM',
          autoConfirm: true,
          notificationEmails: true,
          smsNumber1: smsNumbers[0] || '',
          smsNumber2: smsNumbers[1] || '',
          smsNumber3: smsNumbers[2] || ''
        });
      })
      .catch((err) => {
        console.error('Failed to load profile from server, using local fallback:', err);
        // Fallback to local storage cached user
        const userJson = localStorage.getItem('pairley_user');
        if (userJson) {
          try {
            const u = JSON.parse(userJson);
            const smsNumbers = (u.notification_mobiles || '').split(',').map(s => s.trim());
            setStore({
              businessName: u.business_name || u.owner_name || '',
              email: u.email || '',
              phone: u.mobile || '',
              gstin: u.gst_number || '',
              type: u.category || 'shopping',
              address: u.address || '',
              city: u.city || 'Mumbai',
              mallName: u.mall_name || '',
              openTime: '10:00 AM',
              closeTime: '09:00 PM',
              autoConfirm: true,
              notificationEmails: true,
              smsNumber1: smsNumbers[0] || '',
              smsNumber2: smsNumbers[1] || '',
              smsNumber3: smsNumbers[2] || ''
            });
          } catch (e) {}
        }
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errs = {};
    if (!store.businessName.trim()) errs.businessName = 'Business Name is required';
    if (!store.email.trim()) errs.email = 'Contact Email is required';
    if (!store.phone.trim()) errs.phone = 'Contact Phone is required';
    
    // SMS Notifications mobile validation
    if (store.smsNumber1 && store.smsNumber1.trim() && !/^\d{10}$/.test(store.smsNumber1.trim())) {
      errs.smsNumber1 = 'SMS number must be exactly 10 digits';
    }
    if (store.smsNumber2 && store.smsNumber2.trim() && !/^\d{10}$/.test(store.smsNumber2.trim())) {
      errs.smsNumber2 = 'SMS number must be exactly 10 digits';
    }
    if (store.smsNumber3 && store.smsNumber3.trim() && !/^\d{10}$/.test(store.smsNumber3.trim())) {
      errs.smsNumber3 = 'SMS number must be exactly 10 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please correct form errors.', 'error');
      return;
    }

    const mobiles = [store.smsNumber1, store.smsNumber2, store.smsNumber3]
      .map(s => s.trim())
      .filter(Boolean)
      .join(',');

    const updates = {
      business_name: store.businessName,
      category: store.type,
      address: store.address,
      city: store.city,
      mall_name: store.mallName || null,
      gst_number: store.gstin,
      notification_mobiles: mobiles
    };

    api.put('/business/profile', updates)
      .then((res) => {
        // Save locally to local storage as well
        localStorage.setItem('pairley_business_settings', JSON.stringify(store));
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('pairley_user') || '{}');
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('pairley_user', JSON.stringify(updatedUser));
        
        showToast('Merchant profile settings updated successfully!', 'success');
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to save settings on server.', 'error');
      });
  };

  return (
    <div className="business-settings-page page-wrapper py-6 text-left">
      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Store Settings ⚙️
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure store timings, registered tax GSTIN details, and pickup locations.
            </p>
          </div>
        </div>

        {/* Seller Sub-Navigation */}
        <BusinessNav />

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns: Settings fields (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Store Profile Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
                <Building2 size={16} className="text-[#5B12D6]" />
                Business Store Profile
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={store.businessName}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 outline-none transition ${errors.businessName ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                  />
                  {errors.businessName && <span className="text-[10px] text-red-500 font-bold">{errors.businessName}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Business Type</label>
                  <select
                    name="type"
                    value={store.type}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  >
                    <option value="shopping">Shopping & Retail</option>
                    <option value="beauty">Beauty, Salon & Spa</option>
                    <option value="dining">Dining & Restaurants</option>
                    <option value="tours">Tours & Adventure</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Contact Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={store.email}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 border rounded-xl p-2.5 outline-none transition ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    />
                  </div>
                  {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Contact Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={store.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 border rounded-xl p-2.5 outline-none transition ${errors.phone ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    />
                  </div>
                  {errors.phone && <span className="text-[10px] text-red-500 font-bold">{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Pickup Hours & Operations */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
                <Clock size={16} className="text-[#5B12D6]" />
                Pickup Timings & Logistics
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Store Opens At</label>
                  <select
                    name="openTime"
                    value={store.openTime}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  >
                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Store Closes At</label>
                  <select
                    name="closeTime"
                    value={store.closeTime}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  >
                    {['07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location coordinates */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
                <MapPin size={16} className="text-[#5B12D6]" />
                Physical Store Coordinates
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-slate-600">Store Address</label>
                  <input
                    type="text"
                    name="address"
                    value={store.address}
                    onChange={handleInputChange}
                    className={`border rounded-xl p-2.5 outline-none transition ${errors.address ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                  />
                  {errors.address && <span className="text-[10px] text-red-500 font-bold">{errors.address}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Operational City</label>
                  <select
                    name="city"
                    value={store.city}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  >
                    {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-slate-600">Associated Mall (Optional)</label>
                  <select
                    name="mallName"
                    value={store.mallName}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  >
                    <option value="">No Mall / Standalone Shop</option>
                    {MALLS.map(mall => (
                      <option key={mall} value={mall}>{mall}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Tax Validation and Save action */}
          <div className="flex flex-col gap-6">
            
            {/* Registered Tax & Verification */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#5B12D6]" />
                Registered Tax Credentials
              </h4>

              <div className="flex flex-col gap-3.5 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Business GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={store.gstin}
                    onChange={handleInputChange}
                    placeholder="27AABCU9603R1ZM"
                    className={`border rounded-xl p-2.5 outline-none transition ${errors.gstin ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                  />
                  {errors.gstin && <span className="text-[10px] text-red-500 font-bold">{errors.gstin}</span>}
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
                  <CheckCircle size={14} className="text-emerald-600" /> GSTIN Verified & Escrow Active
                </div>
              </div>
            </div>

            {/* Automation parameters */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-left flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Settings size={14} /> Automation Configurations
              </h4>

              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="autoConfirm"
                    checked={store.autoConfirm}
                    onChange={handleInputChange}
                    className="mt-1 flex-shrink-0 accent-[#5B12D6]"
                  />
                  <span className="text-xs text-slate-500 leading-normal font-semibold">
                    <strong>Auto-confirm matched groups</strong>
                    <span className="block text-[9.5px] text-slate-400 mt-0.5 font-medium">Instantly capture BOGO holds once pairs align.</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-slate-100 pt-3 mt-1">
                  <input
                    type="checkbox"
                    name="notificationEmails"
                    checked={store.notificationEmails}
                    onChange={handleInputChange}
                    className="mt-1 flex-shrink-0 accent-[#5B12D6]"
                  />
                  <span className="text-xs text-slate-500 leading-normal font-semibold">
                    <strong>Email dispatch alerts</strong>
                    <span className="block text-[9.5px] text-slate-400 mt-0.5 font-medium">Send carrier tracking links to paired buyers automatically.</span>
                  </span>
                </label>
              </div>
            </div>

            {/* SMS Match Alert Contacts */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-left flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Phone size={14} className="text-[#5B12D6]" /> Match Alert SMS Contacts
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Add up to 3 staff mobile numbers to receive full customer details (name and phone) instantly when a BOGO match is successfully completed.
              </p>

              <div className="flex flex-col gap-3.5 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Primary Alert Mobile</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-sans">+91</span>
                    <input
                      type="text"
                      name="smsNumber1"
                      placeholder="9876543210"
                      value={store.smsNumber1 || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 border rounded-xl p-2.5 outline-none transition ${errors.smsNumber1 ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    />
                  </div>
                  {errors.smsNumber1 && <span className="text-[10px] text-red-500 font-bold">{errors.smsNumber1}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Secondary Alert Mobile (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-sans">+91</span>
                    <input
                      type="text"
                      name="smsNumber2"
                      placeholder="9876543210"
                      value={store.smsNumber2 || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 border rounded-xl p-2.5 outline-none transition ${errors.smsNumber2 ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    />
                  </div>
                  {errors.smsNumber2 && <span className="text-[10px] text-red-500 font-bold">{errors.smsNumber2}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Tertiary Alert Mobile (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-sans">+91</span>
                    <input
                      type="text"
                      name="smsNumber3"
                      placeholder="9876543210"
                      value={store.smsNumber3 || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 border rounded-xl p-2.5 outline-none transition ${errors.smsNumber3 ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                    />
                  </div>
                  {errors.smsNumber3 && <span className="text-[10px] text-red-500 font-bold">{errors.smsNumber3}</span>}
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl flex items-start gap-2 text-[10px] text-indigo-700 font-bold">
                  <Info size={14} className="text-[#5B12D6] flex-shrink-0 mt-0.5" />
                  <span>If no alert numbers are saved, notifications will fallback to the primary store phone number: {store.phone}.</span>
                </div>
              </div>
            </div>

            {/* Save CTA */}
            <div className="flex flex-col gap-2">
              <button 
                type="submit" 
                className="btn btn-primary w-full bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition"
              >
                <Save size={16} /> Save Configurations
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}

