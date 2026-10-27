import React, { useState, useEffect } from 'react';
import { adminAPI, masterAPI, mediaAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import { FiX, FiEdit2, FiSave, FiMapPin, FiDollarSign, FiCalendar, FiUser, FiMail, FiUpload, FiCheck } from 'react-icons/fi';

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

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getListingById(listingId);
      setListing(response.data.data);
      setEditData({
        title: response.data.data.title || '',
        shortDescription: response.data.data.shortDescription || '',
        detailedDescription: response.data.data.detailedDescription || '',
        askingPrice: response.data.data.askingPrice || '',
        priceNegotiable: response.data.data.priceNegotiable,
        status: response.data.data.status || '',
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.editListing(listingId, editData);
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
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/50',
    ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/50',
    EXPIRED: 'bg-slate-50 text-slate-700 border-slate-200/50',
    SOLD: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    WITHDRAWN: 'bg-mauve-50 text-mauve-700 border-mauve-200/50',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-50">
        <div className="glass-card p-12 rounded-[2.5rem] border-none text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
          <p className="text-ethereal-on-surface-variant font-black uppercase tracking-[0.3em] mt-8 text-[10px]">Retrieving Asset Meta...</p>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="fixed inset-0 bg-ethereal-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fadeIn">
      <div className="glass-card bg-gray-900/90 rounded-[2.5rem] border-none shadow-2xl w-full max-w-5xl h-[96vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="px-10 py-8 border-b border-ethereal-surface flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <span className="section-label tracking-[0.2em] mb-1">Asset Intelligence</span>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl display-title uppercase tracking-tighter shrink-0">Listing Audit</h2>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[listing.status] || 'bg-slate-100'}`}>
                {listing.status}
              </span>
              {listing.isFeatured && (
                <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200/50 animate-pulse">★ Featured</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-ethereal-surface-low text-ethereal-primary rounded-[1.2rem] hover:bg-ethereal-primary hover:text-white transition-all shadow-sm">
                <FiEdit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-ethereal-primary text-white rounded-[1.2rem] hover:shadow-xl shadow-ethereal-primary/20 transition-all disabled:opacity-50">
                  <FiSave className="w-4 h-4" /> {saving ? 'Committing...' : 'Commit Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-ethereal-surface text-ethereal-on-surface-variant rounded-[1.2rem] hover:bg-slate-100 transition-all">
                  Abort
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-4 text-ethereal-on-surface-variant hover:text-rose-500 hover:bg-rose-50 rounded-[1.2rem] transition-all">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-10 space-y-12 overflow-y-auto custom-scrollbar">
          {/* Title & Description Segment */}
          <div className="space-y-8">
            <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-40 block mb-3">Master Title</label>
              {editing ? (
                <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-8 py-5 bg-ethereal-surface border border-transparent rounded-[1.5rem] focus:bg-gray-900 focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none text-lg font-bold" />
              ) : (
                <h3 className="text-2xl font-bold text-ethereal-on-surface leading-tight tracking-tight group-hover:text-ethereal-primary transition-colors">{listing.displayTitle}</h3>
              )}
            </div>

            <div>
              <div className="glass-card bg-ethereal-surface-low/30 p-8 rounded-[2rem] border-none shadow-inner">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-40 block mb-4">Executive Summary</label>
                {editing ? (
                  <textarea value={editData.shortDescription} onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                    rows={3} className="w-full px-6 py-4 bg-gray-900 border border-ethereal-surface rounded-[1.2rem] focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none text-sm font-medium resize-none shadow-sm" />
                ) : (
                  <p className="text-ethereal-on-surface-variant font-medium leading-relaxed">{listing.shortDescription || 'No abstract provided.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Asset Matrix Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-ethereal-surface p-6 rounded-[1.2rem]">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[9px] font-black uppercase tracking-widest mb-3">
                <FiDollarSign className="w-3 h-3" /> Valuation
              </div>
              {editing ? (
                <input type="number" value={editData.askingPrice} min="0" onChange={(e) => { if (parseFloat(e.target.value) < 0) return; setEditData({ ...editData, askingPrice: e.target.value }); }}
                  className="w-full px-4 py-2 bg-gray-900 border border-ethereal-surface rounded-lg text-sm font-bold focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none" />
              ) : (
                <p className="text-base font-black text-ethereal-on-surface tracking-tight">{formatPrice(listing.askingPrice)}</p>
              )}
            </div>
            <div className="bg-ethereal-surface p-6 rounded-[1.2rem]">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[9px] font-black uppercase tracking-widest mb-3">Domain</div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight">{listing.category?.name}</p>
            </div>
            <div className="bg-ethereal-surface p-6 rounded-[1.2rem]">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[9px] font-black uppercase tracking-widest mb-3">Modality</div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight">{listing.dealType?.name}</p>
            </div>
            <div className="bg-ethereal-surface p-6 rounded-[1.2rem]">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[9px] font-black uppercase tracking-widest mb-3">
                <FiMapPin className="w-3 h-3" /> Deployment
              </div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight truncate">
                {listing.cityName}{listing.stateName ? `, ${listing.stateName}` : ''}
              </p>
            </div>
            <div className="bg-ethereal-surface p-6 rounded-[1.2rem]">
              <div className="flex items-center gap-2 text-ethereal-on-surface-variant opacity-40 text-[9px] font-black uppercase tracking-widest mb-3">
                <FiMail className="w-3 h-3" /> engagement
              </div>
              <p className="text-base font-black text-ethereal-on-surface tracking-tight underline decoration-ethereal-primary/30 decoration-2 underline-offset-4">{listing.inquiryCount || 0} hits</p>
            </div>
          </div>

          {/* Configuration Override Layer */}
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-t border-ethereal-surface">
              <div className="space-y-6">

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-40 block mb-3">State Selection</label>
                  <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-6 py-4 bg-ethereal-surface border border-transparent rounded-[1.2rem] focus:bg-gray-900 focus:ring-4 focus:ring-ethereal-primary/10 transition-all outline-none text-sm font-black uppercase tracking-widest cursor-pointer">
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="SOLD">Sold</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-6 justify-center">
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-ethereal-surface-low transition-colors">
                  <div className="relative w-6 h-6 shrink-0">
                    <input type="checkbox" checked={editData.priceNegotiable || false}
                      onChange={(e) => setEditData({ ...editData, priceNegotiable: e.target.checked })}
                      className="peer absolute opacity-0 w-full h-full cursor-pointer z-10" />
                    <div className="w-6 h-6 border-2 border-ethereal-surface rounded-md bg-gray-900 peer-checked:bg-ethereal-primary peer-checked:border-ethereal-primary transition-all flex items-center justify-center">
                      <FiSave className="text-white w-3 h-3 scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-ethereal-on-surface-variant leading-none">Valuation Negotiable</span>
                </label>
              </div>
            </div>
          )}

          {/* Stakeholder Registry */}
          {listing.seller && (
            <div className="pt-8 border-t border-ethereal-surface">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-ethereal-on-surface-variant mb-6 flex items-center gap-3">
                <FiUser className="w-4 h-4 text-ethereal-primary" /> Vendor Profile
              </h4>
              <div className="glass-card bg-ethereal-surface-low/20 p-8 rounded-[2rem] border-none grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Primary Entity</p>
                  <p className="text-sm font-bold text-ethereal-on-surface">{listing.seller.fullName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Comms Channel</p>
                  <p className="text-sm font-medium text-ethereal-primary lowercase truncate">{listing.seller.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Secure Link</p>
                  <p className="text-sm font-bold text-ethereal-on-surface tracking-tighter">{listing.seller.mobileNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">Organization</p>
                  <p className="text-sm font-bold text-ethereal-on-surface">{listing.seller.companyName || 'Private Entity'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Categorical Schematics */}
          {listing.categoryDetails && (() => {
            const currencyFields = ['annualRevenue', 'annualTurnover', 'askingPrice'];
            const areaFields = ['landAreaSqft', 'carpetAreaSqft', 'plotAreaSqft', 'constructedAreaSqft'];
            const percentFields = ['stakePercentage'];
            const hiddenKeys = ['id', 'listingId', 'listing', 'createdAt', 'updatedAt', 'hospitalType', 'equipmentType'];

            const displayableEntries = Object.entries(listing.categoryDetails).filter(([key, value]) => {
              if (hiddenKeys.includes(key)) return false;
              if (value === null || value === undefined || value === '') {
                return typeof value === 'boolean';
              }
              return true;
            });

            if (displayableEntries.length === 0) return null;

            return (
              <div className="pt-8 border-t border-ethereal-surface">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-ethereal-on-surface-variant mb-6">Taxonomy Specifications</h4>
                <div className="bg-ethereal-surface rounded-[2rem] p-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
                    {displayableEntries.map(([key, value]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                      let displayValue;
                      if (typeof value === 'boolean') {
                        displayValue = value ? 'Yes' : 'No';
                      } else if (typeof value === 'object') {
                        displayValue = value.name || 'Structured Object';
                      } else if (currencyFields.includes(key)) {
                        displayValue = formatPrice(value);
                      } else if (areaFields.includes(key)) {
                        displayValue = `${Number(value).toLocaleString('en-IN')} sq ft`;
                      } else if (percentFields.includes(key)) {
                        displayValue = `${value}%`;
                      } else {
                        displayValue = String(value);
                      }
                      return (
                        <div key={key}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mb-2">{label}</p>
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
            <div className="bg-rose-50/50 border border-rose-100 rounded-[1.5rem] p-8 animate-fadeIn">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 mb-2">Discrepancy Report</p>
              <p className="text-sm font-medium text-rose-800 leading-relaxed italic">"{listing.rejectionReason}"</p>
            </div>
          )}

          {/* Temporal Meta */}
          <div className="pt-8 border-t border-ethereal-surface flex flex-wrap gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-30">
            <div className="flex items-center gap-2"><FiCalendar className="w-3 h-3" /> Initialization: {formatDate(listing.createdAt)}</div>
            <div>Latest Sync: {formatDate(listing.updatedAt)}</div>
            <div>Expiration Window: {formatDate(listing.expiresAt)}</div>
          </div>
        </div>

        {/* Dynamic Footer Actions */}
        {!editing && listing.status === 'PENDING' && (
          <div className="shrink-0 bg-ethereal-surface px-10 py-8 border-t border-ethereal-surface">
            <div className="flex justify-end">
              <button onClick={handleApprove}
                className="px-10 py-5 bg-[#db7c26] text-white rounded-[1.5rem] hover:bg-[#3a5578] shadow-xl shadow-[#db7c26]/20 transition-all font-black text-[10px] uppercase tracking-widest">
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





