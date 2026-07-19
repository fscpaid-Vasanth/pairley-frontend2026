import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  X,
  Loader2
} from 'lucide-react';
import { categories } from '../../data/categories';
import { formatPrice } from '../../utils/constants';
import DealCard from '../../components/DealCard';
import MediaUploadPanel from '../../components/business/MediaUploadPanel';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { getUserLocation, reverseGeocode } from '../../utils/geo';
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
  const { showToast } = useToast();
  const { id: offerId } = useParams();
  const isEditMode = !!offerId;

  const token = localStorage.getItem('pairley_token');
  const business = JSON.parse(localStorage.getItem('pairley_user') || 'null');

  // Redirect if not logged in
  if (!token || !business) {
    navigate('/login');
    return null;
  }

  // Block PENDING / REJECTED merchants from creating deals
  if (business.role === 'Business' && business.verification_status !== 'APPROVED') {
    const isRejected = business.verification_status === 'REJECTED';
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 520, width: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(78,43,196,0.1)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{isRejected ? '❌' : '⏳'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            {isRejected ? 'Account Not Approved' : 'Awaiting Admin Approval'}
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
            {isRejected
              ? 'Your merchant account has been rejected. You cannot create deals. Please contact support@pairley.com.'
              : 'You cannot create deals until your shop is approved by the Pairley admin team. Approval typically takes 24–48 hours.'}
          </p>
          <button
            onClick={() => navigate('/business/dashboard')}
            style={{ padding: '12px 32px', borderRadius: 99, background: '#5B12D6', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  const [dealType, setDealType] = useState('pair'); // 'pair' or 'group'
  const [category, setCategory] = useState('shopping');
  const [activeSection, setActiveSection] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePlaceholder, setImagePlaceholder] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop');
  const [originalPrice, setOriginalPrice] = useState('');
  const [pairleyPrice, setPairleyPrice] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);
  const [validDays, setValidDays] = useState('30');
  const [minParticipants, setMinParticipants] = useState('3');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [terms, setTerms] = useState('Valid only through the Pairley web/mobile app interface. Match must be achieved within deal timeframe.');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isLoadingOffer, setIsLoadingOffer] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit mode: fetch the existing offer and pre-fill the form. Note:
  // minParticipants, additional group tiers beyond the first, terms text,
  // and the free-text location string were never persisted by the original
  // create flow (confirmed in Module 3 STEP 1 research) — those fields fall
  // back to their create-mode defaults rather than restoring anything,
  // since there's nothing to restore.
  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/offers/details/${offerId}`)
      .then((offer) => {
        if (offer.business_id !== business.id) {
          showToast('You do not own this offer.', 'error');
          navigate('/business/manage-deals');
          return;
        }
        const isPair = offer.offer_type === 'BOGO';
        setDealType(isPair ? 'pair' : 'group');
        setCategory(offer.category || 'shopping');
        setTitle(offer.title || '');
        setDescription(offer.description || '');
        setImagePlaceholder(offer.cover_image || offer.offer_image || '');
        setOriginalPrice(String(offer.original_price ?? ''));
        if (isPair) {
          setPairleyPrice(String(offer.offer_price ?? ''));
        } else {
          setTiers([{ id: 1, minPeople: offer.required_people || 5, pricePerHead: offer.offer_price || 0 }]);
        }
        setLocation(offer.business?.city || business.city || '');
        if (typeof offer.geo_lat === 'number') setLatitude(offer.geo_lat);
        if (typeof offer.geo_lng === 'number') setLongitude(offer.geo_lng);
        const startMs = new Date(offer.start_date).getTime();
        const endMs = new Date(offer.end_date).getTime();
        const daysRemaining = Math.max(1, Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)));
        setValidDays(String(daysRemaining));
        setMaxParticipants(String(offer.required_people ?? '20'));
        setWhatsappNumber(offer.whatsapp_number || '');
        const existingGallery = Array.isArray(offer.gallery_images) && offer.gallery_images.length > 0
          ? offer.gallery_images
          : (offer.facility_images || []);
        setFacilityImages(existingGallery);
        try {
          const staff = JSON.parse(offer.facility_details || '[]');
          if (Array.isArray(staff) && staff.length > 0) setStaffList(staff);
        } catch (e) {
          // facility_details wasn't valid staff JSON — leave the default row
        }
      })
      .catch(() => {
        showToast('Failed to load this offer for editing.', 'error');
        navigate('/business/manage-deals');
      })
      .finally(() => setIsLoadingOffer(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  // Facility showcase and staff/trainers details state
  const [facilityImages, setFacilityImages] = useState([]);
  const [staffList, setStaffList] = useState([{ name: '', role: '' }]);

  const addStaffRow = () => {
    setStaffList([...staffList, { name: '', role: '' }]);
  };

  const removeStaffRow = (idx) => {
    if (staffList.length > 1) {
      setStaffList(staffList.filter((_, i) => i !== idx));
    }
  };

  const handleStaffChange = (idx, field, value) => {
    const updated = [...staffList];
    updated[idx][field] = value;
    setStaffList(updated);
  };

  const handleFacilityImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacilityImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFacilityImage = (idx) => {
    setFacilityImages(facilityImages.filter((_, i) => i !== idx));
  };

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

  // Single-page form validation
  const validateForm = () => {
    const newErrors = {};
    if (!dealType) newErrors.dealType = 'Please select a deal model.';
    if (!category) newErrors.category = 'Please select a category.';
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToSection3 = () => {
    const sec2Errors = {};
    if (!title || title.trim().length < 5) sec2Errors.title = 'Title must be at least 5 characters.';
    if (!description || description.trim().length < 15) sec2Errors.description = 'Description must be at least 15 characters.';
    if (!location || location.trim().length < 2) sec2Errors.location = 'Please enter a valid location/city.';
    if (!imagePlaceholder) sec2Errors.image = 'Please select a cover image.';
    
    const orig = parseFloat(originalPrice);
    if (dealType === 'pair') {
      const pairley = parseFloat(pairleyPrice);
      if (!originalPrice || isNaN(orig) || orig <= 0) {
        sec2Errors.originalPrice = 'Please enter a valid original price.';
      }
      if (!pairleyPrice || isNaN(pairley) || pairley <= 0) {
        sec2Errors.pairleyPrice = 'Please enter a valid split price.';
      } else if (orig && pairley >= orig) {
        sec2Errors.pairleyPrice = 'Split price must be less than the original price.';
      }
    } else {
      if (!originalPrice || isNaN(orig) || orig <= 0) {
        sec2Errors.originalPrice = 'Please enter a baseline original price.';
      }
      if (tiers.length === 0) {
        sec2Errors.tiers = 'Please add at least one group pricing tier.';
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
          sec2Errors.tierErrors = tierErrors;
        }
      }
    }

    if (Object.keys(sec2Errors).length > 0) {
      setErrors({ ...errors, ...sec2Errors });
      showToast('Please fill all mandatory fields in Section 2 correctly.', 'error');
      return;
    }

    const updatedErrors = { ...errors };
    delete updatedErrors.title;
    delete updatedErrors.description;
    delete updatedErrors.location;
    delete updatedErrors.image;
    delete updatedErrors.originalPrice;
    delete updatedErrors.pairleyPrice;
    delete updatedErrors.tiers;
    delete updatedErrors.tierErrors;
    setErrors(updatedErrors);

    setActiveSection(3);
    setTimeout(() => {
      const el = document.getElementById('deal-section-3');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNextToSection4 = () => {
    if (!validDays || parseInt(validDays) <= 0) {
      setErrors({ ...errors, validDays: 'Please enter a valid duration (minimum 1 day).' });
      showToast('Please enter a valid duration for the deal.', 'error');
      return;
    }
    
    const updatedErrors = { ...errors };
    delete updatedErrors.validDays;
    setErrors(updatedErrors);

    setActiveSection(4);
    setTimeout(() => {
      const el = document.getElementById('deal-section-4');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePublish = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      showToast('Please correct form validation errors before publishing.', 'error');
      const firstErrorEl = document.querySelector('.error-text');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

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
      cover_image: imagePlaceholder || null,
      gallery_images: facilityImages,
      facility_details: JSON.stringify(staffList.filter(s => s.name.trim() || s.role.trim())),
      whatsapp_number: whatsappNumber || null,
      geo_lat: latitude,
      geo_lng: longitude
    };

    setIsSubmitting(true);
    const request = isEditMode
      ? api.put(`/offers/update/${offerId}`, payload)
      : api.post('/offers/create', payload);

    request
      .then(() => {
        showToast(isEditMode ? 'Deal updated successfully!' : 'Deal published successfully to the live feed!', 'success');
        navigate(isEditMode ? '/business/manage-deals' : '/business/dashboard');
      })
      .catch((err) => {
        console.error('Failed to save deal:', err);
        showToast(err.message || 'Failed to save deal. Please check your connection and try again.', 'error');
      })
      .finally(() => setIsSubmitting(false));
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

  if (isLoadingOffer) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin text-[#5B12D6]" size={32} />
      </div>
    );
  }

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
            <Sparkles className="text-[#5B12D6]" size={28} />
            {isEditMode ? 'Edit Listing' : 'Create New Listing'}
          </h2>

          <form onSubmit={handlePublish} className="flex flex-col gap-8 py-4">
            
            {/* Section 1: Type & Category */}
            <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl flex flex-col gap-6 text-left shadow-sm">
              <div className="border-b border-slate-200/60 pb-3">
                <span className="bg-[#5B12D6]/10 text-[#5B12D6] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Section 1
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-2">Deal Model & Category</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the co-buying social model and target category.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`create-deal-page__model-card flex flex-col text-left p-6 rounded-2xl border-4 transition-all relative ${
                    dealType === 'pair' 
                      ? 'border-[#5B12D6] bg-[#5B12D6]/10 shadow-lg shadow-[#5B12D6]/10 scale-[1.01]' 
                      : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => setDealType('pair')}
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                    🤝
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Pair Deal (BOGO Split)</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Two customers match to unlock a BOGO deal. They split the cost 50/50 and each gets their item. Great for restaurants, spa services, and retail.
                  </p>
                  {dealType === 'pair' && (
                    <span className="absolute top-4 right-4 bg-[#5B12D6] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-white">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`create-deal-page__model-card flex flex-col text-left p-6 rounded-2xl border-4 transition-all relative ${
                    dealType === 'group' 
                      ? 'border-[#5B12D6] bg-[#5B12D6]/10 shadow-lg shadow-[#5B12D6]/10 scale-[1.01]' 
                      : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => setDealType('group')}
                >
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                    👥
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Group Deal (Tiered Pricing)</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Multiple participants pool interest. As the size of the group reaches set milestones, the cost per person decreases. Ideal for travel tours, experiences, and subscriptions.
                  </p>
                  {dealType === 'group' && (
                    <span className="absolute top-4 right-4 bg-[#5B12D6] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-white">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3">Select Deal Category</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left relative ${
                        category === cat.id 
                          ? 'border-[#5B12D6] bg-[#5B12D6]/15 text-[#5B12D6] font-black shadow-sm scale-[1.02]' 
                          : 'border-slate-200 bg-white/50 text-slate-600 hover:border-slate-300'
                      }`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.name}</span>
                      {category === cat.id && (
                        <span className="absolute right-2 top-2 bg-[#5B12D6] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(2);
                    setTimeout(() => {
                      const el = document.getElementById('deal-section-2');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold text-xs px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  Continue to Section 2 <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Section 2: Details & Pricing */}
            <div 
              id="deal-section-2"
              className={`bg-white border border-slate-200 p-6 md:p-8 rounded-3xl flex flex-col gap-5 text-left shadow-sm relative transition-all duration-300 ${
                activeSection < 2 ? 'opacity-40 pointer-events-none select-none' : ''
              }`}
            >
              {activeSection < 2 && (
                <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px] flex items-center justify-center rounded-3xl z-10">
                  <div className="bg-slate-800/90 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md">
                    🔒 Complete Section 1 to Unlock
                  </div>
                </div>
              )}
              <div className="border-b border-slate-200/60 pb-3 mb-2">
                <span className="bg-[#5B12D6]/10 text-[#5B12D6] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Section 2
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-2">Product Details & Pricing</h3>
                <p className="text-xs text-slate-500 mt-0.5">Provide customer-facing descriptions, price points, and cover images.</p>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Deal Title</label>
                <input
                  type="text"
                  className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                    errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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
                    errors.description ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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

              {isEditMode && (
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Upload Real Images</label>
                  <p className="text-xs text-slate-500 -mt-1">
                    Uploads here replace the preset/URL cover image below with a real hosted image, and manage the gallery directly on this offer.
                  </p>
                  <MediaUploadPanel
                    singleSlots={[
                      { key: 'cover', label: 'Cover Image', value: imagePlaceholder, uploadUrl: `/offers/${offerId}/media`, responseField: 'cover_image' },
                    ]}
                    gallery={{
                      images: facilityImages,
                      uploadUrl: `/offers/${offerId}/media`,
                      removeUrl: `/offers/${offerId}/media/gallery`,
                      responseField: 'gallery',
                      maxCount: 10,
                    }}
                    onUpdated={(data) => {
                      if (data.cover_image) setImagePlaceholder(data.cover_image);
                      if (Array.isArray(data.gallery_images)) setFacilityImages(data.gallery_images);
                      if (errors.image) setErrors({ ...errors, image: null });
                    }}
                    onError={(msg) => showToast(msg, 'error')}
                  />
                </div>
              )}

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Cover Image {isEditMode ? '(Preset/URL fallback)' : ''}</label>
                <div
                  className={`create-deal-page__uploader border-2 border-dashed rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between cursor-pointer transition-all ${
                    errors.image ? 'border-red-500 bg-red-50/20' : 'border-slate-200 hover:border-[#5B12D6] bg-slate-50/40'
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
                                ? 'bg-[#5B12D6] text-white' 
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
                                ? 'bg-[#5B12D6] text-white' 
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
                                <div className="absolute top-1 right-1 w-5 h-5 bg-[#5B12D6] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
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
                              className="form-input w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#5B12D6]"
                              placeholder="https://images.unsplash.com/photo-..."
                              value={customImageUrl}
                              onChange={(e) => setCustomImageUrl(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white font-bold text-xs px-4 py-2 rounded-xl"
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

              {/* Shop Facilities & Staff Details */}
              <div className="bg-slate-50/50 border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-4 text-left">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  🏪 Shop Facilities & Team Details
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">Add pictures of your gym equipment / facilities and list your trainers or stylists.</p>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Facility Showcase Photos</label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {facilityImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 group">
                        <img src={img} alt="facility" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFacilityImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-primary transition-colors bg-white shadow-sm flex-shrink-0">
                      <span className="text-lg font-bold">+</span>
                      <span className="text-[8px] font-extrabold uppercase">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFacilityImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200/60 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Stylists / Trainers / Staff</label>
                    <button
                      type="button"
                      onClick={addStaffRow}
                      className="px-2.5 py-1.5 border border-slate-200 hover:border-primary text-slate-600 hover:text-primary rounded-lg text-[10px] font-bold bg-white transition-colors flex items-center gap-1 shadow-sm"
                    >
                      + Add Staff
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                    {staffList.map((staff, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="e.g. Coach Arjun / Stylist Priya"
                          value={staff.name}
                          onChange={(e) => handleStaffChange(idx, 'name', e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Strength Specialist / Senior Stylist"
                          value={staff.role}
                          onChange={(e) => handleStaffChange(idx, 'role', e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary"
                        />
                        {staffList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStaffRow(idx)}
                            className="p-2 bg-slate-50 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Fields */}
              {dealType === 'pair' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700">Original Retail Price (₹)</label>
                    <input
                      type="number"
                      className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                        errors.originalPrice ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
                      }`}
                      placeholder="6999"
                      value={originalPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOriginalPrice(val);
                        setPairleyPrice(val ? Math.round(parseInt(val) / 2) : '');
                        
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
                        errors.pairleyPrice ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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
                <div className="flex flex-col gap-3">
                  <div className="form-group flex flex-col gap-1.5 mb-2">
                    <label className="text-sm font-bold text-slate-700">Baseline Retail Price per Head (₹)</label>
                    <input
                      type="number"
                      className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                        errors.originalPrice ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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
                                    className={`form-input w-full pl-3 pr-14 py-2 border rounded-lg text-slate-800 outline-none text-xs focus:border-[#5B12D6] ${
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
                                    className={`form-input w-full pl-6 pr-14 py-2 border rounded-lg text-slate-800 outline-none text-xs focus:border-[#5B12D6] ${
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Location / City</label>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#5B12D6] hover:underline flex items-center gap-1 bg-none border-none p-0 cursor-pointer"
                    disabled={isDetectingLoc}
                    onClick={async () => {
                      setIsDetectingLoc(true);
                      try {
                        const coords = await getUserLocation();
                        if (coords?.lat) {
                          setLatitude(coords.lat);
                          setLongitude(coords.lng);
                          const address = await reverseGeocode(coords.lat, coords.lng);
                          if (address?.city) {
                            setLocation(`${address.locality || address.area || address.city}, ${address.city}`);
                          } else {
                            setLocation(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                          }
                          showToast('Shop location coordinates detected!', 'success');
                        } else {
                          showToast('Could not retrieve GPS coordinates.', 'error');
                        }
                      } catch (err) {
                        showToast('Failed to detect location.', 'error');
                      } finally {
                        setIsDetectingLoc(false);
                      }
                    }}
                  >
                    📍 {isDetectingLoc ? 'Detecting...' : 'Detect Shop Location'}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    className={`form-input w-full pl-9 pr-3 py-3 border rounded-xl text-slate-800 outline-none transition-all ${
                      errors.location ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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
                {latitude && longitude && (
                  <span className="text-[10px] text-emerald-600 font-bold mt-1">
                    ✓ Coordinates Saved: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </span>
                )}
                {errors.location && (
                  <span className="error-text text-red-500 flex items-center gap-1 mt-1 text-xs font-medium">
                    <AlertCircle size={12} /> {errors.location}
                  </span>
                )}
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">WhatsApp Contact Number (Optional)</label>
                <input
                  type="text"
                  className="form-input border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-[#5B12D6]"
                  placeholder="e.g. 9876543210 (Defaults to business owner mobile)"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(1);
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft size={14} /> Back to Section 1
                </button>
                <button
                  type="button"
                  onClick={handleNextToSection3}
                  className="bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold text-xs px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  Continue to Section 3 <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Section 3: Duration & Rules */}
            <div 
              id="deal-section-3"
              className={`bg-white border border-slate-200 p-6 md:p-8 rounded-3xl flex flex-col gap-5 text-left shadow-sm relative transition-all duration-300 ${
                activeSection < 3 ? 'opacity-40 pointer-events-none select-none' : ''
              }`}
            >
              {activeSection < 3 && (
                <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px] flex items-center justify-center rounded-3xl z-10">
                  <div className="bg-slate-800/90 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md">
                    🔒 Complete Section 2 to Unlock
                  </div>
                </div>
              )}
              <div className="border-b border-slate-200/60 pb-3 mb-2">
                <span className="bg-[#5B12D6]/10 text-[#5B12D6] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Section 3
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-2">Duration, Capacity & Terms</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure limits, deadlines, and standard usage rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">Deal Duration (Days)</label>
                  <input
                    type="number"
                    className={`form-input border rounded-xl p-3 text-slate-800 outline-none transition-all ${
                      errors.validDays ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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
                        errors.maxParticipants ? 'border-red-500' : 'border-slate-200 focus:border-[#5B12D6]'
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
                  className={`form-textarea border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-[#5B12D6] transition-all`}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(2);
                    setTimeout(() => {
                      const el = document.getElementById('deal-section-2');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft size={14} /> Back to Section 2
                </button>
                <button
                  type="button"
                  onClick={handleNextToSection4}
                  className="bg-[#5B12D6] hover:bg-[#430bb0] text-white font-extrabold text-xs px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  Continue to Section 4 <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Section 4: Live Preview & Submission */}
            <div 
              id="deal-section-4"
              className={`bg-white border border-slate-200 p-6 md:p-8 rounded-3xl flex flex-col gap-6 text-left shadow-sm relative transition-all duration-300 ${
                activeSection < 4 ? 'opacity-40 pointer-events-none select-none' : ''
              }`}
            >
              {activeSection < 4 && (
                <div className="absolute inset-0 bg-white/45 backdrop-blur-[0.5px] flex items-center justify-center rounded-3xl z-10">
                  <div className="bg-slate-800/90 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md">
                    🔒 Complete Section 3 to Unlock
                  </div>
                </div>
              )}
              <div className="border-b border-slate-200/60 pb-3 mb-2">
                <span className="bg-[#5B12D6]/10 text-[#5B12D6] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Section 4
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-2">Review & Live Preview</h3>
                <p className="text-xs text-slate-500 mt-0.5">This is how your deal card will appear to customers in search feeds.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
                
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
                    
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-semibold">
                      <span className="text-slate-400 font-medium">Marketing Model:</span>
                      <span className="text-slate-700 font-extrabold capitalize">
                        {dealType === 'pair' ? '🤝 Pair Deal (BOGO Split)' : '👥 Group Deal (Tiered)'}
                      </span>

                      <span className="text-slate-400 font-medium">Category:</span>
                      <span className="text-slate-700 font-extrabold capitalize">
                        {selectedCategoryObj?.icon} {selectedCategoryObj?.name}
                      </span>

                      <span className="text-slate-400 font-medium">Title:</span>
                      <span className="text-slate-700 font-bold">{title || '(Not set)'}</span>

                      <span className="text-slate-400 font-medium">Location:</span>
                      <span className="text-slate-700 font-bold flex items-center gap-1">
                        <MapPin size={10} /> {location || '(Not set)'}
                      </span>

                      <span className="text-slate-400 font-medium">Duration:</span>
                      <span className="text-slate-700 font-bold flex items-center gap-1">
                        <Calendar size={10} /> Valid for {validDays || 30} Days
                      </span>

                      {dealType === 'pair' ? (
                        <>
                          <span className="text-slate-400 font-medium">Original Price:</span>
                          <span className="text-slate-500 line-through font-bold">
                            {formatPrice(parseInt(originalPrice) || 0)}
                          </span>

                          <span className="text-slate-400 font-medium">Split Price / Head:</span>
                          <span className="text-[#5B12D6] font-extrabold text-sm">
                            {formatPrice(parseInt(pairleyPrice) || 0)} (50% Off)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400 font-medium">Original baseline:</span>
                          <span className="text-slate-500 font-bold">
                            {formatPrice(parseInt(originalPrice) || 0)}
                          </span>

                          <span className="text-[#5B12D6] font-medium">Tiers configured:</span>
                          <span className="text-slate-700 font-bold">
                            {tiers.length} price points
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#5B12D6]/5 border border-[#5B12D6]/10 p-4 rounded-xl mt-4">
                    <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
                      💡 **Direct Publish**: Pressing the button below publishes this offer directly across active customer search feeds instantly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="border-t border-slate-100 pt-6 flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(3);
                    setTimeout(() => {
                      const el = document.getElementById('deal-section-3');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft size={14} /> Back to Section 3
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-all hover:scale-[1.01] disabled:opacity-60"
                >
                  {isSubmitting
                    ? <Loader2 size={16} className="animate-spin" />
                    : <>{isEditMode ? 'Save Changes' : 'Publish Deal'} <Check size={16} /></>}
                </button>
              </div>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}

