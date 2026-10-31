import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { jobsAPI, masterAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import * as Icons from 'react-icons/fa';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const numericId = id ? id.split('-')[0] : '';
  const isEditMode = !!numericId;
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [jobCategories, setJobCategories] = useState([]);
  const [cities, setCities] = useState([]);

  // Form Section Refs for navigation
  const basicRef = useRef(null);
  const detailsRef = useRef(null);
  const descRef = useRef(null);
  const compRef = useRef(null);
  const submitBtnRef = useRef(null);
  const isSubmittedRef = useRef(false);

  // UI/UX States
  const [activeStep, setActiveStep] = useState(1);
  const [activeFocus, setActiveFocus] = useState('general');
  const [draftSavedTime, setDraftSavedTime] = useState('');
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState(null);

  const [formData, setFormData] = useState({
    title: '', jobCategoryId: '', specialisation: '', employmentType: '',
    salaryMinLpa: '', salaryMaxLpa: '', cityName: '', experienceRequired: '',
    qualifications: '', description: '', applicationDeadline: '',
    numberOfOpenings: 1, contactEmail: '',
  });

  useEffect(() => {
    masterAPI.getJobCategories().then(res => setJobCategories(res.data?.data || [])).catch(() => {});
    masterAPI.getCities().then(res => setCities(res.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      jobsAPI.getById(numericId).then(res => {
        const job = res.data.data;
        setFormData({
          title: job.title || '',
          jobCategoryId: job.jobCategory?.id || job.jobCategoryId || '',
          specialisation: job.specialisation || '',
          employmentType: job.employmentType || '',
          salaryMinLpa: job.salaryMinLpa || '',
          salaryMaxLpa: job.salaryMaxLpa || '',
          cityName: job.cityName || job.city?.name || '',
          experienceRequired: job.experienceRequired || '',
          qualifications: job.qualifications || '',
          description: job.description || '',
          applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
          numberOfOpenings: job.numberOfOpenings || 1,
          contactEmail: job.contactEmail || '',
        });
        setLoading(false);
      }).catch(err => {
        setError('Failed to fetch job details');
        setLoading(false);
      });
    }
  }, [id, isEditMode]);

  // Check for existing drafts
  useEffect(() => {
    if (jobCategories.length === 0) return;
    
    const userId = user?.id || 'guest';
    const draftKey = isEditMode ? `dhotels_job_draft_edit_${userId}_${id}` : `dhotels_job_draft_new_${userId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.data) {
          const hasData = Object.keys(parsed.data).some(key => {
            const val = parsed.data[key];
            return val !== '' && val !== false && val !== null && val !== undefined && key !== 'numberOfOpenings';
          });
          if (hasData) {
            setDraftToRestore(parsed.data);
            setShowRestoreBanner(true);
          }
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [jobCategories, isEditMode, id]);

  // Auto-save draft on changes
  useEffect(() => {
    if (loading || isSubmittedRef.current) return;
    
    const hasData = Object.keys(formData).some(key => {
      const val = formData[key];
      return val !== '' && val !== false && val !== null && val !== undefined && val !== 1;
    });
    if (!hasData) return;

    const userId = user?.id || 'guest';
    const draftKey = isEditMode ? `dhotels_job_draft_edit_${userId}_${id}` : `dhotels_job_draft_new_${userId}`;
    
    const delayDebounce = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDraftSavedTime(timeStr);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [formData, isEditMode, id, loading]);

  // Update active step dynamically based on section completion
  useEffect(() => {
    const isBasic = !!(formData.title?.trim() && formData.jobCategoryId && formData.employmentType);
    const isDetails = isBasic && !!(formData.experienceRequired && formData.cityName?.trim());
    const isDesc = isDetails && !!formData.description?.trim();

    if (!isBasic) {
      setActiveStep(1);
    } else if (!isDetails) {
      setActiveStep(2);
    } else if (!isDesc) {
      setActiveStep(3);
    } else {
      setActiveStep(4);
    }
  }, [formData]);

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setFormData(prev => ({
        ...prev,
        ...draftToRestore
      }));
      toast.success("Draft restored successfully!");
    }
    setShowRestoreBanner(false);
  };

  const handleDiscardDraft = () => {
    const draftKey = isEditMode ? `dhotels_job_draft_edit_${user?.id || 'guest'}_${id}` : `dhotels_job_draft_new_${user?.id || 'guest'}`;
    localStorage.removeItem(draftKey);
    setShowRestoreBanner(false);
    toast.success("Draft discarded.");
  };

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if ((type === 'number' || (e.target.getAttribute && e.target.getAttribute('type') === 'number')) && value !== '') {
      if (parseFloat(value) < 0) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name, currentValue) => {
    handleChange({
      target: {
        name,
        type: 'checkbox',
        checked: !currentValue
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('LOGIN_REQUIRED');
      return;
    }

    isSubmittedRef.current = true;
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        title: formData.title,
        jobCategoryId: parseInt(formData.jobCategoryId),
        specialisation: formData.specialisation,
        employmentType: formData.employmentType,
        cityName: formData.cityName,
        experienceRequired: formData.experienceRequired,
        qualifications: formData.qualifications,
        description: formData.description,
        applicationDeadline: formData.applicationDeadline,
        numberOfOpenings: parseInt(formData.numberOfOpenings) || 1,
        contactEmail: formData.contactEmail,
      };
      if (formData.salaryMinLpa) payload.salaryMinLpa = parseFloat(formData.salaryMinLpa);
      if (formData.salaryMaxLpa) payload.salaryMaxLpa = parseFloat(formData.salaryMaxLpa);

      if (isEditMode) {
        await jobsAPI.update(numericId, payload);
        toast.success('Job updated successfully!');
      } else {
        await jobsAPI.create(payload);
        toast.success('Job posted successfully! Please wait for admins to review and approve it.', { duration: 5000 });
      }
      
      const draftKey = isEditMode ? `dhotels_job_draft_edit_${user?.id || 'guest'}_${numericId}` : `dhotels_job_draft_new_${user?.id || 'guest'}`;
      localStorage.removeItem(draftKey);
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('LOGIN_REQUIRED');
      } else {
        setError(err.response?.data?.message || 'Failed to post job. Please check all fields.');
      }
    } finally { setLoading(false); }
  };

  const getJobCategoryIcon = (name) => {
    const normalized = name?.toLowerCase() || '';
    if (normalized.includes('chef') || normalized.includes('cook')) return 'FaUtensils';
    if (normalized.includes('bartender') || normalized.includes('mixolog')) return 'FaCocktail';
    if (normalized.includes('barista')) return 'FaCoffee';
    if (normalized.includes('manager')) return 'FaBriefcase';
    if (normalized.includes('front desk') || normalized.includes('concierge') || normalized.includes('service')) return 'FaConciergeBell';
    if (normalized.includes('housekeeping') || normalized.includes('maintenance')) return 'FaBroom';
    return 'FaHotel';
  };

  const renderJobCategoryIcon = (iconName, className) => {
    const IconComponent = Icons[iconName] || Icons.FaStethoscope;
    return <IconComponent className={className} />;
  };

  const getCompletionPercentage = () => {
    let total = 8;
    let filled = 0;

    if (formData.title?.trim()) filled++;
    if (formData.jobCategoryId) filled++;
    if (formData.employmentType) filled++;
    if (formData.experienceRequired) filled++;
    if (formData.cityName?.trim()) filled++;
    if (formData.description?.trim()) filled++;
    if (formData.applicationDeadline) filled++;
    if (formData.contactEmail?.trim()) filled++;

    return Math.round((filled / total) * 100);
  };

  const FOCUS_TIPS = {
    general: {
      title: "Recruiting Tips",
      text: "Fill out the fields to publish a job post. Standardized job summaries increase applicant interest rates."
    },
    title: {
      title: "Job Title",
      text: "Be specific. E.g. 'Executive Sous Chef' or 'Restaurant Operations Manager' attracts better matched profiles."
    },
    jobCategoryId: {
      title: "Job Category",
      text: "Setting the correct category routes your posting directly into specialized filters for chefs, managers, or front office."
    },
    employmentType: {
      title: "Employment Model",
      text: "Indicate whether this is full-time, part-time, or a flexible 'Locum' shift model."
    },
    experienceRequired: {
      title: "Experience Level",
      text: "Specify clear experience levels to match your team's structural needs."
    },
    cityName: {
      title: "Geographical Location",
      text: "Recruits will see your city on search grids. Autocomplete helps you select major cities rapidly."
    },
    description: {
      title: "Job Overview",
      text: "Describe responsibilities, shifts, covers or room count, and growth opportunities. Detail makes you stand out."
    },
    salaryMinLpa: {
      title: "Salary Range (LPA)",
      text: "Listing standard compensation estimates increases application rates by 80%."
    },
    applicationDeadline: {
      title: "Application Deadline",
      text: "Set a clear closing date. Recommended to keep it within 30 to 45 days."
    },
    contactEmail: {
      title: "Contact / HR Email",
      text: "All applicants' resumes and notification updates will be routed directly to this address."
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-900/60 border border-gray-700/60 rounded-xl focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 text-gray-200 placeholder-gray-500 backdrop-blur-sm shadow-inner";
  const labelClass = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh relative pt-12 pb-0 text-gray-100 flex flex-col" style={{ overflowX: 'clip' }}>
      {/* Decorative glow elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 relative z-10 flex-grow pb-12">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary-400 mb-3 transition uppercase tracking-wider"
            >
              <Icons.FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-gray-100">
              <span>{isEditMode ? '💾' : '🚀'}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-400">
                {isEditMode ? 'Edit Job Posting' : 'Post a New Job'}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-2">
              <span>⏱️ Estimated completion: 3 minutes</span>
              <span className="text-gray-700">•</span>
              <span>Find chefs, managers and front-of-house talent</span>
            </p>
          </div>
          
          {/* Top completeness badge */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-3 flex items-center gap-4 self-start md:self-auto backdrop-blur-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Completeness</p>
              <p className="text-sm font-bold text-gray-200">{getCompletionPercentage()}% Done</p>
            </div>
          </div>
        </div>

        {/* Restore Draft Banner */}
        {showRestoreBanner && (
          <div className="mb-8 bg-gradient-to-r from-primary-500/10 to-primary-500/10 border border-primary-500/30 rounded-2xl p-5 md:p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-gray-200">Unfinished Job Draft Detected</h3>
                <p className="text-xs text-gray-400 mt-1">We found a local draft of your job listing. Would you like to restore it and continue?</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center md:justify-end">
              <button 
                onClick={handleDiscardDraft}
                className="px-4 py-2 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200 text-xs font-bold rounded-xl transition bg-gray-950/40"
              >
                Discard Draft
              </button>
              <button 
                onClick={handleRestoreDraft}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-500/10 transition"
              >
                Restore Draft
              </button>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Information Panel */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 self-start">
            
            {/* Dynamic Focus Tips Box */}
            <div className="bg-gradient-to-b from-gray-900/80 to-gray-950/80 border border-gray-800 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl" />
              <h3 className="text-xs font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Icons.FaInfoCircle className="text-primary-500" /> {FOCUS_TIPS[activeFocus]?.title || FOCUS_TIPS.general.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed transition-all duration-300">
                {FOCUS_TIPS[activeFocus]?.text || FOCUS_TIPS.general.text}
              </p>
            </div>

            {/* Job Quality Meter */}
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Job Post Strength</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Score</span>
                  <span className={`font-bold ${
                    getCompletionPercentage() < 40 ? 'text-red-400' : getCompletionPercentage() < 75 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {getCompletionPercentage() < 40 ? 'Weak' : getCompletionPercentage() < 75 ? 'Good Progress' : 'High Quality'}
                  </span>
                </div>
                
                {/* Visual Bar */}
                <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden p-[2px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      getCompletionPercentage() < 40 
                        ? 'bg-gradient-to-r from-red-500 to-primary-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                        : getCompletionPercentage() < 75 
                        ? 'bg-gradient-to-r from-primary-500 to-primary-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                        : 'bg-gradient-to-r from-primary-500 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                    }`}
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
                
                {/* Benefits lists */}
                <div className="pt-2 border-t border-gray-800/80 space-y-2">
                  <div className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className={`text-sm shrink-0 ${getCompletionPercentage() >= 35 ? 'text-green-500' : 'text-gray-600'}`}>✓</span>
                    <span>Role details complete</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className={`text-sm shrink-0 ${getCompletionPercentage() >= 60 ? 'text-green-500' : 'text-gray-600'}`}>✓</span>
                    <span>Location & logistics set</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-400">
                    <span className={`text-sm shrink-0 ${getCompletionPercentage() >= 85 ? 'text-green-500' : 'text-gray-600'}`}>✓</span>
                    <span>Salary ranges & HR details added</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recruiter benefits & FAQ */}
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recruiting on DHotels</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="text-lg">🧑‍⚕️</div>
                    <div>
                      <p className="text-xs font-bold text-gray-200">Hospitality Talent</p>
                      <p className="text-[10px] text-gray-500 leading-normal">Reach chefs, F&B, front office and housekeeping professionals.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-lg">⚡</div>
                    <div>
                      <p className="text-xs font-bold text-gray-200">Rapid Recruitment</p>
                      <p className="text-[10px] text-gray-500 leading-normal">Our system alerts relevant matches immediately upon approval.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800/80">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recruiter FAQ</h3>
                <div className="space-y-2">
                  <details className="group border border-gray-800/60 rounded-xl p-3 bg-gray-950/20 list-none transition-all duration-300">
                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-xs text-gray-400 hover:text-gray-200">
                      <span>Who sees the HR email?</span>
                      <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                      Only authenticated, registered candidates are allowed to view the email or submit applications directly to your organisation.
                    </p>
                  </details>
                  <details className="group border border-gray-800/60 rounded-xl p-3 bg-gray-950/20 list-none transition-all duration-300">
                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-xs text-gray-400 hover:text-gray-200">
                      <span>Can we edit later?</span>
                      <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                      Yes! You can edit listing details or close application intakes anytime from your Recruiter Dashboard page.
                    </p>
                  </details>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Form Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {error && error !== 'LOGIN_REQUIRED' && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-5 rounded-r-2xl animate-shake flex gap-3 backdrop-blur-sm">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-xs font-bold text-red-200 uppercase tracking-wider">Recruitment Error</p>
                  <p className="text-sm text-red-300/90 mt-1">{error}</p>
                </div>
              </div>
            )}

            {error && error === 'LOGIN_REQUIRED' && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-2xl backdrop-blur-sm">
                <div className="flex gap-4">
                  <span className="text-2xl shrink-0">🔒</span>
                  <div>
                    <h3 className="text-base text-amber-200 font-bold">Authentication Required</h3>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Please register or log in to post job requirements to our hospitality network.</p>
                    <div className="flex gap-3 mt-4">
                      <Link to="/login" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition">Login</Link>
                      <Link to="/register" className="px-4 py-2 border border-primary-500/30 hover:border-primary-500 text-primary-400 hover:bg-primary-500/5 text-xs font-bold rounded-xl transition">Sign Up</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Stepper Inside Form Column Header */}
              <div className="bg-gray-900/30 border border-gray-800/80 rounded-3xl p-6 backdrop-blur-md shadow-lg">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary-500">Guided Workflow</span>
                  <h2 className="text-lg font-bold text-gray-100 mt-1">Recruiting Milestones</h2>
                </div>
                
                {/* Horizontal Stepper */}
                <div className="flex flex-row items-center justify-between gap-1 border-t border-gray-800/80 pt-6">
                  {[
                    { id: 1, name: 'Role', ref: basicRef },
                    { id: 2, name: 'Location', ref: detailsRef },
                    { id: 3, name: 'Pitch', ref: descRef },
                    { id: 4, name: 'Terms', ref: compRef },
                  ].map((step, idx) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;

                    return (
                      <React.Fragment key={step.id}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(step.ref)}
                          className={`flex items-center gap-2 text-left transition-all duration-300 focus:outline-none ${
                            isActive
                              ? 'text-primary-400 font-bold scale-102'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-500 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                              : isActive
                              ? 'bg-primary-500 border-primary-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                              : 'bg-gray-950 border-gray-800 text-gray-500'
                          }`}>
                            {isCompleted ? '✓' : step.id}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">
                            {step.id === 1 && 'Role'}
                            {step.id === 2 && 'Location'}
                            {step.id === 3 && 'Pitch'}
                            {step.id === 4 && 'Terms'}
                          </span>
                        </button>
                        {idx < 3 && (
                          <div className="flex-1 h-[1px] bg-gray-800/80 mx-2" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Job Role Details */}
              <section 
                ref={basicRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Job Role Details</h3>
                    <p className="text-xs text-gray-500">Define the profile title, category, and model of employment</p>
                  </div>
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <label className={labelClass}>Job Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    maxLength="200"
                    onFocus={() => setActiveFocus('title')}
                    placeholder="e.g., Senior Cardiologist" 
                    className={inputClass} 
                  />
                </div>

                {/* Category Redesign: Selectable Cards */}
                <div className="space-y-3">
                  <label className={labelClass}>Job Category *</label>
                  {jobCategories.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map(idx => (
                        <div key={idx} className="animate-pulse bg-gray-950/60 border border-gray-900 rounded-2xl p-5 h-24 flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-800" />
                          <div className="w-16 h-3 bg-gray-800 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {jobCategories.map((c) => {
                        const isSelected = String(c.id) === String(formData.jobCategoryId);
                        const iconName = getJobCategoryIcon(c.name);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onFocus={() => setActiveFocus('jobCategoryId')}
                            onClick={() => {
                              handleChange({ target: { name: 'jobCategoryId', value: c.id } });
                              setActiveFocus('employmentType');
                            }}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-b from-primary-500/10 to-primary-500/10 border-primary-500/80 text-primary-400 shadow-[0_4px_20px_rgba(249,115,22,0.12)] scale-[1.03]'
                                : 'bg-gray-950/40 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300 hover:scale-[1.01]'
                            }`}
                          >
                            <div className={`p-2.5 rounded-xl mb-2.5 text-2xl transition-all duration-300 ${
                              isSelected ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-900/60 text-gray-600'
                            }`}>
                              {renderJobCategoryIcon(iconName)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-snug">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Specialisation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Specialisation</label>
                    <input 
                      type="text" 
                      name="specialisation" 
                      value={formData.specialisation} 
                      onChange={handleChange}
                      onFocus={() => setActiveFocus('title')}
                      placeholder="e.g., Cardiology, Radiology" 
                      className={inputClass} 
                    />
                  </div>

                  {/* Employment Type Selector pills */}
                  <div className="space-y-2">
                    <label className={labelClass}>Employment Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'FULL_TIME', label: 'Full Time' },
                        { id: 'PART_TIME', label: 'Part Time' },
                        { id: 'CONTRACT', label: 'Contract' },
                        { id: 'LOCUM', label: 'Locum' },
                        { id: 'INTERNSHIP', label: 'Internship' }
                      ].map(type => {
                        const isSelected = formData.employmentType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onFocus={() => setActiveFocus('employmentType')}
                            onClick={() => {
                              handleChange({ target: { name: 'employmentType', value: type.id } });
                              setActiveFocus('experienceRequired');
                            }}
                            className={`px-3 py-2 border text-[11px] font-bold uppercase tracking-wider rounded-xl transition duration-300 ${
                              isSelected
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Location & Details */}
              <section 
                ref={detailsRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Details & Location</h3>
                    <p className="text-xs text-gray-500">Define experience profiles, academic qualifications, and geographic location</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Experience Required Selector */}
                  <div className="space-y-2">
                    <label className={labelClass}>Experience Required *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'FRESHER', label: 'Fresher' },
                        { id: 'ONE_TO_THREE', label: '1-3 Years' },
                        { id: 'THREE_TO_FIVE', label: '3-5 Years' },
                        { id: 'FIVE_TO_TEN', label: '5-10 Years' },
                        { id: 'TEN_PLUS', label: '10+ Years' }
                      ].map(exp => {
                        const isSelected = formData.experienceRequired === exp.id;
                        return (
                          <button
                            key={exp.id}
                            type="button"
                            onFocus={() => setActiveFocus('experienceRequired')}
                            onClick={() => {
                              handleChange({ target: { name: 'experienceRequired', value: exp.id } });
                              setActiveFocus('cityName');
                            }}
                            className={`px-3 py-2 border text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-300 ${
                              isSelected
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            {exp.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* City Datalist Autocomplete */}
                  <div className="space-y-2">
                    <label className={labelClass}>City *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-sm">📍</span>
                      <input 
                        type="text" 
                        name="cityName" 
                        value={formData.cityName} 
                        onChange={handleChange}
                        required 
                        list="jobCityList" 
                        onFocus={() => setActiveFocus('cityName')}
                        placeholder="Search or select city" 
                        className={`${inputClass} pl-10`} 
                        autoComplete="off" 
                      />
                    </div>
                    <datalist id="jobCityList">
                      <option value="Mumbai" />
                      <option value="Delhi" />
                      <option value="Bengaluru" />
                      <option value="Hyderabad" />
                      <option value="Chennai" />
                      <option value="Kolkata" />
                      <option value="Pune" />
                      <option value="Ahmedabad" />
                      <option value="Jaipur" />
                      <option value="Lucknow" />
                      <option value="Surat" />
                      <option value="Kanpur" />
                      <option value="Nagpur" />
                      <option value="Indore" />
                      <option value="Thane" />
                      <option value="Bhopal" />
                      <option value="Visakhapatnam" />
                      <option value="Patna" />
                      <option value="Vadodara" />
                      <option value="Ghaziabad" />
                      <option value="Ludhiana" />
                      <option value="Agra" />
                      <option value="Nashik" />
                      <option value="Faridabad" />
                      <option value="Meerut" />
                      <option value="Rajkot" />
                      <option value="Varanasi" />
                      <option value="Srinagar" />
                      <option value="Aurangabad" />
                      <option value="Dhanbad" />
                      <option value="Amritsar" />
                      <option value="Navi Mumbai" />
                      <option value="Allahabad" />
                      <option value="Ranchi" />
                      <option value="Howrah" />
                      <option value="Coimbatore" />
                      <option value="Jabalpur" />
                      <option value="Gwalior" />
                      <option value="Vijayawada" />
                      <option value="Jodhpur" />
                      <option value="Madurai" />
                      <option value="Raipur" />
                      <option value="Kota" />
                      <option value="Chandigarh" />
                      <option value="Guwahati" />
                      <option value="Solapur" />
                      <option value="Hubli" />
                      <option value="Mysuru" />
                      <option value="Tiruchirappalli" />
                      <option value="Bareilly" />
                      <option value="Aligarh" />
                      <option value="Tiruppur" />
                      <option value="Moradabad" />
                      <option value="Jalandhar" />
                      <option value="Bhubaneswar" />
                      <option value="Salem" />
                      <option value="Warangal" />
                      <option value="Guntur" />
                      <option value="Bhilai" />
                      <option value="Kochi" />
                      <option value="Gorakhpur" />
                      <option value="Noida" />
                      <option value="Gurgaon" />
                      <option value="Mangalore" />
                      <option value="Dehradun" />
                      <option value="Udaipur" />
                      <option value="Thiruvananthapuram" />
                      <option value="Shimla" />
                      <option value="Panaji" />
                    </datalist>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-2">
                  <label className={labelClass}>Qualifications Required</label>
                  <input 
                    type="text" 
                    name="qualifications" 
                    value={formData.qualifications} 
                    onChange={handleChange}
                    onFocus={() => setActiveFocus('experienceRequired')}
                    placeholder="e.g., MBBS, MD Cardiology, GNM, B.Pharm" 
                    className={inputClass} 
                  />
                </div>
              </section>

              {/* Step 3: Job Description */}
              <section 
                ref={descRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100">Job Description</h3>
                    <p className="text-xs text-gray-500">Provide job summary details, key responsibilities, and shift schedules</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={labelClass}>Detailed Description *</label>
                    <span className="text-[10px] text-gray-500 font-mono">{formData.description.length} / 3000</span>
                  </div>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="6"
                    required
                    maxLength="3000" 
                    onFocus={() => setActiveFocus('description')}
                    placeholder="Describe responsibilities, outlet or property size, shift pattern, team you will lead, and must-have skills..." 
                    className={inputClass} 
                  />
                </div>
              </section>

              {/* Step 4: Terms & Compensation */}
              <section 
                ref={compRef} 
                className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md scroll-mt-6 transition-all duration-300 focus-within:border-gray-700"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-gray-800/80">
                  <span className="text-2xl text-primary-400">💰</span>
                  <div>
                    <h3 className="text-lg font-bold text-primary-400 uppercase tracking-widest text-sm">Terms & Compensation</h3>
                    <p className="text-xs text-gray-500">Define salary scales, total openings, deadlines, and applicant routing</p>
                  </div>
                </div>

                {/* Salary LPA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Min Salary (LPA)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-sm">₹</span>
                      <input 
                        type="number" 
                        name="salaryMinLpa" 
                        value={formData.salaryMinLpa} 
                        onChange={handleChange}
                        step="0.5" 
                        min="0" 
                        onFocus={() => setActiveFocus('salaryMinLpa')}
                        placeholder="e.g., 8" 
                        className={`${inputClass} pl-8`} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Max Salary (LPA)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 text-sm">₹</span>
                      <input 
                        type="number" 
                        name="salaryMaxLpa" 
                        value={formData.salaryMaxLpa} 
                        onChange={handleChange}
                        step="0.5" 
                        min="0" 
                        onFocus={() => setActiveFocus('salaryMinLpa')}
                        placeholder="e.g., 20" 
                        className={`${inputClass} pl-8`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Openings, Deadline, Contact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Number of Openings</label>
                    <input 
                      type="number" 
                      name="numberOfOpenings" 
                      value={formData.numberOfOpenings} 
                      onChange={handleChange}
                      min="1" 
                      onFocus={() => setActiveFocus('general')}
                      className={inputClass} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Application Deadline *</label>
                    <input 
                      type="date" 
                      name="applicationDeadline" 
                      value={formData.applicationDeadline} 
                      onChange={handleChange}
                      required 
                      onFocus={() => setActiveFocus('applicationDeadline')}
                      className={inputClass} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Contact Email *</label>
                    <input 
                      type="email" 
                      name="contactEmail" 
                      value={formData.contactEmail} 
                      onChange={handleChange}
                      required 
                      onFocus={() => setActiveFocus('contactEmail')}
                      placeholder="careers@yourhotel.com" 
                      className={inputClass} 
                    />
                  </div>
                </div>
              </section>

              {/* Hidden submit trigger button */}
              <button type="submit" ref={submitBtnRef} className="hidden" />
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 w-full z-40 bg-gray-950/95 backdrop-blur-md border-t border-gray-800/80 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] py-4 px-4 md:px-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Completeness Score */}
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* SVG Completion Ring */}
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" className="stroke-gray-850" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  className="stroke-primary-500 transition-all duration-500" 
                  strokeWidth="4" 
                  fill="transparent"
                  strokeDasharray={125.6} 
                  strokeDashoffset={125.6 - (125.6 * getCompletionPercentage()) / 100} 
                />
              </svg>
              <span className="absolute text-xs font-bold text-gray-200">{getCompletionPercentage()}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">Job Post Strength</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {draftSavedTime ? `Draft auto-saved at ${draftSavedTime}` : 'All changes saved locally'}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                const draftKey = isEditMode ? `dhotels_job_draft_edit_${user?.id || 'guest'}_${id}` : `dhotels_job_draft_new_${user?.id || 'guest'}`;
                localStorage.setItem(draftKey, JSON.stringify({
                  data: formData,
                  timestamp: new Date().toISOString()
                }));
                const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setDraftSavedTime(timeStr);
                toast.success(`Job draft saved manually at ${timeStr}`);
              }}
              className="px-5 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-850 hover:text-white transition flex items-center gap-2 text-xs uppercase tracking-wider bg-gray-950/20"
            >
              <Icons.FaSave /> Save Draft
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (!formData.title.trim()) {
                  toast.error('Please enter a Job Title');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.jobCategoryId) {
                  toast.error('Please select a Job Category');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.employmentType) {
                  toast.error('Please select an Employment Type');
                  scrollToSection(basicRef);
                  return;
                }
                if (!formData.experienceRequired) {
                  toast.error('Please select Experience level');
                  scrollToSection(detailsRef);
                  return;
                }
                if (!formData.cityName.trim()) {
                  toast.error('Please enter a City');
                  scrollToSection(detailsRef);
                  return;
                }
                if (!formData.description.trim()) {
                  toast.error('Please enter a Job Description');
                  scrollToSection(descRef);
                  return;
                }
                if (!formData.applicationDeadline) {
                  toast.error('Please select an Application Deadline');
                  scrollToSection(compRef);
                  return;
                }
                if (!formData.contactEmail.trim()) {
                  toast.error('Please enter a Contact Email');
                  scrollToSection(compRef);
                  return;
                }
                if (submitBtnRef.current) {
                  submitBtnRef.current.click();
                }
              }}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-500 text-white font-bold rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-600 hover:shadow-primary-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Icons.FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                isEditMode ? '💾 Save Changes' : '🚀 Publish Job Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;




