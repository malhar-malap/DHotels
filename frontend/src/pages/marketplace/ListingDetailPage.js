import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
// import { authPath } from '../../utils/authRedirect'; // Paid contact access (₹1,000 per connection) paused
import {
  PiMapPin, PiCaretLeft, PiCaretRight, PiLockKey, PiPhone, PiEnvelopeSimple, PiUser,
  PiSealCheck, PiEye, PiClock, PiNotePencil, PiArrowLeft,
} from 'react-icons/pi';
import { listingsAPI /* , paymentAPI */ } from '../../services/api'; // Paid contact access (₹1,000 per connection) paused
import { generateSlug } from '../../utils/slugify';
import { formatListingPrice, listingPriceParts } from '../../utils/formatPrice';
// import { loadRazorpay } from '../../utils/loadRazorpay'; // Paid contact access (₹1,000 per connection) paused
import { getCategoryMeta, getSpecs, getPropertyFacts, parseAmenities, formatLocation, categoryImage, resolveImage, priceLabelFor, isSampleImage, hasBurnedInNote, SAMPLE_IMAGE_NOTE /* , CONTACT_FEE */ } from '../../utils/hospitality';
import { useAuth } from '../../context/AuthContext';
import Seo, { absoluteUrl, truncate, SITE_URL } from '../../components/common/Seo';
// import toast from 'react-hot-toast'; // Paid contact access (₹1,000 per connection) paused

