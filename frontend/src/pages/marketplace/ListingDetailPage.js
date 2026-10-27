import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { listingsAPI, inquiriesAPI, userAPI, paymentAPI } from '../../services/api';
import { generateSlug } from '../../utils/slugify';
import { formatPrice } from '../../utils/formatPrice';
import { loadRazorpay } from '../../utils/loadRazorpay';
import { useAuth } from '../../context/AuthContext';
import VerificationModal from '../../components/VerificationModal';
import Seo, { absoluteUrl, truncate, SITE_URL } from '../../components/common/Seo';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiCheck, FiArrowLeft, FiShield, FiPhoneCall, FiCheckCircle, FiInfo, FiChevronLeft, FiLock, FiUnlock, FiCreditCard, FiUser } from 'react-icons/fi';

const ListingDetailPage = () => {
  const { id } = useParams();
  const numericId = id ? id.split('-')[0] : '';
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [inquiryData, setInquiryData] = useState({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentChecking, setPaymentChecking] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);

  useEffect(() => { 
    fetchListing();
    if (isAuthenticated && !user?.isVerifiedBuyer) {
      fetchVerificationStatus();
    }
  }, [numericId, isAuthenticated, user]);

  // Check if user has already paid for this listing
  useEffect(() => {
    if (isAuthenticated && numericId) {
      checkPaymentStatus();
    } else {
      setPaymentChecking(false);
    }
  }, [isAuthenticated, numericId]);

  const checkPaymentStatus = async () => {
    try {
      setPaymentChecking(true);
      const res = await paymentAPI.checkPayment(numericId);
      if (res.data?.data?.paid) {
        setHasPaid(true);
        setSellerDetails(res.data.data.paymentDetails);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setPaymentChecking(false);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      const res = await userAPI.getVerificationStatus();
      if (res.data?.data) {
        setVerificationStatus(res.data.data.status);
      }
    } catch (error) {
      console.error('Error fetching verification status', error);
    }
  };

  const fetchListing = async () => {
    try {
      const response = await listingsAPI.getById(numericId);
      const fetchedListing = response.data.data;
      setListing(fetchedListing);
      if (user) setInquiryData({ buyerName: user.fullName || '', buyerEmail: user.email || '', buyerPhone: user.mobileNumber || '', message: '' });
      
      // Dynamic SEO Slug redirection / Canonical URL verification
      if (fetchedListing) {
        const canonicalSlug = generateSlug(fetchedListing.displayTitle || fetchedListing.title, fetchedListing.cityName);
        const expectedPath = `/listings/${fetchedListing.id}-${canonicalSlug}`;
        if (location.pathname !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }
      }
    } catch (error) { console.error('Error fetching listing:', error); }
    setLoading(false);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to send inquiry'); return; }
    setSubmitting(true);
    try {
      await inquiriesAPI.create(numericId, inquiryData);
      toast.success('Inquiry sent successfully!');
      setShowInquiryModal(false);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to send inquiry'); }
    setSubmitting(false);
  };

  // ========== RAZORPAY PAYMENT HANDLER ==========
  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase contact access');
      return;
    }

    setPaymentLoading(true);

    try {
      // Ensure Razorpay script is loaded dynamically
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Unable to load payment gateway. Please check your network connection.');
        setPaymentLoading(false);
        return;
      }

      // Step 1: Create Razorpay order on backend
      const orderRes = await paymentAPI.createOrder(numericId);
      const orderData = orderRes.data.data;

      // Step 2: Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.companyName,
        description: `Contact Access: ${orderData.listingTitle}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              listingId: parseInt(numericId),
            });

            if (verifyRes.data?.success) {
              const sellerData = verifyRes.data.data;
              setHasPaid(true);
              setSellerDetails(sellerData);
              toast.success('Payment successful! Seller contact details unlocked.');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error(verifyError.response?.data?.message || 'Payment verification failed.');
          }
          setPaymentLoading(false);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.mobileNumber || '',
        },
        theme: {
          color: '#0d9488',
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentLoading(false);
        toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
      });
      rzp.open();

    } catch (error) {
      setPaymentLoading(false);
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };



  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>);
  }

  if (!listing) {
    return (<div className="min-h-screen flex items-center justify-center"><Seo title="Listing Not Found | DH Acquisitions" noindex statusCode={404} /><div className="text-center"><h2 className="text-xl font-bold text-gray-200 mb-2">Listing Not Found</h2><Link to="/listings" className="text-primary-500">Back to Listings</Link></div></div>);
  }

  const isOwner = isAuthenticated && user?.id === listing?.seller?.id;

  // Search meta - only public fields (displayTitle hides the real name of confidential listings)
  const seoName = listing.displayTitle || 'Healthcare Business';
  const seoPath = `/listings/${listing.id}-${generateSlug(seoName, listing.cityName)}`;
  const seoTitle = listing.cityName && !seoName.toLowerCase().includes(listing.cityName.toLowerCase())
    ? `${seoName} in ${listing.cityName} | DH Acquisitions`
    : `${seoName} | DH Acquisitions`;
  const seoDescription = truncate(listing.shortDescription || listing.detailedDescription) ||
    truncate(`${listing.category?.name || 'Healthcare business'} ${listing.dealType?.name ? `(${listing.dealType.name}) ` : ''}in ${[listing.cityName, listing.stateName].filter(Boolean).join(', ') || 'India'}. View details on DH Acquisitions.`);
  const seoImages = (listing.images || []).map(absoluteUrl);
  const seoSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: seoName,
      description: seoDescription,
      ...(seoImages.length > 0 && { image: seoImages }),
      ...(listing.category?.name && { category: listing.category.name }),
      ...(listing.uniqueCode && { sku: listing.uniqueCode }),
      ...(listing.askingPrice && {
        offers: {
          '@type': 'Offer',
          price: listing.askingPrice,
          priceCurrency: 'INR',
          availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          url: `${SITE_URL}${seoPath}`
        }
      })
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${SITE_URL}/listings` },
        { '@type': 'ListItem', position: 3, name: seoName, item: `${SITE_URL}${seoPath}` }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10 py-8">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={seoPath}
        image={seoImages[0]}
        type="product"
        noindex={listing.status && listing.status !== 'ACTIVE'}
        schema={seoSchema}
      />
      <div className="max-w-7xl mx-auto px-4">
        <Link to="/listings" className="inline-flex items-center text-gray-400 hover:text-primary-500 mb-6"><FiChevronLeft className="mr-1" />Back to Listings</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="card overflow-hidden group">
              <div className="h-64 md:h-96 bg-gray-200 relative">
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <img 
                      src={listing.images[currentImageIndex]} 
                      alt={listing.displayTitle} 
                      className="w-full h-full object-cover transition-all duration-300" 
                    />
                    
                    {listing.images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-900 p-2 rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          <FiChevronLeft className="text-gray-200" size={24} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 hover:bg-gray-900 p-2 rounded-full shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          <FiChevronLeft className="text-gray-200 rotate-180" size={24} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {listing.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-xl">No Image Available</span>
                  </div>
                )}
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="flex overflow-x-auto gap-2 p-4 scrollbar-hide">
                  {listing.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`${idx + 1}`} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg cursor-pointer transition-all ${
                        currentImageIndex === idx ? 'ring-4 ring-primary-500 scale-95 opacity-100' : 'opacity-60 hover:opacity-100'
                      }`} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary">{listing.category?.name}</span>
                    <span className="badge badge-secondary">{listing.dealType?.name}</span>
                    {listing.uniqueCode && (
                      <span className="px-2 py-1 bg-[#db7c26]/10 text-[#db7c26] border border-[#db7c26]/20 rounded text-xs font-bold uppercase tracking-wider">Code: {listing.uniqueCode}</span>
                    )}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-200">{listing.displayTitle}</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Asking Price</p>
                  <p className="text-xl font-bold text-primary-600">{formatPrice(listing.askingPrice)}</p>
                  {listing.priceNegotiable && <p className="text-xs text-gray-500">Negotiable</p>}
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-200">{listing.cityName}</p>
                  <p className="text-sm text-gray-500">{listing.stateName}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Inquiries</p>
                  <p className="text-lg font-semibold text-gray-200">{listing.inquiryCount}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-2">Description</h2>
                <p className="text-gray-400 whitespace-pre-line">{listing.shortDescription}</p>
              </div>

              {listing.detailedDescription && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-200 mb-2">Detailed Description</h2>
                  <p className="text-gray-400 whitespace-pre-line">{listing.detailedDescription}</p>
                </div>
              )}

              {listing.categoryDetails && (() => {
                const currencyFields = ['annualRevenue', 'annualTurnover', 'askingPrice'];
                const areaFields = ['landAreaSqft', 'carpetAreaSqft', 'totalLandAreaSqft', 'plotAreaSqft', 'constructedAreaSqft'];
                const percentFields = ['stakePercentage'];
                const hiddenKeys = ['id', 'listingId', 'listing', 'createdAt', 'updatedAt', 'hospitalType', 'equipmentType'];

                const displayableEntries = Object.entries(listing.categoryDetails).filter(([key, value]) => {
                  if (hiddenKeys.includes(key)) return false;
                  if (value === null || value === undefined || value === '') {
                    return typeof value === 'boolean';
                  }
                  return true;
                });

                return (
                  <div className="border-t border-gray-700 pt-6">
                    <h2 className="text-lg font-semibold text-gray-200 mb-4">Additional Details</h2>
                    {displayableEntries.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No additional details provided by the seller for this listing.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {displayableEntries.map(([key, value]) => {
                          let displayValue;
                          if (typeof value === 'boolean') {
                            displayValue = value ? 'Yes' : 'No';
                          } else if (typeof value === 'object') {
                            displayValue = value.name || JSON.stringify(value);
                          } else if (currencyFields.includes(key)) {
                            displayValue = formatPrice(value);
                          } else if (areaFields.includes(key)) {
                            displayValue = `${Number(value).toLocaleString('en-IN')} sq ft`;
                          } else if (percentFields.includes(key)) {
                            displayValue = `${value}%`;
                          } else {
                            displayValue = value;
                          }

                          return (
                            <div key={key} className="bg-gray-800 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                              <p className="font-medium text-gray-200">{displayValue}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-2xl md:text-3xl font-bold text-primary-600">{formatPrice(listing.askingPrice)}</p>
                {listing.priceNegotiable && <span className="text-sm text-gray-500">Price Negotiable</span>}
              </div>

              {isOwner ? (
                <Link to={`/listings/${listing.id}/edit`} className="btn btn-primary w-full py-3 mb-3 font-bold text-center block bg-[#db7c26] text-white rounded-lg">
                  Edit Listing
                </Link>
              ) : (
                <div className="space-y-4">
                  {/* Payment / Contact Access Section */}
                  {paymentChecking ? (
                    // Loading state while checking payment
                    <div className="w-full py-6 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#d8572a]"></div>
                      <span className="ml-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Checking access...</span>
                    </div>
                  ) : hasPaid && sellerDetails ? (
                    // ✅ PAID — Show seller contact details
                    <div className="relative overflow-hidden rounded-[1.2rem] border border-[#db7c26]/20 bg-gray-900/60 backdrop-blur-xl shadow-2xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#db7c26] to-[#d8572a] px-5 py-3.5 flex items-center gap-2">
                        <FiUnlock className="w-4 h-4 text-white" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Contact Unlocked</span>
                        <FiCheckCircle className="w-4 h-4 text-white ml-auto" />
                      </div>
                      
                      {/* Seller Details */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-950/40 border border-white/5 rounded-xl shadow-inner">
                          <div className="w-10 h-10 rounded-full bg-[#db7c26]/10 flex items-center justify-center border border-[#db7c26]/20">
                            <FiUser className="w-5 h-5 text-[#db7c26]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Seller Name</p>
                            <p className="text-sm font-bold text-gray-200 truncate">{sellerDetails.sellerName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-950/40 border border-white/5 rounded-xl shadow-inner">
                          <div className="w-10 h-10 rounded-full bg-[#db7c26]/10 flex items-center justify-center border border-[#db7c26]/20">
                            <FiMail className="w-5 h-5 text-[#db7c26]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                            <a href={`mailto:${sellerDetails.sellerEmail}`} className="text-sm font-bold text-[#db7c26] hover:text-[#d8572a] hover:underline truncate block">
                              {sellerDetails.sellerEmail}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-950/40 border border-white/5 rounded-xl shadow-inner">
                          <div className="w-10 h-10 rounded-full bg-[#db7c26]/10 flex items-center justify-center border border-[#db7c26]/20">
                            <FiPhone className="w-5 h-5 text-[#db7c26]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                            <a href={`tel:${sellerDetails.sellerPhone}`} className="text-sm font-bold text-[#db7c26] hover:text-[#d8572a] hover:underline">
                              {sellerDetails.sellerPhone}
                            </a>
                          </div>
                        </div>

                        <p className="text-[8px] font-bold text-[#db7c26]/70 text-center uppercase tracking-widest pt-1">
                          ✅ Verified Payment • Dashboard Sync Complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    // 🔒 NOT PAID — Show payment button
                    <>
                      <div className="group relative w-full">
                        <button 
                          onClick={handlePayment}
                          disabled={paymentLoading}
                          className={`w-full py-4 rounded-[1.2rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-lg flex flex-col items-center justify-center gap-1 ${
                            paymentLoading 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-900 border-2 border-ethereal-primary/30 text-ethereal-primary hover:bg-ethereal-primary hover:text-white shadow-ethereal-primary/5 group'
                          }`}
                        >
                          {paymentLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                              Processing...
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-2">
                                <FiCreditCard className="w-4 h-4" />
                                ₹1000 | Contact Access
                              </span>
                              <span className="text-[8px] opacity-60">Secure Payment via Razorpay</span>
                            </>
                          )}
                        </button>
                        {/* Tooltip */}
                        {!paymentLoading && (
                          <div className="invisible group-hover:visible absolute z-[60] bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 max-w-[calc(100vw-2rem)] p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-fadeIn pointer-events-none">
                            <div className="flex items-start gap-3">
                              <FiInfo className="w-4 h-4 text-ethereal-primary shrink-0 mt-0.5" />
                              <p className="text-[10px] font-medium leading-relaxed">
                                Pay ₹1000 to unlock the seller's contact details (name, email & phone). Your payment is secured by Razorpay.
                              </p>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 py-1">
                        <FiLock className="w-3 h-3 text-gray-300" />
                        <p className="text-[9px] font-bold text-gray-300 text-center uppercase tracking-widest">
                          Seller details locked until payment
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="modal-overlay" onClick={() => setShowInquiryModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-200 mb-4">Send Inquiry</h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div><label className="form-label">Your Name</label><input type="text" value={inquiryData.buyerName} onChange={e => setInquiryData({ ...inquiryData, buyerName: e.target.value })} className="form-input" required /></div>
              <div><label className="form-label">Email</label><input type="email" value={inquiryData.buyerEmail} onChange={e => setInquiryData({ ...inquiryData, buyerEmail: e.target.value })} className="form-input" required /></div>
              <div><label className="form-label">Phone</label><input type="tel" value={inquiryData.buyerPhone} onChange={e => setInquiryData({ ...inquiryData, buyerPhone: e.target.value })} className="form-input" required /></div>
              <div><label className="form-label">Message</label><textarea value={inquiryData.message} onChange={e => setInquiryData({ ...inquiryData, message: e.target.value })} className="form-input" rows="4" maxLength="300" placeholder="I'm interested in this listing..." required /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowInquiryModal(false)} className="btn btn-secondary flex-1">Cancel</button><button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Sending...' : 'Send Inquiry'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)} 
        onSuccess={fetchVerificationStatus}
      />
    </div>
  );
};

export default ListingDetailPage;





