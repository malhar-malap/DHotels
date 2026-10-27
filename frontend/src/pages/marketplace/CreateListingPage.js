import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { listingsAPI, masterAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as Icons from 'react-icons/fa';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const numericId = id ? id.split('-')[0] : '';
  const { isAuthenticated, user } = useAuth();
  const isEditMode = !!numericId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [dealTypes, setDealTypes] = useState([]);

  // Form Section Refs for scroll tracking
  const basicRef = useRef(null);
  const pricingRef = useRef(null);
  const descRef = useRef(null);
  const specsRef = useRef(null);
  const submitBtnRef = useRef(null);
  const isSubmittedRef = useRef(false);

  // UI/UX States
  const [activeStep, setActiveStep] = useState(1);
  const [activeFocus, setActiveFocus] = useState('general');
  const [draftSavedTime, setDraftSavedTime] = useState('');
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState(null);

  const [formData, setFormData] = useState({
    title: '', categoryId: '', dealTypeId: '', cityName: '',
    askingPrice: '', priceNegotiable: true, shortDescription: '', detailedDescription: '',
    // Hotels
    numberOfRooms: '', plotAreaSqft: '', constructedAreaSqft: '',
    // Restaurants, Cafe, Banquets, Resto-Bars, Resorts
    carpetAreaSqft: '',
  });

  useEffect(() => {
    masterAPI.getCategories()
      .then(res => setCategories(res.data?.data || []))
      .catch(() => toast.error('Failed to load categories'));

    if (isEditMode) {
      setLoading(true);
      listingsAPI.getById(numericId).then(res => {
        const data = res.data.data;
        setFormData({
            title: data.title || '', categoryId: data.category?.id || '', dealTypeId: data.dealType?.id || '',
            cityName: data.cityName || '', askingPrice: data.askingPrice || '',
            priceNegotiable: data.priceNegotiable ?? true, shortDescription: data.shortDescription || '',
            detailedDescription: data.detailedDescription || '',
            numberOfRooms: data.categoryDetails?.numberOfRooms || '',
            plotAreaSqft: data.categoryDetails?.plotAreaSqft || '',
            constructedAreaSqft: data.categoryDetails?.constructedAreaSqft || '',
            carpetAreaSqft: data.categoryDetails?.carpetAreaSqft || '',
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  // Check for existing drafts
  useEffect(() => {
    if (categories.length === 0) return;
    
    const userId = user?.id || 'guest';
    const draftKey = isEditMode ? `dhotels_draft_edit_${userId}_${id}` : `dhotels_draft_new_${userId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.data) {
          const hasData = Object.keys(parsed.data).some(key => {
            const val = parsed.data[key];
            return val !== '' && val !== false && val !== null && val !== undefined && key !== 'priceNegotiable';
          });
          if (hasData) {
            setDraftToRestore(parsed.data);
            setShowRestoreBanner(true);
          }
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [categories, isEditMode, id]);

  // Auto-save draft on changes
  useEffect(() => {
    if (loading || isSubmittedRef.current) return;
    
    const hasData = Object.keys(formData).some(key => {
      const val = formData[key];
      return val !== '' && val !== false && val !== null && val !== undefined && val !== true;
    });
    if (!hasData) return;

    const userId = user?.id || 'guest';
    const draftKey = isEditMode ? `dhealth_draft_edit_${userId}_${id}` : `dhealth_draft_new_${userId}`;
    
    const delayDebounce = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDraftSavedTime(timeStr);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [formData, isEditMode, id, loading]);

  // Update progress stepper based on field completion status
  useEffect(() => {
    const isBasic = !!(formData.title?.trim() && formData.categoryId && formData.dealTypeId && formData.cityName?.trim());
    const isPricing = isBasic && !!formData.askingPrice;
    const isPitch = isPricing && !!(formData.shortDescription?.trim() || formData.detailedDescription?.trim());

    if (!isBasic) {
      setActiveStep(1);
    } else if (!isPricing) {
      setActiveStep(2);
    } else if (!isPitch) {
      setActiveStep(3);
    } else {
      setActiveStep(4);
    }
  }, [formData]);

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setFormData(prev => ({
        ...prev,
        ...draftToRestore
      }));
      toast.success("Draft restored successfully!");
    }
    setShowRestoreBanner(false);
  };

  const handleDiscardDraft = () => {
    const draftKey = isEditMode ? `dhealth_draft_edit_${user?.id || 'guest'}_${id}` : `dhealth_draft_new_${user?.id || 'guest'}`;
    localStorage.removeItem(draftKey);
    setShowRestoreBanner(false);
    toast.success("Draft discarded.");
  };

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (formData.categoryId) {
      masterAPI.getDealTypes(formData.categoryId)
        .then(res => setDealTypes(res.data?.data || []))
        .catch(() => {});
    }
  }, [formData.categoryId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if ((type === 'number' || (e.target.getAttribute && e.target.getAttribute('type') === 'number')) && value !== '') {
      // Prevent negative numbers for all numeric fields
      const numVal = parseFloat(value);
      if (numVal < 0) return;
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };



  const getCategoryName = () => {
    const cat = categories.find(c => String(c.id) === String(formData.categoryId));
    return cat?.name?.toLowerCase() || '';
  };

  const getDealTypeName = () => {
    const dt = dealTypes.find(d => String(d.id) === String(formData.dealTypeId));
    return dt?.name?.toLowerCase() || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in before attempting to create/edit
    if (!isAuthenticated) {
      setError('LOGIN_REQUIRED');
      toast.error('Please login or sign up to create listings.');
      setLoading(false);
      return;
    }

    isSubmittedRef.current = true;
    setLoading(true);
    setError('');

    try {
      // Prepare Payload
      const payload = {
        title: formData.title,
        categoryId: parseInt(formData.categoryId),
        dealTypeId: parseInt(formData.dealTypeId),
        cityName: formData.cityName,
        askingPrice: parseFloat(formData.askingPrice),
        priceNegotiable: formData.priceNegotiable,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        isConfidential: false,
        confidentialTitle: null
      };

      const catName = getCategoryName();
      if (catName === 'hotel' || catName === 'hotels') {
        if (formData.numberOfRooms) payload.numberOfRooms = parseInt(formData.numberOfRooms);
        if (formData.plotAreaSqft) payload.plotAreaSqft = parseFloat(formData.plotAreaSqft);
        if (formData.constructedAreaSqft) payload.constructedAreaSqft = parseFloat(formData.constructedAreaSqft);
      } else {
        // Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts
        if (formData.carpetAreaSqft) payload.carpetAreaSqft = parseFloat(formData.carpetAreaSqft);
      }

      // 3. Create or Edit Listing
      const draftKey = isEditMode ? `dhotels_draft_edit_${user?.id || 'guest'}_${numericId}` : `dhotels_draft_new_${user?.id || 'guest'}`;
      if (isEditMode) {
        await listingsAPI.update(numericId, payload);
        toast.success('Listing updated successfully!');
      } else {
        await listingsAPI.create(payload);
        toast.success('Listing posted successfully! Please wait for admins to review and approve it.', { duration: 5000 });
      }
      localStorage.removeItem(draftKey);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('LOGIN_REQUIRED');
        toast.error('Please login or sign up to create listings.');
      } else {
        setError(err.response?.data?.message || 'Failed to create listing. Please check your inputs and images.');
        toast.error('Failed to create listing');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name) => {
    const normalized = name?.toLowerCase() || '';
    if (normalized.includes('hospital') || normalized.includes('dental')) {
      return 'FaHospital';
    }
    if (normalized.includes('pharma company') || normalized.includes('pharma companies')) {
      return 'FaFlask';
    }
    if (normalized.includes('pharmacy') || normalized.includes('pharmacies')) {
      return 'FaPills';
    }
    if (normalized.includes('hotel')) return 'FaHotel';
    if (normalized.includes('restaurant') && normalized.includes('bar')) return 'FaCocktail';
    if (normalized.includes('restaurant')) return 'FaUtensils';
    if (normalized.includes('cafe')) return 'FaCoffee';
    if (normalized.includes('banquet')) return 'FaGlassCheers';
    if (normalized.includes('resort')) return 'FaUmbrellaBeach';
    return 'FaHotel';
  };

  const renderCategoryIcon = (iconName, className) => {
    if (iconName === 'hotel-icon') return <Icons.FaHotel className={className} />;
    if (iconName === 'utensils-icon') return <Icons.FaUtensils className={className} />;
    if (iconName === 'coffee-icon') return <Icons.FaCoffee className={className} />;
    if (iconName === 'glass-cheers-icon') return <Icons.FaGlassCheers className={className} />;
    if (iconName === 'cocktail-icon') return <Icons.FaCocktail className={className} />;
    if (iconName === 'umbrella-beach-icon') return <Icons.FaUmbrellaBeach className={className} />;
    const IconComponent = Icons[iconName] || Icons.FaHotel;
    return <IconComponent className={className} />;
  };

  const getCompletionPercentage = () => {
    let total = 5; // categoryId, dealTypeId, title, cityName, askingPrice
    let filled = 0;

    if (formData.categoryId) filled++;
    if (formData.dealTypeId) filled++;
    if (formData.title.trim()) filled++;
    if (formData.cityName.trim()) filled++;
    if (formData.askingPrice) filled++;

    const catName = getCategoryName();
    if (catName === 'hotel' || catName === 'hotels') {
      total += 3;
      if (formData.numberOfRooms) filled++;
      if (formData.plotAreaSqft) filled++;
      if (formData.constructedAreaSqft) filled++;
    } else {
      total += 1;
      if (formData.carpetAreaSqft) filled++;
    }

    total += 2; // shortDescription, detailedDescription
    if (formData.shortDescription.trim()) filled++;
    if (formData.detailedDescription.trim()) filled++;

    return Math.round((filled / total) * 100);
  };

  const FOCUS_TIPS = {
    general: {
      title: "Quick Guidance",
      text: "Fill out the fields to build a high-quality listing. A premium completion score increases buyer inquiry rates."
    },
    categoryId: {
      title: "Marketplace Category",
      text: "Selecting the correct category enables buyers to find your listing through filtered searches."
    },
    dealTypeId: {
      title: "Transaction Deal Type",
      text: "Indicate whether this is an outright sale, a lease, or a partial stake partnership."
    },
    title: {
      title: "Captivating Title",
      text: "Keep it under 100 characters. Example: 'NABH Accredited 100-Bed Multi-Specialty Hospital for Sale in Mumbai'."
    },
    cityName: {
      title: "City & Geographic Node",
      text: "Provide the correct city. If your city is not in the list, type its name to enter a custom value."
    },
    askingPrice: {
      title: "Asking Price Valuation",
      text: "Enter your expected price. You can mark it as negotiable to encourage flexible negotiations."
    },
    shortDescription: {
      title: "Elevator Pitch",
      text: "A brief one-sentence hook (max 500 chars) displayed on browsing cards to grab instant attention."
    },
    detailedDescription: {
      title: "In-Depth Description",
      text: "Describe the business details: historical revenue trends, staff strength, growth opportunities, and reasons for exit."
    },
    specs: {
      title: "Technical Specifications",
      text: "Provide certifications (NABH/FDA/WHO/NABL) and structural capacities to build buyer confidence."
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-900/60 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-orange-500/80 focus:border-transparent outline-none transition-all duration-300 text-gray-200 placeholder-gray-500 backdrop-blur-sm shadow-inner";
  const labelClass = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  const handleToggle = (name, currentValue) => {
    handleChange({
      target: {
        name,
        type: 'checkbox',
        checked: !currentValue
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] bg-mesh relative pt-12 pb-0 text-gray-100 flex flex-col" style={{ overflowX: 'clip' }}>
      {/* Decorative glow elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 relative z-10 flex-grow pb-12">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-orange-400 mb-3 transition uppercase tracking-wider"
            >
              <Icons.FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-gray-100">
              <span>{isEditMode ? '💾' : '🚀'}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-400">
                {isEditMode ? 'Edit Listing' : 'Post a New Listing'}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-2">
              <span>⏱️ Estimated completion: 4 minutes</span>
              <span className="text-gray-700">•</span>
              <span>Attract verified healthcare buyers</span>
            </p>
          </div>
          
          {/* Top completeness badge */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-3 flex items-center gap-4 self-start md:self-auto backdrop-blur-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Listing Score</p>
              <p className="text-sm font-bold text-gray-200">{getCompletionPercentage()}% Complete</p>
            </div>
          </div>
        </div>

        {/* Restore Draft Banner */}
        {showRestoreBanner && (
          <div className="mb-8 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-5 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-gray-200">Unfinished Draft Detected</h3>
                <p className="text-xs text-gray-400 mt-1">We found a local draft of your listing details. Would you like to restore it and continue?</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center md:justify-end">
              <button 
                onClick={handleDiscardDraft}
                className="px-4 py-2 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200 text-xs font-bold rounded-xl transition bg-gray-950/40"
              >
                Discard Draft
              </button>
              <button 
                onClick={handleRestoreDraft}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/10 transition"
              >
                Restore Draft
              </button>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Information Panel */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 self-start">
            
            {/* Dynamic Focus Tips Box */}
            <div className="bg-gradient-to-b from-gray-900/80 to-gray-950/80 border border-gray-800 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Icons.FaInfoCircle className="text-orange-500" /> {FOCUS_TIPS[activeFocus]?.title || FOCUS_TIPS.general.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed transition-all duration-300">
                {FOCUS_TIPS[activeFocus]?.text || FOCUS_TIPS.general.text}
              </p>
            </div>

            {/* Listing Quality Meter */}
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Listing Quality Meter</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Score</span>
                  <span className={`font-bold ${
                    getCompletionPercentage() < 40 ? 'text-red-400' : getCompletionPercentage() < 75 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {getCompletionPercentage() < 40 ? 'Need Details' : getCompletionPercentage() < 75 ? 'Good Progress' : 'Premium Standard'}
                  </span>
                </div>
                
                {/* Visual Bar */}
                <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden p-[2px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      getCompletionPercentage() < 40 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                        : getCompletionPercentage() < 75 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                        : 'bg-gradient-to-r from-amber-500 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                    }`}
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
                
                {/* Benefits lists */}
                <div className="pt-2 border-t border-gray-800/80 space-y-2">
                  <div className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className={`text-sm shrink-0 ${getCompletionPercentage() >= 45 ? 'text-green-500' : 'text-gray-600'}`}>✓</span>
                    <span>Basic Details complete</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className={`text-sm shrink-0 ${getCompletionPercentage() >= 65 ? 'text-green-500' : 'text-gray-600'}`}>✓</span>
                    <span>Valuation parameters set</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className={`text-sm shrink-0 ${getCompletionPercentage() >= 85 ? 'text-green-500' : 'text-gray-600'}`}>✓</span>
                    <span>Elevator pitch & specs included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform benefits & FAQ */}
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Why list on DHealth?</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="text-lg">🛡️</div>
                    <div>
                      <p className="text-xs font-bold text-gray-200">100% Confidentiality</p>
                      <p className="text-[10px] text-gray-500 leading-normal">Your sensitive data is only revealed to vetted, verified buyers.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-lg">📈</div>
                    <div>
                      <p className="text-xs font-bold text-gray-200">Active Investor Network</p>
                      <p className="text-[10px] text-gray-500 leading-normal">Get matched with corporate entities and private equity buyers instantly.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800/80">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">FAQ snippets</h3>
                <div className="space-y-2">
                  <details className="group border border-gray-800/60 rounded-xl p-3 bg-gray-950/20 list-none transition-all duration-300">
                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-xs text-gray-400 hover:text-gray-200">
                      <span>Who assigns photos?</span>
                      <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                      To maintain high visual quality and system consistency, our admin team reviews and assigns appropriate visual styling. Users do not upload images.
                    </p>
                  </details>
                  <details className="group border border-gray-800/60 rounded-xl p-3 bg-gray-950/20 list-none transition-all duration-300">
                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-xs text-gray-400 hover:text-gray-200">
                      <span>How long does approval take?</span>
                      <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                      Listings are validated and approved within 24 hours. You will receive an email confirmation once it is live.
                    </p>
                  </details>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Form Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {error && error !== 'LOGIN_REQUIRED' && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-5 rounded-r-2xl animate-shake flex gap-3 backdrop-blur-sm">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-xs font-bold text-red-200 uppercase tracking-wider">Submission Error</p>
                  <p className="text-sm text-red-300/90 mt-1">{error}</p>
                </div>
              </div>
            )}

            {error && error === 'LOGIN_REQUIRED' && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-2xl backdrop-blur-sm">
                <div className="flex gap-4">
                  <span className="text-2xl shrink-0">🔒</span>
                  <div>
                    <h3 className="text-base text-amber-200 font-bold">Authentication Required</h3>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Please register or log in to submit your medical business listing to our network.</p>
                    <div className="flex gap-3 mt-4">
                      <Link to="/login" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition">Login</Link>
                      <Link to="/register" className="px-4 py-2 border border-orange-500/30 hover:border-orange-500 text-orange-400 hover:bg-orange-500/5 text-xs font-bold rounded-xl transition">Sign Up</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Stepper Inside Form Column Header */}
              <div className="bg-gray-900/30 border border-gray-800/80 rounded-3xl p-6 backdrop-blur-md shadow-lg">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500">Guided Workflow</span>
                  <h2 className="text-lg font-bold text-gray-100 mt-1">Listing Progress</h2>
                </div>
                
                {/* Horizontal Stepper */}
                <div className="flex flex-row items-center justify-between gap-1 border-t border-gray-800/80 pt-6">
                  {[
                    { id: 1, name: 'Category', ref: basicRef },
                    { id: 2, name: 'Valuation', ref: pricingRef },
                    { id: 3, name: 'Pitch', ref: descRef },
                    { id: 4, name: 'Specs', ref: specsRef },
                  ].map((step, idx) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;
                    const isLocked = step.id === 4 && !formData.categoryId;

                    return (
                      <React.Fragment key={step.id}>
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => scrollToSection(step.ref)}
                          className={`flex items-center gap-2 text-left transition-all duration-300 focus:outline-none ${
                            isLocked
                              ? 'opacity-30 cursor-not-allowed'
                              : isActive
                              ? 'text-orange-400 font-bold scale-102'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                            isLocked
                              ? 'bg-gray-950 border-gray-800 text-gray-700'
                              : isCompleted
                              ? 'bg-green-500 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                              : isActive
                              ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                              : 'bg-gray-950 border-gray-800 text-gray-500'
                          }`}>
                            {isCompleted ? '✓' : step.id}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">
                            {step.id === 1 && 'Basic'}
                            {step.id === 2 && 'Pricing'}
                            {step.id === 3 && 'Pitch'}
                            {step.id === 4 && 'Specs'}
                          </span>
                        </button>
                        {idx < 3 && (
                          <div className="flex-1 h-[1px] bg-gray-800/80 mx-2" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Basic Information */}
              <section 
                ref={basicRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
                onClick={() => { if(activeFocus === 'general') setActiveFocus('categoryId'); }}
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Basic Details</h3>
                    <p className="text-xs text-gray-500">Define your marketplace segment and core details</p>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className={labelClass}>Listing Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    maxLength="200"
                    onFocus={() => setActiveFocus('title')}
                    placeholder="e.g., Well-equipped Diagnostic Center in Central Delhi" 
                    className={inputClass} 
                  />
                </div>

                {/* Categories Redesign: Selectable Cards */}
                <div className="space-y-3">
                  <label className={labelClass}>Select Category *</label>
                  {categories.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map(idx => (
                        <div key={idx} className="animate-pulse bg-gray-950/60 border border-gray-900 rounded-2xl p-5 h-24 flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-800" />
                          <div className="w-16 h-3 bg-gray-800 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {categories.map((c) => {
                        const isSelected = String(c.id) === String(formData.categoryId);
                        const iconName = getCategoryIcon(c.name);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onFocus={() => setActiveFocus('categoryId')}
                            onClick={() => {
                              handleChange({ target: { name: 'categoryId', value: c.id } });
                              setFormData(prev => ({ ...prev, dealTypeId: '' }));
                              setActiveFocus('dealTypeId');
                            }}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-b from-orange-500/10 to-amber-500/10 border-orange-500/80 text-orange-400 shadow-[0_4px_20px_rgba(249,115,22,0.12)] scale-[1.03]'
                                : 'bg-gray-950/40 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300 hover:scale-[1.01]'
                            }`}
                          >
                            <div className={`p-2.5 rounded-xl mb-2.5 text-2xl transition-all duration-300 ${
                              isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-900/60 text-gray-600'
                            }`}>
                              {renderCategoryIcon(iconName)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-snug">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Deal Types: Dynamic selectable buttons */}
                {formData.categoryId && (
                  <div className="space-y-3 animate-fadeIn">
                    <label className={labelClass}>Deal Type *</label>
                    <div className="flex flex-wrap gap-3">
                      {dealTypes.map((d) => {
                        const isSelected = String(d.id) === String(formData.dealTypeId);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onFocus={() => setActiveFocus('dealTypeId')}
                            onClick={() => {
                              handleChange({ target: { name: 'dealTypeId', value: d.id } });
                              setActiveFocus('cityName');
                            }}
                            className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                              isSelected
                                ? 'bg-orange-500 text-white border-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.25)] scale-[1.02]'
                                : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300 hover:scale-[1.01]'
                            }`}
                          >
                            {d.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* City Selection Autocomplete */}
                <div className="space-y-2">
                  <label className={labelClass}>City *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 text-sm">📍</span>
                    <input 
                      type="text" 
                      name="cityName" 
                      value={formData.cityName} 
                      onChange={handleChange} 
                      required
                      list="cityList" 
                      onFocus={() => setActiveFocus('cityName')}
                      placeholder="Search or select city" 
                      className={`${inputClass} pl-10`} 
                      autoComplete="off" 
                    />
                  </div>
                  <datalist id="cityList">
                    <option value="Mumbai" />
                    <option value="Delhi" />
                    <option value="Bengaluru" />
                    <option value="Hyderabad" />
                    <option value="Chennai" />
                    <option value="Kolkata" />
                    <option value="Pune" />
                    <option value="Ahmedabad" />
                    <option value="Jaipur" />
                    <option value="Lucknow" />
                    <option value="Surat" />
                    <option value="Kanpur" />
                    <option value="Nagpur" />
                    <option value="Indore" />
                    <option value="Thane" />
                    <option value="Bhopal" />
                    <option value="Visakhapatnam" />
                    <option value="Patna" />
                    <option value="Vadodara" />
                    <option value="Ghaziabad" />
                    <option value="Ludhiana" />
                    <option value="Agra" />
                    <option value="Nashik" />
                    <option value="Faridabad" />
                    <option value="Meerut" />
                    <option value="Rajkot" />
                    <option value="Varanasi" />
                    <option value="Srinagar" />
                    <option value="Aurangabad" />
                    <option value="Dhanbad" />
                    <option value="Amritsar" />
                    <option value="Navi Mumbai" />
                    <option value="Allahabad" />
                    <option value="Ranchi" />
                    <option value="Howrah" />
                    <option value="Coimbatore" />
                    <option value="Jabalpur" />
                    <option value="Gwalior" />
                    <option value="Vijayawada" />
                    <option value="Jodhpur" />
                    <option value="Madurai" />
                    <option value="Raipur" />
                    <option value="Kota" />
                    <option value="Chandigarh" />
                    <option value="Guwahati" />
                    <option value="Solapur" />
                    <option value="Hubli" />
                    <option value="Mysuru" />
                    <option value="Tiruchirappalli" />
                    <option value="Bareilly" />
                    <option value="Aligarh" />
                    <option value="Tiruppur" />
                    <option value="Moradabad" />
                    <option value="Jalandhar" />
                    <option value="Bhubaneswar" />
                    <option value="Salem" />
                    <option value="Warangal" />
                    <option value="Guntur" />
                    <option value="Bhilai" />
                    <option value="Kochi" />
                    <option value="Gorakhpur" />
                    <option value="Noida" />
                    <option value="Gurgaon" />
                    <option value="Mangalore" />
                    <option value="Dehradun" />
                    <option value="Udaipur" />
                    <option value="Thiruvananthapuram" />
                    <option value="Shimla" />
                    <option value="Panaji" />
                  </datalist>
                  <p className="text-[10px] text-gray-500 leading-normal">Type to filter list, or enter custom geographic city.</p>
                </div>
              </section>

              {/* Step 2: Pricing & Privacy */}
              <section 
                ref={pricingRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Pricing & Privacy</h3>
                    <p className="text-xs text-gray-500">Determine valuation models and visibility configurations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Asking Price (INR ₹) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-semibold text-sm">₹</span>
                      <input 
                        type="number" 
                        name="askingPrice" 
                        value={formData.askingPrice} 
                        onChange={handleChange} 
                        required
                        min="0" 
                        step="0.01" 
                        onFocus={() => setActiveFocus('askingPrice')}
                        placeholder="0.00" 
                        className={`${inputClass} pl-8`} 
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleToggle('priceNegotiable', formData.priceNegotiable)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm font-semibold transition duration-300 ${
                        formData.priceNegotiable
                          ? 'bg-orange-500/10 border-orange-500/80 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.08)]'
                          : 'bg-gray-950/40 border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-xs uppercase font-bold tracking-wider">Price is Negotiable</span>
                      <span className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${
                        formData.priceNegotiable ? 'bg-orange-500 justify-end' : 'bg-gray-800 justify-start'
                      }`}>
                        <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Privacy Warning Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-green-950/10 to-emerald-950/15 border border-green-800/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-green-950/40 border border-green-500/30 text-green-400 shrink-0">
                      🔓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest">Public Marketplace Listing</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        This is posted as a public listing. Registered stakeholders can browse basic parameters. Sensitive operational details and specific identity indicators will remain masked until direct verification.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 3: Description Section */}
              <section 
                ref={descRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Description</h3>
                    <p className="text-xs text-gray-500">Provide promotional copywriting and core operational descriptions</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Short Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className={labelClass}>Short Description (Elevator Pitch) *</label>
                      <span className="text-[10px] text-gray-500 font-mono">{formData.shortDescription.length} / 500</span>
                    </div>
                    <textarea 
                      name="shortDescription" 
                      value={formData.shortDescription} 
                      onChange={handleChange} 
                      rows="2"
                      required
                      maxLength="500" 
                      onFocus={() => setActiveFocus('shortDescription')}
                      placeholder="e.g., Profitable, NABH-accredited clinic in a prime residential medical hub with consistent patient footfall..." 
                      className={inputClass} 
                    />
                    <p className="text-[10px] text-gray-500 leading-normal">Used as a summary hook on search lists.</p>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className={labelClass}>Detailed Overview & Assets</label>
                      <span className="text-[10px] text-gray-500 font-mono">{formData.detailedDescription.length} / 5000</span>
                    </div>
                    <textarea 
                      name="detailedDescription" 
                      value={formData.detailedDescription} 
                      onChange={handleChange} 
                      rows="6"
                      maxLength="5000" 
                      onFocus={() => setActiveFocus('detailedDescription')}
                      placeholder="Provide comprehensive details about the business infrastructure, list of assets, employee details, vendor networks, historical growth trajectory, and rationale for divestment..." 
                      className={inputClass} 
                    />
                    <p className="text-[10px] text-gray-500 leading-normal">Fully descriptive overview visible to verified investors.</p>
                  </div>
                </div>
              </section>

              {/* Step 4: Category-Specific Details */}
              {getCategoryName() && (
                <section 
                  ref={specsRef} 
                  className="bg-gray-900/40 border border-orange-500/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-orange-500/30"
                  onClick={() => setActiveFocus('specs')}
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                    <span className="text-2xl text-orange-400">📌</span>
                    <div>
                      <h3 className="text-lg font-bold text-orange-400 uppercase tracking-widest text-sm">{getCategoryName()} Specifications</h3>
                      <p className="text-xs text-gray-500">Provide vertical-specific data nodes for verification</p>
                    </div>
                  </div>

                  {/* Hospitality Specifications */}
                  {['hotel', 'hotels'].includes(getCategoryName()) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                      <div className="space-y-2">
                        <label className={labelClass}>Number of Rooms *</label>
                        <input
                          type="number"
                          name="numberOfRooms"
                          value={formData.numberOfRooms}
                          onChange={handleChange}
                          placeholder="e.g. 45"
                          min="1"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Plot Area (sq ft) *</label>
                        <input
                          type="number"
                          name="plotAreaSqft"
                          value={formData.plotAreaSqft}
                          onChange={handleChange}
                          placeholder="e.g. 20000"
                          min="0"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Constructed Area (sq ft) *</label>
                        <input
                          type="number"
                          name="constructedAreaSqft"
                          value={formData.constructedAreaSqft}
                          onChange={handleChange}
                          placeholder="e.g. 15000"
                          min="0"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                      <div className="space-y-2">
                        <label className={labelClass}>Carpet Area (sq ft) *</label>
                        <input
                          type="number"
                          name="carpetAreaSqft"
                          value={formData.carpetAreaSqft}
                          onChange={handleChange}
                          placeholder="e.g. 2500"
                          min="0"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Hidden submit trigger button */}
              <button type="submit" ref={submitBtnRef} className="hidden" />
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 w-full z-40 bg-[#0d0e12]/95 backdrop-blur-md border-t border-gray-800/80 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] py-4 px-4 md:px-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Completeness Score */}
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* SVG Completion Ring */}
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" className="stroke-gray-850" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  className="stroke-orange-500 transition-all duration-500" 
                  strokeWidth="4" 
                  fill="transparent"
                  strokeDasharray={125.6} 
                  strokeDashoffset={125.6 - (125.6 * getCompletionPercentage()) / 100} 
                />
              </svg>
              <span className="absolute text-xs font-bold text-gray-200">{getCompletionPercentage()}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">Listing Completeness</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {draftSavedTime ? `Draft auto-saved at ${draftSavedTime}` : 'All changes saved locally'}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                const draftKey = isEditMode ? `dhealth_draft_edit_${user?.id || 'guest'}_${id}` : `dhealth_draft_new_${user?.id || 'guest'}`;
                localStorage.setItem(draftKey, JSON.stringify({
                  data: formData,
                  timestamp: new Date().toISOString()
                }));
                const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setDraftSavedTime(timeStr);
                toast.success(`Draft saved manually at ${timeStr}`);
              }}
              className="px-5 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-850 hover:text-white transition flex items-center gap-2 text-xs uppercase tracking-wider bg-gray-950/20"
            >
              <Icons.FaSave /> Save Draft
            </button>
            
            <button
              type="button"
              onClick={() => {
                // Ensure form validates custom requirements
                if (!formData.categoryId) {
                  toast.error('Please select a Category');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.dealTypeId) {
                  toast.error('Please select a Deal Type');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.title.trim()) {
                  toast.error('Please enter a Listing Title');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.cityName.trim()) {
                  toast.error('Please enter a City');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.askingPrice) {
                  toast.error('Please enter an Asking Price');
                  scrollToSection(pricingRef);
                  return;
                }
                if (submitBtnRef.current) { submitBtnRef.current.click(); }
              }}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Icons.FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                isEditMode ? '💾 Save Changes' : '🚀 Publish Listing'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
