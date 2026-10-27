import React, { useState, useEffect } from 'react';
import { adminAPI, jobsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiX, FiMapPin, FiBriefcase, FiCalendar, FiUser, FiMail, FiDollarSign, FiClock, FiFileText, FiChevronRight, FiCheck, FiArrowRight } from 'react-icons/fi';

const AdminJobDetailModal = ({ jobId, onClose, onUpdated }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'applications'

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getById(jobId);
      setJob(response.data.data);
    } catch (error) {
      toast.error('Failed to load job details');
      onClose();
    }
    setLoading(false);
  };

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const response = await adminAPI.getJobApplications(jobId, { page: 0, size: 50 });
      setApplications(response.data.data.content || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
    setAppsLoading(false);
  };

  const handleApprove = async () => {
    try {
      await adminAPI.approveJob(jobId);
      toast.success('Job posting approved');
      fetchJob();
      if (onUpdated) onUpdated();
    } catch (error) {
      toast.error('Failed to approve job');
    }
  };

  const handleArchive = async () => {
    try {
      await adminAPI.archiveJob(jobId);
      toast.success('Role archived successfully');
      fetchJob();
      if (onUpdated) onUpdated();
    } catch (error) {
      toast.error('Failed to archive role');
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
    CLOSED: 'bg-slate-50 text-slate-700 border-slate-200/50',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ethereal-surface/80 backdrop-blur-md flex items-center justify-center z-[70]">
        <div className="glass-card p-12 rounded-[2.5rem] border-none text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
          <p className="text-ethereal-on-surface-variant font-black uppercase tracking-[0.3em] mt-8 text-[10px]">Decoding Job Profile...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-ethereal-surface/60 backdrop-blur-sm flex items-center justify-center z-[70] p-6 animate-fadeIn">
      <div className="glass-card bg-gray-900/95 rounded-[3rem] border-none shadow-2xl w-full max-w-5xl h-[96vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header Section */}
        <div className="bg-ethereal-surface-low/30 px-12 py-10 border-b border-ethereal-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="bg-ethereal-primary/10 p-5 rounded-[1.5rem] shadow-sm border border-ethereal-primary/5">
              <FiBriefcase className="w-8 h-8 text-ethereal-primary" />
            </div>
            <div>
              <span className="section-label tracking-[0.2em] mb-1">Human Capital Asset</span>
              <h2 className="text-3xl display-title uppercase tracking-tighter leading-none">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[job.status] || ''}`}>
                  {job.status}
                </span>
                <span className="text-ethereal-on-surface-variant text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-40">
                  <FiCalendar className="w-3.5 h-3.5" /> Initialized {formatDate(job.createdAt)}
                </span>
                <span className="text-ethereal-on-surface-variant text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-40">
                  <FiClock className="w-3.5 h-3.5" /> Deadline {formatDate(job.applicationDeadline)}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 text-ethereal-on-surface-variant hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all">
            <FiX className="w-7 h-7" />
          </button>
        </div>

        {/* Navigation Layers */}
        <div className="px-12 bg-gray-900 flex gap-10 shrink-0">
          <button 
            onClick={() => setActiveTab('details')}
            className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all relative ${activeTab === 'details' ? 'border-ethereal-primary text-ethereal-primary' : 'border-transparent text-ethereal-on-surface-variant opacity-40 hover:opacity-100'}`}
          >
            Structural Details
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-3 relative ${activeTab === 'applications' ? 'border-ethereal-primary text-ethereal-primary' : 'border-transparent text-ethereal-on-surface-variant opacity-40 hover:opacity-100'}`}
          >
            Entity Applications <span className="bg-ethereal-surface px-2.5 py-1 rounded-full text-[9px] font-black ml-1">{job.applicationCount || 0}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'details' ? (
            <div className="space-y-12 animate-fadeIn">
              {/* Asset Logistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-ethereal-primary/10 transition-all">
                  <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-40"><FiUser className="w-3.5 h-3.5" /> Stakeholder</p>
                  <p className="text-base font-black text-ethereal-on-surface tracking-tight">{job.employer?.companyName || 'N/A'}</p>
                  <p className="text-[10px] font-medium text-ethereal-primary uppercase tracking-widest mt-1">{job.employer?.fullName}</p>
                </div>
                <div className="p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-ethereal-primary/10 transition-all">
                  <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-40"><FiMapPin className="w-3.5 h-3.5" /> Region</p>
                  <p className="text-base font-black text-ethereal-on-surface tracking-tight">{job.city?.name || 'Remote Config'}</p>
                  <p className="text-[10px] font-medium text-ethereal-on-surface-variant uppercase tracking-widest mt-1 opacity-60">{job.city?.stateName}</p>
                </div>
                <div className="p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-ethereal-primary/10 transition-all">
                  <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-40"><FiClock className="w-3.5 h-3.5" /> Seniority</p>
                  <p className="text-base font-black text-ethereal-on-surface tracking-tight capitalize">{job.experienceRequired?.replace('_', ' ') || 'Internal'}</p>
                  <p className="text-[10px] font-medium text-ethereal-on-surface-variant uppercase tracking-widest mt-1 opacity-60">{job.employmentType?.replace('_', ' ')}</p>
                </div>
                <div className="p-6 bg-ethereal-surface rounded-[2rem] border border-transparent hover:border-ethereal-primary/10 transition-all">
                  <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-40"><FiDollarSign className="w-3.5 h-3.5" /> Quota (LPA)</p>
                  <p className="text-base font-black text-ethereal-on-surface tracking-tight">{job.salaryMinLpa} — {job.salaryMaxLpa}</p>
                  <p className="text-[10px] font-medium text-[#db7c26] uppercase tracking-widest mt-1">Guaranteed Base</p>
                </div>
              </div>

              {/* Narrative Segmentation */}
              <div className="grid grid-cols-1 gap-12">
                <div className="group">
                  <h4 className="text-[11px] font-black text-ethereal-on-surface uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <FiFileText className="w-4.5 h-4.5 text-ethereal-primary" /> Core Responsibilities
                  </h4>
                  <div className="glass-card bg-ethereal-surface-low/30 p-10 rounded-[2.5rem] border-none text-ethereal-on-surface-variant text-sm font-medium leading-loose whitespace-pre-wrap shadow-inner group-hover:bg-gray-900 transition-all duration-500">
                    {job.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-ethereal-on-surface uppercase tracking-[0.3em]">Credentials Required</h4>
                    <div className="bg-ethereal-surface rounded-[2rem] p-8 text-ethereal-on-surface-variant text-sm font-medium leading-relaxed">
                      {job.qualifications || 'Standard operational certifications.'}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-ethereal-on-surface uppercase tracking-[0.3em]">Strategic Domain</h4>
                    <div className="bg-ethereal-surface rounded-[2rem] p-8 text-ethereal-on-surface-variant text-sm font-medium leading-relaxed">
                      {job.specialisation || 'General Clinical Practice'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Synthesis Layer */}
              <div className="p-8 bg-ethereal-primary/5 rounded-[2.5rem] border border-ethereal-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-sm">
                    <FiMail className="w-6 h-6 text-ethereal-primary opacity-60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-ethereal-primary uppercase tracking-[0.2em] mb-1">Direct Comms</p>
                    <p className="text-lg font-black text-ethereal-on-surface tracking-tight lowercase">{job.contactEmail}</p>
                  </div>
                </div>
                <div className="md:text-right px-8 py-4 bg-gray-900/50 rounded-[1.5rem]">
                  <p className="text-[10px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-40">Talent Quota</p>
                  <p className="text-xl font-black text-ethereal-on-surface tracking-tighter">{job.numberOfOpenings} VACANCIES</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {appsLoading ? (
                <div className="py-24 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-ethereal-primary mx-auto"></div>
                  <p className="text-ethereal-on-surface-variant mt-8 text-[10px] font-black uppercase tracking-[0.3em]">Retrieving Applicants...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="bg-ethereal-surface w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 opacity-40 shadow-inner">
                    <FiUser className="w-10 h-10 text-ethereal-on-surface-variant" />
                  </div>
                  <h3 className="text-xl font-bold text-ethereal-on-surface uppercase tracking-tight">Zero Influx</h3>
                  <p className="text-ethereal-on-surface-variant text-sm font-medium mt-2">No entity has initialized an application sequence for this posting.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-6 py-4 bg-ethereal-surface-low/30 rounded-2xl border border-ethereal-surface shrink-0">
                    <span className="text-xs font-black uppercase tracking-widest text-ethereal-on-surface-variant">Active Candidates List</span>
                    <span className="bg-ethereal-primary/10 text-ethereal-primary px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{applications.length} TOTAL</span>
                  </div>
                  <div className="grid gap-4">
                    {applications.map((app, idx) => (
                      <div key={app.id} className="glass-card bg-gray-900 p-6 rounded-[2rem] border-transparent hover:border-ethereal-primary/20 transition-all group animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="bg-ethereal-surface-low w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-ethereal-primary text-base uppercase group-hover:bg-ethereal-primary group-hover:text-white transition-all duration-300">
                              {app.seekerName.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-ethereal-on-surface text-base tracking-tight">{app.seekerName}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ethereal-on-surface-variant mt-1 opacity-60">
                                <span className="lowercase">{app.seekerEmail}</span>
                                <span>•</span>
                                <span>{app.seekerMobile || 'No mobile provided'}</span>
                              </div>
                            </div>
                          </div>
                        <div className="flex items-center gap-6">
                          <span className="px-4 py-1.5 bg-ethereal-surface text-ethereal-on-surface-variant text-[9px] font-black uppercase tracking-widest rounded-full opacity-60">
                            {formatDate(app.appliedAt)}
                          </span>
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" 
                            className="p-4 bg-ethereal-surface text-ethereal-primary hover:bg-ethereal-primary hover:text-white rounded-[1.2rem] shadow-sm transition-all" title="Review CV">
                            <FiFileText className="w-6 h-6" />
                          </a>
                        </div>
                      </div>
                      {app.coverLetter && (
                        <div className="mt-6 pl-19 border-l-2 border-ethereal-surface ml-7">
                          <p className="text-[9px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-40">Entity Narrative Preview</p>
                          <p className="text-xs text-ethereal-on-surface-variant font-medium leading-relaxed italic opacity-80">
                            "{app.coverLetter}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Global Protocol Controls */}
        <div className="shrink-0 bg-ethereal-surface px-12 py-8 border-t border-ethereal-surface flex items-center justify-between gap-6">
          <button onClick={onClose} className="px-8 py-4 text-[10px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] hover:text-ethereal-primary transition-all">
            Decommission View
          </button>
          <div className="flex gap-4">
            {job.status === 'PENDING' && (
              <button onClick={handleApprove}
                className="px-10 py-5 bg-[#db7c26] text-white rounded-[1.5rem] hover:bg-[#3a5578] shadow-xl shadow-[#db7c26]/20 transition-all font-black text-[10px] uppercase tracking-[widest] flex items-center gap-3">
                <FiCheck className="w-4 h-4" /> Validate Requirement
              </button>
            )}
            {job.status === 'ACTIVE' && activeTab === 'details' && (
              <button onClick={handleArchive} className="px-10 py-5 bg-white text-gray-900 rounded-[1.5rem] hover:bg-gray-200 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                Archive Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetailModal;





