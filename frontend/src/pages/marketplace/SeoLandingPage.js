import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateSlug } from '../../utils/slugify';
import axios from 'axios';
import { listingsAPI } from '../../services/api';
import { seoData } from './seoData';
import { FiChevronLeft, FiMapPin, FiActivity, FiArrowRight, FiPlus, FiMinus, FiShield, FiLock, FiInfo } from 'react-icons/fi';

const SeoLandingPage = ({ pathKey }) => {
  const data = seoData[pathKey];
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Fetch Listings Effect
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchListings = async () => {
      if (!data) return;
      setLoadingListings(true);
      try {
        const params = {
          categoryId: data.categoryId,
          cityName: data.locationName,
          size: 3
        };
        const response = await listingsAPI.getAll(params, {
          signal: controller.signal,
          timeout: 4000 // 4s timeout ceiling for bot crawls
        });
        if (isMounted && response?.data) {
          const content = response.data.data?.content || response.data.listings || response.data.data || [];
          setListings(Array.isArray(content) ? content : []);
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED' || err.response?.status === 499) {
          // Graceful silent fallback for headless search bots & aborted fetches
          if (isMounted) setListings([]);
          return;
        }
        console.warn('Notice: Matching listings unavailable:', err.message || err);
        if (isMounted) setListings([]);
      } finally {
        if (isMounted) {
          setLoadingListings(false);
        }
      }
    };

    fetchListings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [data]);

  const renderFormattedContent = (text) => {
    return text.split('\n').map((line, lineIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('- ');
      let cleanLine = isBullet ? trimmed.substring(2) : line;

      const parts = cleanLine.split('**');
      const renderedLine = parts.map((part, partIdx) => {
        return partIdx % 2 === 1 ? (
          <strong key={partIdx} className="text-white font-extrabold">
            {part}
          </strong>
        ) : (
          part
        );
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-6 list-disc list-outside text-gray-400 pl-1 mb-2">
            {renderedLine}
          </li>
        );
      }

      if (!trimmed) {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <p key={lineIdx} className="text-gray-400 leading-relaxed mb-4">
          {renderedLine}
        </p>
      );
    });
  };

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <Link to="/listings" className="text-primary-500 hover:underline">Go to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh bg-gray-900 text-gray-100 relative overflow-hidden">
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <link rel="canonical" href={data.canonicalUrl} />
        <meta property="og:title" content={data.ogTitle || data.title} />
        <meta property="og:description" content={data.ogDescription || data.description} />
        <meta property="og:url" content={data.canonicalUrl} />
        {data.schemaMarkup && (
          <script type="application/ld+json">
            {JSON.stringify(data.schemaMarkup)}
          </script>
        )}
      </Helmet>

      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#d8572a]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Hero Header Area */}
      <div className="border-b border-white/5 bg-gray-950/20 backdrop-blur-sm pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blogs" className="hover:text-primary-400 transition-colors">Blogs</Link>
            <span>/</span>
            <span className="text-gray-300 truncate">{data.h1}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-bold text-primary-400 mb-4 tracking-wider uppercase">
              <FiShield className="w-3.5 h-3.5" /> Market Insights & Research
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {data.h1}
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              {data.introduction}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar Table of Contents */}
          <aside className="lg:w-1/4 lg:sticky lg:top-24 lg:self-start w-full">
            <div className="bg-gray-950/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 pb-2 border-b border-white/5">
                On This Page
              </h3>
              <nav className="space-y-3">
                {data.sections.map((sec, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="block text-xs font-semibold text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {sec.heading}
                  </a>
                ))}
                <a
                  href="#active-listings"
                  className="block text-xs font-semibold text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Active Opportunities
                </a>
                <a
                  href="#faq-section"
                  className="block text-xs font-semibold text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Frequently Asked Questions
                </a>
              </nav>
            </div>
          </aside>

          {/* Right Main Text Content */}
          <main className="flex-grow lg:w-3/4 w-full space-y-12">
            <div className="glass-panel p-8 rounded-3xl bg-gray-900/60 border border-white/5">
              {data.sections.map((sec, idx) => (
                <section key={idx} id={`#section-${idx}`} className="scroll-mt-24 mb-10 last:mb-0 space-y-4">
                  <h2 className="text-xl md:text-2xl font-extrabold text-white border-l-4 border-primary-500 pl-3">
                    {sec.heading}
                  </h2>
                  <div className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {renderFormattedContent(sec.content)}
                  </div>
                </section>
              ))}
            </div>

            {/* Dynamic Listings Section */}
            <section id="active-listings" className="scroll-mt-24 space-y-6">
              <h2 className="text-xl md:text-2xl font-extrabold text-white pl-1">
                Active Opportunities in {data.locationName}
              </h2>
              
              {loadingListings ? (
                /* Shimmer Skeletons */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-950/40 border border-white/5 rounded-3xl overflow-hidden p-4 shadow-md animate-pulse">
                      <div className="bg-gray-800/60 rounded-2xl h-48 w-full mb-4"></div>
                      <div className="h-4 bg-gray-800/60 rounded w-1/3 mb-3"></div>
                      <div className="h-6 bg-gray-800/60 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-800/60 rounded w-1/2 mb-6"></div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                /* Clean Empty/CTA Slate */
                <div className="p-8 rounded-3xl bg-gray-950/40 border border-white/5 text-center max-w-2xl mx-auto space-y-6">
                  <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FiInfo className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Dynamic Asset Pipeline Active</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Listing availability in {data.locationName} fluctuates over time due to transaction completions and confidentiality protocols. Currently, no active open listings exist specifically matching this location filter.
                  </p>
                  <Link 
                    to={data.marketplaceUrl} 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-300"
                  >
                    View All {data.categoryName} in India <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Real Listing Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <Link
                      key={listing.id}
                      to={`/listings/${listing.id}-${generateSlug(listing.displayTitle || listing.title, listing.cityName)}`}
                      className="group relative flex flex-col bg-gray-950/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/20 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-900">
                        {listing.primaryImage ? (
                          <>
                            {!loadedImages[listing.id] && (
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 animate-pulse" />
                            )}
                            <img
                              src={listing.primaryImage}
                              alt={listing.displayTitle}
                              onLoad={() => handleImageLoad(listing.id)}
                              className={`w-full h-full object-cover transition-opacity duration-500 ${
                                loadedImages[listing.id] ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <FiActivity className="w-10 h-10 text-gray-700" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-[8px] font-black uppercase tracking-wider rounded-full">
                            {listing.dealType}
                          </span>
                        </div>
                        {listing.isConfidential && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-red-500/90 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FiLock className="w-2.5 h-2.5" /> Confidential
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              {listing.categoryName}
                            </span>
                            <span className="text-gray-400 text-[10px] flex items-center gap-1">
                              <FiMapPin className="w-3 h-3 text-primary-500" /> {listing.cityName}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-100 text-sm line-clamp-1 mb-1 group-hover:text-primary-400 transition-colors">
                            {listing.displayTitle}
                          </h4>
                          <p className="text-gray-400 text-xs line-clamp-2">
                            {listing.shortDescription}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Interactive FAQs Accordion */}
            <section id="faq-section" className="scroll-mt-24 space-y-6">
              <h2 className="text-xl md:text-2xl font-extrabold text-white pl-1">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {data.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-white/5 rounded-2xl bg-gray-950/20 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm md:text-base text-white hover:bg-white/5 transition-colors duration-200 outline-none"
                    >
                      <span>{faq.question}</span>
                      {openFaqIndex === idx ? (
                        <FiMinus className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      ) : (
                        <FiPlus className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        openFaqIndex === idx ? 'max-h-[300px] border-t border-white/5' : 'max-h-0'
                      } overflow-hidden`}
                    >
                      <p className="px-6 py-5 text-xs md:text-sm text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Premium CTA */}
            <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-gray-950/60 to-gray-900/60 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />
              
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold text-white">Find Your Ideal Asset</h3>
                <p className="text-gray-400 text-xs md:text-sm max-w-lg leading-relaxed">
                  Join India's most secure corporate healthcare acquisition portal to post your mandates or browse verified listings nationwide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link
                  to={data.marketplaceUrl}
                  className="btn btn-primary text-xs uppercase tracking-wider w-full sm:w-auto font-black shadow-lg shadow-primary-500/20"
                >
                  Browse Marketplace
                </Link>
                <Link
                  to="/contact-us"
                  className="btn btn-secondary text-xs uppercase tracking-wider w-full sm:w-auto font-black border border-white/5"
                >
                  Contact Analyst
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SeoLandingPage;
