import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  Users,
  Layers,
  Settings,
  Eye,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { categories } from '../../data/categories';
import { formatPrice } from '../../utils/constants';
import DealCard from '../../components/DealCard';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import './CreateDealPage.css';

// Preset stock images for the merchant to choose from
const IMAGE_PRESETS = [
  {
    category: 'shopping',
    name: 'Electronics & Gadgets',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
  },
  {
    category: 'shopping',
    name: 'Fashion & Apparel',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop'
  },
  {
    category: 'dining',
    name: 'Food & Dining',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop'
  },
  {
    category: 'tours',
    name: 'Travel & Tours',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop'
  },
  {
    category: 'beauty',
    name: 'Spa & Salon',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop'
  },
  {
    category: 'fitness',
    name: 'Gym & Fitness',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop'
  },
  {
    category: 'entertainment',
    name: 'Events & Entertainment',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=400&fit=crop'
  },
  {
    category: 'education',
    name: 'Education & Courses',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop'
  }
];

export default function CreateDealPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { showToast } = useToast();

  // Form states
  const [dealType, setDealType] = useState('pair'); // 'pair' or 'group'
  const [category, setCategory] = useState('shopping');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePlaceholder, setImagePlaceholder] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop');
  const [originalPrice, setOriginalPrice] = useState('');
  const [pairleyPrice, setPairleyPrice] = useState('');
  const [location, setLocation] = useState('');
  const [validDays, setValidDays] = useState('30');
  const [minParticipants, setMinParticipants] = useState('3');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [terms, setTerms] = useState('Valid only through the Pairley web/mobile app interface. Match must be achieved within deal timeframe.');

  // Image uploader state
  const [uploaderTab, setUploaderTab] = useState('presets'); // 'presets' or 'url'
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showUploaderSettings, setShowUploaderSettings] = useState(false);

  // Form errors
  const [errors, setErrors] = useState({});

  // Group tiers with unique ID for exit animations
  const [tiers, setTiers] = useState([
    { id: 1, minPeople: 5, pricePerHead: 1000 },
    { id: 2, minPeople: 10, pricePerHead: 800 },
  ]);
  const [nextTierId, setNextTierId] = useState(3);

  const addTierRow = () => {
    const minPeople = tiers.length > 0 ? tiers[tiers.length - 1].minPeople + 5 : 5;
    const pricePerHead = tiers.length > 0 ? Math.max(100, Math.round(tiers[tiers.length - 1].pricePerHead * 0.8)) : 800;
    setTiers([...tiers, { id: nextTierId, minPeople, pricePerHead }]);
    setNextTierId(nextTierId + 1);
    
    // Clear tier validation errors if any
    if (errors.tiers || errors.tierErrors) {
      const updatedErrors = { ...errors };
      delete updatedErrors.tiers;
      delete updatedErrors.tierErrors;
      setErrors(updatedErrors);
    }
  };

  const removeTierRow = (id) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((t) => t.id !== id));
    }
  };

  const handleTierChange = (id, field, value) => {
    setTiers(tiers.map((t) => (t.id === id ? { ...t, [field]: parseInt(value) || 0 } : t)));
    
    // Clear validation error when user edits
    if (errors.tierErrors || errors.tiers) {
      const updatedErrors = { ...errors };
      delete updatedErrors.tierErrors;
      delete updatedErrors.tiers;
      setErrors(updatedErrors);
    }
  };

  // Step validation
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!dealType) newErrors.dealType = 'Please select a deal model.';
      if (!category) newErrors.category = 'Please select a category.';
    } else if (step === 2) {
      if (!title || title.trim().length < 5) {
        newErrors.title = 'Title must be at least 5 characters.';
      }
      if (!description || description.trim().length < 15) {
        newErrors.description = 'Description must be at least 15 characters.';
      }
      if (!location || location.trim().length < 2) {
        newErrors.location = 'Please enter a valid location/city.';
      }
      if (!imagePlaceholder) {
        newErrors.image = 'Please select a cover image preset or input a valid URL.';
      }
      
      const orig = parseFloat(originalPrice);
      if (dealType === 'pair') {
        const pairley = parseFloat(pairleyPrice);
        if (!originalPrice || isNaN(orig) || orig <= 0) {
          newErrors.originalPrice = 'Please enter a valid original price.';
        }
        if (!pairleyPrice || isNaN(pairley) || pairley <= 0) {
          newErrors.pairleyPrice = 'Please enter a valid split price.';
        } else if (orig && pairley >= orig) {
          newErrors.pairleyPrice = 'Split price must be less than the original price.';
        }
      } else {
        // Group deal
        if (!originalPrice || isNaN(orig) || orig <= 0) {
          newErrors.originalPrice = 'Please enter a baseline original price (used to calculate savings).';
        }
        if (tiers.length === 0) {
          newErrors.tiers = 'Please add at least one group pricing tier.';
        } else {
          const tierErrors = [];
          let lastMinPeople = 0;
          let lastPrice = orig || Infinity;
          
          tiers.forEach((t, idx) => {
            const rowError = {};
            if (!t.minPeople || t.minPeople <= 0) {
              rowError.minPeople = 'Required';
            } else if (t.minPeople <= lastMinPeople) {
              rowError.minPeople = `Must be > ${lastMinPeople}`;
            }
            
            if (!t.pricePerHead || t.pricePerHead <= 0) {
              rowError.pricePerHead = 'Required';
            } else if (orig && t.pricePerHead >= orig) {
              rowError.pricePerHead = 'Must be < original price';
            } else if (t.pricePerHead >= lastPrice) {
              rowError.pricePerHead = `Must be < ${lastPrice}`;
            }

            if (Object.keys(rowError).length > 0) {
              tierErrors[idx] = rowError;
            }
            
            if (t.minPeople) lastMinPeople = t.minPeople;
            if (t.pricePerHead) lastPrice = t.pricePerHead;
          });
          
          if (tierErrors.some(Boolean)) {
            newErrors.tierErrors = tierErrors;
          }
        }
      }
    } else if (step === 3) {
      if (!validDays || parseInt(validDays) <= 0) {
        newErrors.validDays = 'Please enter a valid duration (minimum 1 day).';
      }
      if (dealType === 'group') {
        const minP = parseInt(minParticipants);
        const maxP = parseInt(maxParticipants);
        if (!minParticipants || isNaN(minP) || minP <= 1) {
          newErrors.minParticipants = 'Min capacity must be at least 2.';
        }
        if (!maxParticipants || isNaN(maxP) || maxP <= minP) {
          newErrors.maxParticipants = 'Max capacity must exceed min capacity.';
        }
      }
      if (!terms || terms.trim().length < 10) {
        newErrors.terms = 'Please enter valid terms and conditions.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setErrors({});
      if (step < 4) setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setErrors({});
      setStep(step - 1);
    }
  };

  const handlePublish = () => {
    const orig = originalPrice.toString().replace(/\D/g, '');
    const offerPriceVal = dealType === 'pair' ? pairleyPrice.toString().replace(/\D/g, '') : (tiers[0]?.pricePerHead || orig).toString();
    const capacityVal = dealType === 'pair' ? '2' : maxParticipants.toString();
    
    const startDateIso = new Date().toISOString();
    const endDateIso = new Date(Date.now() + parseInt(validDays || '30') * 24 * 60 * 60 * 1000).toISOString();

    const payload = {
      title,
      description,
      offer_type: dealType === 'pair' ? 'BOGO' : 'GROUP_DISCOUNT',
      category: category.toLowerCase(),
      original_price: orig,
      offer_price: offerPriceVal,
      required_people: capacityVal,
      start_date: startDateIso,
      end_date: endDateIso,
      offer_image: imagePlaceholder || null
    };

    api.post('/offers/create', payload)
      .then((res) => {
        showToast('Deal published successfully to the live feed!', 'success');
        navigate('/business/dashboard');
      })
      .catch((err) => {
        console.error('Failed to publish live deal:', err);
        showToast('Live publish failed. Registered locally (Demo Mode)', 'info');
        navigate('/business/dashboard');
      });
  };

  // Apply custom image URL
  const applyCustomUrl = () => {
    if (customImageUrl && customImageUrl.startsWith('http')) {
      setImagePlaceholder(customImageUrl);
      setShowUploaderSettings(false);
      
      if (errors.image) {
        const updatedErrors = { ...errors };
        delete updatedErrors.image;
        setErrors(updatedErrors);
      }
    } else {
      alert('Please enter a valid URL starting with http:// or https://');
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === category);

  // Stepper Header Config
  const stepsConfig = [
    { num: 1, label: 'Type & Category', icon: Layers },
    { num: 2, label: 'Details & Pricing', icon: Sparkles },
    { num: 3, label: 'T&C & Timing', icon: Settings },
    { num: 4, label: 'Preview & Live', icon: Eye },
  ];

  // Mock deal data matching DealCard's expected props format
  const mockCreatedDeal = {
    id: 'preview-deal',
    title: title || 'Your Deal Title',
    category: category,
    images: [imagePlaceholder],
    originalPrice: parseInt(originalPrice) || 0,
    pairleyPrice: dealType === 'pair' ? (parseInt(pairleyPrice) || 0) : (tiers[0]?.pricePerHead || 0),
    mode: dealType,
    interestCount: 0,
    maxParticipants: dealType === 'pair' ? 2 : parseInt(maxParticipants),
    location: location || 'Select Location',
    businessOwner: {
      name: 'Rajesh Kumar - TechZone Electronics'
    }
  };

  return (
    <div className="create-deal-page page-wrapper py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          className="bg-white/80 backdrop-blur-lg border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Title */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Sparkles className="text-[#4E2BC4]" size={28} />
            Create New Listing
          </h2>

          {/* Stepper Header */}
          <div className="create-deal-page__stepper-container mb-8">
            <div className="create-deal-page__progress-track">
              <div 
                className="create-deal-page__progress-fill" 
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            <div className="create-deal-page__stepper flex justify-between relative z-10">
              {stepsConfig.map((s) => {
                const StepIcon = s.icon;
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                
                return (
                  <div
                    key={s.num}
                    className={`create-deal-page__step ${isCurrent ? 'create-deal-page__step--active' : ''} ${
                      isDone ? 'create-deal-page__step--done' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="create-deal-page__step-num flex items-center justify-center rounded-full"
                      onClick={() => {
                        // Allow backwards navigation directly by clicking stepper numbers
                        if (s.num < step) {
                          setStep(s.num);
                          setErrors({});
                        }
                      }}
                      disabled={s.num >= step}
                    >
                      {isDone ? <Check size={18} /> : <StepIcon size={18} />}
                    </button>
                    <span className="create-deal-page__step-label text-xs font-semibold mt-2 text-slate-500 hide-mobile">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Wizard Contents */}
          <div className="create-deal-page__content min-h-[300px] py-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Select Deal Model</h3>
                    <p className="text-sm text-slate-500 mt-1">Choose the social matching logic that fits your offer.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`create-deal-page__model-card flex flex-col text-left p-6 rounded-2xl border-2 transition-all ${
                        dealType === 'pair' 
                          ? 'border-[#4E2BC4] bg-[#4E2BC4]/5 shadow-sm shadow-[#4E2BC4]/10' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => setDealType('pair')}
                    >
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                        🤝
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">Pair Deal (BOGO Split)</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Two customers match to unlock a BOGO deal. They split the cost 50/50 and each gets their item. Great for restaurants, spa services, and retail.
                      </p>
                      <span className="text-xs font-bold text-[#4E2BC4] mt-4 flex items-center gap-1">
                        Learn more <ArrowRight size={12} />
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`create-deal-page__model-card flex flex-col text-left p-6 rounded-2xl border-2 transition-all ${
                        dealType === 'group' 
                          ? 'border-[#4E2BC4] bg-[#4E2BC4]/5 shadow-sm shadow-[#4E2BC4]/10' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => setDealType('group')}
                    >
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                        👥
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">Group Deal (Tiered Pricing)</h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Multiple participants pool interest. As the size of the group reaches set milestones, the cost per person decreases. Ideal for travel tours, experiences, and subscriptions.
                      </p>
                      <span className="text-xs font-bold text-[#4E2BC4] mt-4 flex items-center gap-1">
                        Learn more <ArrowRight size={12} />
                      </span>
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-3">Select Deal Category</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                            category === cat.id 
                              ? 'border-[#4E2BC4] bg-[#4E2BC4]/5 text-[#4E2BC4] font-bold' 
                              : 'border-slate-200 bg-white/50 text-slate-600 hover:border-slate-300'
                          }`}
                          onClick={() => setCategory(cat.id)}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-xs font-semibold">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Enter Details & Pricing</h3>
                    <p className="text-sm text-slate-500 mt-1">Provide attractive information, images, and prices for your customers.</p>
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Deal Title</label>
                    <input
                      type="text"
                      className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                        errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                      }`}
                      placeholder="e.g. Samsung Galaxy Buds FE BOGO offer"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors({...errors, title: null});
                      }}
                      required
                    />
                    {errors.title && (
                      <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                        <AlertCircle size={12} /> {errors.title}
                      </span>
                    )}
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      className={`form-textarea border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                        errors.description ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                      }`}
                      placeholder="Describe the product details, features, terms, packages details..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors({...errors, description: null});
                      }}
                      required
                    />
                    {errors.description && (
                      <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                        <AlertCircle size={12} /> {errors.description}
                      </span>
                    )}
                  </div>

                  {/* ===== Interactive Mock Cover Image Uploader ===== */}
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Cover Image</label>
                    
                    <div 
                      className={`create-deal-page__uploader border-2 border-dashed rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between cursor-pointer transition-all ${
                        errors.image ? 'border-red-500 bg-red-50/20' : 'border-slate-200 hover:border-[#4E2BC4] bg-slate-50/40'
                      }`}
                      onClick={() => setShowUploaderSettings(!showUploaderSettings)}
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          {imagePlaceholder ? (
                            <img src={imagePlaceholder} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">
                            {imagePlaceholder ? 'Cover image selected' : 'Choose a cover image'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Click to change image or choose a preset category.
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="btn btn-outline btn-sm whitespace-nowrap bg-white border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl flex items-center gap-1 text-xs shadow-sm hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUploaderSettings(!showUploaderSettings);
                        }}
                      >
                        <Upload size={14} /> Browse Presets
                      </button>
                    </div>
                    {errors.image && (
                      <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                        <AlertCircle size={12} /> {errors.image}
                      </span>
                    )}

                    {/* Presets and URL Panel Drawer */}
                    <AnimatePresence>
                      {showUploaderSettings && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-slate-100 bg-white p-4 rounded-2xl mt-2 flex flex-col gap-3 shadow-inner overflow-hidden"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                  uploaderTab === 'presets' 
                                    ? 'bg-[#4E2BC4] text-white' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                                onClick={() => setUploaderTab('presets')}
                              >
                                Category Presets
                              </button>
                              <button
                                type="button"
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                  uploaderTab === 'url' 
                                    ? 'bg-[#4E2BC4] text-white' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                                onClick={() => setUploaderTab('url')}
                              >
                                Paste Custom URL
                              </button>
                            </div>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-600"
                              onClick={() => setShowUploaderSettings(false)}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {uploaderTab === 'presets' ? (
                            <div className="create-deal-page__preset-grid">
                              {IMAGE_PRESETS.map((preset, idx) => (
                                <div
                                  key={idx}
                                  className={`create-deal-page__preset-card relative ${
                                    imagePlaceholder === preset.url ? 'create-deal-page__preset-card--active' : ''
                                  }`}
                                  onClick={() => {
                                    setImagePlaceholder(preset.url);
                                    if (errors.image) setErrors({...errors, image: null});
                                  }}
                                >
                                  <img src={preset.url} alt={preset.name} className="create-deal-page__preset-img" />
                                  <span className="create-deal-page__preset-label">{preset.name}</span>
                                  {imagePlaceholder === preset.url && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-[#4E2BC4] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                                      <Check size={12} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input
                                  type="url"
                                  className="form-input w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4E2BC4]"
                                  placeholder="https://images.unsplash.com/photo-..."
                                  value={customImageUrl}
                                  onChange={(e) => setCustomImageUrl(e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-bold text-xs px-4 py-2 rounded-xl"
                                onClick={applyCustomUrl}
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {dealType === 'pair' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-700">Original Retail Price (₹)</label>
                        <input
                          type="number"
                          className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                            errors.originalPrice ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                          }`}
                          placeholder="6999"
                          value={originalPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOriginalPrice(val);
                            setPairleyPrice(val ? Math.round(parseInt(val) / 2) : '');
                            
                            // Clear error fields
                            const updatedErrors = { ...errors };
                            delete updatedErrors.originalPrice;
                            delete updatedErrors.pairleyPrice;
                            setErrors(updatedErrors);
                          }}
                          required
                        />
                        {errors.originalPrice && (
                          <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                            <AlertCircle size={12} /> {errors.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="form-group flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-700">Split Deal Price per Head (50% Off) (₹)</label>
                        <input
                          type="number"
                          className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                            errors.pairleyPrice ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                          }`}
                          value={pairleyPrice}
                          onChange={(e) => {
                            setPairleyPrice(e.target.value);
                            if (errors.pairleyPrice) {
                              const updatedErrors = { ...errors };
                              delete updatedErrors.pairleyPrice;
                              setErrors(updatedErrors);
                            }
                          }}
                          placeholder="3499"
                          required
                        />
                        {errors.pairleyPrice && (
                          <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                            <AlertCircle size={12} /> {errors.pairleyPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Group pricing tier builder
                    <div className="flex flex-col gap-3">
                      <div className="form-group flex flex-col gap-1.5 mb-2">
                        <label className="text-sm font-bold text-slate-700">Baseline Retail Price per Head (₹)</label>
                        <input
                          type="number"
                          className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                            errors.originalPrice ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                          }`}
                          placeholder="1200"
                          value={originalPrice}
                          onChange={(e) => {
                            setOriginalPrice(e.target.value);
                            if (errors.originalPrice) {
                              const updatedErrors = { ...errors };
                              delete updatedErrors.originalPrice;
                              setErrors(updatedErrors);
                            }
                          }}
                        />
                        {errors.originalPrice && (
                          <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                            <AlertCircle size={12} /> {errors.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <h4 className="font-bold text-slate-800 text-sm">Add Group Pricing Tiers</h4>
                        <button
                          type="button"
                          className="btn btn-outline border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-slate-50 bg-white"
                          onClick={addTierRow}
                        >
                          <Plus size={14} /> Add Tier
                        </button>
                      </div>
                      
                      {errors.tiers && (
                        <div className="text-red-500 text-xs font-medium flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.tiers}
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <AnimatePresence initial={false}>
                          {tiers.map((tier, idx) => {
                            const orig = parseInt(originalPrice) || 0;
                            const savingsPct = orig > 0 && tier.pricePerHead ? Math.round(((orig - tier.pricePerHead) / orig) * 100) : 0;
                            const rowError = errors.tierErrors?.[idx] || {};

                            return (
                              <motion.div 
                                key={tier.id} 
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-slate-50 border border-slate-200/50 p-3 rounded-xl overflow-hidden"
                              >
                                <span className="text-xs font-bold text-slate-600 whitespace-nowrap pt-2 md:pt-0">
                                  Tier {idx + 1}:
                                </span>
                                
                                <div className="flex-1 flex gap-2 items-center">
                                  <div className="flex flex-col gap-1 w-1/2">
                                    <div className="relative">
                                      <input
                                        type="number"
                                        className={`form-input w-full pl-3 pr-14 py-2 border rounded-lg text-slate-800 outline-none text-xs focus:border-[#4E2BC4] ${
                                          rowError.minPeople ? 'border-red-500' : 'border-slate-200'
                                        }`}
                                        placeholder="5"
                                        value={tier.minPeople || ''}
                                        onChange={(e) => handleTierChange(tier.id, 'minPeople', e.target.value)}
                                      />
                                      <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">
                                        Members
                                      </span>
                                    </div>
                                    {rowError.minPeople && (
                                      <span className="text-[10px] text-red-500 font-bold">{rowError.minPeople}</span>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-1 w-1/2">
                                    <div className="relative">
                                      <span className="absolute left-3 top-2 text-[10px] text-slate-400 font-bold">₹</span>
                                      <input
                                        type="number"
                                        className={`form-input w-full pl-6 pr-14 py-2 border rounded-lg text-slate-800 outline-none text-xs focus:border-[#4E2BC4] ${
                                          rowError.pricePerHead ? 'border-red-500' : 'border-slate-200'
                                        }`}
                                        placeholder="800"
                                        value={tier.pricePerHead || ''}
                                        onChange={(e) => handleTierChange(tier.id, 'pricePerHead', e.target.value)}
                                      />
                                      <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold pointer-events-none">
                                        /Head
                                      </span>
                                    </div>
                                    {rowError.pricePerHead && (
                                      <span className="text-[10px] text-red-500 font-bold">{rowError.pricePerHead}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3">
                                  {savingsPct > 0 ? (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-lg font-extrabold whitespace-nowrap">
                                      ⚡ {savingsPct}% OFF
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">No discount yet</span>
                                  )}

                                  {tiers.length > 1 && (
                                    <button
                                      type="button"
                                      className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                      onClick={() => removeTierRow(tier.id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Location / City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} />
                      <input
                        type="text"
                        className={`form-input w-full pl-9 pr-3 py-3 border rounded-xl text-slate-800 outline-none transition-all ${
                          errors.location ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                        }`}
                        placeholder="e.g. Bangalore, Online"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          if (errors.location) setErrors({...errors, location: null});
                        }}
                        required
                      />
                    </div>
                    {errors.location && (
                      <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                        <AlertCircle size={12} /> {errors.location}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Duration & Rules</h3>
                    <p className="text-sm text-slate-500 mt-1">Configure limits, deadlines, and standard usage rules.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700">Deal Duration (Days)</label>
                      <input
                        type="number"
                        className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                          errors.validDays ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                        }`}
                        placeholder="30"
                        value={validDays}
                        onChange={(e) => {
                          setValidDays(e.target.value);
                          if (errors.validDays) setErrors({...errors, validDays: null});
                        }}
                      />
                      {errors.validDays && (
                        <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                          <AlertCircle size={12} /> {errors.validDays}
                        </span>
                      )}
                    </div>
                    {dealType === 'group' && (
                      <div className="form-group flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-slate-700">Max Group Capacity</label>
                        <input
                          type="number"
                          className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                            errors.maxParticipants ? 'border-red-500' : 'border-slate-200 focus:border-[#4E2BC4]'
                          }`}
                          placeholder="25"
                          value={maxParticipants}
                          onChange={(e) => {
                            setMaxParticipants(e.target.value);
                            if (errors.maxParticipants) setErrors({...errors, maxParticipants: null});
                          }}
                        />
                        {errors.maxParticipants && (
                          <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                            <AlertCircle size={12} /> {errors.maxParticipants}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Detailed Terms & Conditions</label>
                    <textarea
                      rows={4}
                      className={`form-textarea border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-[#4E2BC4] transition-all`}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Review & Live Preview</h3>
                    <p className="text-sm text-slate-500 mt-1">This is how your deal card will appear to customers in search feeds.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center bg-slate-50/50 border border-slate-200/50 p-6 md:p-8 rounded-3xl">
                    
                    {/* Live DealCard Import */}
                    <div className="w-full max-w-[340px] shadow-lg rounded-2xl overflow-hidden bg-white">
                      <DealCard 
                        deal={mockCreatedDeal} 
                        onClick={(e) => e.preventDefault()} 
                      />
                    </div>
                    
                    {/* Text Summary Table */}
                    <div className="flex-1 w-full flex flex-col gap-4 self-stretch justify-between">
                      <div className="flex flex-col gap-3">
                        <h4 className="text-md font-bold text-slate-800 border-b border-slate-200 pb-2">
                          Listing Configuration Summary
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                          <span className="text-slate-400 font-medium">Marketing Model:</span>
                          <span className="text-slate-700 font-extrabold capitalize">
                            {dealType === 'pair' ? '🤝 Pair Deal (BOGO Split)' : '👥 Group Deal (Tiered)'}
                          </span>

                          <span className="text-slate-400 font-medium">Category:</span>
                          <span className="text-slate-700 font-extrabold capitalize">
                            {selectedCategoryObj?.icon} {selectedCategoryObj?.name}
                          </span>

                          <span className="text-slate-400 font-medium">Title:</span>
                          <span className="text-slate-700 font-bold">{title}</span>

                          <span className="text-slate-400 font-medium">Location:</span>
                          <span className="text-slate-700 font-bold flex items-center gap-1">
                            <MapPin size={10} /> {location}
                          </span>

                          <span className="text-slate-400 font-medium">Duration:</span>
                          <span className="text-slate-700 font-bold flex items-center gap-1">
                            <Calendar size={10} /> Valid for {validDays} Days
                          </span>

                          {dealType === 'pair' ? (
                            <>
                              <span className="text-slate-400 font-medium">Original Price:</span>
                              <span className="text-slate-500 line-through font-bold">
                                {formatPrice(parseInt(originalPrice) || 0)}
                              </span>

                              <span className="text-slate-400 font-medium">Split Price / Head:</span>
                              <span className="text-[#4E2BC4] font-extrabold text-sm">
                                {formatPrice(parseInt(pairleyPrice) || 0)} (50% Off)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-400 font-medium">Original baseline:</span>
                              <span className="text-slate-500 font-bold">
                                {formatPrice(parseInt(originalPrice) || 0)}
                              </span>

                              <span className="text-slate-400 font-medium">Tiers configured:</span>
                              <span className="text-slate-700 font-bold">
                                {tiers.length} price points
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#4E2BC4]/5 border border-[#4E2BC4]/10 p-4 rounded-xl mt-4">
                        <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
                          💡 **Next step**: Clicking "Publish Deal" will distribute this offer across active customer search feeds instantly. Ensure images are high definition and clear!
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-8">
            <button
              type="button"
              className={`btn btn-outline border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition hover:bg-slate-50 ${
                step === 1 ? 'opacity-0 pointer-events-none' : ''
              }`}
              onClick={prevStep}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all hover:translate-x-0.5"
                onClick={nextStep}
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.01]"
                onClick={handlePublish}
              >
                Publish Deal <Check size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
