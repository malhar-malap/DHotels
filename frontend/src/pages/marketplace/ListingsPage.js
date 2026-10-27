import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { listingsAPI, masterAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { generateSlug } from '../../utils/slugify';
import { FiSearch, FiMapPin, FiFilter, FiX, FiActivity, FiShield, FiLock, FiCheckCircle } from 'react-icons/fi';
import Seo from '../../components/common/Seo';

// Search meta for the marketplace and each category landing path
const LISTINGS_SEO = {
  '/listings': {
    title: 'Healthcare Businesses for Sale in India | Marketplace | DH Acquisitions',
    description: 'Browse verified hospitals, pharma companies, diagnostic centres, dental clinics, pharmacies and medical equipment for sale or lease across India.'
  },
  '/hospitals-for-sale-india': {
    title: 'Hospitals for Sale in India | Running Hospitals & Nursing Homes | DH Acquisitions',
    description: 'Find running hospitals, nursing homes and multi-speciality facilities for sale or lease across India. Verified listings with asking prices and key details.'
  },
  '/pharma-companies-for-sale-india': {
    title: 'Pharma Companies for Sale in India | Manufacturing Units | DH Acquisitions',
    description: 'Explore pharmaceutical companies, manufacturing plants and formulation units for sale in India, with licences, capacity and asking price details.'
  },
  '/diagnostic-centers-for-sale-india': {
    title: 'Diagnostic Centres for Sale in India | Labs & Imaging | DH Acquisitions',
    description: 'Browse pathology labs, imaging and diagnostic centres for sale across India. Compare equipment, location and asking price on verified listings.'
  },
  '/dental-clinics-for-sale-india': {
    title: 'Dental Clinics for Sale in India | DH Acquisitions',
    description: 'Find established dental clinics and practices for sale across India, with chairs, equipment and patient base details on verified listings.'
  },
  '/pharmacies-for-sale-india': {
    title: 'Pharmacies for Sale in India | Medical Stores | DH Acquisitions',
    description: 'Browse running pharmacies and medical stores for sale across India. Verified listings with location, turnover and asking price details.'
  }
};

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getCategoryFromPath = (path) => {
    switch (path) {
      case '/hospitals-for-sale-india': return '1';
      case '/pharma-companies-for-sale-india': return '2';
      case '/diagnostic-centers-for-sale-india': return '3';
      case '/dental-clinics-for-sale-india': return '4';
      case '/pharmacies-for-sale-india': return '5';
      default: return null;
    }
  };

  const getPathFromCategory = (categoryId) => {
    switch (categoryId?.toString()) {
      case '1': return '/hospitals-for-sale-india';
      case '2': return '/pharma-companies-for-sale-india';
      case '3': return '/diagnostic-centers-for-sale-india';
      case '4': return '/dental-clinics-for-sale-india';
      case '5': return '/pharmacies-for-sale-india';
      default: return '/listings';
    }
  };

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dealTypes, setDealTypes] = useState([]);
  const [cities, setCities] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 24, totalElements: 0, totalPages: 0 });
  const [loadedImages, setLoadedImages] = useState({});
  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    categoryId: getCategoryFromPath(window.location.pathname) || searchParams.get('category') || '',
    dealTypeId: searchParams.get('dealType') || '',
    cityName: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  useEffect(() => {
    fetchMasterData();
    masterAPI.getCities()
      .then(res => setCities(res.data?.data || []))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const categoryFromPath = getCategoryFromPath(location.pathname);
    const categoryId = categoryFromPath || searchParams.get('category') || '';
    const dealTypeId = searchParams.get('dealType') || '';
    const cityName = searchParams.get('city') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    
    setFilters(prev => ({
      ...prev,
      keyword,
      categoryId,
      dealTypeId,
      cityName,
      minPrice,
      maxPrice
    }));
  }, [searchParams, location.pathname]);

  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  useEffect(() => {
    if (filters.categoryId) {
      masterAPI.getDealTypes(filters.categoryId)
        .then(res => setDealTypes(res.data?.data || []))
        .catch(() => setDealTypes([]));
    } else {
      setDealTypes([]);
      setFilters(prev => ({ ...prev, dealTypeId: '' }));
    }
  }, [filters.categoryId]);

  useEffect(() => {
    fetchListings();
  }, [debouncedKeyword, filters.categoryId, filters.dealTypeId, filters.cityName, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortDirection, pagination.page]);

  const fetchMasterData = async () => {
    // Fetch categories
    try {
      const catRes = await masterAPI.getCategories();
      if (catRes.data && catRes.data.success) {
        setCategories(catRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

  };

  const fetchListings = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = { 
        ...filters, 
        keyword: debouncedKeyword,
        page: pagination.page, 
        size: pagination.size 
      };
      Object.keys(params).forEach(key => { if (params[key] === '' || params[key] === null) delete params[key]; });
      const response = await listingsAPI.getAll(params, { timeout: 6000 });
      const data = response?.data?.data;
      if (data && data.content) {
        setListings(data.content || []);
        setPagination(prev => ({ ...prev, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 }));
      } else {
        setListings([]);
      }
      setLoadedImages({});
    } catch (error) {
      console.warn('Notice: Error or timeout fetching listings:', error.message || error);
      setFetchError(true);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Price validation: prevent negative values
    if ((name === 'minPrice' || name === 'maxPrice') && value !== '') {
      if (parseFloat(value) < 0) return;
    }
    
    // Handle combined sort value (e.g. "askingPrice_asc")
    if (name === 'sortOption') {
      const [sortBy, sortDirection] = value.split('_');
      setFilters(prev => ({ ...prev, sortBy, sortDirection }));
      return;
    }
    
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const updateURLWithParams = (newParams) => {
    // Determine the base path from the new category (if set), otherwise use current path's category
    const targetCategory = newParams.category || getCategoryFromPath(location.pathname);
    const targetPath = getPathFromCategory(targetCategory);
    
    // Copy params so we can modify
    const paramsToSet = { ...newParams };
    
    // Remove category param if the path already implies it
    if (targetPath !== '/listings' && paramsToSet.category) {
      delete paramsToSet.category;
    }
    
    // Check if we need to navigate to a new path
    if (targetPath !== location.pathname) {
      const queryStr = new URLSearchParams(paramsToSet).toString();
      navigate(`${targetPath}${queryStr ? '?' + queryStr : ''}`);
    } else {
      // Just update the query string on the current path
      setSearchParams(paramsToSet);
    }
  };

  const applyFilters = () => {
    const newParams = {};
    if (filters.keyword) newParams.keyword = filters.keyword;
    if (filters.categoryId) newParams.category = filters.categoryId;
    if (filters.dealTypeId) newParams.dealType = filters.dealTypeId;
    if (filters.cityName) newParams.city = filters.cityName;
    if (filters.minPrice) newParams.minPrice = filters.minPrice;
    if (filters.maxPrice) newParams.maxPrice = filters.maxPrice;
    
    updateURLWithParams(newParams);
    setPagination(prev => ({ ...prev, page: 0 }));
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ keyword: '', categoryId: '', dealTypeId: '', cityName: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', sortDirection: 'desc' });
    updateURLWithParams({});
    fetchListings();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.dealTypeId) count++;
    if (filters.cityName) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  const removeFilter = (key) => {
    const newParams = { ...filters };
    if (key === 'category') {
      newParams.categoryId = '';
      newParams.dealTypeId = '';
    } else if (key === 'dealType') {
      newParams.dealTypeId = '';
    } else if (key === 'city') {
      newParams.cityName = '';
    } else if (key === 'minPrice') {
      newParams.minPrice = '';
    } else if (key === 'maxPrice') {
      newParams.maxPrice = '';
    }
    
    setFilters(prev => ({ 
      ...prev, 
      categoryId: newParams.categoryId, 
      dealTypeId: newParams.dealTypeId,
      cityName: newParams.cityName,
      minPrice: newParams.minPrice,
      maxPrice: newParams.maxPrice
    }));

    const updatedSearchParams = {};
    if (newParams.keyword) updatedSearchParams.keyword = newParams.keyword;
    if (newParams.categoryId) updatedSearchParams.category = newParams.categoryId;
    if (newParams.dealTypeId) updatedSearchParams.dealType = newParams.dealTypeId;
    if (newParams.cityName) updatedSearchParams.city = newParams.cityName;
    if (newParams.minPrice) updatedSearchParams.minPrice = newParams.minPrice;
    if (newParams.maxPrice) updatedSearchParams.maxPrice = newParams.maxPrice;
    
    updateURLWithParams(updatedSearchParams);
    setPagination(prev => ({ ...prev, page: 0 }));
  };



  return (
    <div className="min-h-screen bg-mesh bg-gray-900 text-gray-100 relative overflow-hidden">
      <Seo
        title={(LISTINGS_SEO[location.pathname] || LISTINGS_SEO['/listings']).title}
        description={(LISTINGS_SEO[location.pathname] || LISTINGS_SEO['/listings']).description}
        path={LISTINGS_SEO[location.pathname] ? location.pathname : '/listings'}
      />
      {/* Ambient background light glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#d8572a]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Hero Header Area */}
      <div className="border-b border-white/5 bg-gray-950/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center md:text-left mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-bold text-primary-400 mb-4 tracking-wider uppercase">
              <FiShield className="w-3.5 h-3.5 text-primary-400" /> Verified Healthcare Marketplace
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
              Explore Premium <span className="text-gradient">Healthcare Assets</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Acquire, lease, or invest in verified hospitals, pharmaceutical plants, research laboratories, and diagnostic centers. Direct access to secure institutional transactions.
            </p>
          </div>

          {/* Search & Filter Glass Box */}
          <div className="glass-panel p-4 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 bg-gray-900/80 backdrop-blur-xl border border-white/5 relative z-10">
            <div className="flex-grow relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <input 
                type="text" 
                name="keyword" 
                value={filters.keyword} 
                onChange={handleFilterChange} 
                placeholder="Search by name, category, city, or unique listing ID (e.g. HSP00058)..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-950/60 text-white placeholder-gray-500 text-sm md:text-base rounded-2xl border border-gray-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:outline-none transition-all outline-none"
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()} 
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`px-5 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all border outline-none ${
                  showFilters || (filters.categoryId || filters.cityName || filters.minPrice || filters.maxPrice)
                    ? 'bg-primary-500/10 text-primary-400 border-primary-500/30 shadow-inner' 
                    : 'bg-gray-950/40 text-gray-300 border-gray-800 hover:bg-gray-800/40'
                }`}
              >
                <FiFilter className="w-4 h-4" /> 
                <span className="hidden sm:inline">Filters</span>
                {(filters.categoryId || filters.cityName || filters.minPrice || filters.maxPrice) && (
                  <span className="bg-primary-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">!</span>
                )}
              </button>
              <button 
                onClick={applyFilters} 
                className="btn-gradient px-8 py-4 rounded-2xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary-500/10 active:scale-95 transition-transform"
              >
                Search
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-6 animate-fadeIn">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mr-1">Active:</span>
              {filters.categoryId && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                  Segment: {categories.find(c => String(c.id) === String(filters.categoryId))?.name || 'Selected'}
                  <button onClick={() => removeFilter('category')} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Remove category filter"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.dealTypeId && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                  Type: {dealTypes.find(d => String(d.id) === String(filters.dealTypeId))?.name || 'Selected'}
                  <button onClick={() => removeFilter('dealType')} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Remove deal type filter"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.cityName && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                  City: {filters.cityName}
                  <button onClick={() => removeFilter('city')} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Remove city filter"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.minPrice && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                  Min: {formatPrice(filters.minPrice)}
                  <button onClick={() => removeFilter('minPrice')} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Remove min price filter"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                  Max: {formatPrice(filters.maxPrice)}
                  <button onClick={() => removeFilter('maxPrice')} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Remove max price filter"><FiX className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider ml-1">
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="md:flex md:gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <>
              {/* Mobile overlay backdrop */}
              <div
                className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
              />
              
              <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gray-950 p-6 overflow-y-auto border-l border-white/5 md:relative md:inset-auto md:z-auto md:overflow-visible md:w-80 md:rounded-3xl md:border md:bg-gray-900/40 md:backdrop-blur-xl md:p-6 md:h-fit md:sticky md:top-24 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">Filter Criteria</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={clearFilters} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider">Reset</button>
                    <button onClick={() => setShowFilters(false)} className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-900 border border-gray-800" aria-label="Close filters">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Asset Category</label>
                    <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full bg-gray-950/60 border border-gray-800 text-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer">
                      <option value="">All Categories</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                  </div>
                  
                  {filters.categoryId && dealTypes.length > 0 && (
                    <div className="animate-fadeIn">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Deal Structure</label>
                      <select name="dealTypeId" value={filters.dealTypeId} onChange={handleFilterChange} className="w-full bg-gray-950/60 border border-gray-800 text-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer">
                        <option value="">All Types</option>
                        {dealTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Region / City</label>
                    <input 
                      type="text" 
                      name="cityName" 
                      value={filters.cityName} 
                      onChange={handleFilterChange} 
                      list="filterCityList" 
                      placeholder="All Cities" 
                      className="w-full bg-gray-950/60 border border-gray-800 text-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
                      autoComplete="off" 
                    />
                    <datalist id="filterCityList">
                      {cities.map(city => (
                        <option key={city.id} value={city.name} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Valuation Range</label>
                    <div className="flex gap-3">
                      <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min Price" min="0" className="w-full bg-gray-950/60 border border-gray-800 text-gray-200 rounded-xl px-3 py-3 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                      <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max Price" min="0" className="w-full bg-gray-950/60 border border-gray-800 text-gray-200 rounded-xl px-3 py-3 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Sort Order</label>
                    <select name="sortOption" value={`${filters.sortBy}_${filters.sortDirection}`} onChange={handleFilterChange} className="w-full bg-gray-950/60 border border-gray-800 text-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer">
                      <option value="createdAt_desc">Newest Listings</option>
                      <option value="createdAt_asc">Oldest Listings</option>
                      <option value="askingPrice_asc">Valuation: Low to High</option>
                      <option value="askingPrice_desc">Valuation: High to Low</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button onClick={applyFilters} className="btn-gradient w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase shadow-md shadow-primary-500/10">Apply Filters</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Listings List Area */}
          <div className="flex-1">
            {loading ? (
              /* Shimmer Skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
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
              /* Premium Empty / Fallback State */
              <div className="text-center py-20 px-6 bg-gray-950/20 border border-white/5 rounded-3xl backdrop-blur-md max-w-2xl mx-auto shadow-xl animate-fadeIn">
                <div className="w-20 h-20 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiActivity className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
                  {fetchError ? 'Verified Healthcare & Hospital Opportunities' : 'No Listings Match Your Request'}
                </h3>
                <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                  {fetchError 
                    ? 'Explore verified operational hospitals, clinics, and medical centers for sale across India. Live inventory pipeline is actively being refreshed. Connect with our M&A advisory team or submit your specific acquisition mandate.'
                    : "We couldn't find any results matching your search terms or active filters. Try refining your parameters, searching by unique asset code, or clearing your selections."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {fetchError ? (
                    <>
                      <button onClick={fetchListings} className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary-500/20">
                        Refresh Listings
                      </button>
                      <Link to="/contact-us" className="btn btn-secondary px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase border border-white/10">
                        Contact Advisory
                      </Link>
                    </>
                  ) : (
                    <button onClick={clearFilters} className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary-500/20">
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Result header */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-400 font-medium text-sm">{pagination.totalElements} premium assets active</p>
                </div>
                
                {/* Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <Link 
                      key={listing.id} 
                      to={`/listings/${listing.id}-${generateSlug(listing.displayTitle || listing.title, listing.cityName)}`} 
                      className="group relative flex flex-col bg-gray-950/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/20 hover:-translate-y-1.5 transition-all duration-500"
                    >
                      {/* Image Frame */}
                      <div className="relative h-52 overflow-hidden bg-gray-900">
                        {listing.primaryImage ? (
                          <>
                            {!loadedImages[listing.id] && (
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 animate-pulse" />
                            )}
                            <img 
                              src={listing.primaryImage} 
                              alt={listing.displayTitle} 
                              onLoad={() => handleImageLoad(listing.id)}
                              className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out ${
                                loadedImages[listing.id] ? 'opacity-100' : 'opacity-0'
                              }`} 
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900 border-b border-gray-800/30">
                            <FiActivity className="w-12 h-12 text-gray-700 group-hover:text-primary-500/30 transition-colors" />
                          </div>
                        )}
                        
                        {/* Gradient Depth Layer */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-90" />
                        
                        {/* Status Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                          {listing.dealType && (
                            <span className="px-2.5 py-1 bg-emerald-500/90 text-white backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                              {listing.dealType}
                            </span>
                          )}
                          {listing.uniqueCode && (
                            <span className="px-2.5 py-1 bg-primary-500/90 text-white backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                              {listing.uniqueCode}
                            </span>
                          )}
                        </div>

                        {listing.isConfidential && (
                          <div className="absolute top-4 right-4 pointer-events-none">
                            <span className="bg-red-500/95 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                              <FiLock className="w-3 h-3" /> Confidential
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Frame */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              {listing.categoryName}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <FiMapPin className="w-3.5 h-3.5 text-primary-500/80" /> {listing.cityName}{listing.stateName ? `, ${listing.stateName}` : ''}
                            </span>
                          </div>
                          
                          <h3 className="font-extrabold text-gray-100 text-base group-hover:text-primary-400 transition-colors duration-300 line-clamp-1 mb-2 leading-tight">
                            {listing.displayTitle}
                          </h3>
                          
                          <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                            {listing.shortDescription || "Secure verification active. Request details to view full description."}
                          </p>
                        </div>

                        <div>
                          {/* Inner Divider */}
                          <div className="border-t border-gray-800/60 my-4" />

                          {/* Footer details */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Valuation</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-white tracking-tight">
                                  {formatPrice(listing.askingPrice)}
                                </span>
                                {listing.priceNegotiable && (
                                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    Negotiable
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full font-bold shadow-sm">
                              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified Ad</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-3">
                    <button 
                      onClick={() => { setPagination(prev => ({ ...prev, page: prev.page - 1 })); fetchListings(); }} 
                      disabled={pagination.page === 0} 
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-900/60 border border-gray-800/40 rounded-xl">
                      Page {pagination.page + 1} of {pagination.totalPages}
                    </span>
                    <button 
                      onClick={() => { setPagination(prev => ({ ...prev, page: prev.page + 1 })); fetchListings(); }} 
                      disabled={pagination.page >= pagination.totalPages - 1} 
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingsPage;



