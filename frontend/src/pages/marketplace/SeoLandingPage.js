import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PiArrowRight, PiArrowUpRight, PiPlus, PiMinus } from 'react-icons/pi';
import { listingsAPI, masterAPI } from '../../services/api';
import { getCategoryMeta } from '../../utils/hospitality';
import ListingCard, { ListingCardSkeleton } from '../../components/marketplace/ListingCard';
import Seo, { SITE_URL } from '../../components/common/Seo';
import NotFoundPage from '../NotFoundPage';
import { seoData } from './seoData';
import { getBlogArticle } from './blogArticles';

// Renders the small markdown subset used in seoData: "- " bullets and **bold**
const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i} className="font-semibold text-gray-100">{part.slice(2, -2)}</strong> : part
  );

const RichText = ({ content }) => {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith('- '));
  const paragraphs = lines.filter((l) => !l.startsWith('- '));
  return (
    <div className="space-y-4 text-gray-300">
      {paragraphs.map((p) => <p key={p} className="leading-relaxed">{renderInline(p)}</p>)}
      {bullets.length > 0 && (
        <ul className="space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 leading-relaxed">
              <span className="mt-2.5 h-1 w-3 shrink-0 bg-primary-400" />
              <span>{renderInline(b.slice(2))}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SeoLandingPage = ({ pathKey }) => {
  const data = seoData[pathKey];
  const meta = data ? getCategoryMeta(data.categoryName) : null;
  const [listings, setListings] = useState([]);
  const [nationwide, setNationwide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    if (!data) return undefined;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const cats = await masterAPI.getCategories();
        const categoryId = (cats.data?.data || []).find((c) => c.name.toLowerCase() === data.categoryName.toLowerCase())?.id;
        const base = { categoryId, size: 6, sortBy: 'createdAt', sortDirection: 'desc' };
        let items = [];
        if (data.cityFilter) {
          const local = await listingsAPI.getAll({ ...base, cityName: data.cityFilter }, { timeout: 5000 });
          items = local.data?.data?.content || [];
        }
        // Fall back to the category nationally when nothing is listed locally yet
        const useNational = items.length === 0;
        if (useNational) {
          const all = await listingsAPI.getAll(base, { timeout: 5000 });
          items = all.data?.data?.content || [];
        }
        if (active) {
          setListings(items);
          setNationwide(useNational);
        }
      } catch (err) {
        if (active) setListings([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [data]);

  if (!data) return <NotFoundPage />;

  const path = `/${pathKey}`;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: meta?.label || 'Marketplace', item: `${SITE_URL}${meta?.path || '/listings'}` },
        { '@type': 'ListItem', position: 3, name: data.h1, item: `${SITE_URL}${path}` },
      ],
    },
  ];

  return (
    <div className="bg-gray-950">
      <Seo title={data.title} description={data.description} path={path} schema={schema} />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        {meta && (
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <img src={meta.image} alt="" className="h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950/50" />
          </div>
        )}
        <div className="container-site py-16 md:py-24">
          <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gray-300">Home</Link><span>/</span>
            {meta && <><Link to={meta.path} className="hover:text-gray-300">{meta.label}</Link><span>/</span></>}
            <span className="text-gray-300">{data.eyebrow}</span>
          </nav>
          <h1 className="heading-xl mt-5 max-w-3xl">{data.h1}</h1>
          <p className="lede mt-5 max-w-2xl">{data.introduction}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#listings" className="btn-brass">See listings</a>
            <Link to="/listings/create" className="btn-ghost">List your property</Link>
          </div>
        </div>
      </section>

      <section id="listings" className="container-site scroll-mt-20 py-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow eyebrow-rule">{nationwide && !loading ? 'Across India' : data.locationName}</p>
            <h2 className="heading-lg mt-3">{meta?.label || data.categoryName} on the market</h2>
            {nationwide && !loading && data.cityFilter && (
              <p className="mt-2 text-sm text-gray-400">Nothing is listed in {data.locationName} right now — here are the latest across India.</p>
            )}
          </div>
          {meta && <Link to={meta.path} className="btn-quiet">All {meta.label.toLowerCase()} <PiArrowRight className="h-4 w-4" /></Link>}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? [0, 1, 2].map((i) => <ListingCardSkeleton key={i} />) : listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
        {!loading && listings.length === 0 && (
          <div className="surface p-10 text-center">
            <p className="text-gray-300">New {meta?.label.toLowerCase() || 'listings'} are under review. Tell us what you are looking for and we will match you privately.</p>
            <Link to="/contact-us" className="btn-brass mt-6">Share your requirement</Link>
          </div>
        )}
      </section>

      <section className="border-t border-white/[0.06] bg-gray-900/40 py-16 md:py-20">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-12">
            {data.sections.map((s) => (
              <article key={s.heading}>
                <h2 className="heading-md">{s.heading}</h2>
                <div className="mt-4"><RichText content={s.content} /></div>
              </article>
            ))}
          </div>
          <div>
            {data.guides?.length > 0 && (
              <div className="mb-12">
                <h2 className="heading-md">In-depth guides</h2>
                <div className="mt-4 space-y-3">
                  {data.guides.map(getBlogArticle).filter(Boolean).map((a) => (
                    <Link key={a.slug} to={`/blogs/${a.slug}`} className="group surface flex items-center justify-between gap-4 p-5 transition-colors hover:border-primary-400/30">
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-400">{a.readTime}</span>
                        <span className="mt-1 block font-semibold text-gray-100 group-hover:text-primary-200">{a.title}</span>
                      </span>
                      <PiArrowUpRight className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-primary-300" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <h2 className="heading-md">Frequently asked</h2>
            <div className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {data.faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-gray-100"
                    >
                      {f.q}
                      {open ? <PiMinus className="h-4 w-4 shrink-0 text-primary-400" /> : <PiPlus className="h-4 w-4 shrink-0 text-gray-500" />}
                    </button>
                    {open && <p className="pb-5 leading-relaxed text-gray-400 animate-fadeIn">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeoLandingPage;
