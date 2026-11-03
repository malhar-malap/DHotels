// Placeholder exports for remaining pages
// These pages can be fully implemented as needed

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaBriefcase } from 'react-icons/fa';
import { listingsAPI, jobsAPI, userAPI, inquiriesAPI, masterAPI, openPrivateFile } from '../services/api';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaMapMarkerAlt, FaRupeeSign, FaLock } from 'react-icons/fa';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { FiXCircle, FiTrash2 } from 'react-icons/fi';
import { generateSlug } from '../utils/slugify';
import { PRICE_NOT_DISCLOSED_LABEL } from '../utils/formatPrice';

// Generic placeholder component
const PlaceholderPage = ({ title, description, linkText, linkHref }) => (
  <div className="min-h-screen  py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-12 text-center animate-fadeIn">
        <h1 className="text-4xl display-title mb-6">{title}</h1>
        <p className="text-ethereal-on-surface-variant text-lg mb-8 max-w-2xl mx-auto">{description}</p>
        {linkText && linkHref && (
          <Link to={linkHref} className="btn-ethereal-primary inline-block">
            {linkText}
          </Link>
        )}
      </div>
    </div>
  </div>
);

// Listing Pages
export const CreateListingPage = () => (
  <PlaceholderPage
    title="Create Listing"
    description="List your hotel, resort, restaurant, café, bar or banquet hall for sale or lease."
    linkText="Back to Dashboard"
    linkHref="/dashboard"
  />
);

