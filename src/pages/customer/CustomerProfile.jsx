import { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { categories } from '../../data/categories';
import ImageWithFallback from '../../components/ImageWithFallback';
import CustomerNav from '../../components/CustomerNav';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import './CustomerProfile.css';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('pairley_token');
  const localUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');

  useEffect(() => {
    if (!token || !localUser) {
      navigate('/login');
    }
  }, [token, localUser, navigate]);

  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [originalProfile, setOriginalProfile] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    profile_photo: '',
    created_at: ''
  });
  
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    profile_photo: '',
    created_at: ''
  });

  const [interests, setInterests] = useState(
    categories.map(cat => ({ ...cat, selected: false }))
  );

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matching: true,
  });

  useEffect(() => {
    setLoading(true);
    // 1. Fetch customer profile
    api.get('/customers/profile')
      .then((data) => {
        const prof = {
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.mobile || '',
          city: data.city || '',
          address: data.address || '',
          profile_photo: data.profile_photo || '',
          created_at: data.created_at || ''
        };
        setProfile(prof);
        setOriginalProfile(prof);

        // Load preferred categories
        const localInterestsKey = `pairley_interests_${data.id}`;
        const savedCategories = localStorage.getItem(localInterestsKey)
          ? JSON.parse(localStorage.getItem(localInterestsKey))
          : [];
        setInterests(
          categories.map(cat => ({
            ...cat,
            selected: savedCategories.includes(cat.id)
          }))
        );

        // Load notifications
        const localNotifsKey = `pairley_notifications_${data.id}`;
        const savedNotifs = localStorage.getItem(localNotifsKey);
        if (savedNotifs) {
          try {
            setNotifications(JSON.parse(savedNotifs));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.error('Failed to load customer profile, falling back:', err);
        const localUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');
        if (!localUser) return;
        const prof = {
          id: localUser.id || 'demo-id',
          name: localUser.name || localUser.owner_name || 'User',
          email: localUser.email || '',
          phone: localUser.mobile || localUser.phone || '',
          city: localUser.city || 'Mumbai',
          address: localUser.address || '',
          profile_photo: localUser.profile_photo || '',
          created_at: localUser.created_at || ''
        };
        setProfile(prof);
        setOriginalProfile(prof);
        
        const localInterestsKey = `pairley_interests_${prof.id}`;
        const savedCategories = localStorage.getItem(localInterestsKey)
          ? JSON.parse(localStorage.getItem(localInterestsKey))
          : localUser.interests || [];
        setInterests(
          categories.map(cat => ({
            ...cat,
            selected: savedCategories.includes(cat.id)
          }))
        );
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Fetch history to compute totalSaved
    api.get('/customers/history')
      .then((history) => {
        const saved = history.filter(h => h.status === 'READY_TO_BUY' || h.status === 'COMPLETED')
          .reduce((acc, h) => acc + (h.offer.original_price - h.offer.offer_price), 0);
        setTotalSaved(saved);
      })
      .catch(() => {
        // Fallback saved calculation
        const localUser = JSON.parse(localStorage.getItem('pairley_user') || '{}');
        setTotalSaved(localUser.totalSaved || 12500);
      });
  }, []);

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
    
    const updates = {
      name: profile.name,
      email: profile.email,
      city: profile.city,
      address: profile.address
    };

    api.put('/customers/profile', updates)
      .then((res) => {
        const updatedProf = {
          ...originalProfile,
          name: res.name,
          email: res.email,
          city: res.city,
          address: res.address || '',
          profile_photo: res.profile_photo
        };
        setProfile(updatedProf);
        setOriginalProfile(updatedProf);

        // Save selected categories
        const selectedIds = interests.filter(c => c.selected).map(c => c.id);
        localStorage.setItem(`pairley_interests_${profile.id}`, JSON.stringify(selectedIds));

        // Save notifications
        localStorage.setItem(`pairley_notifications_${profile.id}`, JSON.stringify(notifications));

        // Update local cache
        const localUser = JSON.parse(localStorage.getItem('pairley_user') || '{}');
        const updatedUser = {
          ...localUser,
          ...updates,
          interests: selectedIds
        };
        localStorage.setItem('pairley_user', JSON.stringify(updatedUser));

        showToast('Profile settings saved successfully!', 'success');
        setEditMode(false);
      })
      .catch((err) => {
        console.error('Failed to save profile details:', err);
        showToast(err.message || 'Failed to save profile details.', 'error');
      });
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    // Revert interests
    const localInterestsKey = `pairley_interests_${profile.id}`;
    const savedCategories = localStorage.getItem(localInterestsKey)
      ? JSON.parse(localStorage.getItem(localInterestsKey))
      : [];
    setInterests(
      categories.map(cat => ({
        ...cat,
        selected: savedCategories.includes(cat.id)
      }))
    );
    setEditMode(false);
  };

  if (!token || !localUser) {
    return null;
  }

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
                <ImageWithFallback src={profile.profile_photo || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + (profile.name || 'User'))} alt={profile.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-purple-50" fallbackType="avatar" name={profile.name} />
                {editMode && (
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#4E2BC4] hover:bg-[#6D4EE3] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors duration-200" aria-label="Upload photo">
                    <Camera size={12} />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{profile.name || 'Loading profile...'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer Account • Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2025'}
                </p>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Online
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                    Saved {formatPrice(totalSaved)} overall
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Switcher */}
            <button
              onClick={() => {
                if (editMode) {
                  handleCancelEdit();
                } else {
                  setEditMode(true);
                }
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

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Detailed Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
                      </div>
                      <textarea
                        name="address"
                        value={profile.address}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        required
                        placeholder="Detailed address is important"
                        className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 ${
                          editMode 
                            ? 'border-purple-300 shadow-sm bg-purple-50/5' 
                            : 'border-slate-200 opacity-70 cursor-not-allowed'
                        }`}
                        rows={2}
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
