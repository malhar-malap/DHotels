import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminAPI, masterAPI } from '../../services/api';
import AdminUserDetailModal from './AdminUserDetailModal';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { FiUser, FiSearch, FiFilter, FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiArrowLeft, FiSlash, FiCheckCircle } from 'react-icons/fi';

const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState('');
  const [page, setPage] = useState(0);

  // Modals
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        keyword: keyword || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        isVerified: isVerifiedFilter !== '' ? isVerifiedFilter : undefined
      };

      const response = await adminAPI.getUsers(params);
      const data = response.data.data;
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, keyword, roleFilter, statusFilter, isVerifiedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearFilters = () => {
    setKeyword('');
    setRoleFilter('');
    setStatusFilter('');
    setIsVerifiedFilter('');
    setPage(0);
  };

  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, userId: id });
  };

  const confirmDelete = async () => {
    const id = confirmModal.userId;
    setConfirmModal({ isOpen: false, userId: null });
    if (!id) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
              <span className="section-label tracking-[0.2em]">Governance Module</span>
            </div>
            <h1 className="text-4xl display-title uppercase tracking-tighter">Identity Registry</h1>
            <p className="text-ethereal-on-surface-variant font-medium mt-1">
              Overseeing <span className="text-ethereal-on-surface">{totalElements}</span> active computational identities
            </p>
          </div>
          <div className="glass-card px-8 py-4 rounded-[1.5rem] border-none flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant opacity-40">System Population</span>
            <span className="text-3xl font-black text-ethereal-primary tracking-tighter">{totalElements}</span>
          </div>
        </div>

        {/* Intelligence Filters */}
        <div className="glass-card p-8 rounded-[2rem] border-none mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[320px] relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-ethereal-on-surface-variant opacity-40" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="Identity Lookup (Name, Email, Entity)..."
                className="w-full pl-14 pr-6 py-4 bg-ethereal-surface-low border border-transparent rounded-[1.2rem] text-sm font-medium focus:bg-gray-900 focus:ring-4 focus:ring-ethereal-primary/10 outline-none transition-all shadow-sm shadow-black/5" />
            </div>

            <div className="flex flex-wrap gap-3">
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                className="px-6 py-4 bg-ethereal-surface-low border border-transparent rounded-[1.2rem] text-sm font-black uppercase tracking-widest text-ethereal-on-surface-variant outline-none transition-all focus:bg-gray-900 shadow-sm shadow-black/5 cursor-pointer">
                <option value="">Functional Roles</option>
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller</option>
                <option value="EMPLOYER">Employer</option>
                <option value="JOB_SEEKER">Job Seeker</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="px-6 py-4 bg-ethereal-surface-low border border-transparent rounded-[1.2rem] text-sm font-black uppercase tracking-widest text-ethereal-on-surface-variant outline-none transition-all focus:bg-gray-900 shadow-sm shadow-black/5 cursor-pointer">
                <option value="">Operational Status</option>
                <option value="ACTIVE">Online</option>
                <option value="SUSPENDED">Restricted</option>
                <option value="INACTIVE">Dormant</option>
              </select>

              <select value={isVerifiedFilter} onChange={(e) => { setIsVerifiedFilter(e.target.value); setPage(0); }}
                className="px-6 py-4 bg-ethereal-surface-low border border-transparent rounded-[1.2rem] text-sm font-black uppercase tracking-widest text-ethereal-on-surface-variant outline-none transition-all focus:bg-gray-900 shadow-sm shadow-black/5 cursor-pointer">
                <option value="">KYC Verification</option>
                <option value="verified">Verified Users</option>
                <option value="unverified">Unverified Users</option>
              </select>

              {(keyword || roleFilter || statusFilter || isVerifiedFilter) && (
                <button onClick={clearFilters} className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-[1.2rem] transition-all shadow-sm shadow-rose-500/10 active:scale-95" title="Purge Filters">
                  <FiSlash className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Identity Matrix Grid */}
        <div className="glass-card rounded-[2.5rem] border-none overflow-hidden animate-fadeIn">
          {loading ? (
            <div className="p-32 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
              <p className="text-ethereal-on-surface-variant font-black uppercase tracking-[0.3em] mt-8 text-[10px]">Decoding Encrypted Nodes...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-32 text-center">
              <div className="w-24 h-24 bg-ethereal-surface-low rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <FiUser className="w-10 h-10 text-ethereal-on-surface-variant opacity-20" />
              </div>
              <h3 className="text-2xl font-bold text-ethereal-on-surface uppercase tracking-tight">Zero Matches</h3>
              <p className="text-ethereal-on-surface-variant font-medium mt-2">The search parameters yielded no identifiable entities.</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-[13px]">
              <div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ethereal-surface-low border-b border-ethereal-surface">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Genetic Identity</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Permissions</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Global Position</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Lifecycle</th>
                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Initialized</th>
                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ethereal-surface">
                  {users.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-ethereal-surface-low/50 group transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-ethereal-primary/10 text-ethereal-primary rounded-[1rem] flex items-center justify-center font-black text-lg shadow-sm border border-ethereal-primary/5">
                            {user.fullName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-ethereal-on-surface flex items-center gap-2 cursor-pointer group-hover:text-ethereal-primary transition-all duration-300"
                              onClick={() => setSelectedUserId(user.id)}>
                              {user.fullName}
                              {user.isVerifiedBuyer && <FiCheckCircle className="text-primary-300 w-4 h-4 shadow-sm" title="Validated Entity" />}
                            </p>
                            <p className="text-[11px] font-medium text-ethereal-on-surface-variant opacity-50 lowercase tracking-wide">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map(role => (
                            <span key={role} className="px-3 py-1 bg-gray-900 border border-ethereal-surface rounded-lg text-[9px] font-black uppercase tracking-widest text-ethereal-on-surface-variant opacity-70">
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-ethereal-on-surface font-semibold tracking-tight">
                        {user.city ? `${user.city}, ${user.state}` : <span className="text-ethereal-on-surface-variant opacity-20 italic">No Coordinates</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.15em] uppercase border ${
                          user.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-rose-50 text-rose-700 border-rose-200/50'
                        }`}>
                          {user.status === 'ACTIVE' ? 'Optimal' : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-ethereal-on-surface-variant font-bold tracking-wider opacity-60">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:translate-x-4 md:group-hover:translate-x-0">
                          <button onClick={() => setSelectedUserId(user.id)}
                            className="p-3 bg-gray-900 text-ethereal-on-surface-variant hover:text-ethereal-primary hover:shadow-xl hover:-translate-y-1 rounded-[1.2rem] shadow-sm transition-all"
                            title="Analytical View">
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(user.id)}
                            className="p-3 bg-gray-900 text-ethereal-on-surface-variant hover:text-rose-600 hover:shadow-xl hover:-translate-y-1 rounded-[1.2rem] shadow-sm transition-all"
                            title="Purge Identity">
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          )}

          {/* Sequential Pagination Layer */}
          {totalPages > 1 && (
            <div className="bg-ethereal-surface-low/30 px-10 py-10 border-t border-ethereal-surface flex items-center justify-between">
              <span className="text-[10px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.3em]">
                Page {page + 1} <span className="mx-3 opacity-20">/</span> {totalPages}
              </span>
              <div className="flex gap-4">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-4 bg-gray-900 rounded-[1.2rem] shadow-sm hover:shadow-md disabled:opacity-20 hover:-translate-x-1 transition-all">
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-4 bg-gray-900 rounded-[1.2rem] shadow-sm hover:shadow-md disabled:opacity-20 hover:translate-x-1 transition-all">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Identity Depth Analysis Overlay */}
      {selectedUserId && (
        <AdminUserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdated={fetchUsers}
        />
      )}
      
      <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, userId: null })}
          onConfirm={confirmDelete}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          isDanger={true}
      />
    </div>
  );
};

export default AdminUsersPage;