export const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 0, size: 6, totalPages: 0, totalElements: 0 });
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    fetchListings();
  }, [debouncedKeyword, selectedCategory, pagination.page]);

  useEffect(() => {
    masterAPI.getCategories().then(res => setCategories(res.data?.data || []));
  }, []);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, listingId: null });
  const [closing, setClosing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, listingId: null });
  const [deleting, setDeleting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        categoryId: selectedCategory || undefined,
        keyword: debouncedKeyword || undefined
      };
      const { data } = await listingsAPI.getMy(params);
      if (data && data.success) {
        setListings(data.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.data.totalPages,
          totalElements: data.data.totalElements
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = (id) => {
    setConfirmModal({ isOpen: true, listingId: id });
  };

  const confirmClose = async (reason) => {
    const id = confirmModal.listingId;
    setConfirmModal({ isOpen: false, listingId: null });
    if (!id) return;

    setClosing(true);
    try {
      await listingsAPI.close(id, reason);
      toast.success('Listing closed successfully');
      fetchListings();
    } catch (error) {
      toast.error('Failed to close listing');
    } finally {
      setClosing(false);
    }
  };

  const confirmDelete = async (reason) => {
    const id = deleteModal.listingId;
    setDeleteModal({ isOpen: false, listingId: null });
    if (!id || !reason?.trim()) return;

    setDeleting(true);
    try {
      await listingsAPI.delete(id, reason.trim());
      toast.success('Listing deleted');
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout activeTab="My Listings">
      <div className="py-10 px-4 md:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <span className="section-label mb-2 block">Marketplace</span>
            <h1 className="text-4xl display-title">My Listings</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Search listings..."
                className="w-full bg-gray-900 border border-ethereal-outline-variant px-4 py-2.5 rounded-full text-sm focus:ring-2 focus:ring-ethereal-primary/20 focus:outline-none transition-all placeholder-gray-500 text-gray-100"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              className="bg-gray-900 border border-ethereal-outline-variant px-4 py-2.5 rounded-full text-sm focus:ring-2 focus:ring-ethereal-primary/20 focus:outline-none transition-all cursor-pointer w-full sm:w-auto text-gray-200"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Link to="/listings/create" className="btn-ethereal-primary whitespace-nowrap w-full sm:w-auto text-center">
              Post New Listing
            </Link>
          </div>
        </div>

        {loading ? (
          /* Shimmer loading */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-950/40 border border-white/5 rounded-3xl overflow-hidden p-4 shadow-md animate-pulse">
                <div className="bg-gray-800/60 rounded-2xl h-48 w-full mb-4"></div>
                <div className="h-4 bg-gray-800/60 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-gray-800/60 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800/60 rounded w-1/2 mb-6"></div>
                <div className="border-t border-gray-800/60 pt-4 flex justify-between items-center">
                  <div className="h-6 bg-gray-800/60 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-800/60 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-12 text-center rounded-3xl">
            <p className="text-ethereal-on-surface-variant mb-6 text-lg">No listings found matching your search or filters.</p>
            <Link to="/listings/create" className="text-ethereal-primary font-bold hover:underline">Get started today</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map(listing => (
                <div key={listing.id} className="relative flex flex-col bg-gray-950/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/20 hover:-translate-y-1.5 transition-all duration-500 group">
                  <div className="relative h-52 overflow-hidden bg-gray-900">
                    {!loadedImages[listing.id] && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 animate-pulse" />
                    )}
                    <img 
                      src={listing.primaryImage || '/placeholder-image.jpg'} 
                      alt={listing.displayTitle} 
                      onLoad={() => handleImageLoad(listing.id)}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                        loadedImages[listing.id] ? 'opacity-100' : 'opacity-0'
                      }`} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-90" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                      {listing.uniqueCode && (
                        <span className="px-2.5 py-1 bg-primary-500/90 text-white backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                          {listing.uniqueCode}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2">
                      {listing.isConfidential && (
                        <span className="bg-red-500/95 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                          <FaLock size={8} /> Confidential
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg flex items-center gap-1 ${
                        listing.status === 'ACTIVE' 
                          ? 'bg-emerald-500/90 text-white' 
                          : listing.status === 'EXPIRED'
                          ? 'bg-red-500/90 text-white'
                          : listing.status === 'CLOSED' || listing.status === 'SOLD'
                          ? 'bg-gray-700/90 text-white'
                          : 'bg-yellow-500/90 text-white'
                      }`}>
                        {listing.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {listing.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="mb-3">
                        <span className="text-[9px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1.5">
                          {listing.categoryName}
                        </span>
                        <h3 className="text-lg font-extrabold text-gray-100 line-clamp-1 leading-tight group-hover:text-primary-400 transition-colors duration-300">
                          {listing.displayTitle}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                        {listing.shortDescription || "No short description provided. Select edit to write one."}
                      </p>
                    </div>
                    
                    <div>
                      <div className="border-t border-gray-800/60 my-4" />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Asking Price</span>
                          <span className="text-lg font-black text-white flex items-center leading-none">
                            {listing.priceNotDisclosed ? PRICE_NOT_DISCLOSED_LABEL : (
                              <>
                                <FaRupeeSign size={14} className="mr-0.5 text-primary-400" />
                                {listing.askingPrice?.toLocaleString()}
                              </>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link 
                            to={`/listings/${listing.id}-${generateSlug(listing.displayTitle || listing.title, listing.cityName)}`} 
                            className="p-2.5 rounded-xl bg-gray-950/60 text-primary-400 border border-gray-800 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all shadow-sm" 
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </Link>
                          <Link 
                            to={`/listings/${listing.id}/edit`} 
                            className="px-4 py-2.5 rounded-xl bg-gray-950/60 text-gray-200 border border-gray-800 hover:bg-gray-800 transition-all font-bold text-xs flex items-center"
                          >
                            Edit
                          </Link>
                          {listing.status === 'ACTIVE' && (
                            <button 
                              onClick={() => handleCloseClick(listing.id)}
                              disabled={closing}
                              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm disabled:opacity-50"
                              title="Close Listing"
                            >
                              <FiXCircle size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, listingId: listing.id })}
                            disabled={deleting}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm disabled:opacity-50"
                            title="Delete Listing"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-3">
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} 
                  disabled={pagination.page === 0} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors text-gray-300"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-900/60 border border-gray-800/40 rounded-xl">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} 
                  disabled={pagination.page >= pagination.totalPages - 1} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors text-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, listingId: null })}
          onConfirm={confirmClose}
          title="Close Listing"
          message="Are you sure you want to close this listing? It will no longer be visible on the marketplace."
          confirmText="Close Listing"
          isDanger={true}
          requireReason={true}
          reasonLabel="Reason for closing (Required)"
      />
      <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, listingId: null })}
          onConfirm={confirmDelete}
          title="Delete Listing"
          message="This permanently deletes the listing and its inquiries. This cannot be undone. Our team will be notified of your reason."
          confirmText="Delete Listing"
          isDanger={true}
          requireReason={true}
          reasonLabel="Reason for deleting (Required)"
      />
    </div>
    </DashboardLayout>
  );
};

