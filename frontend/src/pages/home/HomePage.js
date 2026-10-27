import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI, jobsAPI, masterAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import { generateSlug } from '../../utils/slugify';
import { 
  FiSearch, 
  FiMapPin, 
  FiDollarSign, 
  FiActivity, 
  FiTool, 
  FiBriefcase,
  FiChevronRight,
  FiStar
} from 'react-icons/fi';
import Seo from '../../components/common/Seo';

const HomePage = () => {
  const navigate = useNavigate();
  const getCategoryPath = (id, name) => {
    return `/listings?category=${encodeURIComponent(name || id)}`;
  };
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000', // Luxury Hotel & Pool
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000', // Fine Dining Restaurant
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=2000', // Aesthetic Cafe Bistro
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=2000', // Resto-Bar & Lounge
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=2000'  // Luxury Beach Resort
  ];

  useEffect(() => {
    fetchInitialData();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [listingsRes, jobsRes, categoriesRes] = await Promise.all([
        listingsAPI.getFeatured(),
        jobsAPI.getFeatured(),
        masterAPI.getCategories()
      ]);
      
      setFeaturedListings(listingsRes.data.data || []);
      setFeaturedJobs(jobsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/listings?keyword=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10">
      <Seo
        title="Buy, Sell & Lease Hotels, Cafes & Restaurants in India | DHotels"
        description="India's leading hospitality acquisitions marketplace. Buy, sell, lease and partner in hotels, cafes, restaurants, resto-bars, banquet halls, and resorts."
        path="/"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'DHotels',
            url: 'https://dhotels.co',
            logo: 'https://dhotels.co/images/logo.png',
            email: 'support@dhotels.co',
            areaServed: 'IN'
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'DHotels',
            url: 'https://dhotels.co'
          }
        ]}
      />
      {/* Hero Section with Carousel */}
      <section className="relative min-h-[620px] sm:min-h-[550px] md:h-[650px] flex items-center overflow-hidden py-12 md:py-0">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center animate-carousel"
                style={{ backgroundImage: `url(${img})` }}
              />
              <div className="absolute inset-0 bg-gray-900/40/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
            </div>
          ))}
          {/* Colorful abstract shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl opacity-60 animate-pulse-slow mix-blend-screen translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-500/20 to-primary-500/20 rounded-full blur-3xl opacity-60 animate-pulse-slow mix-blend-screen translate-y-1/3 -translate-x-1/2" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-3xl hover-3d">
            <div className="hover-3d-child">
              <div className="inline-flex items-center px-4 py-2 bg-[#db7c26]/10 border border-[#db7c26]/30 rounded-full text-[#db7c26] font-bold text-xs uppercase tracking-wider mb-6 shadow-sm shadow-[#db7c26]/5 backdrop-blur-md">
                <FiStar className="inline mr-2 text-amber-400 animate-pulse w-4 h-4" />
                India's Most Trusted Hospitality Network
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-100 mb-4 md:mb-6 leading-[1.1] tracking-tight">
                India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Premier</span>
                <br /> Hospitality Marketplace
              </h1>
              <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-10 max-w-2xl font-medium leading-relaxed">
                Connecting hoteliers, restaurateurs, and investors to buy, sell, lease, or enter profit-sharing partnerships.
              </p>

              {/* Glassmorphic Search Bar */}
              <div className="bg-gray-900/50 backdrop-blur-2xl p-2 rounded-3xl shadow-[0_8px_32px_rgba(216,87,42,0.15)] border border-white/10 max-w-2xl transition-all duration-500 hover:shadow-[0_8px_32px_rgba(216,87,42,0.25)] hover:border-[#d8572a]/30 group">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-primary-500 w-6 h-6" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search hospitals, labs, pharma..."
                      className="w-full pl-14 pr-4 py-4 bg-transparent text-gray-100 placeholder-gray-400 text-lg rounded-xl focus:outline-none transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/30"
                  >
                    Explore
                  </button>
                </form>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3 mt-6 md:mt-8">
                {[
                  { name: 'Hospitals', id: 1 }, 
                  { name: 'Diagnostic Centres', id: 3 }, 
                  { name: 'Pharma Companies', id: 2 }, 
                  { name: 'Dental Clinics', id: 4 },
                  { name: 'Pharmacies', id: 5 }
                ].map((tag) => (
                  <button 
                    key={tag.name}
                    onClick={() => navigate(getCategoryPath(tag.id))}
                    className="bg-gray-900/40/80 text-gray-300 hover:text-cyan-400 hover:bg-gray-900/40 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all border border-gray-700/50 shadow-sm hover:shadow-md hover:border-primary-200"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-100 mb-4 tracking-tight">Browse by Specialized Category</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { id: 1, name: 'Hotels', description: 'Boutique hotels, commercial lodging, and prime hospitality assets.' },
              { id: 2, name: 'Restaurants', description: 'Fine dining establishments, multi-cuisine outlets, and casual eateries.' },
              { id: 3, name: 'Cafe', description: 'Artisanal cafes, coffee shops, and trendy bistros in high-footfall hubs.' },
              { id: 4, name: 'Banquet halls', description: 'Grand celebration venues, marriage halls, and convention spaces.' },
              { id: 5, name: 'Restaurants and Bar', description: 'Licensed resto-bars, cocktail lounges, and premier nightlife venues.' },
              { id: 6, name: 'Resorts', description: 'Destination retreats, luxury stays, and scenic holiday properties.' }
            ].map((category) => {
              const IconComponent = FiBriefcase;
              return (
                <Link
                  key={category.id}
                  to={`/listings?category=${encodeURIComponent(category.name)}`}
                  className="group relative w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1.34rem)] flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d8572a]/20 to-[#db7c26]/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
                  <div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] h-full flex flex-col justify-between relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#d8572a]/10 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:border-[#db7c26]/30">
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#d8572a]/10 to-[#db7c26]/10 border border-[#db7c26]/20 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-500 relative z-10">
                        <IconComponent className="w-7 h-7 text-[#db7c26]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 tracking-tight transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                        {category.description || 'Institutional-grade healthcare opportunities and strategic placement.'}
                      </p>
                      <div className="flex items-center w-fit px-4 py-2 rounded-xl bg-[#db7c26]/10 border border-[#db7c26]/20 text-[#db7c26] font-bold text-xs uppercase tracking-wider gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        Explore Segment <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-[#d8572a] to-[#db7c26] opacity-[0.02] rounded-full blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings - Clean Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-[#db7c26]/10 to-transparent opacity-50 transform translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-100 mb-3 tracking-tight">Exclusive Opportunities</h2>
              <p className="text-lg text-gray-500">Hand-picked premium hotels, restaurants, and hospitality assets for you.</p>
            </div>
            <Link 
              to="/listings" 
              className="px-6 py-3 bg-gray-900/50 text-[#db7c26] font-bold border border-white/10 rounded-2xl hover:border-[#d8572a]/40 hover:bg-[#d8572a]/10 hover:shadow-lg hover:shadow-[#d8572a]/20 transition-all flex items-center gap-2 backdrop-blur-md"
            >
              Explore All <FiChevronRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800/40 rounded-3xl h-[450px] shadow-sm skeleton animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}-${generateSlug(listing.displayTitle || listing.title, listing.cityName)}`}
                  className="group"
                >
                  <div className="bg-gray-800/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-[#db7c26]/10 hover:-translate-y-2 hover:border-[#db7c26]/30 transition-all duration-500 h-full flex flex-col overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      {listing.primaryImage ? (
                        <img
                          src={listing.primaryImage}
                          alt={listing.displayTitle}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <FiActivity className="w-16 h-16 text-gray-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4 flex gap-2">
                        {listing.isConfidential && (
                          <span className="bg-yellow-500 text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-bold shadow-sm">
                            Confidential
                          </span>
                        )}
                        <span className="bg-[#db7c26] text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-bold shadow-sm">
                          {listing.dealTypeName}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[#db7c26] font-bold text-xs uppercase tracking-wider bg-[#db7c26]/10 border border-[#db7c26]/20 px-3 py-1.5 rounded-xl">
                          {listing.categoryName} | {listing.dealType || listing.dealTypeName}
                        </span>
                        <span className="text-gray-400 text-sm font-medium flex items-center">
                          <FiMapPin className="inline mr-1 w-4 h-4" />{listing.cityName}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-100 mb-4 line-clamp-2 group-hover:text-[#db7c26] transition-colors leading-tight">
                        {listing.displayTitle}
                      </h3>

                      <div className="mb-4 space-y-1">
                        {listing.uniqueCode && (
                          <div className="text-xs text-gray-400 font-medium">
                            <span className="text-[#db7c26] font-bold">Code:</span> {listing.uniqueCode}
                          </div>
                        )}
                        {listing.categoryDetails && (
                            <div className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                              {listing.categoryName?.toLowerCase().includes('hospital') ? (
                                <>
                                  {listing.categoryDetails.landAreaSqft ? `Area: ${Number(listing.categoryDetails.landAreaSqft).toLocaleString('en-IN')} sq ft. | ` : ''}
                                  {listing.categoryDetails.numberOfBeds ? `Beds: ${listing.categoryDetails.numberOfBeds}` : ''}
                                </>
                              ) : listing.categoryName?.toLowerCase().includes('pharmac') ? (
                                <>
                                  {listing.categoryDetails.premisesType ? `Premises: ${listing.categoryDetails.premisesType} | ` : ''}
                                  {listing.categoryDetails.yearsInBusiness ? `Years: ${listing.categoryDetails.yearsInBusiness} | ` : ''}
                                  {listing.categoryDetails.carpetAreaSqft ? `Area: ${Number(listing.categoryDetails.carpetAreaSqft).toLocaleString('en-IN')} sq ft.` : ''}
                                  {listing.categoryDetails.oneLineDescription && <div className="mt-1 italic">{listing.categoryDetails.oneLineDescription}</div>}
                                </>
                              ) : null}
                            </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Asking Price</p>
                          <div className="text-2xl font-extrabold text-gray-100">
                            {formatPrice(listing.askingPrice)}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gray-900/40 border border-gray-800 text-[#db7c26] rounded-2xl flex items-center justify-center group-hover:bg-[#db7c26] group-hover:border-[#db7c26] group-hover:text-white transition-all duration-300 shadow-sm">
                          <FiChevronRight className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* How It Works - Clean Steps */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative flex flex-col items-center">
            {/* Soft background glow spot behind the header */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-primary-500/10 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse" />
            
            <div className="inline-flex items-center justify-center gap-4 mb-2">
              {/* Left animated decorative line */}
              <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-r from-transparent to-orange-500/80 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-1/2 h-full animate-shimmer" />
              </div>
              
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-100 tracking-tight relative hover:text-[#db7c26] transition-colors">
                <Link to="/hospitals-for-sale-india">
                  Strategic <span className="text-[#db7c26]">Workflow</span>
                </Link>
              </h2>
              
              {/* Right animated decorative line */}
              <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-l from-transparent to-orange-500/80 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/80 to-transparent w-1/2 h-full animate-shimmer" />
              </div>
            </div>
            
            {/* Center underline with pulse micro-animation */}
            <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mt-3 relative overflow-hidden shadow-[0_0_10px_rgba(14,165,233,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent w-1/2 h-full animate-shimmer" />
            </div>
            
            <p className="text-sm md:text-base text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
              How we facilitate high-value healthcare transactions.
            </p>
          </div>
          <div className="flex justify-center items-center relative z-10">
            <div className="w-full max-w-4xl rounded-3xl overflow-hidden border border-gray-800/80 shadow-2xl bg-gray-900/20 backdrop-blur-md p-2 md:p-4">
              <img 
                src="/images/strat_img.png" 
                alt="Strategic Workflow" 
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Elite Hospitality Careers */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-block bg-gray-800/40 backdrop-blur-xl border border-white/5 px-4 py-1.5 rounded-full text-[#db7c26] font-bold text-xs uppercase tracking-wider mb-4 shadow-sm">
              Placements & Careers
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-100 tracking-tight leading-[1.1] mb-4">
              Hospitality & Culinary Careers
            </h2>
            <p className="text-lg text-gray-400 font-medium">
              Direct access to leadership roles, executive chefs, and operational talent in the hospitality industry.
            </p>
          </div>

          {/* Top Hospitality Roles Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 md:mb-16">
            {[
              { id: 'chefs', title: 'Executive Chefs', count: '45+', icon: FiBriefcase },
              { id: 'managers', title: 'Restaurant Managers', count: '38+', icon: FiBriefcase },
              { id: 'bar', title: 'Bartenders & Baristas', count: '60+', icon: FiTool },
              { id: 'operations', title: 'Front Desk & Operations', count: '55+', icon: FiActivity }
            ].map((role) => (
              <div key={role.id} className="bg-gray-800/40 backdrop-blur-xl rounded-[2rem] p-6 flex items-center justify-between group hover:border-[#db7c26]/30 border border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer">
                <div>
                  <p className="text-2xl font-extrabold text-gray-100 tracking-tight">{role.count}</p>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{role.title}</p>
                </div>
                <div className="w-12 h-12 bg-[#db7c26]/10 border border-[#db7c26]/20 text-[#db7c26] rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <role.icon className="w-5 h-5 text-[#db7c26]" />
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-800/40 rounded-3xl h-48 shadow-sm skeleton animate-pulse" />
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/healthcare-jobs-india/${job.id}-${generateSlug(job.title, job.cityName)}`}
                  className="group"
                >
                  <div className="bg-gray-800/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-lg hover:shadow-2xl hover:shadow-[#db7c26]/10 hover:-translate-y-2 hover:border-[#db7c26]/30 transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-[#db7c26]/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex-1 pr-4">
                        <h3 className="text-2xl font-bold text-gray-100 mb-2 group-hover:text-[#db7c26] transition-colors leading-tight">{job.title}</h3>
                        <p className="text-[#db7c26] font-semibold text-sm">{job.employerCompany || job.employerName}</p>
                      </div>
                      <span className="bg-gray-900/50 border border-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg">
                        {job.categoryName}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-400 mb-8">
                      <span className="flex items-center gap-2 bg-gray-900/50 border border-white/5 px-3 py-1 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-[#db7c26]" /> {job.cityName}
                      </span>
                      <span className="flex items-center gap-2 bg-gray-900/50 border border-white/5 px-3 py-1 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-orange-400" /> {job.employmentType?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-gray-800 mt-auto">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Package (LPA)</span>
                        <span className="text-2xl font-extrabold text-[#db7c26] tracking-tight">
                          ₹{job.salaryMinLpa} - {job.salaryMaxLpa}L
                        </span>
                      </div>
                      <div className="bg-[#db7c26]/10 text-[#db7c26] border border-[#db7c26]/20 px-6 py-3 rounded-xl font-bold text-sm tracking-wide group-hover:bg-[#db7c26] group-hover:text-white transition-all duration-300 shadow-md">
                        Apply
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="w-20 h-20 bg-[#db7c26]/10 border border-[#db7c26]/20 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <FiBriefcase className="text-[#db7c26] w-10 h-10" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-100 tracking-tight mb-4">Premium Hospitality Opportunities are Listed</h3>
              <p className="text-lg text-gray-400 font-medium mb-8 max-w-xl mx-auto leading-relaxed">
                Explore vetted leadership positions, chef roles, and operational careers active across Mumbai, Delhi, Goa, Bangalore and top destinations.
              </p>
              <button 
                onClick={() => navigate('/jobs')}
                className="bg-[#db7c26]/15 hover:bg-[#db7c26] text-white border border-[#db7c26]/20 transition-all duration-300 font-bold uppercase tracking-wider py-4 px-8 rounded-2xl shadow-lg shadow-[#db7c26]/10 hover:shadow-[#db7c26]/30 inline-flex items-center gap-2"
              >
                Search All Openings <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust & CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-[#db7c26]/10 via-[#d8572a]/5 to-transparent transform -translate-x-1/2 rounded-full blur-3xl opacity-65"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block bg-[#db7c26]/10 border border-[#db7c26]/20 px-6 py-2 rounded-full text-[#db7c26] font-bold text-xs uppercase tracking-widest mb-8 shadow-sm">
            Start Your Journey
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-100 mb-8 tracking-tight">
            The Premier <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d8572a] to-[#db7c26]">Hospitality</span> Marketplace
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of verified owners, investors, and operators. Experience trusted, confidential transitions for hotels, cafes, and restaurants.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {!isAuthenticated && (
              <Link to="/register" className="bg-gradient-to-r from-[#d8572a] to-[#db7c26] px-6 md:px-10 py-4 md:py-5 rounded-2xl text-white font-bold text-lg md:text-xl hover:from-[#c56a1e] hover:to-[#b35b13] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#db7c26]/20 hover:shadow-[#db7c26]/30">
                Create Partner ID
              </Link>
            )}
            <Link to="/listings/create" className="bg-gray-900/50 border border-white/10 px-6 md:px-10 py-4 md:py-5 rounded-2xl text-white font-bold text-lg md:text-xl hover:border-[#db7c26]/50 hover:bg-[#db7c26]/10 transition-all transform hover:-translate-y-1 shadow-lg backdrop-blur-md hover:shadow-[#db7c26]/20">
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;



