import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminAPI, masterAPI } from '../../services/api';
import AdminJobDetailModal from './AdminJobDetailModal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { FiCheck, FiX, FiTrash2, FiEye, FiFilter, FiSearch, FiChevronLeft, FiChevronRight, FiArrowLeft, FiBriefcase } from 'react-icons/fi';

const AdminJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  // Sync statusFilter with searchParams URL updates
  useEffect(() => {
    setStatusFilter(searchParams.get('status') || '');
  }, [searchParams]);

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

  // Master data
  const [categories, setCategories] = useState([]);

  // Modals
  const [detailModalId, setDetailModalId] = useState(null);
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, jobId: null });

  // Actions loading
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchMasterData(); }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        size: 10,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        keyword: keyword || undefined
      };

      const response = await adminAPI.getJobs(params);
      const data = response.data.data;
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error(error);
    }
    setLoading(false);
  }, [page, statusFilter, categoryFilter, keyword]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const fetchMasterData = async () => {
    try {
      const catRes = await masterAPI.getJobCategories();
      setCategories(catRes.data.data || []);
    } catch (error) {
      console.error('Error loading job categories:', error);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.approveJob(id);
      toast.success('Job approved!');
      fetchJobs();
    } catch (error) { toast.error('Failed to approve'); }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setActionLoading(rejectModalId);
    try {
      await adminAPI.rejectJob(rejectModalId, rejectReason);
      toast.success('Job rejected');
      setRejectModalId(null);
      setRejectReason('');
      fetchJobs();
    } catch (error) { toast.error('Failed to reject'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, jobId: id });
  };

  const confirmDelete = async () => {
    const id = confirmModal.jobId;
    setConfirmModal({ isOpen: false, jobId: null });
    if (!id) return;
    setActionLoading(id);
    try {
      await adminAPI.deleteJob(id);
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) { toast.error('Failed to delete'); }
    setActionLoading(null);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
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
    EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200/50',
    CLOSED: 'bg-indigo-100 text-indigo-800 border-indigo-200/50',
  };

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
              <span className="section-label tracking-[0.2em]">Career Portal Management</span>
            </div>
            <h1 className="text-4xl display-title uppercase tracking-tighter">
              {showPendingSection ? 'Talent Pipeline' : 'Position Registry'}
            </h1>
            <p className="text-ethereal-on-surface-variant font-medium mt-1">
              Currently indexing <span className="text-ethereal-on-surface">{totalElements}</span> professional opportunities
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-card p-8 rounded-[2rem] border-none mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-ethereal-primary/10 text-ethereal-primary"><FiFilter className="w-4 h-4" /></div>
            <span className="text-sm font-black uppercase tracking-widest text-ethereal-on-surface">Precision Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 transition-all outline-none">
              <option value="">All Lifecycle Stages</option>
              <option value="PENDING">Vetting Required</option>
              <option value="ACTIVE">Market Active</option>
              <option value="REJECTED">Decommissioned</option>
              <option value="CLOSED">Concluded</option>
            </select>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              className="px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 transition-all outline-none">
              <option value="">All Modal Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="relative md:col-span-2">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ethereal-on-surface-variant opacity-40" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); } }}
                placeholder="Key Identifier (Title or Legal Entity)..."
                className="w-full pl-11 pr-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 outline-none" />
            </div>
          </div>
          {(statusFilter || categoryFilter || keyword) && (
            <div className="mt-6 flex justify-end">
              <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant hover:text-ethereal-primary transition-colors">Reset Query Parameters</button>
            </div>
          )}
        </div>        {/* Jobs List Grid */}
        <div className="glass-card rounded-[2.5rem] border-none overflow-hidden animate-fadeIn">
          {loading ? (
            <div className="p-24 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
              <p className="text-ethereal-on-surface-variant font-black uppercase tracking-widest mt-6 text-[10px]">Synchronizing Matrix...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-24 text-center">
              <div className="bg-ethereal-surface-low w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <FiBriefcase className="w-8 h-8 text-ethereal-on-surface-variant opacity-40" />
              </div>
              <p className="text-ethereal-on-surface font-bold text-xl tracking-tight">Zero Indices Recorded</p>
              <p className="text-ethereal-on-surface-variant font-medium mt-2">Try adjusting your refinement parameters to broaden scan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ethereal-surface-low border-b border-ethereal-surface">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Asset Designation</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Modality</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Ownership</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Location</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Status</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Timestamp</th>
                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ethereal-surface text-sm">
                  {jobs.map((job, idx) => (
                    <tr key={job.id} className="hover:bg-ethereal-surface-low transition-colors group animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <td className="px-8 py-6">
                        <p className="font-bold text-ethereal-on-surface truncate max-w-[200px] cursor-pointer group-hover:text-ethereal-primary transition-colors"
                          onClick={() => setDetailModalId(job.id)}>
                          {job.title}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-40 mt-1">
                          {job.employmentType.replace('_', ' ')} • Deadline: {formatDate(job.applicationDeadline)}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-ethereal-primary/5 text-ethereal-primary rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {job.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-ethereal-on-surface font-bold">{job.employerCompany || '—'}</p>
                        <p className="text-[10px] font-medium text-ethereal-on-surface-variant opacity-60">{job.employerName}</p>
                      </td>
                      <td className="px-6 py-6 text-ethereal-on-surface-variant font-medium">
                        {job.cityName}, {job.stateName}
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[job.status] || ''}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-ethereal-on-surface-variant font-bold tracking-wider">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => setDetailModalId(job.id)} className="p-2 rounded-xl bg-gray-900 text-ethereal-on-surface-variant hover:text-blue-600 hover:shadow-lg transition-all">
                            <FiEye className="w-4 h-4" />
                          </button>
                          {job.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleApprove(job.id)} disabled={actionLoading === job.id} className="p-2 rounded-xl bg-gray-900 text-[#db7c26] hover:shadow-lg transition-all">
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setRejectModalId(job.id); setRejectReason(''); }} className="p-2 rounded-xl bg-gray-900 text-rose-500 hover:shadow-lg transition-all">
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(job.id)} disabled={actionLoading === job.id} className="p-2 rounded-xl bg-gray-900 text-rose-700 hover:shadow-lg transition-all">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">
                Viewing Plate {page + 1} of {totalPages} <span className="mx-2 opacity-20">|</span> Total Items: {totalElements}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                  className="p-3 rounded-2xl bg-gray-900 text-ethereal-on-surface hover:text-ethereal-primary shadow-sm disabled:opacity-30 transition-all">
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                    if (pageNum < 0 || pageNum >= totalPages) return null;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${page === pageNum ? 'bg-ethereal-primary text-white shadow-lg' : 'bg-gray-900 text-ethereal-on-surface hover:bg-ethereal-surface-low'}`}>
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                  className="p-3 rounded-2xl bg-gray-900 text-ethereal-on-surface hover:text-ethereal-primary shadow-sm disabled:opacity-30 transition-all">
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal Overlay */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-[60] p-6 animate-fadeIn">
          <div className="glass-card bg-gray-900 p-10 rounded-[2.5rem] border-none shadow-2xl w-full max-w-lg animate-scaleIn">
            <h3 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-4 uppercase">Asset Rejection Protocol</h3>
            <p className="text-sm font-medium text-ethereal-on-surface-variant mb-8 opacity-60">Define the reason for non-compliance. This metadata will be transmitted to the entity owner.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Detailed reason for decommissioning..."
              className="w-full px-6 py-5 bg-ethereal-surface border border-transparent rounded-[1.5rem] focus:bg-gray-900 focus:ring-4 focus:ring-rose-100 transition-all outline-none resize-none min-h-[160px] text-sm font-medium" />
            <div className="flex justify-end gap-4 mt-10">
              <button onClick={() => setRejectModalId(null)}
                className="btn-ethereal-secondary">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading === rejectModalId}
                className="px-8 py-4 bg-rose-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20 disabled:opacity-50 transition-all">
                {actionLoading === rejectModalId ? 'Processing...' : 'Execute Decommission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Analysis Overlay */}
      {detailModalId && (
        <AdminJobDetailModal
          jobId={detailModalId}
          onClose={() => setDetailModalId(null)}
          onUpdated={fetchJobs}
        />
      )}
      
      <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, jobId: null })}
          onConfirm={confirmDelete}
          title="Delete Job Posting"
          message="Are you sure you want to delete this job posting? This action cannot be undone."
          confirmText="Delete Job"
          isDanger={true}
      />
    </div>
  );
};

export default AdminJobsPage;





