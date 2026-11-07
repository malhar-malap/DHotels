import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PiArrowLeft, PiCheck, PiFloppyDisk, PiInfo, PiMapPin, PiWarning } from 'react-icons/pi';
import { listingsAPI, masterAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import { AREA_UNITS, toSqft, fromSqft } from '../../utils/area';
import { CATEGORIES, TITLE_TYPES, PRICE_UNITS, OPERATIONAL_STATUSES, getCategoryMeta, isHotelCategory, priceLabelFor } from '../../utils/hospitality';
import ListingCard from '../../components/marketplace/ListingCard';

const EMPTY_FORM = {
  title: '', categoryId: '', dealTypeId: '', cityName: '',
  askingPrice: '', priceNotDisclosed: false, priceNegotiable: true, shortDescription: '', detailedDescription: '',
  // Hotels (plot area is typed in plotAreaUnit and sent to the API in sq ft)
  numberOfRooms: '', plotAreaSqft: '', plotAreaUnit: 'SQFT', constructedAreaSqft: '', titleType: '',
  // Restaurants, Cafe, Banquet halls, Restaurants and Bar, Resorts
  carpetAreaSqft: '',
  // Optional, every category
  locality: '', stateName: '', priceUnit: 'TOTAL',
  starCategory: '', operationalStatus: '', floors: '', kitchenPermissions: '', securityDeposit: '', annualTurnover: '', amenities: '',
};

const OPTIONAL_TEXT_FIELDS = ['locality', 'stateName', 'starCategory', 'operationalStatus', 'floors', 'kitchenPermissions', 'securityDeposit', 'annualTurnover', 'amenities'];

const CITY_SUGGESTIONS = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa',
  'Panaji', 'Udaipur', 'Jodhpur', 'Lonavala', 'Mahabaleshwar', 'Nashik', 'Nagpur', 'Indore', 'Lucknow', 'Chandigarh',
  'Shimla', 'Manali', 'Rishikesh', 'Dehradun', 'Mussoorie', 'Kochi', 'Munnar', 'Thiruvananthapuram', 'Mysuru', 'Coorg',
  'Ooty', 'Puducherry', 'Gurugram', 'Noida', 'Navi Mumbai', 'Thane', 'Varanasi', 'Agra', 'Amritsar', 'Darjeeling',
];

const draftKeyFor = (userId, editId) =>
  editId ? `dhotels_listing_draft_edit_${userId || 'guest'}_${editId}` : `dhotels_listing_draft_new_${userId || 'guest'}`;

const UNTYPED_KEYS = ['priceUnit', 'priceNegotiable', 'priceNotDisclosed', 'plotAreaUnit'];
const hasContent = (data) => Object.entries(data).some(([key, val]) => !UNTYPED_KEYS.includes(key) && val !== '' && val !== null && val !== undefined);

