import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiList, FiMail, FiBriefcase, FiFileText, 
  FiUser, FiPlus, FiEdit, FiEye, FiLogOut, 
  FiSettings, FiShield, FiMenu, FiX, FiActivity, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { userAPI } from '../../services/api';
import VerificationModal from '../../components/VerificationModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [showVerModal, setShowVerModal] = useState(false);

  useEffect(() => {
    const fetchVer = async () => {
      try {
        const res = await userAPI.getVerificationStatus();
        if (res.data?.data) setVerification(res.data.data);
      } catch (err) {
        console.error('Error fetching verification status:', err);
      }
    }
    if (user) fetchVer();
  }, [user]);

  const quickActions = [
    { title: 'Post Listing', icon: FiPlus, href: '/listings/create', color: 'from-blue-500 to-indigo-600' },
    { title: 'Post Job', icon: FiBriefcase, href: '/healthcare-jobs-india/create', color: 'from-purple-500 to-pink-600' },
    { title: 'Browse', icon: FiEye, href: '/listings', color: 'from-[#d8572a] to-[#db7c26]' },
    { title: 'Find Jobs', icon: FiFileText, href: '/healthcare-jobs-india', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <DashboardLayout activeTab="Overview">
      <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12 space-y-10">
          
          {/* Welcome Header */}
          <section className="animate-fadeIn">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none mb-4">
              Hello, <span className="text-gradient underline decoration-[#d8572a]/20">{user?.fullName?.split(' ')[0]}</span>
            </h1>
            <p className="text-sm font-bold text-[#e5e7eb] opacity-60 max-w-2xl tracking-tight leading-relaxed">
              Your institutional command center is active. Monitor your healthcare ecosystem, track analytics, and manage stakeholder inquiries.
            </p>
          </section>

          {/* Quick Actions Grid */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Link 
                  key={action.title} 
                  to={action.href} 
                  className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-ethereal-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-start relative overflow-hidden"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} mb-6 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white mb-2 relative z-10">{action.title}</h3>
                  <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2 relative z-10">
                    Execute Node <FiChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${action.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none`} />
                </Link>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Information */}
            <section className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Identity Profile</h2>
              </div>
              
              <div className="glass-card overflow-hidden shadow-2xl relative border border-white/5 bg-gray-800/40 backdrop-blur-xl rounded-[2.5rem]">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d8572a]/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="p-8 md:p-12 space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2 bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          <FiMail className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Institutional Email</p>
                      </div>
                      <p className="font-black text-white text-sm tracking-tight truncate pl-14" title={user?.email}>{user?.email || 'unassigned@dhacquisitions.com'}</p>
                    </div>
                    
                    <div className="space-y-2 bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                          <FiActivity className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Contact</p>
                      </div>
                      <p className="font-black text-white text-lg tracking-tight pl-14">{user?.mobileNumber || '+91 - Not Set'}</p>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4 bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#d8572a]/20 text-[#d8572a] flex items-center justify-center shadow-[0_0_15px_rgba(216,87,42,0.3)]">
                          <FiShield className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Authorization Nodes</p>
                      </div>
                      <div className="flex flex-wrap gap-3 pl-14 pt-1">
                        {Array.from(new Set(user?.roles || [])).map(role => (
                          <span key={role} className="px-4 py-2 bg-[#d8572a]/10 border border-[#d8572a]/30 text-[#db7c26] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_10px_rgba(216,87,42,0.2)]">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Verification Sentinel */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-white tracking-tight px-2 uppercase tracking-[0.1em]">Protocol Check</h2>
              <div className="glass-card p-8 md:p-10 h-fit shadow-2xl relative overflow-hidden group border border-white/5 bg-gray-800/40 backdrop-blur-xl rounded-[2.5rem]">
                 <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none" />
                 <div className={`absolute inset-0 opacity-[0.02] transition-opacity duration-700 pointer-events-none flex items-center justify-center`}>
                    <FiShield className="w-64 h-64" />
                 </div>
                 
                 <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(216,87,42,0.3)] transition-transform group-hover:scale-110 duration-500 ${verification?.status === 'APPROVED' ? 'bg-[#d8572a]/20 text-[#db7c26] border border-[#d8572a]/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                        <FiShield className="w-7 h-7" />
                      </div>
                      <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-md ${
                        verification?.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        verification?.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        verification?.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {verification?.status || 'Unverified'}
                      </div>
                    </div>

                    {!verification ? (
                      <div className="space-y-4 flex-1">
                        <h3 className="font-black text-2xl text-white tracking-tight">KYC Pending</h3>
                        <p className="text-sm font-medium text-gray-400 leading-relaxed">Submit institutional credentials to validate your entity and access premium features.</p>
                        <button 
                          onClick={() => setShowVerModal(true)}
                          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white transition-all uppercase tracking-widest group/btn shadow-lg"
                        >
                          Initiate Protocol
                          <FiActivity className="w-4 h-4 text-[#db7c26] group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                             <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Document Type</span>
                             <span className="text-sm font-black text-white truncate">{verification.docType}</span>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                             <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Submission Date</span>
                             <span className="text-sm font-black text-white">{new Date(verification.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {verification.status === 'REJECTED' && (
                          <div className="p-5 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Protocol Failure Reason</p>
                            <p className="text-sm font-medium text-red-200 leading-relaxed">{verification.rejectionReason}</p>
                          </div>
                        )}
                        
                        <div className="pt-6 mt-auto border-t border-white/5">
                           <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden shadow-inner">
                              <div className={`h-full transition-all duration-1000 relative ${verification?.status === 'APPROVED' ? 'w-full bg-[#d8572a]' : verification?.status === 'PENDING' ? 'w-2/3 bg-orange-500' : 'w-1/3 bg-red-500'}`}>
                                <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                              </div>
                           </div>
                           <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-4 text-center flex items-center justify-center gap-2">
                             <span className="w-1 h-1 rounded-full bg-current"></span>
                             Identity Node Integrity
                             <span className="w-1 h-1 rounded-full bg-current"></span>
                           </p>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </section>
          </div>
        </div>
        {showVerModal && (
          <VerificationModal
            isOpen={showVerModal}
            onClose={() => setShowVerModal(false)}
            onSuccess={() => {
              setShowVerModal(false);
              window.location.reload();
            }}
          />
        )}
    </DashboardLayout>
  );
};

export default DashboardPage;
