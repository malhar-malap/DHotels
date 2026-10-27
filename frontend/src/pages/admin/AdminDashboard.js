import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiUsers, FiList, FiBriefcase, FiMail, FiCheck, FiX, FiEye, FiCreditCard, FiChevronRight, FiCheckSquare, FiAward, FiShield, FiPhone, FiFileText } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [commStats, setCommStats] = useState({ newMessages: 0, pendingConsultations: 0, newMandates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [response, contactStats, consultStats, mandateStats] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getContactMessageStats(),
        adminAPI.getConsultationStats(),
        adminAPI.getMandateStats()
      ]);
      setStats(response.data.data);
      setCommStats({
        newMessages: contactStats.data.data.newMessages || 0,
        pendingConsultations: consultStats.data.data.pendingConsultations || 0,
        newMandates: mandateStats.data.data.newMandates || 0
      });
    } catch (error) { console.error('Error fetching stats:', error); }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Network Users', value: stats?.totalUsers || 0, icon: FiUsers, gradient: 'from-blue-500/20 to-indigo-500/20', accent: 'text-blue-600', label: stats?.newUsersToday ? `+${stats.newUsersToday} recently` : 'Stable growth' },
    { title: 'Active Listings', value: stats?.activeListings || 0, icon: FiList, gradient: 'from-[#d8572a]/20 to-[#d8572a]/20', accent: 'text-[#db7c26]', label: stats?.pendingListings ? `${stats.pendingListings} pending review` : 'All caught up' },
    { title: 'Career Opportunities', value: stats?.activeJobs || 0, icon: FiBriefcase, gradient: 'from-purple-500/20 to-pink-500/20', accent: 'text-purple-600', label: stats?.pendingJobs ? `${stats.pendingJobs} processing` : 'Optimized flow' },
    { title: 'Strategic Inquiries', value: stats?.inquiriesToday || 0, icon: FiMail, gradient: 'from-orange-500/20 to-red-500/20', accent: 'text-orange-600', label: '24h activity' }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="section-label mb-2 block tracking-[0.2em]">Administrative Control</span>
          <h1 className="text-4xl display-title uppercase tracking-tighter">Command Center</h1>
          <p className="text-ethereal-on-surface-variant font-medium mt-1">Platform-wide analytics and strategic orchestration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat, idx) => (
            <div key={stat.title} className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] animate-fadeIn group hover:bg-gray-800/60 hover:border-white/10 transition-all duration-500 shadow-2xl relative overflow-hidden" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <stat.icon className={`w-8 h-8 ${stat.accent}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full border border-white/5">{stat.label}</span>
              </div>
              <h3 className="text-5xl font-black text-white mb-2 tracking-tighter relative z-10">{stat.value.toLocaleString()}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] relative z-10">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Core Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-xl border border-white/5 p-10 md:p-12 rounded-[2.5rem] shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-ethereal-on-surface tracking-tight">Active Pipeline</h2>
              <Link to="/admin/listings?status=PENDING" className="text-ethereal-primary text-sm font-black uppercase tracking-widest hover:underline">Full Audit</Link>
            </div>
            <div className="grid gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 bg-gray-900/50 border border-white/5 rounded-3xl group hover:bg-gray-800/80 hover:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="p-4 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/20"><FiCheckSquare size={22} /></div>
                  <div>
                    <p className="font-bold text-ethereal-on-surface text-sm md:text-base">Listings Vetting</p>
                    <p className="text-xs font-medium text-ethereal-on-surface-variant opacity-60 leading-relaxed">{stats?.pendingListings || 0} assets awaiting clinical verification</p>
                  </div>
                </div>
                <Link to="/admin/listings?status=PENDING" className="btn-ethereal-secondary !px-6 !py-2.5 text-xs font-black w-full sm:w-auto text-center">Verify</Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 bg-gray-900/50 border border-white/5 rounded-3xl group hover:bg-gray-800/80 hover:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/20"><FiAward size={22} /></div>
                  <div>
                    <p className="font-bold text-ethereal-on-surface text-sm md:text-base">Career Path Approval</p>
                    <p className="text-xs font-medium text-ethereal-on-surface-variant opacity-60 leading-relaxed">{stats?.pendingJobs || 0} professional roles in processing</p>
                  </div>
                </div>
                <Link to="/admin/jobs?status=PENDING" className="btn-ethereal-secondary !px-6 !py-2.5 text-xs font-black w-full sm:w-auto text-center">Audit</Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 bg-gray-900/50 border border-white/5 rounded-3xl group hover:bg-gray-800/80 hover:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/20"><FiShield size={22} /></div>
                  <div>
                    <p className="font-bold text-ethereal-on-surface text-sm md:text-base">KYC Integrity Suite</p>
                    <p className="text-xs font-medium text-ethereal-on-surface-variant opacity-60 leading-relaxed">{stats?.pendingVerifications || 0} buyer identity requests</p>
                  </div>
                </div>
                <Link to="/admin/verifications" className="btn-ethereal-secondary !px-6 !py-2.5 text-xs font-black w-full sm:w-auto text-center">Authorize</Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-10 md:p-12 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-8">Pulse Report</h2>
            <div className="space-y-6">
              {[
                { label: 'New Entities', value: stats?.newUsersToday, color: 'bg-green-500' },
                { label: 'Asset Intake', value: stats?.newListingsToday, color: 'bg-blue-500' },
                { label: 'Network Inquiries', value: stats?.inquiriesToday, color: 'bg-orange-500' },
                { label: 'Talent Moves', value: stats?.applicationsToday, color: 'bg-purple-500' },
                { label: 'Weekly Growth', value: stats?.newUsersWeek, color: 'bg-pink-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 ${item.color} rounded-full`}></div>
                    <span className="text-sm font-bold text-ethereal-on-surface-variant uppercase tracking-wider group-hover:text-ethereal-primary transition-colors">{item.label}</span>
                  </div>
                  <span className="text-lg font-black text-ethereal-on-surface">{item.value || 0}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 rounded-3xl bg-ethereal-primary/5 border border-ethereal-primary/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-primary mb-2">Systems Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-ethereal-on-surface">Core Infrastructure Nominal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Strategy Tools */}
        <div className="space-y-8">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-12 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-10">Ecosystem Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { to: '/admin/listings', icon: FiList, label: 'Asset Library', color: 'from-blue-500 to-indigo-600' },
                { to: '/admin/jobs', icon: FiBriefcase, label: 'Talent Pool', color: 'from-purple-500 to-pink-600' },
                { to: '/admin/users', icon: FiUsers, label: 'Entity Directory', color: 'from-[#d8572a] to-[#db7c26]' },
                { to: '/admin/payments', icon: FiCreditCard, label: 'Financial Core', color: 'from-emerald-500 to-teal-600' },
                { to: '/admin/logs', icon: FiShield, label: 'System Logs', color: 'from-slate-500 to-gray-600' },
              ].map((link) => (
                <Link 
                    key={link.label} 
                    to={link.to} 
                    className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-ethereal-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-start relative overflow-hidden"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} mb-6 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                      <link.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-white mb-2 relative z-10">{link.label}</h3>
                    <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2 relative z-10">
                      Execute Node <FiChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${link.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none`} />
                  </Link>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-12 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-bold text-ethereal-on-surface tracking-tight mb-10">Communications & Enquiries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { to: '/admin/contact-messages', icon: FiMail, label: 'Contact Messages', color: 'from-cyan-500 to-blue-600', badge: commStats.newMessages },
                { to: '/admin/consultations', icon: FiPhone, label: 'Call Requests', color: 'from-green-500 to-emerald-600', badge: commStats.pendingConsultations },
                { to: '/admin/mandates', icon: FiFileText, label: 'Mandates', color: 'from-amber-500 to-orange-600', badge: commStats.newMandates },
              ].map((link) => (
                <Link 
                    key={link.label} 
                    to={link.to} 
                    className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-ethereal-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-start relative overflow-hidden"
                  >
                    {link.badge > 0 && (
                      <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center animate-pulse shadow-md border border-gray-900 relative z-20">
                        {link.badge}
                      </span>
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} mb-6 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                      <link.icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-white mb-2 relative z-10">{link.label}</h3>
                    <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2 relative z-10">
                      Execute Node <FiChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${link.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none`} />
                  </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;




