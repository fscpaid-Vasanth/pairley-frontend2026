import { useState, useEffect, useMemo } from 'react';
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
  Info,
  Image as ImageIcon,
  Globe,
  AtSign,
  Users,
  MessageCircle,
  Lock,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { getUserLocation, reverseGeocode } from '../../utils/geo';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import BusinessNav from '../../components/BusinessNav';
import MediaUploadPanel from '../../components/business/MediaUploadPanel';
import { MALLS } from '../../utils/constants';
import './BusinessSettingsPage.css';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];
const DEFAULT_DAY_TIMING = { open: '10:00', close: '21:00', isClosed: false };
const defaultStoreTiming = () =>
  DAYS.reduce((acc, d) => ({ ...acc, [d.key]: { ...DEFAULT_DAY_TIMING } }), {});

export default function BusinessSettingsPage() {
  const { showToast } = useToast();

  const [store, setStore] = useState({
    businessName: '',
    email: '',
    phone: '',
    gstin: '',
    type: 'shopping',
    description: '',
    website: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    supportNumber: '',
    address: '',
    city: 'Mumbai',
    mallName: '',
    geoLat: null,
    geoLng: null,
    storeTiming: defaultStoreTiming(),
    leadAcceptanceMode: 'MANUAL',
    smsNumber1: '',
    smsNumber2: '',
    smsNumber3: '',
    logo: '',
    coverImage: '',
    galleryImages: [],
  });

  const [errors, setErrors] = useState({});
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mapProfileToStore = (data) => {
    const smsNumbers = (data.notification_mobiles || '').split(',').map((s) => s.trim());
    return {
      businessName: data.business_name || data.owner_name || '',
      email: data.email || '',
      phone: data.mobile || '',
      gstin: data.gst_number || '',
      type: data.category || 'shopping',
      description: data.description || '',
      website: data.website || '',
      instagram: data.instagram || '',
      facebook: data.facebook || '',
      whatsapp: data.whatsapp || '',
      supportNumber: data.support_number || '',
      address: data.address || '',
      city: data.city || 'Mumbai',
      mallName: data.mall_name || '',
      geoLat: typeof data.geo_lat === 'number' ? data.geo_lat : null,
      geoLng: typeof data.geo_lng === 'number' ? data.geo_lng : null,
      storeTiming: data.store_timing && Object.keys(data.store_timing).length > 0 ? { ...defaultStoreTiming(), ...data.store_timing } : defaultStoreTiming(),
      leadAcceptanceMode: data.lead_acceptance_mode || 'MANUAL',
      smsNumber1: smsNumbers[0] || '',
      smsNumber2: smsNumbers[1] || '',
      smsNumber3: smsNumbers[2] || '',
      logo: data.logo || '',
      coverImage: data.cover_image || '',
      galleryImages: Array.isArray(data.gallery_images) ? data.gallery_images : [],
    };
  };

  useEffect(() => {
    api.get('/business/profile')
      .then((data) => setStore(mapProfileToStore(data)))
      .catch((err) => {
        console.error('Failed to load profile from server:', err);
        showToast('Could not load your profile. Please refresh the page.', 'error');
      });
  }, []);

  const completion = useMemo(() => calculateProfileCompletion({
    business_name: store.businessName,
    category: store.type,
    description: store.description,
    address: store.address,
    city: store.city,
    geo_lat: store.geoLat,
    geo_lng: store.geoLng,
    logo: store.logo,
    cover_image: store.coverImage,
    gallery_images: store.galleryImages,
    store_timing: store.storeTiming,
    website: store.website,
    instagram: store.instagram,
    facebook: store.facebook,
    whatsapp: store.whatsapp,
    support_number: store.supportNumber,
    gst_number: store.gstin,
  }), [store]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDayTimingChange = (day, field, value) => {
    setStore((prev) => ({
      ...prev,
      storeTiming: {
        ...prev.storeTiming,
        [day]: { ...prev.storeTiming[day], [field]: value },
      },
    }));
  };

  const handleDetectLocation = async () => {
    setIsDetectingLoc(true);
    try {
      const coords = await getUserLocation();
      if (coords?.lat) {
        setStore((prev) => ({ ...prev, geoLat: coords.lat, geoLng: coords.lng }));
        const address = await reverseGeocode(coords.lat, coords.lng);
        if (address?.formattedAddress) {
          setStore((prev) => ({
            ...prev,
            address: address.formattedAddress !== 'Location detected' ? address.formattedAddress : prev.address,
            city: address.city && address.city !== 'Your City' ? address.city : prev.city,
          }));
        }
        showToast('Store location detected!', 'success');
      } else {
        showToast('Could not retrieve GPS coordinates.', 'error');
      }
    } catch (err) {
      showToast('Failed to detect location.', 'error');
    } finally {
      setIsDetectingLoc(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!store.businessName.trim()) errs.businessName = 'Business Name is required';
    if (!store.email.trim()) errs.email = 'Contact Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email.trim())) errs.email = 'Enter a valid email address';

    [1, 2, 3].forEach((n) => {
      const val = store[`smsNumber${n}`];
      if (val && val.trim() && !/^\d{10}$/.test(val.trim())) {
        errs[`smsNumber${n}`] = 'SMS number must be exactly 10 digits';
      }
    });

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
      .map((s) => s.trim())
      .filter(Boolean)
      .join(',');

    const updates = {
      business_name: store.businessName,
      category: store.type,
      email: store.email,
      description: store.description,
      website: store.website,
      instagram: store.instagram,
      facebook: store.facebook,
      whatsapp: store.whatsapp,
      support_number: store.supportNumber,
      address: store.address,
      city: store.city,
      mall_name: store.mallName || null,
      gst_number: store.gstin,
      notification_mobiles: mobiles,
      store_timing: store.storeTiming,
      lead_acceptance_mode: store.leadAcceptanceMode,
    };
    if (typeof store.geoLat === 'number') updates.geo_lat = store.geoLat;
    if (typeof store.geoLng === 'number') updates.geo_lng = store.geoLng;

    setIsSaving(true);
    api.put('/business/profile', updates)
      .then(() => {
        const user = JSON.parse(localStorage.getItem('pairley_user') || '{}');
        localStorage.setItem('pairley_user', JSON.stringify({ ...user, ...updates }));
        showToast('Merchant profile settings updated successfully!', 'success');
      })
      .catch((err) => {
        console.error(err);
        showToast(err.message || 'Failed to save settings on server.', 'error');
      })
      .finally(() => setIsSaving(false));
  };

  const handleMediaUpdated = (data) => {
    setStore((prev) => ({
      ...prev,
      logo: data.logo ?? prev.logo,
      coverImage: data.cover_image ?? prev.coverImage,
      galleryImages: Array.isArray(data.gallery_images) ? data.gallery_images : prev.galleryImages,
    }));
    showToast('Image updated!', 'success');
  };

  const handleMediaError = (message) => showToast(message, 'error');

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
              Configure your storefront profile, hours, media, and location.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 min-w-[180px]">
            <span className="text-xs font-bold text-slate-600">Profile Completion: {completion.percent}%</span>
            <div className="w-full sm:w-44 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-[#5B12D6] transition-all" style={{ width: `${completion.percent}%` }} />
            </div>
          </div>
        </div>

        <BusinessNav />

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Business Media: Logo, Cover, Gallery */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-[#5B12D6]" />
                Business Media
              </h4>

              <MediaUploadPanel
                singleSlots={[
                  { key: 'logo', label: 'Logo', value: store.logo, uploadUrl: '/business/media', responseField: 'logo' },
                  { key: 'cover', label: 'Cover Image', value: store.coverImage, uploadUrl: '/business/media', responseField: 'cover_image' },
                ]}
                gallery={{
                  images: store.galleryImages,
                  uploadUrl: '/business/media',
                  removeUrl: '/business/media/gallery',
                  responseField: 'gallery',
                  maxCount: 10,
                }}
                onUpdated={handleMediaUpdated}
                onError={handleMediaError}
              />
            </div>

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
                  <label className="text-slate-600 flex items-center gap-1">
                    Login Mobile <Lock size={11} className="text-slate-400" />
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={store.phone}
                      readOnly
                      disabled
                      className="w-full pl-9 pr-3 border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Contact support to change your login mobile number.</span>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-slate-600">Description</label>
                  <textarea
                    name="description"
                    value={store.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell customers what makes your store worth visiting..."
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Online Presence */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
                <Globe size={16} className="text-[#5B12D6]" />
                Online Presence & Contact
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 flex items-center gap-1"><Globe size={12} /> Website</label>
                  <input type="text" name="website" value={store.website} onChange={handleInputChange} placeholder="https://yourstore.com" className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 flex items-center gap-1"><AtSign size={12} /> Instagram</label>
                  <input type="text" name="instagram" value={store.instagram} onChange={handleInputChange} placeholder="@yourstore" className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 flex items-center gap-1"><Users size={12} /> Facebook</label>
                  <input type="text" name="facebook" value={store.facebook} onChange={handleInputChange} placeholder="facebook.com/yourstore" className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 flex items-center gap-1"><MessageCircle size={12} /> WhatsApp</label>
                  <input type="text" name="whatsapp" value={store.whatsapp} onChange={handleInputChange} placeholder="9876543210" className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-slate-600 flex items-center gap-1"><Phone size={12} /> Customer Support Number</label>
                  <input type="text" name="supportNumber" value={store.supportNumber} onChange={handleInputChange} placeholder="9876543210" className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]" />
                </div>
              </div>
            </div>

            {/* Store Timing — per day */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-1.5">
                <Clock size={16} className="text-[#5B12D6]" />
                Store Hours
              </h4>

              <div className="flex flex-col gap-2">
                {DAYS.map((day) => {
                  const timing = store.storeTiming[day.key] || DEFAULT_DAY_TIMING;
                  return (
                    <div key={day.key} className="store-hours-row">
                      <span className="store-hours-day">{day.label}</span>
                      <label className="store-hours-closed-toggle">
                        <input
                          type="checkbox"
                          checked={!!timing.isClosed}
                          onChange={(e) => handleDayTimingChange(day.key, 'isClosed', e.target.checked)}
                        />
                        Closed
                      </label>
                      <input
                        type="time"
                        value={timing.open}
                        disabled={timing.isClosed}
                        onChange={(e) => handleDayTimingChange(day.key, 'open', e.target.value)}
                        className="store-hours-time-input"
                      />
                      <span className="text-slate-400 text-xs">to</span>
                      <input
                        type="time"
                        value={timing.close}
                        disabled={timing.isClosed}
                        onChange={(e) => handleDayTimingChange(day.key, 'close', e.target.value)}
                        className="store-hours-time-input"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#5B12D6]" />
                  Physical Store Location
                </h4>
                <button
                  type="button"
                  className="text-xs font-bold text-[#5B12D6] hover:underline flex items-center gap-1 bg-none border-none p-0 cursor-pointer"
                  disabled={isDetectingLoc}
                  onClick={handleDetectLocation}
                >
                  📍 {isDetectingLoc ? 'Detecting...' : 'Detect Store Location'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-slate-600">Store Address</label>
                  <input
                    type="text"
                    name="address"
                    value={store.address}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Operational City</label>
                  <select
                    name="city"
                    value={store.city}
                    onChange={handleInputChange}
                    className="border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#5B12D6]"
                  >
                    {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'].map((c) => (
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
                    {MALLS.map((mall) => (
                      <option key={mall} value={mall}>{mall}</option>
                    ))}
                  </select>
                </div>

                {typeof store.geoLat === 'number' && (
                  <div className="md:col-span-3 text-[10px] text-slate-400 font-medium">
                    Coordinates: {store.geoLat.toFixed(5)}, {store.geoLng.toFixed(5)}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
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
                    className="border border-slate-200 rounded-xl p-2.5 outline-none transition focus:border-[#5B12D6]"
                  />
                </div>
              </div>
            </div>

            {/* Lead Acceptance */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-left flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Settings size={14} /> Lead Acceptance
              </h4>
              <p className="text-[10px] text-slate-400 font-medium -mt-2">How new customer interest is handled when it comes in.</p>

              <div className="lead-acceptance-toggle">
                <button
                  type="button"
                  className={`lead-acceptance-option ${store.leadAcceptanceMode === 'MANUAL' ? 'active' : ''}`}
                  onClick={() => setStore((prev) => ({ ...prev, leadAcceptanceMode: 'MANUAL' }))}
                >
                  Manual
                </button>
                <button
                  type="button"
                  className={`lead-acceptance-option ${store.leadAcceptanceMode === 'AUTOMATIC' ? 'active' : ''}`}
                  onClick={() => setStore((prev) => ({ ...prev, leadAcceptanceMode: 'AUTOMATIC' }))}
                >
                  Automatic
                </button>
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
                {[1, 2, 3].map((n) => (
                  <div className="flex flex-col gap-1.5" key={n}>
                    <label className="text-slate-600">{n === 1 ? 'Primary' : n === 2 ? 'Secondary (Optional)' : 'Tertiary (Optional)'} Alert Mobile</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-sans">+91</span>
                      <input
                        type="text"
                        name={`smsNumber${n}`}
                        placeholder="9876543210"
                        value={store[`smsNumber${n}`] || ''}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 border rounded-xl p-2.5 outline-none transition ${errors[`smsNumber${n}`] ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'}`}
                      />
                    </div>
                    {errors[`smsNumber${n}`] && <span className="text-[10px] text-red-500 font-bold">{errors[`smsNumber${n}`]}</span>}
                  </div>
                ))}

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
                disabled={isSaving}
                className="btn btn-primary w-full bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : 'Save Configurations'}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
