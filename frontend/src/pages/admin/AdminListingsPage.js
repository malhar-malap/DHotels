import React, { useState, useEffect, useCallback } from 'react';
import RefreshButton from '../../components/admin/RefreshButton';
import { useSearchParams, Link } from 'react-router-dom';
import { adminAPI, masterAPI } from '../../services/api';
import { formatListingPrice } from '../../utils/formatPrice';
import AdminListingDetailModal from './AdminListingDetailModal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { FiCheck, FiX, FiTrash2, FiStar, FiEye, FiFilter, FiSearch, FiChevronLeft, FiChevronRight, FiArrowLeft, FiImage } from 'react-icons/fi';

const MAX_FEATURE_DAYS = 60;
/** "12 days left", or "5 hours left" in the last day. */
const featuredTimeLeft = (until) => {
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const days = Math.ceil(ms / 86400000);
  if (ms < 86400000) {
    const hours = Math.max(1, Math.ceil(ms / 3600000));
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  }
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
};
const formatDateTime = (date) => date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const AdminListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  // Master data
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modals
  const [detailModalId, setDetailModalId] = useState(null);
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [featureModalId, setFeatureModalId] = useState(null);
  // Featured duration: a preset ('3', '7', '14', '30') or 'custom' with customFeatureDays (1-60)
  const [featurePreset, setFeaturePreset] = useState('7');
  const [customFeatureDays, setCustomFeatureDays] = useState('');
  // Expiry of the listing's current featured window, if it is featured right now
  const [featureCurrentUntil, setFeatureCurrentUntil] = useState(null);

  // Approve modal
  const [approveModalId, setApproveModalId] = useState(null);
  const [approveUniqueCode, setApproveUniqueCode] = useState('');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, listingId: null, isBulk: false });

  // Actions loading
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchMasterData(); }, []);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: 30 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (cityFilter) params.cityId = cityFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (keyword) params.keyword = keyword;

      const response = await adminAPI.getListings(params);
      const data = response.data.data;
      setListings(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error('Failed to load listings');
      console.error(error);
    }
    setLoading(false);
  }, [page, statusFilter, categoryFilter, cityFilter, fromDate, toDate, keyword]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

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

  // Actions
  const handleApprove = (id) => {
    setApproveModalId(id);
    setApproveUniqueCode('');
    // Pre-fill the next free code in the category's series; the admin can overwrite or clear it
    adminAPI.suggestListingCode(id)
      .then((res) => setApproveUniqueCode((current) => current || res.data?.data || ''))
      .catch(() => {});
  };

  const handleApproveConfirm = async () => {
    setActionLoading(approveModalId);
    try {
      // No image is sent: the backend assigns representative photos for the listing's category,
      // and generates the next code in the series when the field is blank
      await adminAPI.approveListing(approveModalId, approveUniqueCode.trim());
      toast.success(approveUniqueCode.trim() ? 'Listing approved with code: ' + approveUniqueCode.trim().toUpperCase() : 'Listing approved with an auto-assigned code');
      setApproveModalId(null);
      setApproveUniqueCode('');
      fetchListings();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve'); }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setActionLoading(rejectModalId);
    try {
      await adminAPI.rejectListing(rejectModalId, rejectReason);
      toast.success('Listing rejected');
      setRejectModalId(null);
      setRejectReason('');
      fetchListings();
    } catch (error) { toast.error('Failed to reject'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, listingId: id, isBulk: false });
  };

  const confirmDelete = async (reason) => {
    const { listingId, isBulk } = confirmModal;
    setConfirmModal({ isOpen: false, listingId: null, isBulk: false });
    if (!reason?.trim()) { toast.error('Please provide a reason for deletion'); return; }
    
    if (isBulk) {
      if (selectedIds.length === 0) return;
      try {
        const response = await adminAPI.bulkDeleteListings(selectedIds, reason.trim());
        const result = response.data.data;
        toast.success(`${result.successCount} listings deleted`);
        setSelectedIds([]);
        setSelectAll(false);
        fetchListings();
      } catch (error) { toast.error('Bulk delete failed'); }
      return;
    }

    if (!listingId) return;
    setActionLoading(listingId);
    try {
      await adminAPI.deleteListing(listingId, reason.trim());
      toast.success('Listing deleted and the owner has been notified');
      fetchListings();
    } catch (error) { toast.error('Failed to delete'); }
    setActionLoading(null);
  };

  const featureDays = featurePreset === 'custom' ? Number(customFeatureDays) : Number(featurePreset);
  const featureDaysValid = Number.isInteger(featureDays) && featureDays >= 1 && featureDays <= MAX_FEATURE_DAYS;

  const openFeatureModal = (listing) => {
    setFeatureModalId(listing.id);
    setFeatureCurrentUntil(listing.isFeatured && listing.featuredUntil ? listing.featuredUntil : null);
    setFeaturePreset('7');
    setCustomFeatureDays('');
  };

  const handleFeature = async () => {
    if (!featureDaysValid) { toast.error(`Choose between 1 and ${MAX_FEATURE_DAYS} days`); return; }
    setActionLoading(featureModalId);
    try {
      await adminAPI.featureListing(featureModalId, featureDays);
      toast.success(`Listing featured for ${featureDays} ${featureDays === 1 ? 'day' : 'days'}; the owner has been notified`);
      setFeatureModalId(null);
      fetchListings();
    } catch (error) { toast.error('Failed to feature listing'); }
    setActionLoading(null);
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) { toast.error('No listings selected'); return; }
    try {
      const response = await adminAPI.bulkApproveListings(selectedIds);
      const result = response.data.data;
      toast.success(`${result.successCount} listings approved`);
      if (result.failedCount > 0) toast.error(`${result.failedCount} failed`);
      setSelectedIds([]);
      setSelectAll(false);
      fetchListings();
    } catch (error) { toast.error('Bulk approve failed'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) { toast.error('No listings selected'); return; }
    setConfirmModal({ isOpen: true, listingId: null, isBulk: true });
  };

  // Selection helpers
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings.map(l => l.id));
    }
    setSelectAll(!selectAll);
  };

  // Sync statusFilter with searchParams URL updates
  useEffect(() => {
    setStatusFilter(searchParams.get('status') || '');
  }, [searchParams]);

  // Filter apply
  const handleStatusChange = (val) => {
    setPage(0);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('status', val);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setCityFilter('');
    setFromDate('');
    setToDate('');
    setKeyword('');
    setPage(0);
    setSearchParams({});
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200/50',
    ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    REJECTED: 'bg-rose-100 text-rose-800 border-rose-200/50',
    EXPIRED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    SOLD: 'bg-indigo-100 text-indigo-800 border-indigo-200/50',
    WITHDRAWN: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200/50',
  };

  const pendingListings = statusFilter === 'PENDING' ? listings : [];
  const showPendingSection = searchParams.get('status') === 'PENDING';

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Link to="/admin" className="p-2 rounded-xl bg-gray-900/50 text-ethereal-on-surface-variant hover:text-ethereal-primary transition-all duration-300">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <span className="section-label tracking-[0.2em]">Listing Management</span>
            </div>
