import React, { useState, useEffect } from 'react';
import RefreshButton from '../../components/admin/RefreshButton';
import { adminAPI, masterAPI, mediaAPI } from '../../services/api';
import { formatPrice, formatListingPrice } from '../../utils/formatPrice';
import { formatArea, toSqft, fromSqft } from '../../utils/area';
import { isHotelCategory, TITLE_TYPES } from '../../utils/hospitality';
import toast from 'react-hot-toast';
import { FiX, FiEdit2, FiSave, FiMapPin, FiDollarSign, FiCalendar, FiUser, FiMail } from 'react-icons/fi';

const PLOT_AREA_UNIT_FIELD = { key: 'plotAreaUnit', label: 'Plot Area Unit', type: 'select', options: [['SQFT', 'sq ft'], ['ACRE', 'acre']] };
// Stored in sq ft; edited in the listing's plot area unit
const LAND_AREA_KEYS = ['plotAreaSqft'];

// Editable category-specific fields, mirroring the owner's create/edit form
const getDetailFields = (categoryName) => {
  if (isHotelCategory(categoryName)) {
    return [
      { key: 'numberOfRooms', label: 'Number of Rooms', type: 'int' },
      { key: 'plotAreaSqft', label: 'Plot Area', type: 'number' },
      PLOT_AREA_UNIT_FIELD,
      { key: 'constructedAreaSqft', label: 'Constructed Area (sq ft)', type: 'number' },
      { key: 'titleType', label: 'Title', type: 'select', options: TITLE_TYPES.map((t) => [t, t]) },
    ];
  }
  return [{ key: 'carpetAreaSqft', label: 'Carpet Area (sq ft)', type: 'number' }];
};

const DETAIL_META_KEYS = ['id', 'listingId', 'listing', 'createdAt', 'updatedAt'];

