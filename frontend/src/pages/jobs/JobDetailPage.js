import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { generateSlug } from '../../utils/slugify';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Seo, { truncate, SITE_URL } from '../../components/common/Seo';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiMail, FiChevronLeft, FiCheck } from 'react-icons/fi';

const formatExperience = (exp) => {
  if (!exp) return '';
  const map = {
    'FRESHER': 'Fresher',
    'ONE_TO_THREE': '1-3 Yrs',
    'THREE_TO_FIVE': '3-5 Yrs',
    'FIVE_TO_TEN': '5-10 Yrs',
    'FIVE_PLUS': '5+ Yrs',
    'TEN_PLUS': '10+ Yrs'
  };
  return map[exp] || exp.replace(/_/g, ' ');
};

// schema.org JobPosting employmentType values
const SCHEMA_EMPLOYMENT_TYPE = { FULL_TIME: 'FULL_TIME', PART_TIME: 'PART_TIME', CONTRACT: 'CONTRACTOR', LOCUM: 'TEMPORARY' };

const maskEmail = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name.charAt(0)}***@${domain}`;
  }
  return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.slice(-1)}@${domain}`;
};

const JobDetailPage = () => {
  const { id } = useParams();
  const numericId = id ? id.split('-')[0] : '';
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchJob(); }, [numericId]);

  const fetchJob = async () => {
    try { 
      const response = await jobsAPI.getById(numericId); 
      const fetchedJob = response.data.data;
      setJob(fetchedJob);
      
      // Dynamic SEO Slug Redirection / Canonical URL verification
      if (fetchedJob) {
        const canonicalSlug = generateSlug(fetchedJob.title, fetchedJob.cityName);
        const expectedPath = `/hospitality-jobs-india/${fetchedJob.id}-${canonicalSlug}`;
        if (location.pathname !== expectedPath) {
          navigate(canonicalSlug ? expectedPath : `/hospitality-jobs-india/${fetchedJob.id}`, { replace: true });
        }
      }
    }
    catch (error) { console.error('Error fetching job:', error); }
    setLoading(false);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to apply'); return; }
    if (!cvFile) { toast.error('Please upload your CV/Resume'); return; }

    const formData = new FormData();
    formData.append('cvFile', cvFile);
    if (coverLetter) formData.append('coverLetter', coverLetter);

    setSubmitting(true);
    try { 
      await jobsAPI.apply(numericId, formData); 
      toast.success('Application submitted successfully!'); 
      setShowApplyModal(false); 
      setCvFile(null);
      setCoverLetter('');
    } catch (error) { 
      toast.error(error.response?.data?.message || 'Failed to apply'); 
    }
    setSubmitting(false);
  };

  if (loading) return (<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>);
  if (!job) return (<div className="min-h-screen flex items-center justify-center"><Seo title="Job Not Found | DHotels24.in" noindex statusCode={404} /><div className="text-center"><h2 className="text-xl font-bold text-gray-200 mb-2">Job Not Found</h2><Link to="/hospitality-jobs-india" className="text-primary-500">Back to Jobs</Link></div></div>);

  // Search meta + Google for Jobs structured data
  const jobCity = job.cityName || job.city?.name;
  const jobSlug = generateSlug(job.title, job.cityName); // must match the canonical redirect in fetchJob
  const jobPath = jobSlug ? `/hospitality-jobs-india/${job.id}-${jobSlug}` : `/hospitality-jobs-india/${job.id}`;
  const jobSeoTitle = `${job.title}${jobCity ? ` in ${jobCity}` : ''} | Hospitality Jobs | DHotels24.in`;
  const jobSeoDescription = truncate(job.description) || `${job.title}${jobCity ? ` job in ${jobCity}` : ''}. Apply on DHotels24.in.`;
  const employerName = job.employer?.companyName;
  const jobSchema = employerName && {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || jobSeoDescription,
    ...(typeof job.createdAt === 'string' && { datePosted: job.createdAt.split('T')[0] }),
    ...(job.applicationDeadline && { validThrough: job.applicationDeadline }),
    ...(SCHEMA_EMPLOYMENT_TYPE[job.employmentType] && { employmentType: SCHEMA_EMPLOYMENT_TYPE[job.employmentType] }),
    hiringOrganization: { '@type': 'Organization', name: employerName },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', ...(jobCity && { addressLocality: jobCity }), addressCountry: 'IN' }
    },
    ...(job.salaryMinLpa && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: Number(job.salaryMinLpa) * 100000,
          ...(job.salaryMaxLpa && { maxValue: Number(job.salaryMaxLpa) * 100000 }),
          unitText: 'YEAR'
        }
      }
    }),
    url: `${SITE_URL}${jobPath}`
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-primary-500/10 py-8">
      <Seo
        title={jobSeoTitle}
        description={jobSeoDescription}
        path={jobPath}
        noindex={job.status && job.status !== 'ACTIVE'}
        schema={jobSchema || undefined}
      />
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/hospitality-jobs-india" className="inline-flex items-center text-gray-400 hover:text-primary-500 mb-6"><FiChevronLeft className="mr-1" />Back to Jobs</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge badge-primary mb-2">{job.jobCategory?.name}</span>
                  <h1 className="text-2xl font-bold text-gray-200">{job.title}</h1>
                  <p className="text-gray-400">{job.employer?.companyName || job.employer?.fullName}</p>
                </div>
                <span className="badge badge-secondary">{job.employmentType?.replace('_', ' ')}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Location</p><p className="font-medium text-gray-200 flex items-center gap-1"><FiMapPin className="w-4 h-4" />{job.cityName || job.city?.name}</p></div>
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Salary</p><p className="font-medium text-gray-200">₹{job.salaryMinLpa} - {job.salaryMaxLpa} LPA</p></div>
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Experience</p><p className="font-medium text-gray-200">{formatExperience(job.experienceRequired)}</p></div>
                <div className="bg-gray-800 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Openings</p><p className="font-medium text-gray-200">{job.numberOfOpenings}</p></div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-2">Job Description</h2>
                <p className="text-gray-400 whitespace-pre-line">{job.description}</p>
              </div>

              {job.qualifications && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-200 mb-2">Qualifications</h2>
                  <p className="text-gray-400">{job.qualifications}</p>
                </div>
              )}

              {job.specialisation && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-200 mb-2">Specialisation</h2>
                  <p className="text-gray-400">{job.specialisation}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-4">
                <p className="text-xl font-bold text-primary-600">₹{job.salaryMinLpa} - ₹{job.salaryMaxLpa} LPA</p>
                <p className="text-sm text-gray-500">Annual Salary</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400"><FiClock className="w-4 h-4" /><span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FiMail className="w-4 h-4" />
                  <span>{isAuthenticated ? job.contactEmail : maskEmail(job.contactEmail)}</span>
                </div>
              </div>

              {isAuthenticated && user && job.employer && user.id === job.employer.id ? (
                <Link to={`/hospitality-jobs-india/${job.id || numericId}/edit`} className="btn btn-secondary w-full py-3 mb-3 flex items-center justify-center gap-2">
                  <FiBriefcase className="w-5 h-5" /> Manage Job
                </Link>
              ) : (
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to apply');
                      return;
                    }
                    setShowApplyModal(true);
                  }} 
                  className="btn btn-primary w-full py-3 mb-3"
                >
                  Apply Now
                </button>
              )}
              <p className="text-xs text-gray-500 text-center">{job.applicationCount} applicants</p>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content p-6 max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-200 mb-4">Apply for {job.title}</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="form-label mb-2 block">Upload CV/Resume (PDF) *</label>
                <div className="relative flex items-center justify-between w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-400/20 transition-all duration-300">
                  <span className="text-gray-300 text-sm truncate max-w-[65%]">
                    {cvFile ? cvFile.name : "No file selected"}
                  </span>
                  <label className="cursor-pointer bg-primary-500/10 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-400/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300">
                    Choose File
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={e => setCvFile(e.target.files[0])} 
                      className="hidden" 
                      required={!cvFile}
                    />
                  </label>
                </div>
              </div>
              <div><label className="form-label">Cover Letter (Optional)</label><textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="form-input" rows="4" maxLength="500" placeholder="Why are you a good fit for this role?" /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Applying...' : 'Submit Application'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;



