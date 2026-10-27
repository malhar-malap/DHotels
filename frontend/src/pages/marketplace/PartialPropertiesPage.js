import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI, masterAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { generateSlug } from '../../utils/slugify';
import { FiSearch, FiMapPin, FiActivity, FiFilter, FiShield, FiLock, FiCheckCircle, FiX } from 'react-icons/fi';
import Seo from '../../components/common/Seo';

const PartialPropertiesPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partialSaleDealTypes, setPartialSaleDealTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [pagination, setPagination] = useState({ page: 0, size: 12, totalElements: 0, totalPages: 0 });
  const [loadedImages, setLoadedImages] = useState({});
  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (partialSaleDealTypes.length > 0) {
      fetchPartialListings();
    }
  }, [debouncedKeyword, selectedCategory, pagination.page, partialSaleDealTypes]);

  const fetchMasterData = async () => {
    try {
      // Fetch categories — match both singular and plural naming conventions
      let relevantCategories = [];
      const catRes = await masterAPI.getCategories();
      if (catRes.data && catRes.data.success) {
        const partialCategoryNames = ['hotel', 'hotels', 'resort', 'resorts'];
        relevantCategories = catRes.data.data.filter(c => partialCategoryNames.includes(c.name.toLowerCase()));
        setCategories(relevantCategories);
      }

      // Fetch deal types to find the IDs for "Profit Sharing" or "Partial" for each category
      let allPartialTypes = [];
      for (const category of relevantCategories) {
          try {
              const dealTypesRes = await masterAPI.getDealTypes(category.id);
              if (dealTypesRes.data && dealTypesRes.data.success) {
                  const partialTypes = dealTypesRes.data.data.filter(dt => 
                    dt.name.toLowerCase().includes('profit') || dt.name.toLowerCase().includes('partial')
                  );
                  const withCategory = partialTypes.map(dt => ({ ...dt, categoryId: category.id }));
                  allPartialTypes = [...allPartialTypes, ...withCategory];
              }
          } catch(err) {
              console.error(`Error fetching deal types for category ${category.name}:`, err);
          }
      }
      
      setPartialSaleDealTypes(allPartialTypes);
      
      // If no partial types found, stop loading
      if (allPartialTypes.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
      setLoading(false);
    }
  };

  const fetchPartialListings = async () => {
    setLoading(true);
    try {
      let results = [];
      let totalElements = 0;
      
      let targetDealTypes = partialSaleDealTypes;
      if (selectedCategory) {
          targetDealTypes = partialSaleDealTypes.filter(dt => dt.categoryId.toString() === selectedCategory.toString());
      }

      for (const dt of targetDealTypes) {
          const params = {
              dealTypeId: dt.id,
              keyword: debouncedKeyword || undefined,
              page: pagination.page,
              size: pagination.size,
              sortBy: 'createdAt',
              sortDirection: 'desc'
          };
          if (selectedCategory) {
              params.categoryId = selectedCategory;
          }
          
          const response = await listingsAPI.getAll(params);
          if (response.data?.data?.content) {
              results = [...results, ...response.data.data.content];
              totalElements += response.data.data.totalElements || results.length;
          }
      }
      
      // Deduplicate listings by id to prevent double-counting
      const uniqueMap = new Map();
      results.forEach(listing => {
        if (!uniqueMap.has(listing.id)) {
          uniqueMap.set(listing.id, listing);
        }
      });
      const uniqueResults = Array.from(uniqueMap.values());

      // Sort the combined results by createdAt descending
      uniqueResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const uniqueCount = uniqueResults.length;
      setListings(uniqueResults);
      setLoadedImages({});
      setPagination(prev => ({ 
          ...prev, 
          totalElements: uniqueCount, 
          totalPages: Math.ceil(uniqueCount / prev.size) || 1 
      }));

    } catch (error) {
      console.error('Error fetching partial properties:', error);
    }
    setLoading(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    return count;
  };

  const removeFilter = (key) => {
    if (key === 'category') {
      setSelectedCategory('');
    }
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setKeyword('');
    setPagination(prev => ({ ...prev, page: 0 }));
  };



  return (
    <div className="min-h-screen bg-mesh bg-gray-900 text-gray-100 relative overflow-hidden">
      <Seo
        title="Profit Sharing & Hotel Co-Investments | DHotels"
        description="Explore profit sharing partnerships, management contracts, and co-investment acquisitions in hotels, resorts, and premium hospitality properties across India."
        path="/partial-properties"
      />
      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#d8572a]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Hero Header Area */}
      <div className="border-b border-white/5 bg-gray-950/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center md:text-left mb-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-bold text-primary-400 mb-4 tracking-wider uppercase">
              <FiShield className="w-3.5 h-3.5 text-primary-400" /> Partnership & Profit Sharing
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
              Profit Sharing & <span className="text-gradient">Co-Ownership</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Explore profit-sharing partnerships, management contracts, and fractional acquisitions in hotels and resorts. Partner with verified hospitality operators.
            </p>
          </div>

          {/* Search & Filter Glass Box */}
          <div className="glass-panel p-4 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 bg-gray-900/80 backdrop-blur-xl border border-white/5 relative z-10">
            <div className="flex-grow relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
              <input 
                type="text" 
                value={keyword} 
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPagination(prev => ({ ...prev, page: 0 }));
                }}
                placeholder="Search partial stake sales by code, category, or keyword..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-950/60 text-white placeholder-gray-500 text-sm md:text-base rounded-2xl border border-gray-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:outline-none transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex items-center bg-gray-950/40 border border-gray-800 rounded-2xl px-4 py-2">
                <FiFilter className="text-primary-400 w-4 h-4 mr-2" />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPagination(prev => ({ ...prev, page: 0 }));
                  }} 
                  className="bg-transparent text-gray-200 text-sm font-bold focus:outline-none cursor-pointer outline-none border-none py-2 pr-2"
                >
                  <option value="" className="bg-gray-950 text-gray-200">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-950 text-gray-200">{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={clearAllFilters}
                className="px-5 py-4 bg-gray-950/40 hover:bg-gray-800/40 border border-gray-800 text-gray-300 rounded-2xl font-bold text-sm transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Active Chips */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-6 animate-fadeIn">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mr-1">Active:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-gray-800/60 border border-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                  Segment: {categories.find(c => String(c.id) === String(selectedCategory))?.name || 'Selected'}
                  <button onClick={() => removeFilter('category')} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Remove category filter"><FiX className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div>
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
            /* Premium Empty State */
            <div className="text-center py-20 px-6 bg-gray-950/20 border border-white/5 rounded-3xl backdrop-blur-md max-w-2xl mx-auto shadow-xl animate-fadeIn">
              <div className="w-20 h-20 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiActivity className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">No Co-Investment Assets Found</h3>
              <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                We couldn't find any partial stake sale listings matching your filters or keyword. Try resetting your parameters or check back later.
              </p>
              <button onClick={clearAllFilters} className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary-500/20">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-400 font-medium text-sm">{pagination.totalElements} partial stake sales active</p>
              </div>

              {/* Grid layout */}
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
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-90" />
                      
                      {/* Badge tags */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                        <span className="px-2.5 py-1 bg-emerald-500/90 text-white backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                          Partial Stake Sale
                        </span>
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

                    {/* Details content */}
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
                          {listing.shortDescription || "Secure co-ownership offering. Request full business details to view prospectus."}
                        </p>
                      </div>

                      <div>
                        {/* Inner Divider */}
                        <div className="border-t border-gray-800/60 my-4" />

                        {/* Footer valuation */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Asset Value</span>
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
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-3">
                  <button 
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} 
                    disabled={pagination.page === 0} 
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800/80 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-900/60 border border-gray-800/40 rounded-xl">
                    Page {pagination.page + 1} of {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} 
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
  );
};

export default PartialPropertiesPage;
