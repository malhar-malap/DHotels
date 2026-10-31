import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PiMagnifyingGlass, PiMapPin, PiArrowRight, PiArrowUpRight, PiSealCheck, PiLockKey,
  PiHandshake, PiKey, PiTag, PiChartLineUp, PiBriefcase,
} from 'react-icons/pi';
import { listingsAPI, jobsAPI, masterAPI } from '../../services/api';
import { generateSlug } from '../../utils/slugify';
import { CATEGORIES, DEAL_TYPES, unsplashSrcSet } from '../../utils/hospitality';
import ListingCard, { ListingCardSkeleton } from '../../components/marketplace/ListingCard';
import Seo, { SITE_URL } from '../../components/common/Seo';

const HERO_IMAGES = [CATEGORIES[0].image, CATEGORIES[1].image, CATEGORIES[3].image];

const SEARCH_MODES = [
  { key: 'For Sale', label: 'Buy' },
  { key: 'For Lease', label: 'Lease' },
  { key: 'Profit Sharing', label: 'Profit sharing' },
];

const TRUST_POINTS = [
  { icon: PiSealCheck, text: 'Every listing reviewed before it goes live' },
  { icon: PiLockKey, text: 'Seller contact shared only with serious buyers' },
  { icon: PiHandshake, text: 'Advisory support through closing' },
];

const DEAL_ICONS = { 'For Sale': PiTag, 'For Lease': PiKey, 'Profit Sharing': PiChartLineUp };

const PROCESS = {
  buyers: [
    { title: 'Shortlist', text: 'Filter verified hotels, resorts and F&B outlets by city, deal type and size.' },
    { title: 'Unlock the seller', text: 'Get the owner’s direct contact for a listing you are serious about.' },
    { title: 'Visit & evaluate', text: 'Inspect the site, review financials and licences with the owner.' },
    { title: 'Close', text: 'Negotiate terms and complete the transfer, with our advisors on hand.' },
  ],
  sellers: [
    { title: 'List privately', text: 'Share rooms, areas, title and price in a five-minute form.' },
    { title: 'We review', text: 'Our team checks the details and publishes it with a listing code.' },
    { title: 'Qualified buyers reach out', text: 'Only buyers who unlock your listing can see your contact details.' },
    { title: 'Sell, lease or partner', text: 'Choose the structure that works — outright sale, lease or profit sharing.' },
  ],
};

