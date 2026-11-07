import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiMapPin, PiLockKey, PiArrowUpRight } from 'react-icons/pi';
import { formatListingPrice } from '../../utils/formatPrice';
import { generateSlug } from '../../utils/slugify';
import { getCategoryMeta, getSpecSummary, categoryImage, resolveImage, priceLabelFor, isSampleImage, hasBurnedInNote, formatLocation } from '../../utils/hospitality';

export const listingPath = (listing) =>
  `/listings/${listing.id}-${generateSlug(listing.displayTitle || listing.title, listing.cityName)}`;

/**
 * Marketplace card for a ListingSummaryResponse.
 * Falls back to a category photograph when the admin has not attached an image yet.
 */
const ListingCard = ({ listing }) => {
  const [loaded, setLoaded] = useState(false);
  const meta = getCategoryMeta(listing.categoryName);
  const image = resolveImage(listing.primaryImage) || categoryImage(listing.categoryName);
  const captioned = hasBurnedInNote(image);
  const representative = isSampleImage(image) && !captioned;
  const specSummary = getSpecSummary(listing.categoryName, listing.categoryDetails);
  const location = formatLocation(listing);

  return (
    <Link
      to={listingPath(listing)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/30 focus-visible:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-850">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-800" />}
        <img
          src={image}
          alt={listing.displayTitle}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            const fallback = categoryImage(listing.categoryName);
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
          }}
          className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {listing.dealType && (
            <span className="rounded-full bg-gray-950/75 px-3 py-1 text-[11px] font-semibold text-gray-50 backdrop-blur">
              {listing.dealType}
            </span>
          )}
          {listing.isConfidential && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-950/75 px-3 py-1 text-[11px] font-semibold text-primary-200 backdrop-blur">
              <PiLockKey className="h-3.5 w-3.5" /> Confidential
            </span>
          )}
        </div>
        {listing.uniqueCode && (
          <span className="absolute right-3 top-3 rounded-md bg-gray-950/75 px-2 py-1 font-mono text-[10px] tracking-wider text-gray-300 backdrop-blur">
            {listing.uniqueCode}
          </span>
        )}

        {/* Sits above the caption band burned into sample photos */}
        <div className={`absolute left-3 right-3 flex items-center gap-1.5 text-xs font-medium text-gray-100 ${captioned ? 'bottom-7' : 'bottom-3'}`}>
          <PiMapPin className="h-4 w-4 shrink-0 text-primary-300" />
          <span className="truncate">{location || 'India'}</span>
          {representative && <span className="ml-auto shrink-0 text-[10px] font-normal text-gray-300/80">Representative image</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-400">
          {meta?.singular || listing.categoryName}
        </p>
        <h3 className="mt-2 line-clamp-2 font-display text-lg leading-snug text-gray-50 transition-colors group-hover:text-primary-100">
          {listing.displayTitle}
        </h3>
        {specSummary && <p className="mt-2 text-sm text-gray-400">{specSummary}</p>}
        <div className="flex-1" />

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              {priceLabelFor(listing.dealType)}
            </p>
            <p className="stat-value mt-0.5 text-xl">
              {formatListingPrice(listing)}
              {listing.priceNegotiable && <span className="ml-2 align-middle font-sans text-[11px] font-medium text-gray-400">Negotiable</span>}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-all duration-300 group-hover:border-primary-400 group-hover:bg-primary-400 group-hover:text-gray-950">
            <PiArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export const ListingCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900">
    <div className="aspect-[4/3] animate-pulse bg-gray-800" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
      <div className="h-5 w-4/5 animate-pulse rounded bg-gray-800" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800" />
      <div className="mt-4 h-6 w-28 animate-pulse rounded bg-gray-800" />
    </div>
  </div>
);

export default ListingCard;
