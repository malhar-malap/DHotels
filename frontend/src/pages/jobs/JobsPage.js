import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobsAPI, masterAPI } from '../../services/api';
import { generateSlug } from '../../utils/slugify';
import { FiSearch, FiMapPin, FiFilter, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { CATEGORIES } from '../../utils/hospitality';
import Seo from '../../components/common/Seo';

const formatExperience = (exp) => {
  if (!exp) return '';
  const map = {
    'FRESHER': 'Fresher',
    'ONE_TO_THREE': '1-3 Yrs',
    'THREE_TO_FIVE': '3-5 Yrs',
    'FIVE_TO_TEN': '5-10 Yrs',
    'TEN_PLUS': '10+ Yrs'
  };
  return map[exp] || exp.replace(/_/g, ' ');
};

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ 
    keyword: searchParams.get('keyword') || '', 
    categoryId: searchParams.get('category') || '', 
    cityId: '', 
    employmentType: '', 
    experienceLevel: '', 
    sortBy: 'createdAt', 
    sortDirection: 'desc' 
  });

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselImages = [
    CATEGORIES[2].image,
    CATEGORIES[0].image,
    CATEGORIES[4].image
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const categoryId = searchParams.get('category') || '';
    
    setFilters(prev => ({
      ...prev,
      keyword,
      categoryId
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.page]);

  const fetchMasterData = async () => {
    try {
      const [catRes, cityRes] = await Promise.all([masterAPI.getJobCategories(), masterAPI.getCities()]);
      setCategories(catRes.data.data || []);
      setCities(cityRes.data.data || []);
    } catch (error) { console.error('Error fetching master data:', error); }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, size: pagination.size };
      Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
      const response = await jobsAPI.getAll(params);
      const data = response.data.data;
      setJobs(data.content || []);
      setPagination(prev => ({ ...prev, totalElements: data.totalElements, totalPages: data.totalPages }));
    } catch (error) { console.error('Error fetching jobs:', error); }
    setLoading(false);
  };

  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
  const applyFilters = () => { setPagination(prev => ({ ...prev, page: 0 })); fetchJobs(); setShowFilters(false); };
  const clearFilters = () => { setFilters({ keyword: '', categoryId: '', cityId: '', employmentType: '', experienceLevel: '', sortBy: 'createdAt', sortDirection: 'desc' }); fetchJobs(); };

  return (
    <div className="min-h-screen">
      <Seo
        title="Hospitality Jobs in India | Hotel, Restaurant & Café Careers | DHotels24.in"
        description="Browse hospitality jobs across India: chefs, general managers, front office, F&B service, bartenders and baristas. Apply directly to hotels, restaurants and cafés."
        path="/hospitality-jobs-india"
      />
      {/* Search & Hero Header with Carousel */}
      <div className="relative pt-24 md:pt-44 pb-12 md:pb-24 overflow-hidden min-h-[350px] md:min-h-[500px] flex items-center">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {carouselImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover object-[75%_center]" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 from-10% via-gray-900/90 via-40% to-transparent to-100%" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-block glass bg-primary-400/50 px-4 py-1.5 rounded-full text-primary-300 font-black text-[10px] uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
               Elite Careers
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-4 md:mb-8">
              Explore Institutional <span className="text-gradient">Opportunities</span>
            </h1>
            
            <div className="glass p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl bg-gray-900/70 backdrop-blur-xl">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-300 w-6 h-6" />
                <input 
                  type="text" 
                  name="keyword" 
                  value={filters.keyword} 
                  onChange={handleFilterChange} 
                  placeholder="Search roles (Chef, Front Office, F&B Manager)..." 
                  className="w-full pl-14 pr-4 py-4 bg-transparent text-white placeholder-gray-200/40 text-lg rounded-xl focus:outline-none transition-all border-none" 
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()} 
                />
              </div>
              <button 
                onClick={applyFilters} 
                className="btn-gradient px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/10"
              >
                Search
              </button>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`glass px-6 py-3 rounded-xl flex items-center gap-3 font-bold text-sm transition-all border-none shadow-sm backdrop-blur-md ${showFilters ? 'bg-primary-600 text-white shadow-primary-300' : 'bg-gray-900/80 text-white hover:bg-gray-900'}`}
              >
                <FiFilter /> Filters 
                {(filters.categoryId || filters.cityId || filters.employmentType || filters.experienceLevel) && (
                  <span className="bg-primary-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black animate-pulse">!</span>
                )}
              </button>
              <p className="text-gray-200 font-bold text-sm opacity-60">
                {pagination.totalElements} premium vacancies active
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
        <div className="flex gap-6 relative">
          {/* Mobile filter overlay backdrop */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Filter panel: full-screen overlay on mobile, sticky sidebar on desktop */}
          {showFilters && (
            <div className="fixed inset-0 z-50 overflow-y-auto p-6 md:p-0 md:relative md:inset-auto md:z-20 md:w-80 md:overflow-hidden">
              <div className="glass-card p-8 h-fit md:sticky md:top-24 relative overflow-hidden max-w-md mx-auto md:max-w-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-bl-[100px] pointer-events-none" />
                {/* Close button – mobile only */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="absolute top-4 right-4 md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white text-xl font-bold"
                  aria-label="Close filters"
                >
                  ✕
                </button>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white tracking-tighter">Refine Search</h3>
                  <button onClick={clearFilters} className="text-xs font-black text-primary-400 uppercase tracking-widest">Reset</button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-200 uppercase tracking-[0.2em] mb-2 block opacity-60">Field</label>
                    <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer">
                      <option value="">All Segments</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-200 uppercase tracking-[0.2em] mb-2 block opacity-60">Location</label>
                    <select name="cityId" value={filters.cityId} onChange={handleFilterChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer">
                      <option value="">All Regions</option>
                      {cities.map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-200 uppercase tracking-[0.2em] mb-2 block opacity-60">Structure</label>
                    <select name="employmentType" value={filters.employmentType} onChange={handleFilterChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer">
                      <option value="">All Types</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="TEMPORARY">Temporary</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-200 uppercase tracking-[0.2em] mb-2 block opacity-60">Seniority</label>
                    <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-200 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer">
                      <option value="">All Levels</option>
                      <option value="FRESHER">Fresher</option>
                      <option value="ONE_TO_THREE">1-3 Years</option>
                      <option value="THREE_TO_FIVE">3-5 Years</option>
                      <option value="FIVE_TO_TEN">5-10 Years</option>
                      <option value="TEN_PLUS">10+ Years</option>
                    </select>
                  </div>
                  <button onClick={applyFilters} className="btn-gradient w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/10">Update Results</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-8 h-40 skeleton" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-10 md:p-16 text-center max-w-2xl mx-auto">
                {/* Ambient glow effects */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary-300/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none -z-10" />

                {/* Glass Icon Container */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/20 relative">
                  <div className="absolute inset-0 bg-primary-600/10 rounded-2xl blur-md" />
                  <FiBriefcase className="w-9 h-9 text-primary-300 relative z-10 animate-pulse" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                  Global Standards Met
                </h3>
                <p className="text-sm md:text-base text-gray-200/70 font-medium leading-relaxed max-w-md mx-auto mb-8">
                  Elite roles are exclusive. Your criteria didn't match current institutional needs.
                </p>
                <button 
                  onClick={clearFilters} 
                  className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Reset Parameters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {jobs.map(job => (
                    <Link key={job.id} to={`/hospitality-jobs-india/${job.id}-${generateSlug(job.title, job.cityName)}`} className="hover-3d group block">
                      <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-gray-800/60 hover:border-white/10 transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                        <div className="mb-6 flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="glass bg-primary-600/10 text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded">
                              {job.categoryName}
                            </span>
                            <span className="text-gray-200 text-[10px] font-bold opacity-40 lowercase tracking-tight">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors leading-tight mb-4 line-clamp-2">
                            {job.title}
                          </h3>
                          <p className="text-xs font-bold text-gray-200 opacity-60">
                            {job.employerCompany || job.employerName}
                          </p>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-200 opacity-40 uppercase tracking-widest">Compensation</span>
                            <span className="text-lg font-black text-white tracking-tighter">
                              ₹{job.salaryMinLpa} - {job.salaryMaxLpa} <span className="text-[10px] opacity-50 ml-1">LPA</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                              <FiMapPin className="text-primary-300" /> {job.cityName}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                              <FiBriefcase className="text-primary-300" /> {job.employmentType?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[10px] font-black text-gray-300 bg-gray-800 px-3 py-2 rounded-lg uppercase tracking-wider text-center">
                            Exp: {formatExperience(job.experienceRequired)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;