const HomePage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('For Sale');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [listings, setListings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [audience, setAudience] = useState('buyers');

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), 7000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, jobsRes] = await Promise.allSettled([listingsAPI.getFeatured(), jobsAPI.getFeatured()]);
        let items = featuredRes.status === 'fulfilled' ? featuredRes.value.data?.data || [] : [];
        // Show the newest listings when nothing has been featured yet
        if (items.length === 0) {
          const latest = await listingsAPI.getAll({ size: 6, sortBy: 'createdAt', sortDirection: 'desc' });
          items = latest.data?.data?.content || [];
        }
        setListings(items.slice(0, 6));
        setJobs(jobsRes.status === 'fulfilled' ? (jobsRes.value.data?.data || []).slice(0, 4) : []);
      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
    masterAPI.getCitiesWithListings()
      .then((res) => setCities(res.data?.data || []))
      .catch(() => setCities([]));
  }, []);

  // Profit sharing is only offered on hotels
  const availableCategories = mode === 'Profit Sharing' ? CATEGORIES.filter((c) => c.name === 'Hotels') : CATEGORIES;

  const changeMode = (next) => {
    setMode(next);
    if (next === 'Profit Sharing') setCategory('Hotels');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const meta = CATEGORIES.find((c) => c.name === category);
    const params = new URLSearchParams({ dealType: mode });
    if (city.trim()) params.set('city', city.trim());
    navigate(`${meta ? meta.path : '/listings'}?${params.toString()}`);
  };

  return (
    <div className="bg-gray-950">
      <Seo
        title="Buy, Sell & Lease Hotels, Resorts & Restaurants in India | DHotels"
        description="India's hospitality marketplace. Buy, sell, lease or co-own hotels, resorts, restaurants, cafés, bars and banquet halls — every listing reviewed before it goes live."
        path="/"
        schema={[
          { '@context': 'https://schema.org', '@type': 'Organization', name: 'DHotels', url: SITE_URL, logo: `${SITE_URL}/images/logo.png`, areaServed: 'IN' },
          { '@context': 'https://schema.org', '@type': 'WebSite', name: 'DHotels', url: SITE_URL },
        ]}
      />

      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {HERO_IMAGES.map((img, i) => (
            <div key={img} className={`absolute inset-0 transition-opacity duration-[1500ms] ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
              <img
                src={img}
                srcSet={unsplashSrcSet(img)}
                sizes="100vw"
                alt=""
                fetchpriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover ${i === slide ? 'animate-kenburns' : ''}`}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-gray-950/30" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-950 to-transparent" />
        </div>

        <div className="container-site flex min-h-[calc(100svh-4rem)] flex-col justify-center py-16 lg:min-h-[44rem]">
          <div className="max-w-3xl">
            <p className="eyebrow eyebrow-rule">India’s hospitality deal room</p>
            <h1 className="heading-xl mt-5">
              Hotels, resorts &amp; restaurants —{' '}
              <em className="text-gradient not-italic">bought, leased and shared.</em>
            </h1>
            <p className="lede mt-5 max-w-2xl">
              A private marketplace for operating hospitality properties. Find your next asset, or put yours in front of buyers who are ready to deal.
            </p>
          </div>

          {/* Structured search */}
          <form onSubmit={handleSearch} className="surface-raised mt-10 max-w-4xl p-2 !bg-gray-900/90 backdrop-blur-xl" role="search">
            <div className="flex gap-1 p-1" role="tablist" aria-label="Deal type">
              {SEARCH_MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.key}
                  onClick={() => changeMode(m.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${mode === m.key ? 'bg-gray-50 text-gray-950' : 'text-gray-300 hover:text-gray-50'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2 p-1 md:grid-cols-[1.1fr_1fr_auto]">
              <label className="flex flex-col rounded-xl bg-gray-950/60 px-4 py-2.5 ring-1 ring-white/[0.06] focus-within:ring-primary-400/60">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Property type</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-0.5 w-full cursor-pointer bg-transparent text-[15px] font-medium text-gray-50 outline-none"
                >
                  {mode !== 'Profit Sharing' && <option value="" className="bg-gray-900">All property types</option>}
                  {availableCategories.map((c) => (
                    <option key={c.name} value={c.name} className="bg-gray-900">{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col rounded-xl bg-gray-950/60 px-4 py-2.5 ring-1 ring-white/[0.06] focus-within:ring-primary-400/60">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">City</span>
                <span className="mt-0.5 flex items-center gap-2">
                  <PiMapPin className="h-4 w-4 shrink-0 text-primary-400" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    list="home-cities"
                    placeholder="Anywhere in India"
                    autoComplete="off"
                    className="w-full bg-transparent text-[15px] font-medium text-gray-50 placeholder-gray-500 outline-none"
                  />
                </span>
                <datalist id="home-cities">
                  {cities.map((c) => <option key={c.id || c.name} value={c.name} />)}
                </datalist>
              </label>
              <button type="submit" className="btn-brass !rounded-xl !py-4 md:!px-8">
                <PiMagnifyingGlass className="h-5 w-5" /> Search
              </button>
            </div>
          </form>

          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm text-gray-300">
                <Icon className="h-5 w-5 text-primary-400" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="container-site py-20 lg:py-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow eyebrow-rule">Browse the marketplace</p>
            <h2 className="heading-lg mt-3">Six kinds of hospitality property</h2>
          </div>
          <Link to="/listings" className="btn-quiet">View all listings <PiArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            const feature = i === 0;
            return (
              <Link
                key={c.name}
                to={c.path}
                className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.06] p-5 ${feature ? 'sm:col-span-2 lg:row-span-2' : ''} ${i === CATEGORIES.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <img src={c.image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-950 via-gray-950/50 to-gray-950/5" />
                <span className="mb-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-950/60 text-primary-200 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className={`font-display text-gray-50 ${feature ? 'text-4xl' : 'text-2xl'}`}>{c.label}</h3>
                <p className={`mt-1.5 text-sm text-gray-300 ${feature ? 'max-w-sm' : 'line-clamp-2'}`}>{c.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">{c.dealTypes.join(' · ')}</span>
                  <PiArrowUpRight className="h-5 w-5 text-gray-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ LISTINGS ============ */}
      <section className="border-y border-white/[0.06] bg-gray-900/40 py-20 lg:py-28">
        <div className="container-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow eyebrow-rule">On the market</p>
              <h2 className="heading-lg mt-3">Latest opportunities</h2>
            </div>
            <Link to="/listings" className="btn-ghost self-start md:self-auto">Explore the marketplace <PiArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [0, 1, 2].map((i) => <ListingCardSkeleton key={i} />)
              : listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
          {!loading && listings.length === 0 && (
            <div className="surface p-10 text-center">
              <h3 className="heading-md">New listings are being reviewed</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-400">Check back shortly, or tell us what you are looking for and we will match you privately.</p>
              <Link to="/contact-us" className="btn-brass mt-6">Share your requirement</Link>
            </div>
          )}
        </div>
      </section>

      {/* ============ DEAL STRUCTURES ============ */}
      <section className="container-site py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow eyebrow-rule">Ways to deal</p>
          <h2 className="heading-lg mt-3">Own it, run it, or share in it</h2>
          <p className="lede mt-4">Every property is listed under the structure its owner is open to, so you only see deals that can actually happen.</p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-3">
          {DEAL_TYPES.map((d) => {
            const Icon = DEAL_ICONS[d.name];
            const to = d.name === 'Profit Sharing' ? '/partial-properties' : `/listings?dealType=${encodeURIComponent(d.name)}`;
            const appliesTo = d.name === 'Profit Sharing' ? 'Hotels' : 'All property types';
            return (
              <Link key={d.name} to={to} className="group flex flex-col bg-gray-950 p-8 transition-colors hover:bg-gray-900">
                <Icon className="h-8 w-8 text-primary-400" />
                <h3 className="heading-md mt-6">{d.name}</h3>
                <p className="mt-2 flex-1 text-gray-400">{d.description}</p>
                <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-4 text-sm">
                  <span className="text-gray-500">{appliesTo}</span>
                  <span className="flex items-center gap-1 font-semibold text-primary-300 group-hover:text-primary-200">
                    Browse <PiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="border-t border-white/[0.06] bg-gray-900/40 py-20 lg:py-28">
        <div className="container-site">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow eyebrow-rule">How it works</p>
              <h2 className="heading-lg mt-3">From first look to handover</h2>
            </div>
            <div className="flex self-start rounded-full border border-white/10 p-1 md:self-auto" role="tablist" aria-label="Audience">
              {[['buyers', 'For buyers'], ['sellers', 'For owners']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={audience === key}
                  onClick={() => setAudience(key)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${audience === key ? 'bg-primary-400 text-gray-950' : 'text-gray-300 hover:text-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ol key={audience} className="mt-12 grid gap-8 md:grid-cols-4">
            {PROCESS[audience].map((step, i) => (
              <li key={step.title} className="relative border-t border-white/10 pt-6 animate-fadeIn">
                <span className="absolute -top-px left-0 h-px w-12 bg-primary-400" />
                <span className="font-display text-sm text-primary-400">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            {audience === 'buyers'
              ? <Link to="/listings" className="btn-brass">Start browsing</Link>
              : <Link to="/listings/create" className="btn-brass">List your property</Link>}
          </div>
        </div>
      </section>

      {/* ============ CAREERS ============ */}
      <section className="container-site py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow eyebrow-rule">Hospitality careers</p>
            <h2 className="heading-lg mt-3">Staff the property you just acquired</h2>
            <p className="lede mt-4">General managers, chefs, front office and F&amp;B teams — post a role or find your next one.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link to="/jobs" className="btn-ghost">Browse jobs</Link>
              <Link to="/jobs/create" className="btn-quiet">Post a job <PiArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {jobs.length === 0 && !loading && (
              <div className="flex items-center gap-4 py-8 text-gray-400">
                <PiBriefcase className="h-6 w-6 text-primary-400" /> New roles are posted every week.
              </div>
            )}
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/hospitality-jobs-india/${job.id}-${generateSlug(job.title, job.cityName)}`}
                className="group flex items-center justify-between gap-4 py-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-50 group-hover:text-primary-200">{job.title}</p>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {[job.employerCompany || job.employerName, job.cityName, job.employmentType?.replace('_', ' ').toLowerCase()].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {job.salaryMinLpa != null && job.salaryMaxLpa != null && (
                    <span className="hidden text-sm text-gray-300 sm:block">₹{job.salaryMinLpa}–{job.salaryMaxLpa} LPA</span>
                  )}
                  <PiArrowUpRight className="h-5 w-5 text-gray-500 transition-colors group-hover:text-primary-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
