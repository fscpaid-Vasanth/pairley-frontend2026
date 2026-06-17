import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Lock, 
  Unlock,
  Trash2, 
  Save, 
  Camera, 
  Sparkles,
  Key,
  ShieldAlert,
  Edit
} from 'lucide-react';
import { mockCustomers } from '../../data/mockUsers';
import { categories } from '../../data/categories';
import ImageWithFallback from '../../components/ImageWithFallback';
import CustomerNav from '../../components/CustomerNav';
import { useToast } from '../../context/ToastContext';
import './CustomerProfile.css';

export default function CustomerProfile() {
  const customer = mockCustomers[0]; // Arjun Mehta
  const { showToast } = useToast();
  
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
  });

  const [interests, setInterests] = useState(
    categories.map(cat => ({
      ...cat,
      selected: customer.interests.includes(cat.id)
    }))
  );

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matching: true,
  });

  const handleInterestToggle = (id) => {
    if (!editMode) return; // Only editable in edit mode
    setInterests(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, selected: !cat.selected } : cat))
    );
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEditMode(false);
    showToast('Profile preferences saved successfully!', 'success');
  };

  return (
    <div className="customer-profile page-wrapper py-6">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#4E2BC4]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-5">
              <div className="customer-profile__avatar-wrap relative">
                <ImageWithFallback src={customer.avatar} alt={profile.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-purple-50" fallbackType="avatar" name={profile.name} />
                {editMode && (
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#4E2BC4] hover:bg-[#6D4EE3] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors duration-200" aria-label="Upload photo">
                    <Camera size={12} />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{profile.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Customer Account • Member since Nov 2025</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Online
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                    Saved {formatPrice(customer.totalSaved)} overall
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Switcher */}
            <button
              onClick={() => {
                if (editMode) {
                  // Revert changes if cancel
                  setProfile({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    city: customer.city,
                  });
                }
                setEditMode(!editMode);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 shadow-sm ${
                editMode 
                  ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200' 
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-[#4E2BC4] hover:bg-purple-50'
              }`}
            >
              {editMode ? (
                <>
                  <Lock size={14} />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit size={14} />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Customer Sub-Navigation */}
          <CustomerNav />

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Personal Form */}
            <form onSubmit={handleSave} className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <User size={18} className="text-[#4E2BC4]" />
                  Personal Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={14} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        required
                        className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 ${
                          editMode 
                            ? 'border-purple-300 shadow-sm bg-purple-50/5' 
                            : 'border-slate-200 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={14} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        required
                        className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 ${
                          editMode 
                            ? 'border-purple-300 shadow-sm bg-purple-50/5' 
                            : 'border-slate-200 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone size={14} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        required
                        className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 ${
                          editMode 
                            ? 'border-purple-300 shadow-sm bg-purple-50/5' 
                            : 'border-slate-200 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin size={14} />
                      </div>
                      <input
                        type="text"
                        name="city"
                        value={profile.city}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        required
                        className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 ${
                          editMode 
                            ? 'border-purple-300 shadow-sm bg-purple-50/5' 
                            : 'border-slate-200 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-6"
                  >
                    <button type="submit" className="w-full py-3 bg-[#4E2BC4] hover:bg-[#6D4EE3] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                      <Save size={14} />
                      Save Profile Details
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Right Column: Interests & Preferences */}
            <div className="space-y-6">
              {/* Category Preferences */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#4E2BC4]" />
                  Preferred Categories
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {interests.map((cat) => {
                    const isSelected = cat.selected;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleInterestToggle(cat.id)}
                        disabled={!editMode}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#4E2BC4]/10 border-[#4E2BC4]/30 text-[#4E2BC4] font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                        } ${!editMode ? 'opacity-85 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-100'}`}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span className="text-[11px] truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                {!editMode && (
                  <p className="text-[10px] text-slate-400 mt-3 italic">Click "Edit Profile" above to update category tags.</p>
                )}
              </div>

              {/* Notification Settings */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2 flex items-center gap-2">
                  <Bell size={18} className="text-[#4E2BC4]" />
                  Notifications
                </h3>

                {[
                  {
                    title: 'Email Alerts',
                    desc: 'Weekly digests and matched deal invoice logs',
                    field: 'email'
                  },
                  {
                    title: 'Push Notifications',
                    desc: 'Instant co-buyer matches and secure chat alerts',
                    field: 'push'
                  },
                  {
                    title: 'Match Confirmations',
                    desc: 'Alert immediately when group target thresholds are unlocked',
                    field: 'matching'
                  }
                ].map((item) => (
                  <div key={item.field} className="flex justify-between items-center py-2">
                    <div>
                      <h5 className="font-bold text-slate-700 text-xs">{item.title}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.field]}
                        onChange={(e) => {
                          if (!editMode) return;
                          setNotifications({ ...notifications, [item.field]: e.target.checked });
                        }}
                        disabled={!editMode}
                        className="sr-only peer"
                      />
                      <div className={`w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all ${
                        editMode ? 'peer-checked:bg-[#4E2BC4] cursor-pointer' : 'peer-checked:bg-[#4E2BC4]/70 cursor-not-allowed opacity-80'
                      }`}></div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Advanced Controls */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between gap-3 items-center">
                <button
                  type="button"
                  onClick={() => alert('Simulating Reset Password link sent to ' + profile.email)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4E2BC4] bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition-all duration-200"
                >
                  <Key size={14} />
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => alert('Account deletion simulated.')}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-200 hover:border-transparent px-4 py-2.5 rounded-xl transition-all duration-200"
                >
                  <ShieldAlert size={14} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Format Price helper
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};