export const MyInquiriesPage = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, [activeTab]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data } = activeTab === 'received'
        ? await inquiriesAPI.getReceived({ size: 100 })
        : await inquiriesAPI.getSent({ size: 100 });
      setInquiries(data.data.content || []);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeTab="Inquiries">
      <div className="py-10 px-4 md:px-8 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <span className="section-label mb-2 block">Communications</span>
          <h1 className="text-4xl display-title">Listing Inquiries</h1>
        </div>

        <div className="flex justify-center md:justify-start mb-10">
          <div className="glass-panel p-1.5 rounded-full flex items-center gap-1">
            <button
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'received' 
                  ? 'bg-ethereal-primary text-white shadow-lg' 
                  : 'text-ethereal-on-surface-variant hover:text-ethereal-primary'
              }`}
              onClick={() => setActiveTab('received')}
            >
              Received Inquiries
            </button>
            <button
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'sent' 
                  ? 'bg-ethereal-primary text-white shadow-lg' 
                  : 'text-ethereal-on-surface-variant hover:text-ethereal-primary'
              }`}
              onClick={() => setActiveTab('sent')}
            >
              Sent Inquiries
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-ethereal-primary border-t-transparent rounded-full"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-16 text-center rounded-3xl animate-fadeIn">
            <p className="text-ethereal-on-surface-variant text-lg">No inquiries found in this section.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {inquiries.map((inq, idx) => (
              <div key={inq.id} className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-6 md:p-8 rounded-3xl animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-ethereal-on-surface">{inq.listingTitle}</h3>
                      <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-100/50 text-blue-700 border border-blue-200/50">
                        {inq.status}
                      </span>
                    </div>
                    
                    <div className="relative mb-6">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-ethereal-primary/20 rounded-full"></div>
                      <p className="text-ethereal-on-surface-variant italic leading-relaxed text-lg pl-2">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="pt-6 border-t border-ethereal-outline-variant/30 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                      {activeTab === 'received' ? (
                        <>
                          <div className="flex flex-col">
                            <span className="section-label opacity-60">Buyer Information</span>
                            <span className="font-bold text-ethereal-on-surface">{inq.buyerName}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="section-label opacity-60">Contact Details</span>
                            <span className="text-ethereal-on-surface-variant">{inq.buyerEmail} • {inq.buyerMobile}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="section-label opacity-60">Seller Information</span>
                            <span className="font-bold text-ethereal-on-surface">{inq.sellerName}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="section-label opacity-60">Contact Details</span>
                            <span className="text-ethereal-on-surface-variant">{inq.sellerEmail} • {inq.sellerMobile}</span>
                          </div>
                        </>
                      )}
                      <div className="flex flex-col md:ml-auto">
                        <span className="section-label opacity-60">Received On</span>
                        <span className="text-ethereal-on-surface-variant text-xs">{new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

// Job Pages
export const CreateJobPage = () => (
  <PlaceholderPage
    title="Post a Job"
    description="Create a job posting to hire hospitality professionals."
    linkText="Back to Dashboard"
    linkHref="/dashboard"
  />
);

export const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, jobId: null });
  const [closing, setClosing] = useState(false);

  const fetchJobs = async () => {
    try {
      const { data } = await jobsAPI.getMy({ size: 100 });
      setJobs(data.data.content);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = (id) => {
    setConfirmModal({ isOpen: true, jobId: id });
  };

  const confirmClose = async (reason) => {
    const id = confirmModal.jobId;
    setConfirmModal({ isOpen: false, jobId: null });
    if (!id) return;

    setClosing(true);
    try {
      await jobsAPI.close(id, reason);
      toast.success('Job closed successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to close job');
    } finally {
      setClosing(false);
    }
  };

  if (loading) return (
    <DashboardLayout activeTab="My Jobs">
      <div className="py-10 px-4 md:px-8 w-full flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-ethereal-primary border-t-transparent rounded-full"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeTab="My Jobs">
      <div className="py-10 px-4 md:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <span className="section-label mb-2 block tracking-widest">Recruitment</span>
            <h1 className="text-4xl lg:text-5xl display-title">My Job Postings</h1>
          </div>
          <Link to="/hospitality-jobs-india/create" className="btn-ethereal-primary shadow-xl">
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-20 text-center rounded-3xl animate-fadeIn">
            <h3 className="text-2xl font-bold text-ethereal-on-surface mb-2">Build your team</h3>
            <p className="text-ethereal-on-surface-variant mb-8">You haven't posted any jobs yet. Start hiring hospitality professionals today.</p>
            <Link to="/hospitality-jobs-india/create" className="text-ethereal-primary font-bold hover:underline">Post your first job</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job, idx) => (
              <div key={job.id} className="relative bg-gray-800/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl animate-fadeIn group hover:bg-gray-800/60 hover:border-white/10 transition-all duration-300 shadow-2xl overflow-hidden" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-900/50 border border-white/5 text-ethereal-primary group-hover:bg-ethereal-primary group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-inner">
                    <FaBriefcase size={24} />
                  </div>
                  <span className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm border ${
                    job.status === 'ACTIVE' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : job.status === 'EXPIRED'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : job.status === 'CLOSED'
                      ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-ethereal-primary transition-colors line-clamp-1 tracking-tight relative z-10">{job.title}</h3>
                
                <div className="flex flex-col gap-3 mb-8 relative z-10">
                  <div className="flex items-center text-gray-400 text-sm font-medium">
                    <FaMapMarkerAlt className="mr-2 text-ethereal-primary opacity-70" /> {job.cityName}
                  </div>
                  <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-ethereal-primary mr-2"></span> {job.employmentType?.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="flex gap-4 relative z-10">
                  <Link 
                    to={`/hospitality-jobs-india/${job.id}/edit`} 
                    className="flex-1 flex items-center justify-center py-4 rounded-2xl bg-gray-900/50 border border-white/5 text-white font-bold hover:bg-ethereal-primary hover:border-ethereal-primary transition-all duration-300 group/btn shadow-md"
                  >
                    Manage
                    <FaEye className="ml-2 transform group-hover/btn:scale-110 transition-transform opacity-70 group-hover/btn:opacity-100" />
                  </Link>
                  {job.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleCloseClick(job.id)}
                      disabled={closing}
                      className="flex-none px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all duration-300 shadow-md"
                      title="Close Job"
                    >
                      <FiXCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, jobId: null })}
          onConfirm={confirmClose}
          title="Close Job Posting"
          message="Are you sure you want to close this job posting? It will no longer be visible to job seekers."
          confirmText="Close Job"
          isDanger={true}
          requireReason={true}
          reasonLabel="Reason for closing (Required)"
      />
    </div>
    </DashboardLayout>
  );
};