const Section = ({ index, title, hint, children, sectionRef }) => (
  <section ref={sectionRef} className="scroll-mt-28 border-t border-white/[0.06] py-10 first:border-t-0 first:pt-0">
    <div className="flex items-baseline gap-4">
      <span className="font-display text-sm text-primary-400">{String(index).padStart(2, '0')}</span>
      <div>
        <h2 className="font-display text-2xl text-gray-50">{title}</h2>
        {hint && <p className="mt-1 text-sm text-gray-400">{hint}</p>}
      </div>
    </div>
    <div className="mt-6 space-y-6 md:pl-9">{children}</div>
  </section>
);

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const numericId = id ? id.split('-')[0] : '';
  const isEditMode = !!numericId;
  const { isAuthenticated, user } = useAuth();
  const draftKey = draftKeyFor(user?.id, numericId);

  const [categories, setCategories] = useState([]);
  const [dealTypes, setDealTypes] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState('');
  const [draftToRestore, setDraftToRestore] = useState(null);
  const submittedRef = useRef(false);
  const sectionRefs = { type: useRef(null), basics: useRef(null), specs: useRef(null), price: useRef(null), pitch: useRef(null) };

  useEffect(() => {
    masterAPI.getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => toast.error('Failed to load property types'));

    if (isEditMode) {
      listingsAPI.getById(numericId).then((res) => {
        const data = res.data.data;
        const details = data.categoryDetails || {};
        setFormData({
          title: data.title || '', categoryId: data.category?.id || '', dealTypeId: data.dealType?.id || '',
          cityName: data.cityName || '', askingPrice: data.askingPrice || '',
          priceNotDisclosed: !!data.priceNotDisclosed,
          priceNegotiable: data.priceNegotiable ?? true, shortDescription: data.shortDescription || '',
          detailedDescription: data.detailedDescription || '',
          numberOfRooms: details.numberOfRooms || '',
          plotAreaUnit: details.plotAreaUnit === 'ACRE' ? 'ACRE' : 'SQFT',
          plotAreaSqft: fromSqft(details.plotAreaSqft, details.plotAreaUnit === 'ACRE' ? 'ACRE' : 'SQFT') || '',
          constructedAreaSqft: details.constructedAreaSqft || '',
          titleType: details.titleType || '',
          carpetAreaSqft: details.carpetAreaSqft || '',
          locality: data.locality || '', stateName: data.stateName || '', priceUnit: data.priceUnit || 'TOTAL',
          starCategory: details.starCategory || '', operationalStatus: details.operationalStatus || '',
          floors: details.floors || '', kitchenPermissions: details.kitchenPermissions || '',
          securityDeposit: details.securityDeposit || '', annualTurnover: details.annualTurnover || '',
          amenities: details.amenities || '',
        });
      }).catch(() => toast.error('Could not load this listing'))
        .finally(() => setLoading(false));
    }
  }, [numericId, isEditMode]);

  // Offer to restore a locally saved draft
  useEffect(() => {
    if (loading) return;
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (saved?.data && hasContent(saved.data)) setDraftToRestore(saved);
    } catch (e) {
      console.error('Failed to read draft', e);
    }
  }, [draftKey, loading]);

  // Autosave
  useEffect(() => {
    if (loading || submittedRef.current || draftToRestore || !hasContent(formData)) return undefined;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ data: formData, timestamp: new Date().toISOString() }));
        setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        // Storage can be unavailable in private mode; drafts are a convenience only
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [formData, draftKey, loading, draftToRestore]);

  useEffect(() => {
    if (!formData.categoryId) { setDealTypes([]); return; }
    masterAPI.getDealTypes(formData.categoryId)
      .then((res) => setDealTypes(res.data?.data || []))
      .catch(() => setDealTypes([]));
  }, [formData.categoryId]);

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.categoryId));
  const categoryName = selectedCategory?.name || '';
  const categoryMeta = getCategoryMeta(categoryName);
  const isHotel = isHotelCategory(categoryName);
  const dealName = dealTypes.find((d) => String(d.id) === String(formData.dealTypeId))?.name || '';

  const set = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') return set(name, checked);
    if (type === 'number' && value !== '' && parseFloat(value) < 0) return undefined;
    return set(name, value);
  };

  const chooseCategory = (cat) => {
    setFormData((prev) => ({ ...prev, categoryId: cat.id, dealTypeId: '' }));
  };

  const checks = useMemo(() => {
    const specsDone = isHotel
      ? !!(formData.numberOfRooms && formData.plotAreaSqft && formData.constructedAreaSqft)
      : !!formData.carpetAreaSqft;
    return [
      { key: 'type', label: 'Property & deal type', done: !!(formData.categoryId && formData.dealTypeId) },
      { key: 'basics', label: 'Title & city', done: !!(formData.title.trim() && formData.cityName.trim()) },
      { key: 'specs', label: 'Property details', done: !!formData.categoryId && specsDone },
      { key: 'price', label: 'Price', done: formData.priceNotDisclosed || !!formData.askingPrice },
      { key: 'pitch', label: 'Description', done: !!formData.shortDescription.trim() },
    ];
  }, [formData, isHotel]);
  const completion = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  const scrollTo = (key) => sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const saveDraftNow = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ data: formData, timestamp: new Date().toISOString() }));
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDraftSavedAt(time);
      toast.success('Draft saved on this device');
    } catch (e) {
      toast.error('Could not save a draft in this browser');
    }
  };

  const restoreDraft = () => {
    setFormData((prev) => ({ ...prev, ...draftToRestore.data }));
    setDraftToRestore(null);
    toast.success('Draft restored');
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey);
    setDraftToRestore(null);
  };

  const validate = () => {
    const firstMissing = checks.find((c) => !c.done && c.key !== 'pitch');
    if (firstMissing) {
      toast.error(`Please complete: ${firstMissing.label}`);
      scrollTo(firstMissing.key);
      return false;
    }
    if (!formData.shortDescription.trim()) {
      toast.error('Please add a short description');
      scrollTo('pitch');
      return false;
    }
    // asking_price is DECIMAL(15,2); anything above ₹1 lakh crore is almost certainly a typo
    if (!formData.priceNotDisclosed && Number(formData.askingPrice) > 1e12) {
      toast.error('That price looks too high — please check the number of zeros');
      scrollTo('price');
      return false;
    }
    if (isHotel && Number(formData.constructedAreaSqft) > toSqft(formData.plotAreaSqft, formData.plotAreaUnit) * 20) {
      toast.error('Constructed area looks too large for the plot — please check the units');
      scrollTo('specs');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('LOGIN_REQUIRED');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    const payload = {
      title: formData.title.trim(),
      categoryId: parseInt(formData.categoryId, 10),
      dealTypeId: parseInt(formData.dealTypeId, 10),
      cityName: formData.cityName.trim(),
      askingPrice: formData.priceNotDisclosed ? null : parseFloat(formData.askingPrice),
      priceNotDisclosed: formData.priceNotDisclosed,
      priceNegotiable: formData.priceNegotiable,
      shortDescription: formData.shortDescription.trim(),
      detailedDescription: formData.detailedDescription.trim(),
      isConfidential: false,
      confidentialTitle: null,
      priceUnit: formData.priceUnit || 'TOTAL',
    };
    // Sent even when empty so clearing a field on edit removes the stored value
    OPTIONAL_TEXT_FIELDS.forEach((key) => { payload[key] = (formData[key] || '').trim(); });
    if (isHotel) {
      payload.numberOfRooms = parseInt(formData.numberOfRooms, 10);
      payload.plotAreaSqft = toSqft(formData.plotAreaSqft, formData.plotAreaUnit);
      payload.plotAreaUnit = formData.plotAreaUnit;
      payload.constructedAreaSqft = parseFloat(formData.constructedAreaSqft);
      payload.titleType = formData.titleType || null;
    } else {
      payload.carpetAreaSqft = parseFloat(formData.carpetAreaSqft);
    }

    try {
      submittedRef.current = true;
      if (isEditMode) {
        await listingsAPI.update(numericId, payload);
        toast.success('Changes saved — your listing will be re-reviewed.');
      } else {
        await listingsAPI.create(payload);
        toast.success('Listing submitted! We’ll review it and email you once it’s live.', { duration: 5000 });
      }
      localStorage.removeItem(draftKey);
      navigate('/dashboard/listings');
    } catch (err) {
      submittedRef.current = false;
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('LOGIN_REQUIRED');
      } else {
        setError(err.response?.data?.message || 'We couldn’t save your listing. Please check the details and try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // Shape the form as a ListingSummaryResponse so the preview uses the real card
  const preview = {
    id: 0,
    displayTitle: formData.title.trim() || (categoryMeta ? `Your ${categoryMeta.singular.toLowerCase()} title` : 'Your listing title'),
    categoryName: categoryName || 'Hotels',
    dealType: dealName || 'For Sale',
    cityName: formData.cityName || 'City',
    locality: formData.locality,
    stateName: formData.stateName,
    priceUnit: formData.priceUnit,
    askingPrice: formData.askingPrice || null,
    priceNotDisclosed: formData.priceNotDisclosed,
    priceNegotiable: formData.priceNegotiable,
    categoryDetails: isHotel
      ? { numberOfRooms: formData.numberOfRooms, plotAreaSqft: toSqft(formData.plotAreaSqft, formData.plotAreaUnit), plotAreaUnit: formData.plotAreaUnit }
      : { carpetAreaSqft: formData.carpetAreaSqft },
  };

  const priceLabel = `${priceLabelFor(dealName)} (₹)`;

  if (loading) {
    return (
      <div className="container-site py-16">
        <div className="h-10 w-72 animate-pulse rounded bg-gray-800" />
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-gray-900" />
      </div>
    );
  }

  return (
    <div className="bg-gray-950">
      <div className="container-site pb-32 pt-10">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200">
          <PiArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mt-6 max-w-2xl">
          <p className="eyebrow eyebrow-rule">{isEditMode ? 'Edit listing' : 'List your property'}</p>
          <h1 className="heading-lg mt-3">{isEditMode ? 'Update your listing' : 'Tell buyers about your property'}</h1>
          <p className="mt-3 text-gray-400">Takes about five minutes. Our team reviews every listing and adds photographs before it goes live.</p>
        </div>

        {draftToRestore && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary-400/30 bg-primary-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-200">
              You have an unfinished draft from {new Date(draftToRestore.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={discardDraft} className="btn-ghost !py-2">Discard</button>
              <button type="button" onClick={restoreDraft} className="btn-brass !py-2">Restore draft</button>
            </div>
          </div>
        )}

        {error === 'LOGIN_REQUIRED' && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-200">Log in or create a free account to submit your listing. Your draft is saved on this device.</p>
            <div className="flex gap-2">
              <Link to="/login" className="btn-brass !py-2">Log in</Link>
              <Link to="/register" className="btn-ghost !py-2">Create account</Link>
            </div>
          </div>
        )}
        {error && error !== 'LOGIN_REQUIRED' && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/[0.06] p-5 text-sm text-rose-200 animate-shake">
            <PiWarning className="mt-0.5 h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
          <form id="listing-form" onSubmit={handleSubmit} noValidate>
            <Section index={1} title="Property & deal type" hint="What are you listing, and how would you like to deal?" sectionRef={sectionRefs.type}>
              <div>
                <p className="field-label">Property type</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(categories.length ? categories : CATEGORIES.map((c, i) => ({ id: `s${i}`, name: c.name, skeleton: true }))).map((cat) => {
                    const meta = getCategoryMeta(cat.name);
                    const Icon = meta?.icon;
                    const selected = String(cat.id) === String(formData.categoryId);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={cat.skeleton}
                        onClick={() => chooseCategory(cat)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${selected ? 'border-primary-400 bg-primary-400/10' : 'border-white/10 hover:border-white/25'} ${cat.skeleton ? 'animate-pulse' : ''}`}
                      >
                        {Icon && <Icon className={`h-6 w-6 shrink-0 ${selected ? 'text-primary-300' : 'text-gray-400'}`} />}
                        <span className={`text-sm font-semibold ${selected ? 'text-gray-50' : 'text-gray-300'}`}>{meta?.label || cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {formData.categoryId && (
                <div className="animate-fadeIn">
                  <p className="field-label">Deal type</p>
                  <div className="flex flex-wrap gap-2">
                    {dealTypes.map((d) => {
                      const selected = String(d.id) === String(formData.dealTypeId);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => set('dealTypeId', d.id)}
                          aria-pressed={selected}
                          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${selected ? 'bg-gray-50 text-gray-950' : 'border border-white/10 text-gray-300 hover:border-white/25'}`}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                  {dealName === 'Profit Sharing' && (
                    <p className="mt-3 flex items-start gap-2 text-sm text-gray-400">
                      <PiInfo className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                      Profit sharing means a partner invests in your hotel in return for a share of operating profit. Mention the share and lock-in in your description.
                    </p>
                  )}
                </div>
              )}
            </Section>

            <Section index={2} title="Title & location" hint="A clear, specific title gets more serious enquiries." sectionRef={sectionRefs.basics}>
              <div>
                <label className="field-label" htmlFor="title">Listing title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder={categoryMeta ? `e.g. 42-room business ${categoryMeta.singular.toLowerCase()} near the airport` : 'e.g. 42-room business hotel near Pune airport'}
                  className="field"
                />
                <p className="mt-1.5 text-right text-xs text-gray-500">{formData.title.length}/200</p>
              </div>
              <div>
                <label className="field-label" htmlFor="cityName">City</label>
                <div className="relative">
                  <PiMapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                  <input id="cityName" name="cityName" value={formData.cityName} onChange={handleChange} list="city-list" autoComplete="off" placeholder="Start typing a city" className="field !pl-10" />
                </div>
                <datalist id="city-list">
                  {CITY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="locality">Locality / area <span className="normal-case tracking-normal text-gray-500">(optional)</span></label>
                  <input id="locality" name="locality" maxLength={150} value={formData.locality} onChange={handleChange} placeholder="e.g. Andheri West, near Veera Desai Rd" className="field" />
                </div>
                <div>
                  <label className="field-label" htmlFor="stateName">State <span className="normal-case tracking-normal text-gray-500">(optional)</span></label>
                  <input id="stateName" name="stateName" maxLength={100} value={formData.stateName} onChange={handleChange} placeholder="e.g. Maharashtra" className="field" />
                </div>
              </div>
            </Section>

            <Section
              index={3}
              title="Property details"
              hint={!formData.categoryId ? 'Choose a property type first.' : isHotel ? 'Rooms, land and built-up area, and the ownership title.' : 'The usable carpet area of the premises.'}
              sectionRef={sectionRefs.specs}
            >
              {!formData.categoryId ? (
                <button type="button" onClick={() => scrollTo('type')} className="btn-quiet">Select a property type</button>
              ) : isHotel ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="numberOfRooms">Number of rooms</label>
                    <input id="numberOfRooms" type="number" name="numberOfRooms" min="1" inputMode="numeric" value={formData.numberOfRooms} onChange={handleChange} placeholder="e.g. 42" className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="titleType">Title</label>
                    <select id="titleType" name="titleType" value={formData.titleType} onChange={handleChange} className="field cursor-pointer">
                      <option value="">Select ownership title</option>
                      {TITLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="plotAreaSqft">Plot area</label>
                    <div className="flex gap-2">
                      <input id="plotAreaSqft" type="number" name="plotAreaSqft" min="0" step="any" inputMode="decimal" value={formData.plotAreaSqft} onChange={handleChange} placeholder={formData.plotAreaUnit === 'ACRE' ? 'e.g. 1.5' : 'e.g. 20000'} className="field min-w-0 flex-1" />
                      <select name="plotAreaUnit" aria-label="Plot area unit" value={formData.plotAreaUnit} onChange={handleChange} className="field !w-auto shrink-0">
                        {AREA_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="constructedAreaSqft">Constructed area (sq ft)</label>
                    <input id="constructedAreaSqft" type="number" name="constructedAreaSqft" min="0" inputMode="decimal" value={formData.constructedAreaSqft} onChange={handleChange} placeholder="e.g. 35000" className="field" />
                  </div>
                </div>
              ) : (
                <div className="max-w-xs">
                  <label className="field-label" htmlFor="carpetAreaSqft">Carpet area (sq ft)</label>
                  <input id="carpetAreaSqft" type="number" name="carpetAreaSqft" min="0" inputMode="decimal" value={formData.carpetAreaSqft} onChange={handleChange} placeholder="e.g. 2500" className="field" />
                </div>
              )}
              {formData.categoryId && (
                <div className="grid gap-5 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
                  <p className="text-sm text-gray-400 sm:col-span-2">More details <span className="text-gray-500">(optional)</span></p>
                  <div>
                    <label className="field-label" htmlFor="starCategory">Category / star rating</label>
                    <input id="starCategory" name="starCategory" maxLength={50} value={formData.starCategory} onChange={handleChange} placeholder="e.g. 3 Star, Boutique, Homestay" className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="operationalStatus">Status</label>
                    <input id="operationalStatus" name="operationalStatus" maxLength={50} value={formData.operationalStatus} onChange={handleChange} list="status-list" placeholder="e.g. Running" className="field" />
                    <datalist id="status-list">
                      {OPERATIONAL_STATUSES.map((st) => <option key={st} value={st} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="floors">Floors</label>
                    <input id="floors" name="floors" maxLength={100} value={formData.floors} onChange={handleChange} placeholder="e.g. Ground + 2" className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="kitchenPermissions">Kitchen &amp; permissions</label>
                    <input id="kitchenPermissions" name="kitchenPermissions" maxLength={200} value={formData.kitchenPermissions} onChange={handleChange} placeholder="e.g. Gas cooking, liquor licence" className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="securityDeposit">Security deposit</label>
                    <input id="securityDeposit" name="securityDeposit" maxLength={100} value={formData.securityDeposit} onChange={handleChange} placeholder="e.g. 6 months' rent" className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="annualTurnover">Annual turnover</label>
                    <input id="annualTurnover" name="annualTurnover" maxLength={100} value={formData.annualTurnover} onChange={handleChange} placeholder="e.g. ₹7 Cr" className="field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="amenities">Amenities &amp; features</label>
                    <input id="amenities" name="amenities" maxLength={2000} value={formData.amenities} onChange={handleChange} placeholder="Comma separated, e.g. Swimming pool, Bar, Banquet, Parking" className="field" />
                  </div>
                </div>
              )}
            </Section>

            <Section index={4} title="Price" sectionRef={sectionRefs.price}>
              <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="field-label" htmlFor="askingPrice">{priceLabel}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input id="askingPrice" type="number" name="askingPrice" min="0" inputMode="numeric" value={formData.priceNotDisclosed ? '' : formData.askingPrice} onChange={handleChange} disabled={formData.priceNotDisclosed} placeholder={formData.priceNotDisclosed ? 'Not disclosed' : 'e.g. 85000000'} className="field !pl-8 disabled:opacity-50" />
                  </div>
                  <p className="mt-1.5 h-4 text-sm text-primary-300">{!formData.priceNotDisclosed && formData.askingPrice ? formatPrice(formData.askingPrice) : ''}</p>
                  <label className="field-label mt-3" htmlFor="priceUnit">Price is quoted</label>
                  <select id="priceUnit" name="priceUnit" value={formData.priceUnit} onChange={handleChange} disabled={formData.priceNotDisclosed} className="field cursor-pointer disabled:opacity-50">
                    {PRICE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                  <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-gray-300">
                    <input type="checkbox" name="priceNotDisclosed" checked={formData.priceNotDisclosed} onChange={handleChange} className="h-4 w-4 rounded border-white/20 bg-gray-900 accent-primary-400" />
                    Don't show the price — share it with buyers when they connect
                  </label>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3 sm:mb-5">
                  <input type="checkbox" name="priceNegotiable" checked={formData.priceNegotiable} onChange={handleChange} className="peer sr-only" />
                  <span className="relative h-6 w-10 rounded-full bg-gray-700 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-primary-400 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400" />
                  <span className="text-sm font-medium text-gray-200">Negotiable</span>
                </label>
              </div>
            </Section>

            <Section index={5} title="Description" hint="Highlight what makes the property worth a visit." sectionRef={sectionRefs.pitch}>
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label" htmlFor="shortDescription">Short description</label>
                  <span className="text-xs text-gray-500">{formData.shortDescription.length}/500</span>
                </div>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows="3"
                  maxLength={500}
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="One or two lines buyers see first — location advantage, occupancy, brand, licences."
                  className="field resize-y"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label" htmlFor="detailedDescription">Full description <span className="normal-case tracking-normal text-gray-500">(optional)</span></label>
                  <span className="text-xs text-gray-500">{formData.detailedDescription.length}/3000</span>
                </div>
                <textarea
                  id="detailedDescription"
                  name="detailedDescription"
                  rows="7"
                  maxLength={3000}
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  placeholder="Operating history, occupancy and ADR, revenue, staff, licences (FSSAI, liquor, fire NOC), parking, and why you are selling or leasing."
                  className="field resize-y"
                />
              </div>
            </Section>
          </form>

          {/* Sidebar: progress + live preview */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="surface p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-100">Progress</p>
                  <p className="text-sm text-primary-300">{completion}%</p>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full rounded-full bg-primary-400 transition-all duration-500" style={{ width: `${completion}%` }} />
                </div>
                <ul className="mt-4 space-y-1">
                  {checks.map((c) => (
                    <li key={c.key}>
                      <button type="button" onClick={() => scrollTo(c.key)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/[0.03]">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${c.done ? 'border-primary-400 bg-primary-400 text-gray-950' : 'border-white/20'}`}>
                          {c.done && <PiCheck className="h-3 w-3" />}
                        </span>
                        <span className={c.done ? 'text-gray-300' : 'text-gray-400'}>{c.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Live preview</p>
                <div className="pointer-events-none">
                  <ListingCard listing={preview} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-gray-950/95 backdrop-blur-xl">
        <div className="container-site flex items-center justify-between gap-4 py-3">
          <p className="hidden text-sm text-gray-400 sm:block">
            {completion}% complete{draftSavedAt && <span className="text-gray-500"> · Draft saved {draftSavedAt}</span>}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button type="button" onClick={saveDraftNow} className="btn-ghost flex-1 !py-2.5 sm:flex-none">
              <PiFloppyDisk className="h-4 w-4" /> Save draft
            </button>
            <button type="submit" form="listing-form" disabled={submitting} className="btn-brass flex-1 !py-2.5 sm:flex-none">
              {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Submit for review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
