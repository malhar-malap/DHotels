import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiX, FiUser, FiActivity, FiMapPin, FiMail, FiPhone, FiCalendar, FiShield, FiTag, FiKey, FiAlertCircle, FiCheck } from 'react-icons/fi';

const AdminUserDetailModal = ({ userId, onClose, onUpdated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, roles
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const availableRoles = ['BUYER', 'SELLER', 'EMPLOYER', 'JOB_SEEKER', 'ADMIN'];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUserDetails(userId);
        setData(response.data.data);
        setSelectedRoles(response.data.data.profile.roles || []);
      } catch (error) {
        toast.error('Failed to load user details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [userId, onClose]);

  const handleToggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (selectedRoles.length === 0) {
      toast.error('User must have at least one role');
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.changeUserRole(userId, { roles: selectedRoles });
      toast.success('User roles updated successfully');
      onUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update roles');
    } finally {
      setActionLoading(false);
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'suspend', 'activate', 'delete'
  const [actionReason, setActionReason] = useState('');

  const executeStatusChange = async () => {
    if ((confirmAction === 'suspend' || confirmAction === 'delete') && !actionReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setActionLoading(true);
    try {
      if (confirmAction === 'suspend') {
        await adminAPI.suspendUser(userId, actionReason);
      } else if (confirmAction === 'activate') {
        await adminAPI.activateUser(userId);
      } else if (confirmAction === 'delete') {
        await adminAPI.deleteUser(userId);
        toast.success(`User deleted successfully`);
        onUpdated();
        onClose();
        return;
      }
      toast.success(`User ${confirmAction}d successfully`);
      onUpdated();
      setShowConfirmModal(false);
      setActionReason('');
    } catch (error) {
      toast.error(`Failed to ${confirmAction} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = (action) => {
    setConfirmAction(action);
    setActionReason('');
    setShowConfirmModal(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-[70]">
        <div className="glass-card p-12 rounded-[2.5rem] border-none text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
          <p className="text-ethereal-on-surface-variant font-black uppercase tracking-[0.3em] mt-8 text-[10px]">Accessing Identity Vault...</p>
        </div>
      </div>
    );
  }

  const { profile, listingCount, jobCount, inquiryCount, applicationCount } = data;

  return (
    <div className="fixed inset-0 bg-ethereal-surface/60 backdrop-blur-sm flex items-center justify-center z-[70] p-6 animate-fadeIn">
      <div className="glass-card bg-gray-900/95 rounded-[3rem] border-none shadow-2xl w-full max-w-5xl h-[96vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Identity Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-5 text-white relative flex items-center justify-between shrink-0 overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-primary-500/10 border border-primary-400/20 text-primary-400 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
              {profile.fullName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight uppercase leading-none mb-2">{profile.fullName}</h2>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  profile.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {profile.status}
                </span>
                <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Enrolled {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all relative z-10">
            <FiX className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Structural Navigation */}
        <div className="flex border-b border-white/5 px-8 bg-gray-950 shrink-0">
          <button onClick={() => setActiveTab('profile')}
            className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'profile' ? 'text-primary-400' : 'text-gray-400 opacity-60 hover:opacity-100'
            }`}>
            Identity Schematic
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
          </button>
          <button onClick={() => setActiveTab('roles')}
            className={`ml-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'roles' ? 'text-primary-400' : 'text-gray-400 opacity-60 hover:opacity-100'
            }`}>
            Protocol Privileges
            {activeTab === 'roles' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
          </button>
        </div>

        {/* Dynamic Context Canvas */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'profile' ? (
            <div className="space-y-12 animate-fadeIn">
              {/* Communication Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-6 p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-primary-400/20 transition-all">
                  <div className="w-14 h-14 bg-gray-900 rounded-[1.2rem] flex items-center justify-center text-blue-500 shadow-sm">
                    <FiMail className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-40">Primary Email</p>
                    <p className="text-base font-black text-ethereal-on-surface tracking-tight lowercase">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-primary-400/20 transition-all">
                  <div className="w-14 h-14 bg-gray-900 rounded-[1.2rem] flex items-center justify-center text-purple-500 shadow-sm">
                    <FiPhone className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-40">Direct Line</p>
                    <p className="text-base font-black text-ethereal-on-surface tracking-tight">{profile.mobileNumber || 'Not provisioned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-primary-400/20 transition-all">
                  <div className="w-14 h-14 bg-gray-900 rounded-[1.2rem] flex items-center justify-center text-primary-300 shadow-sm">
                    <FiMapPin className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-40">Geographic Node</p>
                    <p className="text-base font-black text-ethereal-on-surface tracking-tight">{profile.city ? `${profile.city}, ${profile.state}` : 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-primary-400/20 transition-all">
                  <div className="w-14 h-14 bg-gray-900 rounded-[1.2rem] flex items-center justify-center text-amber-500 shadow-sm">
                    <FiShield className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-40">Trust Index</p>
                    <p className="text-base font-black text-ethereal-on-surface tracking-tight">{profile.isVerifiedBuyer ? 'Verified Entity' : 'Pending Review'}</p>
                  </div>
                </div>
              </div>

              {/* Engagement Analytics */}
              <div className="space-y-6">
                <h3 className="section-label tracking-[0.2em] flex items-center gap-3">
                  <FiActivity className="text-primary-400" /> Platform Volumetrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Listings', val: listingCount ?? 0 },
                    { label: 'Roles', val: jobCount ?? 0 },
                    { label: 'Inquiries', val: inquiryCount ?? 0 },
                    { label: 'Apps', val: applicationCount ?? 0 }
                  ].map(stat => (
                    <div key={stat.label} className="glass-card bg-gray-800/40 border border-white/5 p-6 rounded-[2rem] text-center hover:bg-gray-900 transition-all duration-300 shadow-inner group">
                      <p className="text-3xl font-black text-gray-200 tracking-tighter mb-1 group-hover:scale-110 transition-transform">{stat.val}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] opacity-40">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Controls */}
              <div className="pt-10 border-t border-ethereal-surface flex flex-wrap gap-4">
                {profile.status === 'ACTIVE' ? (
                  <button onClick={() => handleStatusChange('suspend')} disabled={actionLoading}
                    className="px-8 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-3 border border-rose-100/50">
                    <FiAlertCircle className="w-4 h-4" /> Suspend Interface
                  </button>
                ) : (
                  <button onClick={() => handleStatusChange('activate')} disabled={actionLoading}
                    className="px-8 py-4 bg-primary-400/10 text-primary-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-300/20 transition-all flex items-center gap-3 border border-primary-300/20/50">
                    <FiCheck className="w-4 h-4" /> Restore Access
                  </button>
                )}
                <button onClick={() => handleStatusChange('delete')}
                  className="px-8 py-4 bg-ethereal-surface text-ethereal-on-surface-variant rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                  Erase Data History
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-fadeIn">
              <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-200/30 flex gap-6 items-center">
                <div className="w-16 h-16 bg-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-sm shrink-0">
                  <FiKey className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-[0.2em] mb-1">Authorization Matrix Control</h4>
                  <p className="text-xs text-amber-800/70 font-medium leading-relaxed">
                    Changing identity roles will reconfigure access levels across all restricted sub-modules. 
                    Adding 'ADMIN' grants absolute control over all administrative schemas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRoles.map(role => (
                  <button key={role} onClick={() => handleToggleRole(role)}
                    className={`p-6 rounded-[2rem] border-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${
                      selectedRoles.includes(role) 
                        ? 'border-primary-400 bg-primary-500/5 text-primary-400 shadow-sm' 
                        : 'border-ethereal-surface text-ethereal-on-surface-variant opacity-60 hover:opacity-100 hover:border-primary-400/20 bg-gray-900'
                    }`}>
                    {role.replace('_', ' ')}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedRoles.includes(role) ? 'bg-primary-500 border-primary-400 text-white' : 'border-ethereal-surface'
                    }`}>
                      {selectedRoles.includes(role) && <FiCheck className="w-3 h-3" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-10 border-t border-ethereal-surface flex justify-end">
                <button onClick={handleSaveRoles} disabled={actionLoading}
                  className="px-10 py-5 bg-primary-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary-400/20 hover:bg-primary-700 transition-all disabled:opacity-50">
                  {actionLoading ? 'Syncing...' : 'Update Authorization'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-6 animate-fadeIn">
          <div className="glass-card bg-gray-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {confirmAction === 'suspend' && 'Suspend User Account'}
              {confirmAction === 'activate' && 'Activate User Account'}
              {confirmAction === 'delete' && 'Delete User Account'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {confirmAction === 'suspend' && 'Are you sure you want to suspend this account? They will lose access to the platform.'}
              {confirmAction === 'activate' && 'Are you sure you want to restore access for this account?'}
              {confirmAction === 'delete' && 'CRITICAL: Are you sure you want to PERMANENTLY delete this user? This cannot be undone.'}
            </p>
            
            {(confirmAction === 'suspend' || confirmAction === 'delete') && (
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2">Reason (Required)</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-400"
                  placeholder="Enter reason..."
                  rows="3"
                />
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeStatusChange}
                disabled={actionLoading}
                className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors ${
                  confirmAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailModal;