export const MyApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = activeTab === 'received'
        ? await jobsAPI.getReceivedApplications({ size: 100 })
        : await jobsAPI.getMyApplications({ size: 100 });
      setApplications(data.data.content || []);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await jobsAPI.updateApplicationStatus(appId, newStatus);
      toast.success(`Applicant ${newStatus.toLowerCase()} successfully`);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout activeTab="Applications">
      <div className="py-10 px-4 md:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="section-label mb-2 block">Talent Pipeline</span>
          <h1 className="text-4xl display-title">Job Applications</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="glass-panel p-2 rounded-3xl flex flex-col gap-1">
              <button
                className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'received' 
                    ? 'bg-ethereal-primary text-white shadow-lg' 
                    : 'text-ethereal-on-surface-variant hover:bg-ethereal-surface-low'
                }`}
                onClick={() => setActiveTab('received')}
              >
                Applications for My Jobs
              </button>
              <button
                className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'sent' 
                    ? 'bg-ethereal-primary text-white shadow-lg' 
                    : 'text-ethereal-on-surface-variant hover:bg-ethereal-surface-low'
                }`}
                onClick={() => setActiveTab('sent')}
              >
                My Applications
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-ethereal-primary border-t-transparent rounded-full"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="no-border-card text-center py-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-ethereal-surface-low rounded-full flex items-center justify-center mb-6">
                  <FaEye className="text-ethereal-primary opacity-30" size={24} />
                </div>
                <p className="text-ethereal-on-surface-variant text-lg">No applications found in this section.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {applications.map((app, idx) => (
                  <div key={app.id} className="no-border-card animate-fadeIn overflow-hidden relative" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div>
                            <span className="section-label block opacity-60 mb-1">{app.jobTitle}</span>
                            <h3 className="text-xl font-bold text-ethereal-on-surface">
                              {activeTab === 'received' ? app.seekerName : `${app.employerName} (${app.employerCompany})`}
                            </h3>
                          </div>
                          <span className={`self-start sm:self-center px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                            ['SHORTLISTED', 'HIRED'].includes(app.status) 
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                              : app.status === 'REJECTED' 
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {app.coverLetter && (
                          <div className="mb-8 p-6 bg-ethereal-surface-low rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-ethereal-primary rounded-bl-lg opacity-20"></div>
                            <p className="text-ethereal-on-surface-variant text-sm italic relative z-10 leading-relaxed">
                              "{app.coverLetter}"
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div className="flex flex-wrap gap-8 text-sm">
                            <div className="flex flex-col">
                              <span className="section-label opacity-40">Applied On</span>
                              <span className="font-medium text-ethereal-on-surface-variant">{new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                            {activeTab === 'received' && (
                              <>
                                <div className="flex flex-col">
                                  <span className="section-label opacity-40">Contact</span>
                                  <span className="font-medium text-ethereal-on-surface-variant">{app.seekerEmail} • {app.seekerMobile}</span>
                                </div>
                              </>
                            )}
                          </div>
                          {app.cvUrl && (
                            <button 
                              type="button"
                              onClick={() => openPrivateFile(app.cvUrl).catch(() => toast.error('Could not open the document'))}
                              className="px-6 py-2 bg-ethereal-surface-low border border-ethereal-primary/20 text-ethereal-primary font-bold rounded-xl hover:bg-ethereal-primary hover:text-white transition-all duration-300 flex items-center gap-2"
                            >
                              <FaEye size={14} /> View Document
                            </button>
                          )}
                        </div>
                      </div>

                      {activeTab === 'received' && ['SUBMITTED', 'VIEWED'].includes(app.status) && (
                        <div className="flex lg:flex-col items-stretch gap-3 lg:w-48 lg:border-l border-ethereal-outline-variant/30 lg:pl-8 pt-8 lg:pt-0">
                          <button 
                            onClick={() => handleStatusChange(app.id, 'SHORTLISTED')} 
                            className="flex-1 bg-ethereal-secondary text-white py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 hover:scale-[1.02] transition-all"
                          >
                            Shortlist
                          </button>
                          <button 
                            onClick={() => handleStatusChange(app.id, 'REJECTED')} 
                            className="flex-1 bg-rose-500/10 text-rose-300 py-3 rounded-2xl font-bold hover:bg-rose-500/20 transition-all border border-rose-500/30"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

// Profile
export const ProfilePage = () => {
  const [profile, setProfile] = useState({ fullName: '', mobileNumber: '', companyName: '', cityId: '', cityName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile();
      setProfile({
        fullName: data.data.fullName || '',
        mobileNumber: data.data.mobileNumber || '',
        companyName: data.data.companyName || '',
        cityId: data.data.city?.id || '',
        cityName: data.data.city?.name || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: profile.fullName,
        mobileNumber: profile.mobileNumber,
        companyName: profile.companyName,
      };
      if (profile.cityId) payload.cityId = profile.cityId;

      await userAPI.updateProfile(payload);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await userAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout activeTab="Account Settings">
      <div className="py-10 px-4 md:px-8 w-full flex items-center justify-center">
      <div className="animate-pulse text-ethereal-primary font-medium text-lg">Loading profile...</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeTab="Account Settings">
      <div className="py-10 px-4 md:px-8 w-full">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-ethereal-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl shadow-blue-500/20">
            {profile.fullName.charAt(0)}
          </div>
          <span className="section-label mb-2 block tracking-widest">Account Settings</span>
          <h1 className="text-4xl display-title uppercase tracking-tighter">Personal Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-8 rounded-[2.5rem] relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ethereal-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-ethereal-secondary/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-2">
                <label className="section-label opacity-60 ml-1">Legal Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={profile.fullName} 
                  onChange={handleChange} 
                  className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="section-label opacity-60 ml-1">Primary Mobile</label>
                <input 
                  type="text" 
                  name="mobileNumber" 
                  value={profile.mobileNumber} 
                  onChange={handleChange} 
                  className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium" 
                  required 
                  pattern="^[6-9]\d{9}$" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="section-label opacity-60 ml-1">Entity / Organization</label>
                <input 
                  type="text" 
                  name="companyName" 
                  value={profile.companyName} 
                  onChange={handleChange} 
                  className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="section-label opacity-60 ml-1">Registered Analytics City</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    disabled 
                    value={profile.cityName} 
                    className="w-full bg-ethereal-surface-low/50 border border-ethereal-outline-variant/20 px-6 py-4 rounded-2xl text-ethereal-on-surface-variant font-medium cursor-not-allowed" 
                    placeholder="City" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-ethereal-primary opacity-60">Locked</div>
                </div>
                <p className="text-[10px] font-bold text-ethereal-on-surface-variant mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-ethereal-primary rounded-full"></span>
                  Contact infrastructure support for regional updates.
                </p>
              </div>
            </div>

            <div className="mt-16 flex justify-center md:justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="btn-ethereal-primary min-w-[200px] py-4 text-lg shadow-2xl disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-900/30 border-t-white rounded-full animate-spin"></div>
                    Syncing...
                  </span>
                ) : 'Update Identity'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-8 rounded-[2.5rem] relative overflow-hidden h-full flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-64 h-64 bg-ethereal-secondary/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-ethereal-primary/5 rounded-full blur-3xl -mr-32 -mb-32"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-2xl bg-ethereal-surface-low text-ethereal-primary">
                <FaLock size={20} />
              </div>
              <div>
                <span className="section-label opacity-60 block">Security</span>
                <h2 className="text-2xl font-bold text-ethereal-on-surface">Change Password</h2>
              </div>
            </div>

            <div className="w-full h-px bg-ethereal-outline-variant/20 mb-10"></div>

            <form onSubmit={handleChangePassword}>
              <div className="grid grid-cols-1 gap-y-8 max-w-xl">
                <div className="space-y-2">
                  <label className="section-label opacity-60 ml-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 pr-14 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-ethereal-on-surface-variant hover:text-ethereal-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="section-label opacity-60 ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 pr-14 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-ethereal-on-surface-variant hover:text-ethereal-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="section-label opacity-60 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 pr-14 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium"
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-ethereal-on-surface-variant hover:text-ethereal-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-ethereal-primary rounded-full"></span>
                  Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
                </p>
              </div>

              <div className="mt-12 flex justify-center md:justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-ethereal-primary min-w-[200px] py-4 text-lg shadow-2xl disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-900/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

// Admin Pages
export const AdminListings = () => (
  <PlaceholderPage
    title="Listings Administration"
    description="Review, moderate and approve hospitality listings before they go live."
  />
);

export const AdminJobs = () => (
  <PlaceholderPage
    title="Human Capital Management"
    description="Review and approve hospitality job postings."
  />
);

export const AdminUsers = () => (
  <PlaceholderPage
    title="Identity Ecosystem"
    description="Manage buyers, sellers, employers and job seekers on the platform."
  />
);

export const AdminVerifications = () => (
  <PlaceholderPage
    title="KYC & Integrity Suite"
    description="Review buyer identity documents to keep the marketplace trustworthy."
  />
);