<div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl display-title uppercase tracking-tighter">
                {showPendingSection ? 'Audit Pipeline' : 'Asset Repository'}
              </h1>
              <RefreshButton onRefresh={fetchListings} />
            </div>
            <p className="text-ethereal-on-surface-variant font-medium mt-1">
              Currently indexing <span className="text-ethereal-on-surface">{totalElements}</span> listings
            </p>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="glass-card !bg-gray-900/80 px-6 py-4 rounded-3xl border-none flex items-center gap-4 animate-slideUp">
              <span className="text-xs font-black uppercase tracking-widest text-ethereal-on-surface-variant">Selected: {selectedIds.length}</span>
              <div className="h-4 w-px bg-ethereal-surface-low mx-2"></div>
              <button onClick={handleBulkApprove} className="btn-ethereal-primary !px-5 !py-2 text-[11px] font-black uppercase tracking-widest">
                Authorize Batch
              </button>
              <button onClick={handleBulkDelete} className="text-rose-600 hover:text-rose-700 text-[11px] font-black uppercase tracking-widest px-4">
                Purge
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        <div className="glass-card p-8 rounded-3xl border-none mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-ethereal-primary/10 text-ethereal-primary"><FiFilter className="w-4 h-4" /></div>
            <span className="text-sm font-black uppercase tracking-widest text-ethereal-on-surface">Precision Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 transition-all outline-none">
              <option value="">All Lifecycle Stages</option>
              <option value="PENDING">Verification Pending</option>
              <option value="ACTIVE">Market Active</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              className="px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 transition-all outline-none">
              <option value="">All Modalities</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ethereal-on-surface-variant opacity-40" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); } }}
                placeholder="Key Identifier..."
                className="w-full pl-11 pr-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 outline-none" />
            </div>
          </div>
          {(statusFilter || categoryFilter || keyword) && (
            <div className="mt-6 flex justify-end">
              <button onClick={clearFilters} className="text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant hover:text-ethereal-primary transition-colors">Reset Query Parameters</button>
            </div>
          )}
        </div>

        {/* Audit Pipeline (Pending section) */}
        {showPendingSection && pendingListings.length > 0 && (
          <div className="mb-12 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <h2 className="text-xl font-bold text-ethereal-on-surface tracking-tight uppercase">Priority Vetting</h2>
            </div>
            <div className="grid gap-4">
              {pendingListings.map(listing => (
                <div key={listing.id} className="glass-card hover:bg-gray-900 p-5 md:p-6 rounded-3xl border-none flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all duration-500">
                  <div className="flex items-center gap-4 md:gap-6 flex-1 w-full min-w-0">
                    <input type="checkbox" checked={selectedIds.includes(listing.id)}
                      onChange={() => toggleSelect(listing.id)}
                      className="w-5 h-5 accent-ethereal-primary rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-base md:text-lg font-bold text-ethereal-on-surface truncate group-hover:text-ethereal-primary transition-colors cursor-pointer"
                          onClick={() => setDetailModalId(listing.id)}>{listing.displayTitle}</h3>
                        <span className="px-3 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-widest rounded-full">Vetting</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ethereal-on-surface-variant opacity-60">
                        <span className="uppercase tracking-widest">{listing.categoryName}</span>
                        <span>•</span>
                        <span className="uppercase tracking-widest">{listing.cityName}</span>
                        <span>•</span>
                        <span className="text-ethereal-on-surface font-black">{formatListingPrice(listing)}</span>
                        <span>•</span>
                        <span>Origin: {listing.sellerName || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center md:ml-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setDetailModalId(listing.id)} className="p-2.5 md:p-3 rounded-2xl bg-ethereal-surface text-ethereal-on-surface-variant hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <FiEye className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={() => handleApprove(listing.id)} disabled={actionLoading === listing.id} className="p-2.5 md:p-3 rounded-2xl bg-ethereal-surface text-primary-400 hover:bg-primary-400/10 transition-all">
                      <FiCheck className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button onClick={() => { setRejectModalId(listing.id); setRejectReason(''); }} className="p-2.5 md:p-3 rounded-2xl bg-ethereal-surface text-rose-500 hover:bg-rose-50 transition-all">
                      <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Asset Table */}
        {!showPendingSection && (
          <div className="glass-card rounded-3xl border-none overflow-hidden animate-fadeIn">
            {loading ? (
              <div className="p-24 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
                <p className="text-ethereal-on-surface-variant font-black uppercase tracking-widest mt-6 text-[11px]">Synchronizing Matrix...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="p-24 text-center">
                <p className="text-ethereal-on-surface font-bold text-xl tracking-tight">Zero Indices Recorded</p>
                <p className="text-ethereal-on-surface-variant font-medium mt-2">Adjust your refinement parameters to broaden scan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-ethereal-surface-low border-b border-ethereal-surface">
                      <th className="px-8 py-6">
                        <input type="checkbox" checked={selectAll} onChange={toggleSelectAll}
                          className="w-5 h-5 accent-ethereal-primary rounded-lg" />
                      </th>
                      <th className="px-4 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Asset Designation</th>
                      <th className="px-4 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Modality</th>
                      <th className="px-4 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Geography</th>
                      <th className="px-4 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Valuation</th>
                      <th className="px-4 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Status</th>
                      <th className="px-4 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Timestamp</th>
                      <th className="px-4 py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Admin Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ethereal-surface">
                    {listings.map((listing, idx) => (
                      <tr key={listing.id} className="hover:bg-ethereal-surface-low transition-colors group animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <td className="px-8 py-6">
                          <input type="checkbox" checked={selectedIds.includes(listing.id)}
                            onChange={() => toggleSelect(listing.id)}
                            className="w-5 h-5 accent-ethereal-primary rounded-lg" />
                        </td>
                        <td className="px-4 py-6">
                          <div className="max-w-[280px]">
                            <p onClick={() => setDetailModalId(listing.id)} className="font-bold text-ethereal-on-surface truncate group-hover:text-ethereal-primary transition-colors cursor-pointer">
                              {listing.displayTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40">System ID: {listing.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-6 text-xs font-bold text-ethereal-on-surface-variant uppercase tracking-wider">{listing.categoryName}</td>
                        <td className="px-4 py-6 text-xs font-medium text-ethereal-on-surface">{listing.cityName}</td>
                        <td className="px-4 py-6 text-sm font-black text-ethereal-on-surface">{formatListingPrice(listing)}</td>
                        <td className="px-4 py-6">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${statusColors[listing.status] || ''}`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-4 py-6 text-xs font-bold text-ethereal-on-surface-variant tracking-wider">{formatDate(listing.createdAt)}</td>
                        <td className="px-4 py-6">
                          <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => setDetailModalId(listing.id)} className="p-2 rounded-xl bg-gray-900 text-ethereal-on-surface-variant hover:text-blue-600 hover:shadow-lg transition-all"><FiEye size={16} /></button>
                            {(listing.status === 'PENDING' || listing.status === 'REJECTED') && (
                              <button onClick={() => handleApprove(listing.id)} disabled={actionLoading === listing.id} className="p-2 rounded-xl bg-gray-900 text-primary-400 hover:shadow-lg transition-all"><FiCheck size={16} /></button>
                            )}
                            {listing.status !== 'REJECTED' && (
                              <button onClick={() => { setRejectModalId(listing.id); setRejectReason(''); }} className="p-2 rounded-xl bg-gray-900 text-rose-500 hover:shadow-lg transition-all"><FiX size={16} /></button>
                            )}
                            {listing.status === 'ACTIVE' && (
                              <button onClick={() => openFeatureModal(listing)}
                                title={listing.isFeatured ? `Featured: ${featuredTimeLeft(listing.featuredUntil)}` : 'Feature on homepage'}
                                className={`p-2 rounded-xl hover:shadow-lg transition-all ${listing.isFeatured ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-900 text-amber-500'}`}>
                                <FiStar size={16} className={listing.isFeatured ? 'fill-current' : ''} />
                              </button>
                            )}
                            <button onClick={() => handleDelete(listing.id)} disabled={actionLoading === listing.id} className="p-2 rounded-xl bg-gray-900 text-rose-700 hover:shadow-lg transition-all"><FiTrash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Layer */}
            {totalPages > 1 && (
              <div className="bg-ethereal-surface-low/30 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-ethereal-surface">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">
                  Viewing Plate {page + 1} of {totalPages} <span className="mx-2 opacity-20">|</span> Total Items: {totalElements}
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="p-3 rounded-2xl bg-gray-900 text-ethereal-on-surface hover:text-ethereal-primary shadow-sm disabled:opacity-30 transition-all">
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                      if (pageNum >= totalPages || pageNum < 0) return null;
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${page === pageNum ? 'bg-ethereal-primary text-white shadow-lg shadow-ethereal-primary/30' : 'bg-gray-900 text-ethereal-on-surface hover:bg-ethereal-surface'}`}>
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                    className="p-3 rounded-2xl bg-gray-900 text-ethereal-on-surface hover:text-ethereal-primary shadow-sm disabled:opacity-30 transition-all">
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Also show table below pending section */}
        {showPendingSection && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="p-2 rounded-lg border hover:bg-gray-800 disabled:opacity-30"><FiChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border hover:bg-gray-800 disabled:opacity-30"><FiChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal Overlay */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="glass-card bg-gray-900/95 border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-lg animate-scaleIn">
            <h3 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-4 uppercase">Asset Rejection Protocol</h3>
            <p className="text-sm font-medium text-ethereal-on-surface-variant mb-8 opacity-60">Define the reason for non-compliance. This metadata will be transmitted to the entity owner.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Detailed reason for decommissioning..."
              className="w-full px-6 py-5 bg-gray-800 border border-white/10 rounded-2xl focus:bg-gray-950 focus:ring-4 focus:ring-rose-500/20 transition-all outline-none resize-none min-h-[160px] text-sm font-medium" />
            <div className="flex justify-end gap-4 mt-10">
              <button onClick={() => setRejectModalId(null)}
                className="btn-ethereal-secondary">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading === rejectModalId}
                className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20 disabled:opacity-50 transition-all">
                {actionLoading === rejectModalId ? 'Processing...' : 'Execute Decommission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Escalation Modal */}
      {featureModalId && (
        <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="glass-card bg-gray-900/95 border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md animate-scaleIn">
            <h3 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-4 uppercase">Visibility Escalation</h3>
            <p className="text-sm font-medium text-ethereal-on-surface-variant mb-6 opacity-60">Set the priority duration for this asset within the network grid.</p>
            {featureCurrentUntil && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
                <FiStar className="w-5 h-5 mt-0.5 shrink-0 text-amber-300 fill-current" />
                <div className="text-sm">
                  <p className="font-bold text-amber-200">Already featured on the homepage: {featuredTimeLeft(featureCurrentUntil)}</p>
                  <p className="text-amber-200/70 mt-0.5">Current window ends {formatDateTime(new Date(featureCurrentUntil))}. Choosing a new duration replaces it, starting now.</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-ethereal-primary opacity-60">Escalation Duration</label>
              <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Featured duration">
                {[['3', '3 days'], ['7', '7 days'], ['14', '14 days'], ['30', '30 days'], ['custom', 'Custom']].map(([value, label]) => (
                  <button key={value} type="button" role="radio" aria-checked={featurePreset === value}
                    onClick={() => setFeaturePreset(value)}
                    className={`px-2 py-3 rounded-xl text-xs font-bold border transition-colors ${
                      featurePreset === value
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                        : 'bg-gray-800 border-white/10 text-gray-300 hover:border-white/20'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {featurePreset === 'custom' && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="relative">
                    <input type="number" min="1" max={MAX_FEATURE_DAYS} step="1" autoFocus
                      value={customFeatureDays}
                      onChange={(e) => setCustomFeatureDays(e.target.value)}
                      placeholder={`1 - ${MAX_FEATURE_DAYS}`}
                      className="w-full px-6 py-4 pr-16 bg-gray-800 border border-white/10 rounded-2xl focus:bg-gray-950 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none font-bold text-ethereal-on-surface" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">days</span>
                  </div>
                  {customFeatureDays !== '' && !featureDaysValid && (
                    <p className="text-xs text-rose-400">Enter a whole number from 1 to {MAX_FEATURE_DAYS}.</p>
                  )}
                </div>
              )}
              {featureDaysValid && (
                <div className="rounded-2xl bg-gray-800 border border-white/10 px-5 py-4 text-sm">
                  <p className="text-gray-400">Featured on the homepage from</p>
                  <p className="font-bold text-ethereal-on-surface mt-0.5">
                    {formatDateTime(new Date())} <span className="text-gray-500 font-medium">until</span> {formatDateTime(new Date(Date.now() + featureDays * 86400000))}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">It's removed from the homepage automatically at that time, and the owner is notified now.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-10">
              <button onClick={() => setFeatureModalId(null)}
                className="btn-ethereal-secondary">Abort</button>
              <button onClick={handleFeature} disabled={actionLoading === featureModalId || !featureDaysValid}
                className="px-8 py-4 bg-amber-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all">
                {actionLoading === featureModalId ? 'Escalating...' : featureCurrentUntil ? 'Update Visibility' : 'Authorize Visibility'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve with Unique Code Modal */}
      {approveModalId && (
        <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="glass-card bg-gray-900/95 border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-lg animate-scaleIn">
            <h3 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-4 uppercase">Listing Verification</h3>
            <p className="text-sm font-medium text-ethereal-on-surface-variant mb-8 opacity-60">Confirm the unique code to approve and publish this listing. Leave it blank to auto-assign the next code for its category.</p>
            
            <div className="space-y-6">
              {/* Unique Code */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-ethereal-primary opacity-60">Unique Code</label>
                <input
                  type="text"
                  value={approveUniqueCode}
                  onChange={(e) => setApproveUniqueCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApproveConfirm(); }}
                  placeholder="Auto-assign (e.g. HTL00121)"
                  autoFocus
                  className="w-full px-6 py-5 bg-gray-800 border border-white/10 rounded-2xl focus:bg-gray-950 focus:ring-4 focus:ring-ethereal-primary/20 transition-all outline-none text-lg font-bold tracking-wider"
                />
              </div>

              {/* Image is assigned automatically */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-800">
                <FiImage className="w-5 h-5 text-ethereal-primary shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-ethereal-on-surface-variant leading-relaxed">
                  Representative photos for this listing's category are assigned automatically and replace any owner-uploaded photos.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <button onClick={() => setApproveModalId(null)}
                className="btn-ethereal-secondary">Cancel</button>
              <button onClick={handleApproveConfirm} disabled={actionLoading === approveModalId}
                className="px-8 py-4 bg-primary-400 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-500 shadow-xl shadow-primary-400/20 disabled:opacity-50 transition-all">
                {actionLoading === approveModalId ? 'Processing...' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Analysis Overlay */}
      {detailModalId && (
        <AdminListingDetailModal
          listingId={detailModalId}
          onClose={() => setDetailModalId(null)}
          onUpdated={fetchListings}
          onVerifyClick={(listing) => {
            setDetailModalId(null);
            handleApprove(listing.id);
          }}
        />
      )}
      
      <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, listingId: null, isBulk: false })}
          onConfirm={confirmDelete}
          title={confirmModal.isBulk ? "Bulk Delete Listings" : "Delete Listing"}
          message={confirmModal.isBulk ? `Are you sure you want to delete ${selectedIds.length} selected listings? This action cannot be undone. Each owner will be emailed the reason.` : "Are you sure you want to delete this listing? This action cannot be undone. The owner will be emailed the reason."}
          confirmText="Delete"
          isDanger={true}
          requireReason={true}
          reasonLabel="Reason for deletion (sent to the owner)"
      />
    </div>
  );
};

export default AdminListingsPage;