const ListingDetailPage = () => {
  const { id } = useParams();
  const numericId = id ? id.split('-')[0] : '';
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  /* Paid contact access (₹1,000 per connection) paused: seller details now come with the listing itself.
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentChecking, setPaymentChecking] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);
  */

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await listingsAPI.getById(numericId);
        const fetched = response.data.data;
        setListing(fetched);
        setImageIndex(0);
        // Canonical slug redirect
        if (fetched) {
          const expectedPath = `/listings/${fetched.id}-${generateSlug(fetched.displayTitle || fetched.title, fetched.cityName)}`;
          if (location.pathname !== expectedPath) navigate(expectedPath, { replace: true });
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setListing(null);
      }
      setLoading(false);
    };
    fetchListing();
  }, [numericId]);

  /* Paid contact access (₹1,000 per connection) paused
  useEffect(() => {
    if (!isAuthenticated || !numericId) {
      setPaymentChecking(false);
      return;
    }
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
    checkPaymentStatus();
  }, [isAuthenticated, numericId]);

  const handlePayment = async () => {
    if (!isAuthenticated) {
      navigate(authPath(location));
      return;
    }
    setPaymentLoading(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Unable to load the payment gateway. Please check your connection.');
        setPaymentLoading(false);
        return;
      }

      const orderRes = await paymentAPI.createOrder(numericId);
      const orderData = orderRes.data.data;

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.companyName,
        description: `Contact Access: ${orderData.listingTitle}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              listingId: parseInt(numericId, 10),
            });
            if (verifyRes.data?.success) {
              setHasPaid(true);
              setSellerDetails(verifyRes.data.data);
              toast.success('Payment successful — owner contact unlocked.');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error(verifyError.response?.data?.message || 'Payment verification failed.');
          }
          setPaymentLoading(false);
        },
        prefill: { name: user?.fullName || '', email: user?.email || '', contact: user?.mobileNumber || '' },
        theme: { color: '#C9A25A' },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast('Payment cancelled');
          },
        },
      });
      rzp.on('payment.failed', (response) => {
        setPaymentLoading(false);
        toast.error(`Payment failed: ${response.error?.description || 'Unknown error'}`);
      });
      rzp.open();
    } catch (error) {
      setPaymentLoading(false);
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to start payment. Please try again.');
    }
  };
  */

  if (loading) {
    return (
      <div className="container-site py-10">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-800" />
        <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-gray-800" />
        <div className="mt-8 aspect-[16/7] animate-pulse rounded-2xl bg-gray-900" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Seo title="Listing Not Found | DHotels24.com" noindex statusCode={404} />
        <h1 className="heading-lg">This listing isn’t available</h1>
        <p className="mt-3 text-gray-400">It may have been sold, withdrawn or is still under review.</p>
        <Link to="/listings" className="btn-brass mt-8">Browse the marketplace</Link>
      </div>
    );
  }

  const meta = getCategoryMeta(listing.category?.name);
  const categoryName = listing.category?.name;
  const dealName = listing.dealType?.name;
  const isOwner = isAuthenticated && user?.id === listing?.seller?.id;
  // The API leaves out the seller's contact details only for confidential listings
  const seller = listing.seller || {};
  const sellerVisible = Boolean(seller.fullName || seller.email || seller.mobileNumber);
  const specs = getSpecs(categoryName, listing.categoryDetails);
  const images = (listing.images || []).map(resolveImage).filter(Boolean);
  const gallery = images.length > 0 ? images : [categoryImage(categoryName)];
  const place = formatLocation(listing);
  const facts = getPropertyFacts(listing.categoryDetails);
  const amenities = parseAmenities(listing.categoryDetails);
  const priceParts = listingPriceParts(listing);
  const listedOn = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null;
  const priceLabel = priceLabelFor(dealName);

  // Search meta — only public fields (displayTitle hides the real name of confidential listings)
  const seoName = listing.displayTitle || meta?.singular || 'Hospitality property';
  const seoPath = `/listings/${listing.id}-${generateSlug(seoName, listing.cityName)}`;
  const seoTitle = listing.cityName && !seoName.toLowerCase().includes(listing.cityName.toLowerCase())
    ? `${seoName} in ${listing.cityName} | DHotels24.com`
    : `${seoName} | DHotels24.com`;
  const seoDescription = truncate(listing.shortDescription || listing.detailedDescription) ||
    truncate(`${meta?.singular || 'Hospitality property'} ${dealName ? `(${dealName.toLowerCase()}) ` : ''}in ${place || 'India'}. View details on DHotels24.com.`);
  const seoImages = images.map(absoluteUrl);
  const seoSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: seoName,
      description: seoDescription,
      ...(seoImages.length > 0 && { image: seoImages }),
      ...(categoryName && { category: categoryName }),
      ...(listing.uniqueCode && { sku: listing.uniqueCode }),
      ...(listing.askingPrice && !listing.priceNotDisclosed && {
        offers: {
          '@type': 'Offer',
          price: listing.askingPrice,
          priceCurrency: 'INR',
          availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          url: `${SITE_URL}${seoPath}`,
        },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: meta?.label || 'Marketplace', item: `${SITE_URL}${meta?.path || '/listings'}` },
        { '@type': 'ListItem', position: 3, name: seoName, item: `${SITE_URL}${seoPath}` },
      ],
    },
  ];

  const step = (delta) => setImageIndex((i) => (i + delta + gallery.length) % gallery.length);

  return (
    <div className="bg-gray-950 pb-24 lg:pb-16">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={seoPath}
        image={seoImages[0]}
        type="product"
        noindex={listing.status && listing.status !== 'ACTIVE'}
        schema={seoSchema}
      />

      <div className="container-site pt-8">
        <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link to="/listings" className="flex items-center gap-1 hover:text-gray-300"><PiArrowLeft className="h-3.5 w-3.5" /> Marketplace</Link>
          {meta && (<><span>/</span><Link to={meta.path} className="hover:text-gray-300">{meta.label}</Link></>)}
        </nav>

        {/* Title block */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip-brass">{meta?.singular || categoryName}</span>
              {dealName && <span className="chip">{dealName}</span>}
              {listing.status === 'ACTIVE' && (
                <span className="chip !border-emerald-400/20 !text-emerald-300"><PiSealCheck className="h-3.5 w-3.5" /> Reviewed listing</span>
              )}
              {listing.status && listing.status !== 'ACTIVE' && <span className="chip !text-amber-300">{listing.status.toLowerCase()}</span>}
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight text-gray-50 sm:text-4xl lg:text-[2.75rem]">{listing.displayTitle}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-gray-300"><PiMapPin className="h-5 w-5 text-primary-400" /> {place || 'India'}</p>
          </div>
          {listing.uniqueCode && (
            <p className="text-sm text-gray-500">Listing code <span className="ml-1 font-mono text-gray-200">{listing.uniqueCode}</span></p>
          )}
        </div>

        {/* Gallery */}
        <div className={`mt-8 grid gap-2 ${gallery.length > 1 ? 'lg:grid-cols-[2fr_1fr] lg:grid-rows-2' : ''}`}>
          <div className={`group relative overflow-hidden rounded-2xl bg-gray-900 ${gallery.length > 1 ? 'aspect-[16/10] lg:row-span-2 lg:aspect-auto lg:min-h-[28rem]' : 'aspect-[16/10] lg:aspect-[21/9]'}`}>
            <img
              src={gallery[imageIndex]}
              alt={listing.displayTitle}
              onError={(e) => { e.currentTarget.src = categoryImage(categoryName); }}
              className={`h-full w-full object-cover ${hasBurnedInNote(gallery[imageIndex]) ? 'object-bottom' : ''}`}
            />
            {gallery.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-950/70 text-gray-50 backdrop-blur transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <PiCaretLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-950/70 text-gray-50 backdrop-blur transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <PiCaretRight className="h-5 w-5" />
                </button>
                <span className={`absolute right-4 rounded-full bg-gray-950/70 px-3 py-1 text-xs font-medium text-gray-100 backdrop-blur ${hasBurnedInNote(gallery[imageIndex]) ? 'bottom-12' : 'bottom-4'}`}>
                  {imageIndex + 1} / {gallery.length}
                </span>
              </>
            )}
            {(images.length === 0 || isSampleImage(gallery[imageIndex])) && !hasBurnedInNote(gallery[imageIndex]) && (
              <span className="absolute bottom-4 left-4 rounded-full bg-gray-950/70 px-3 py-1 text-xs text-gray-300 backdrop-blur">{SAMPLE_IMAGE_NOTE}</span>
            )}
          </div>
          {gallery.length > 1 && gallery.slice(1, 3).map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setImageIndex(i + 1)}
              className="relative hidden overflow-hidden rounded-2xl bg-gray-900 lg:block"
              aria-label={`Show photo ${i + 2}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              {i === 1 && gallery.length > 3 && (
                <span className="absolute inset-0 flex items-center justify-center bg-gray-950/60 text-sm font-semibold text-gray-50">+{gallery.length - 3} photos</span>
              )}
            </button>
          ))}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide lg:hidden">
            {gallery.map((img, i) => (
              <button key={img} type="button" onClick={() => setImageIndex(i)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ${i === imageIndex ? 'ring-2 ring-primary-400' : 'opacity-60'}`} aria-label={`Show photo ${i + 1}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Key facts */}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] xl:grid-cols-4">
              <div className="bg-gray-950 p-5">
                <dt className="text-xs text-gray-500">{priceLabel}</dt>
                <dd className="stat-value mt-1 whitespace-nowrap text-2xl">
                  {priceParts.price}
                  {priceParts.suffix && <span className="ml-1 font-sans text-sm font-normal text-gray-400">{priceParts.suffix}</span>}
                </dd>
              </div>
              {specs.map((s) => (
                <div key={s.key} className="bg-gray-950 p-5">
                  <dt className="text-xs text-gray-500">{s.label}</dt>
                  <dd className="stat-value mt-1 whitespace-nowrap text-2xl">{s.value}</dd>
                </div>
              ))}
              {specs.length < 3 && (
                <div className="bg-gray-950 p-5">
                  <dt className="text-xs text-gray-500">Deal type</dt>
                  <dd className="stat-value mt-1 whitespace-nowrap text-2xl">{dealName || '—'}</dd>
                </div>
              )}
            </dl>

            {listing.shortDescription && (
              <section className="mt-10">
                <h2 className="eyebrow">Overview</h2>
                <p className="mt-3 font-display text-xl leading-relaxed text-gray-100">{listing.shortDescription}</p>
              </section>
            )}

            {listing.detailedDescription && (
              <section className="mt-10">
                <h2 className="eyebrow">About the property</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-300">{listing.detailedDescription}</p>
              </section>
            )}

            {amenities.length > 0 && (
              <section className="mt-10">
                <h2 className="eyebrow">Amenities &amp; features</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <li key={a} className="chip">{a}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10 border-t border-white/[0.06] pt-8">
              <h2 className="eyebrow">Listing details</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {[
                  ['Property type', meta?.singular || categoryName],
                  ['Deal type', dealName],
                  ['Location', place],
                  ...specs.map((s) => [s.label, s.value]),
                  ...facts.map((f) => [f.label, f.value]),
                  ['Price negotiable', listing.priceNegotiable ? 'Yes' : 'No'],
                  ['Listing code', listing.uniqueCode],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="text-right font-medium text-gray-100">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-5 text-xs text-gray-500">
                {listedOn && <span className="flex items-center gap-1.5"><PiClock className="h-4 w-4" /> Listed {listedOn}</span>}
                {listing.viewCount != null && <span className="flex items-center gap-1.5"><PiEye className="h-4 w-4" /> {listing.viewCount} views</span>}
              </div>
            </section>

            {/* Sent by the API to admins only */}
            {listing.sourceInfo && (
              <section className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
                <h2 className="eyebrow !text-amber-300">Mandate source · admins only</h2>
                <dl className="mt-4 grid gap-y-3 text-sm">
                  {[
                    ['Contact', listing.sourceInfo.contactName],
                    ['Phone', listing.sourceInfo.contactPhone],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
                      <dt className="text-gray-500">{k}</dt>
                      <dd className="text-right font-medium text-gray-100">{v}</dd>
                    </div>
                  ))}
                  {listing.sourceInfo.link && /^https?:\/\//i.test(listing.sourceInfo.link) && (
                    <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
                      <dt className="text-gray-500">Source</dt>
                      <dd className="truncate text-right"><a href={listing.sourceInfo.link} target="_blank" rel="noopener noreferrer nofollow" className="text-primary-200 hover:underline">{listing.sourceInfo.link}</a></dd>
                    </div>
                  )}
                </dl>
                {listing.sourceInfo.notes && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-300">{listing.sourceInfo.notes}</p>}
              </section>
            )}
          </div>

          {/* Contact card */}
          <aside className="lg:sticky lg:top-24 lg:self-start" id="contact">
            <div className="surface-raised overflow-hidden">
              <div className="p-6">
                <p className="text-xs text-gray-500">{priceLabel}</p>
                <p className="stat-value mt-1 text-4xl">{formatListingPrice(listing)}</p>
                {listing.priceNotDisclosed
                  ? <p className="mt-1 text-sm text-gray-400">The owner shares the price once you connect.</p>
                  : listing.priceNegotiable && <p className="mt-1 text-sm text-primary-300">Open to negotiation</p>}
              </div>

              <div className="border-t border-white/[0.06] p-6">
                {isOwner ? (
                  <>
                    <p className="text-sm text-gray-400">This is your listing. Edits are re-reviewed before going live.</p>
                    <Link to={`/listings/${listing.id}/edit`} className="btn-brass mt-4 w-full"><PiNotePencil className="h-4 w-4" /> Edit listing</Link>
                  </>
                ) : sellerVisible ? (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-100"><PiUser className="h-5 w-5 text-primary-400" /> Talk to the owner directly</p>
                    <ul className="mt-4 space-y-3">
                      {seller.fullName && (
                        <li className="flex items-center gap-3 text-sm">
                          <PiUser className="h-5 w-5 shrink-0 text-gray-500" />
                          <span className="truncate font-medium text-gray-100">{seller.fullName}{seller.companyName ? ` · ${seller.companyName}` : ''}</span>
                        </li>
                      )}
                      {seller.mobileNumber && (
                        <li className="flex items-center gap-3 text-sm">
                          <PiPhone className="h-5 w-5 shrink-0 text-gray-500" />
                          <a href={`tel:${seller.mobileNumber}`} className="text-primary-200 hover:underline">{seller.mobileNumber}</a>
                        </li>
                      )}
                      {seller.email && (
                        <li className="flex items-center gap-3 text-sm">
                          <PiEnvelopeSimple className="h-5 w-5 shrink-0 text-gray-500" />
                          <a href={`mailto:${seller.email}`} className="truncate text-primary-200 hover:underline">{seller.email}</a>
                        </li>
                      )}
                    </ul>
                    {seller.mobileNumber && (
                      <a href={`tel:${seller.mobileNumber}`} className="btn-brass mt-5 w-full !py-3.5"><PiPhone className="h-4 w-4" /> Call the owner</a>
                    )}
                    <p className="mt-3 text-xs text-gray-500">Mention listing {listing.uniqueCode || `#${listing.id}`} when you get in touch.</p>
                  </div>
                ) : (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-100"><PiLockKey className="h-5 w-5 text-primary-400" /> Confidential listing</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      The owner has asked to stay anonymous. Our advisors will introduce you once you share your requirement.
                    </p>
                    <Link to="/contact-us" className="btn-brass mt-5 w-full !py-3.5">Contact an advisor</Link>
                  </div>
                )}
                {/* Paid contact access (₹1,000 per connection) paused: the old locked/unlocked contact card
                ) : paymentChecking ? (
                  <div className="flex items-center justify-center gap-3 py-4 text-sm text-gray-400">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-primary-400" /> Checking access…
                  </div>
                ) : hasPaid && sellerDetails ? (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><PiLockKeyOpen className="h-5 w-5" /> Owner contact unlocked</p>
                    <ul className="mt-4 space-y-3">
                      <li className="flex items-center gap-3 text-sm">
                        <PiUser className="h-5 w-5 shrink-0 text-gray-500" />
                        <span className="truncate font-medium text-gray-100">{sellerDetails.sellerName}</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <PiEnvelopeSimple className="h-5 w-5 shrink-0 text-gray-500" />
                        <a href={`mailto:${sellerDetails.sellerEmail}`} className="truncate text-primary-200 hover:underline">{sellerDetails.sellerEmail}</a>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <PiPhone className="h-5 w-5 shrink-0 text-gray-500" />
                        <a href={`tel:${sellerDetails.sellerPhone}`} className="text-primary-200 hover:underline">{sellerDetails.sellerPhone}</a>
                      </li>
                    </ul>
                    <p className="mt-4 text-xs text-gray-500">Also saved to your dashboard.</p>
                  </div>
                ) : (
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-100"><PiLockKey className="h-5 w-5 text-primary-400" /> Talk to the owner directly</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      Unlock the owner’s name, phone and email for a one-time {CONTACT_FEE}. This keeps owners’ details away from casual browsers.
                    </p>
                    <button type="button" onClick={handlePayment} disabled={paymentLoading} className="btn-brass mt-5 w-full !py-3.5">
                      {paymentLoading
                        ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-950/30 border-t-gray-950" /> Processing…</>
                        : isAuthenticated ? `Unlock contact · ${CONTACT_FEE}` : 'Log in to unlock contact'}
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500"><PiShieldCheck className="h-4 w-4" /> Secure payment via Razorpay</p>
                  </div>
                */}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/[0.06] p-5 text-sm text-gray-400">
              Need help evaluating this {meta?.singular?.toLowerCase() || 'property'}?{' '}
              <Link to="/contact-us" className="font-semibold text-primary-300 hover:text-primary-200">Talk to an advisor</Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile price bar */}
      {!isOwner && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-gray-950/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-gray-500">{priceLabel}</p>
              <p className="stat-value text-xl">{formatListingPrice(listing)}</p>
            </div>
            <a href="#contact" className="btn-brass !px-5">Contact owner</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