const AdminListingDetailModal = ({ listingId, onClose, onUpdated, onVerifyClick }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchListing();
    fetchMasterData();
  }, [listingId]);

  // silent: refresh in place without the full-screen loading state
  const fetchListing = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await adminAPI.getListingById(listingId);
      const data = response.data.data;
      setListing(data);
      // Keep every stored category detail so saving doesn't blank the ones without an input here
      const details = {};
      Object.entries(data.categoryDetails || {}).forEach(([key, value]) => {
        if (DETAIL_META_KEYS.includes(key) || (value !== null && typeof value === 'object')) return;
        details[key] = value ?? '';
      });
      if (data.categoryDetails && 'plotAreaUnit' in data.categoryDetails) {
        details.plotAreaUnit = data.categoryDetails.plotAreaUnit === 'ACRE' ? 'ACRE' : 'SQFT';
        LAND_AREA_KEYS.forEach(k => { if (k in details) details[k] = fromSqft(details[k], details.plotAreaUnit); });
      }
      setEditData({
        title: data.title || '',
        shortDescription: data.shortDescription || '',
        detailedDescription: data.detailedDescription || '',
        askingPrice: data.askingPrice || '',
        priceNotDisclosed: !!data.priceNotDisclosed,
        priceNegotiable: data.priceNegotiable,
        details,
      });
    } catch (error) {
      toast.error('Failed to load listing details');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchMasterData = async () => {
    try {
      const [catRes, cityRes] = await Promise.all([
        masterAPI.getCategories(),
        masterAPI.getCities(),
      ]);
      setCategories(catRes.data.data || []);
      setCities(cityRes.data.data || []);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const setDetail = (key, value) => setEditData(prev => ({ ...prev, details: { ...prev.details, [key]: value } }));

  const handleSave = async () => {
    if (!editData.priceNotDisclosed && !editData.askingPrice) {
      toast.error('Enter an asking price or mark it as not disclosed');
      return;
    }
    const { details, ...basic } = editData;
    const detailPayload = {};
    const fieldTypes = Object.fromEntries(getDetailFields(listing.category?.name).map(f => [f.key, f.type]));
    Object.entries(details || {}).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) { detailPayload[key] = null; return; }
      if (LAND_AREA_KEYS.includes(key)) detailPayload[key] = toSqft(value, details.plotAreaUnit);
      else if (fieldTypes[key] === 'int') detailPayload[key] = parseInt(value, 10);
      else if (fieldTypes[key] === 'number') detailPayload[key] = parseFloat(value);
      else detailPayload[key] = value;
    });
    const payload = {
      ...detailPayload,
      ...basic,
      askingPrice: basic.priceNotDisclosed ? null : parseFloat(basic.askingPrice),
    };
    try {
      setSaving(true);
      await adminAPI.editListing(listingId, payload);
      toast.success('Listing updated successfully');
      setEditing(false);
      fetchListing();
      if (onUpdated) onUpdated();
    } catch (error) {
      toast.error('Failed to update listing');
      console.error(error);
    }
    setSaving(false);
  };

  const handleApprove = () => {
    if (onVerifyClick && listing) {
      onVerifyClick(listing);
    }
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusColors = {
    PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    EXPIRED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    SOLD: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    WITHDRAWN: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-50">
        <div className="glass-card p-12 rounded-3xl border-none text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
          <p className="text-ethereal-on-surface-variant font-black uppercase tracking-[0.3em] mt-8 text-[11px]">Retrieving Asset Meta...</p>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="fixed inset-0 bg-ethereal-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fadeIn">
      <div className="glass-card bg-gray-900/95 rounded-3xl border-none shadow-2xl w-full max-w-5xl h-[96vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <span className="section-label tracking-[0.2em] mb-1">Asset Intelligence</span>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl display-title uppercase tracking-tighter shrink-0">Listing Audit</h2>
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${statusColors[listing.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                {listing.status}
              </span>
              {listing.isFeatured && (
                <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">★ Featured{listing.featuredUntil ? ` until ${formatDate(listing.featuredUntil)}` : ''}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!editing && <RefreshButton onRefresh={() => fetchListing(true)} />}
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-white/5 text-ethereal-primary rounded-2xl hover:bg-ethereal-primary hover:text-white transition-all shadow-sm">
                <FiEdit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-ethereal-primary text-white rounded-2xl hover:shadow-xl shadow-ethereal-primary/20 transition-all disabled:opacity-50">
                  <FiSave className="w-4 h-4" /> {saving ? 'Committing...' : 'Commit Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-gray-800 text-ethereal-on-surface-variant rounded-2xl hover:bg-white/10 transition-all">
                  Abort
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-4 text-ethereal-on-surface-variant hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-10 space-y-12 overflow-y-auto custom-scrollbar">
          {/* Title & Description Segment */}
          <div className="space-y-8">
            <div className="relative group">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-40 block mb-3">Master Title</label>
              {editing ? (
                <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-8 py-5 bg-gray-800 border border-transparent rounded-2xl focus:bg-gray-950 focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none text-lg font-bold" />
              ) : (
                <h3 className="text-2xl font-bold text-ethereal-on-surface leading-tight tracking-tight group-hover:text-ethereal-primary transition-colors">{listing.displayTitle}</h3>
              )}
            </div>

            <div>
              <div className="glass-card bg-gray-800/70 p-8 rounded-3xl border-none shadow-inner">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-40 block mb-4">Executive Summary</label>
                {editing ? (
                  <textarea value={editData.shortDescription} onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                    rows={3} className="w-full px-6 py-4 bg-gray-950 border border-white/10 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none text-sm font-medium resize-none shadow-sm" />
                ) : (
                  <p className="text-ethereal-on-surface-variant font-medium leading-relaxed">{listing.shortDescription || 'No abstract provided.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Asset Matrix Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gray-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[11px] font-black uppercase tracking-widest mb-3">
                <FiDollarSign className="w-3 h-3" /> Valuation
              </div>
              {editing ? (
                <input type="number" value={editData.priceNotDisclosed ? '' : editData.askingPrice} min="0" disabled={editData.priceNotDisclosed}
                  placeholder={editData.priceNotDisclosed ? 'Not disclosed' : ''}
                  onChange={(e) => { if (parseFloat(e.target.value) < 0) return; setEditData({ ...editData, askingPrice: e.target.value }); }}
                  className="w-full px-4 py-2 bg-gray-950 border border-white/10 rounded-lg text-sm font-bold focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none disabled:opacity-50" />
              ) : (
                <p className="text-base font-black text-ethereal-on-surface tracking-tight">{formatListingPrice(listing)}</p>
              )}
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[11px] font-black uppercase tracking-widest mb-3">Domain</div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight">{listing.category?.name}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[11px] font-black uppercase tracking-widest mb-3">Modality</div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight">{listing.dealType?.name}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[11px] font-black uppercase tracking-widest mb-3">
                <FiMapPin className="w-3 h-3" /> Deployment
              </div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight truncate">
                {listing.cityName}{listing.stateName ? `, ${listing.stateName}` : ''}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[11px] font-black uppercase tracking-widest mb-3">
                <FiMail className="w-3 h-3" /> engagement
              </div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight underline decoration-ethereal-primary/30 decoration-2 underline-offset-4">{listing.inquiryCount || 0} hits</p>
            </div>
          </div>

          {/* Configuration Override Layer */}
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-t border-white/10">
              <div className="flex flex-col gap-6 justify-center">
                <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-colors">
                  <input type="checkbox" checked={editData.priceNotDisclosed || false}
                    onChange={(e) => setEditData({ ...editData, priceNotDisclosed: e.target.checked })}
                    className="w-5 h-5 accent-ethereal-primary shrink-0" />
                  <span className="text-sm font-black uppercase tracking-widest text-ethereal-on-surface-variant leading-none">Price Not to be Disclosed</span>
                </label>
                <p className="text-[11px] text-ethereal-on-surface-variant opacity-60 px-4">Admin edits keep the listing live; no re-verification is needed.</p>
              </div>
              <div className="flex flex-col gap-6 justify-center">
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="relative w-6 h-6 shrink-0">
                    <input type="checkbox" checked={editData.priceNegotiable || false}
                      onChange={(e) => setEditData({ ...editData, priceNegotiable: e.target.checked })}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer z-10" />
                    <div className="w-6 h-6 border-2 border-white/10 rounded-md bg-gray-950 peer-checked:bg-ethereal-primary peer-checked:border-ethereal-primary transition-all flex items-center justify-center">
                      <FiSave className="text-white w-3 h-3 scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-ethereal-on-surface-variant leading-none">Valuation Negotiable</span>
                </label>
              </div>
            </div>
          )}

          {editing && getDetailFields(listing.category?.name).length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-ethereal-on-surface-variant mb-6">Additional Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {getDetailFields(listing.category?.name).map(field => {
                  const value = editData.details?.[field.key];
                  const inputCls = 'w-full px-4 py-3 bg-gray-950 border border-white/10 rounded-lg text-sm font-bold focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none';
                  if (field.type === 'bool') {
                    return (
                      <label key={field.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors self-end">
                        <input type="checkbox" checked={!!value} onChange={(e) => setDetail(field.key, e.target.checked)} className="w-5 h-5 accent-ethereal-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-ethereal-on-surface-variant">{field.label}</span>
                      </label>
                    );
                  }
                  return (
                    <div key={field.key}>
                      <label className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 block mb-2">{field.label}</label>
                      {field.type === 'select' ? (
                        <select value={value ?? ''} onChange={(e) => setDetail(field.key, e.target.value)} className={inputCls}>
                          <option value="">Select</option>
                          {field.options.map(([optValue, optLabel]) => <option key={optValue} value={optValue}>{optLabel}</option>)}
                        </select>
                      ) : (
                        <input type={field.type === 'text' ? 'text' : 'number'} min={field.type === 'text' ? undefined : '0'}
                          step={field.type === 'number' ? '0.01' : undefined} value={value ?? ''}
                          onChange={(e) => { if (field.type !== 'text' && parseFloat(e.target.value) < 0) return; setDetail(field.key, e.target.value); }}
                          className={inputCls} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stakeholder Registry */}
          {listing.seller && (
            <div className="pt-8 border-t border-white/10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-ethereal-on-surface-variant mb-6 flex items-center gap-3">
                <FiUser className="w-4 h-4 text-ethereal-primary" /> Vendor Profile
              </h4>
              <div className="glass-card bg-gray-800/50 p-8 rounded-3xl border-none grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Primary Entity</p>
                  <p className="text-sm font-bold text-ethereal-on-surface">{listing.seller.fullName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Comms Channel</p>
                  <p className="text-sm font-medium text-ethereal-primary lowercase truncate">{listing.seller.email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Secure Link</p>
                  <p className="text-sm font-bold text-ethereal-on-surface tracking-tighter">{listing.seller.mobileNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Organization</p>
                  <p className="text-sm font-bold text-ethereal-on-surface">{listing.seller.companyName || 'Private Entity'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Categorical Schematics */}
          {listing.categoryDetails && (() => {
            const currencyFields = ['askingPrice'];
            const areaFields = ['plotAreaSqft', 'constructedAreaSqft', 'carpetAreaSqft'];
            const percentFields = [];
            const hiddenKeys = ['id', 'listingId', 'listing', 'createdAt', 'updatedAt', 'plotAreaUnit'];

            const displayableEntries = Object.entries(listing.categoryDetails).filter(([key, value]) => {
              if (hiddenKeys.includes(key)) return false;
              if (value === null || value === undefined || value === '') {
                return typeof value === 'boolean';
              }
              return true;
            });

            if (displayableEntries.length === 0) return null;

            return (
              <div className="pt-8 border-t border-white/10">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-ethereal-on-surface-variant mb-6">Taxonomy Specifications</h4>
                <div className="bg-gray-800 rounded-3xl p-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
                    {displayableEntries.map(([key, value]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/ Sqft$/, '');
                      let displayValue;
                      if (typeof value === 'boolean') {
                        displayValue = value ? 'Yes' : 'No';
                      } else if (typeof value === 'object') {
                        displayValue = value.name || 'Structured Object';
                      } else if (currencyFields.includes(key)) {
                        displayValue = formatPrice(value);
                      } else if (areaFields.includes(key)) {
                        displayValue = formatArea(value, key === 'plotAreaSqft' ? listing.categoryDetails.plotAreaUnit : 'SQFT');
                      } else if (percentFields.includes(key)) {
                        displayValue = `${value}%`;
                      } else {
                        displayValue = String(value);
                      }
                      return (
                        <div key={key}>
                          <p className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">{label}</p>
                          <p className="text-sm font-black text-ethereal-on-surface tracking-tight leading-tight">{displayValue}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Invalidation Log */}
          {listing.rejectionReason && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 animate-fadeIn">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-400 mb-2">Discrepancy Report</p>
              <p className="text-sm font-medium text-rose-200 leading-relaxed italic">"{listing.rejectionReason}"</p>
            </div>
          )}

          {/* Temporal Meta */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-30">
            <div className="flex items-center gap-2"><FiCalendar className="w-3 h-3" /> Initialization: {formatDate(listing.createdAt)}</div>
            <div>Latest Sync: {formatDate(listing.updatedAt)}</div>
            <div>Expiration Window: {formatDate(listing.expiresAt)}</div>
          </div>
        </div>

        {/* Dynamic Footer Actions */}
        {!editing && listing.status === 'PENDING' && (
          <div className="shrink-0 bg-gray-800 px-10 py-8 border-t border-white/10">
            <div className="flex justify-end">
              <button onClick={handleApprove}
                className="px-10 py-5 bg-primary-400 text-white rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-400/20 transition-all font-black text-[11px] uppercase tracking-widest">
                Validate Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListingDetailModal;





