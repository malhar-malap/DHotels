import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  PiMagnifyingGlass, PiSlidersHorizontal, PiX, PiMapPin, PiCaretLeft, PiCaretRight, PiSquaresFour,
} from 'react-icons/pi';
import { listingsAPI, masterAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { CATEGORIES, getCategoryMeta } from '../../utils/hospitality';
import ListingCard, { ListingCardSkeleton, listingPath } from '../../components/marketplace/ListingCard';
import Seo, { SITE_URL } from '../../components/common/Seo';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'askingPrice_asc', label: 'Price: low to high' },
  { value: 'askingPrice_desc', label: 'Price: high to low' },
  { value: 'createdAt_asc', label: 'Oldest first' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹1 Cr', min: '', max: '10000000' },
  { label: '₹1 – 5 Cr', min: '10000000', max: '50000000' },
  { label: '₹5 – 25 Cr', min: '50000000', max: '250000000' },
  { label: '₹25 Cr +', min: '250000000', max: '' },
];

const DEAL_FILTERS = ['For Sale', 'For Lease', 'Profit Sharing'];

const pageCopy = (meta) => meta
  ? {
      title: `${meta.label} for Sale & Lease in India | DHotels`,
      h1: `${meta.label} for sale & lease`,
      description: `Browse verified ${meta.label.toLowerCase()} for ${meta.dealTypes.map((d) => d.toLowerCase()).join(', ')} across India. ${meta.blurb}`,
    }
  : {
      title: 'Hotels, Resorts & Restaurants for Sale in India | DHotels Marketplace',
      h1: 'The hospitality marketplace',
      description: 'Verified hotels, resorts, restaurants, cafés, bars and banquet halls for sale, lease and profit sharing across India.',
    };

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryMeta = CATEGORIES.find((c) => c.path === location.pathname) || null;
  const keyword = searchParams.get('keyword') || '';
  const dealType = searchParams.get('dealType') || '';
  const city = searchParams.get('city') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'createdAt_desc';
  const page = Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1);

  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [cities, setCities] = useState([]);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState({ elements: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState(keyword);
  const [showFilters, setShowFilters] = useState(false);
  const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });
  const [cityDraft, setCityDraft] = useState(city);
  const activeChipRef = useRef(null);

  // Keep the active category chip visible in the horizontally scrolling strip on small screens
  useEffect(() => {
    activeChipRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [location.pathname]);

  useEffect(() => { setKeywordDraft(keyword); }, [keyword]);
  useEffect(() => { setPriceDraft({ min: minPrice, max: maxPrice }); setCityDraft(city); }, [minPrice, maxPrice, city]);

  useEffect(() => {
    masterAPI.getCategories()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoaded(true));
    masterAPI.getCitiesWithListings().then((res) => setCities(res.data?.data || [])).catch(() => setCities([]));
  }, []);

  // Legacy links (?category=Hotels or ?category=1) move to the category's own path
  useEffect(() => {
    const legacy = searchParams.get('category');
    if (!legacy) return;
    const byName = getCategoryMeta(legacy);
    const byId = categories.find((c) => String(c.id) === legacy);
    const meta = byName || (byId && getCategoryMeta(byId.name));
    if (!meta && !categoriesLoaded) return;
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    navigate(`${meta ? meta.path : '/listings'}${next.toString() ? `?${next}` : ''}`, { replace: true });
  }, [searchParams, categories, categoriesLoaded, navigate]);

  const categoryId = useMemo(() => {
    if (!categoryMeta) return undefined;
    return categories.find((c) => c.name.toLowerCase() === categoryMeta.name.toLowerCase())?.id;
  }, [categories, categoryMeta]);

  const waitingForCategory = !!categoryMeta && !categoriesLoaded;

  const fetchListings = useCallback(async () => {
    if (waitingForCategory) return;
    setLoading(true);
    setFetchError(false);
    const [sortBy, sortDirection] = sort.split('_');
    const params = {
      keyword: keyword || undefined,
      categoryId,
      dealTypeName: dealType || undefined,
      cityName: city || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sortBy,
      sortDirection,
      page,
      size: PAGE_SIZE,
    };
    try {
      const response = await listingsAPI.getAll(params, { timeout: 8000 });
      const data = response?.data?.data;
      setListings(data?.content || []);
      setTotal({ elements: data?.totalElements || 0, pages: data?.totalPages || 0 });
    } catch (error) {
      console.warn('Error fetching listings:', error.message || error);
      setFetchError(true);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [waitingForCategory, keyword, categoryId, dealType, city, minPrice, maxPrice, sort, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const updateParams = (changes, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const goToCategory = (meta) => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    // Profit sharing only exists for hotels
    if (dealType && meta && !meta.dealTypes.includes(dealType)) next.delete('dealType');
    navigate(`${meta ? meta.path : '/listings'}${next.toString() ? `?${next}` : ''}`);
  };

  const submitKeyword = (e) => {
    e.preventDefault();
    updateParams({ keyword: keywordDraft.trim() });
  };

  const applyMoreFilters = () => {
    updateParams({ city: cityDraft.trim(), minPrice: priceDraft.min, maxPrice: priceDraft.max });
    setShowFilters(false);
  };

  const clearAll = () => {
    navigate(categoryMeta ? categoryMeta.path : '/listings');
  };

  const availableDeals = categoryMeta ? categoryMeta.dealTypes : DEAL_FILTERS;
  const activeChips = [
    keyword && { key: 'keyword', label: `“${keyword}”` },
    city && { key: 'city', label: city },
    (minPrice || maxPrice) && {
      key: 'price',
      label: minPrice && maxPrice ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}` : minPrice ? `From ${formatPrice(minPrice)}` : `Up to ${formatPrice(maxPrice)}`,
    },
  ].filter(Boolean);
  const moreFilterCount = (city ? 1 : 0) + (minPrice || maxPrice ? 1 : 0);
  const copy = pageCopy(categoryMeta);

  const removeChip = (key) => {
    if (key === 'price') updateParams({ minPrice: '', maxPrice: '' });
    else updateParams({ [key]: '' });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Seo
        title={copy.title}
        description={copy.description}
        path={categoryMeta ? categoryMeta.path : '/listings'}
        // Filtered/paginated views are query-string variants; robots.txt keeps them out of the index
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${SITE_URL}/listings` },
              ...(categoryMeta ? [{ '@type': 'ListItem', position: 3, name: categoryMeta.label, item: `${SITE_URL}${categoryMeta.path}` }] : []),
            ],
          },
          ...(listings.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: copy.h1,
            itemListElement: listings.map((l, i) => ({
              '@type': 'ListItem',
              position: page * PAGE_SIZE + i + 1,
              url: `${SITE_URL}${listingPath(l)}`,
              name: l.displayTitle,
            })),
          }] : []),
        ]}
      />

      {/* Header */}
      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        {categoryMeta && (
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <img src={categoryMeta.image} alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950/60" />
          </div>
        )}
        <div className="container-site py-12 md:py-16">
          <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <span>/</span>
            {categoryMeta ? <Link to="/listings" className="hover:text-gray-300">Marketplace</Link> : <span className="text-gray-300">Marketplace</span>}
            {categoryMeta && (<><span>/</span><span className="text-gray-300">{categoryMeta.label}</span></>)}
          </nav>
          <h1 className="heading-lg mt-4 sm:text-5xl">{copy.h1}</h1>
          <p className="lede mt-3 max-w-2xl">{categoryMeta ? categoryMeta.blurb : copy.description}</p>

          <form onSubmit={submitKeyword} className="mt-8 flex max-w-2xl gap-2" role="search">
            <label className="relative flex-1">
              <span className="sr-only">Search listings</span>
              <PiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                placeholder="Search by name, city or listing code"
                className="field !rounded-full !py-3.5 !pl-12"
              />
            </label>
            <button type="submit" className="btn-brass !px-6">Search</button>
          </form>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-white/[0.06] bg-gray-950/90 backdrop-blur-xl">
        <div className="container-site flex items-center gap-3 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => goToCategory(null)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${!categoryMeta ? 'border-primary-400 bg-primary-400/10 text-primary-100' : 'border-white/10 text-gray-300 hover:border-white/25'}`}
            >
              <PiSquaresFour className="h-4 w-4" /> All
            </button>
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = categoryMeta?.name === c.name;
              return (
                <button
                  key={c.name}
                  ref={active ? activeChipRef : undefined}
                  type="button"
                  onClick={() => goToCategory(c)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${active ? 'border-primary-400 bg-primary-400/10 text-primary-100' : 'border-white/10 text-gray-300 hover:border-white/25'}`}
                >
                  <Icon className="h-4 w-4" /> {c.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-gray-200 hover:border-white/25"
          >
            <PiSlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {moreFilterCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-400 text-[11px] font-bold text-gray-950">{moreFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Results */}
      <section className="container-site py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-gray-400">
              {loading ? 'Searching…' : <><span className="font-semibold text-gray-100">{total.elements}</span> {total.elements === 1 ? 'property' : 'properties'}</>}
            </p>
            {activeChips.map((chip) => (
              <span key={chip.key} className="chip">
                {chip.key === 'city' && <PiMapPin className="h-3.5 w-3.5 text-primary-400" />}
                {chip.label}
                <button type="button" onClick={() => removeChip(chip.key)} aria-label={`Remove ${chip.label}`} className="text-gray-500 hover:text-gray-200">
                  <PiX className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {(activeChips.length > 0 || dealType) && (
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-primary-300 hover:text-primary-200">Clear all</button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-white/10 p-0.5" role="group" aria-label="Deal type">
            {['', ...availableDeals].map((d) => (
              <button
                key={d || 'any'}
                type="button"
                onClick={() => updateParams({ dealType: d })}
                aria-pressed={dealType === d}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${dealType === d ? 'bg-gray-50 text-gray-950' : 'text-gray-300 hover:text-gray-50'}`}
              >
                {d || 'Any deal'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            Sort
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value === 'createdAt_desc' ? '' : e.target.value })}
              className="cursor-pointer rounded-full border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-gray-100 outline-none focus:border-primary-400/60"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="surface mx-auto mt-10 max-w-xl p-10 text-center">
            <h2 className="heading-md">{fetchError ? 'We couldn’t load listings' : 'No properties match these filters'}</h2>
            <p className="mt-3 text-gray-400">
              {fetchError
                ? 'Please check your connection and try again.'
                : 'Try a different city or price range, or tell us what you are looking for and we will match you privately.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {fetchError
                ? <button type="button" onClick={fetchListings} className="btn-brass">Try again</button>
                : <button type="button" onClick={clearAll} className="btn-brass">Clear filters</button>}
              <Link to="/contact-us" className="btn-ghost">Share your requirement</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
            {total.pages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => updateParams({ page: page > 1 ? String(page) : '' }, { resetPage: false })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <PiCaretLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: total.pages }, (_, i) => i)
                  .filter((i) => i === 0 || i === total.pages - 1 || Math.abs(i - page) <= 1)
                  .map((i, idx, arr) => (
                    <React.Fragment key={i}>
                      {idx > 0 && i - arr[idx - 1] > 1 && <span className="px-1 text-gray-600">…</span>}
                      <button
                        type="button"
                        onClick={() => updateParams({ page: i === 0 ? '' : String(i + 1) }, { resetPage: false })}
                        aria-current={i === page ? 'page' : undefined}
                        className={`h-10 min-w-[2.5rem] rounded-full px-3 text-sm font-semibold ${i === page ? 'bg-primary-400 text-gray-950' : 'text-gray-300 hover:bg-white/[0.05]'}`}
                      >
                        {i + 1}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  type="button"
                  disabled={page >= total.pages - 1}
                  onClick={() => updateParams({ page: String(page + 2) }, { resetPage: false })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <PiCaretRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      {/* More filters drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/[0.06] bg-gray-900 animate-slideIn">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <h2 className="font-display text-2xl text-gray-50">Filters</h2>
              <button type="button" onClick={() => setShowFilters(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-300" aria-label="Close filters">
                <PiX className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <div>
                <label className="field-label" htmlFor="filter-city">City</label>
                <div className="relative">
                  <PiMapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                  <input
                    id="filter-city"
                    value={cityDraft}
                    onChange={(e) => setCityDraft(e.target.value)}
                    list="filter-cities"
                    placeholder="Any city"
                    autoComplete="off"
                    className="field !pl-10"
                  />
                  <datalist id="filter-cities">
                    {cities.map((c) => <option key={c.id || c.name} value={c.name} />)}
                  </datalist>
                </div>
              </div>
              <div>
                <p className="field-label">Price</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRICE_PRESETS.map((p) => {
                    const active = priceDraft.min === p.min && priceDraft.max === p.max;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPriceDraft(active ? { min: '', max: '' } : { min: p.min, max: p.max })}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'border-primary-400 bg-primary-400/10 text-primary-100' : 'border-white/10 text-gray-300 hover:border-white/25'}`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input type="number" min="0" inputMode="numeric" placeholder="Min ₹" value={priceDraft.min} onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))} className="field" aria-label="Minimum price in rupees" />
                  <input type="number" min="0" inputMode="numeric" placeholder="Max ₹" value={priceDraft.max} onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))} className="field" aria-label="Maximum price in rupees" />
                </div>
                {(priceDraft.min || priceDraft.max) && (
                  <p className="mt-2 text-xs text-gray-500">
                    {priceDraft.min ? formatPrice(priceDraft.min) : '₹0'} – {priceDraft.max ? formatPrice(priceDraft.max) : 'no limit'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
              <button type="button" onClick={() => { setCityDraft(''); setPriceDraft({ min: '', max: '' }); }} className="btn-ghost flex-1">Reset</button>
              <button type="button" onClick={applyMoreFilters} className="btn-brass flex-1">Show results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
