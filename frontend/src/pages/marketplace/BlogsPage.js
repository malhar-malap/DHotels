import React from 'react';
import { Link } from 'react-router-dom';
import { PiArrowUpRight, PiMapPin } from 'react-icons/pi';
import Seo from '../../components/common/Seo';
import { seoData } from './seoData';
import { blogArticles } from './blogArticles';
import { getCategoryMeta } from '../../utils/hospitality';

// Rough reading time from the guide's own text
const readingTime = (guide) => {
  const words = [guide.introduction, ...guide.sections.map((s) => s.content), ...guide.faqs.map((f) => f.a)]
    .join(' ')
    .split(/\s+/).length;
  return `${Math.max(2, Math.round(words / 200))} min read`;
};

const BlogsPage = () => {
  const guides = Object.entries(seoData).map(([key, guide]) => ({ key, ...guide, meta: getCategoryMeta(guide.categoryName) }));
  const [lead, ...rest] = guides;

  return (
    <div className="bg-gray-950">
      <Seo
        title="Insights & Market Guides | Buying Hotels, Resorts & Restaurants | DHotels24.com"
        description="Guides to buying, leasing and investing in hotels, resorts, restaurants and banquet halls across India — what to check, deal structures and regional notes."
        path="/blogs"
      />

      <section className="container-site py-16 md:py-20">
        <p className="eyebrow eyebrow-rule">Insights</p>
        <h1 className="heading-xl mt-4 max-w-3xl">Guides for hospitality buyers and owners</h1>
        <p className="lede mt-5 max-w-2xl">Practical notes on what to check, how deals are structured and where the opportunities are.</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {blogArticles.map((a) => (
            <Link key={a.slug} to={`/blogs/${a.slug}`} className="group grid overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 transition-colors hover:border-primary-400/30 sm:grid-cols-[11rem_1fr]">
              <div className="aspect-[16/9] overflow-hidden sm:aspect-auto">
                <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-400">{a.category} · {a.readTime}</p>
                <h2 className="mt-2 font-display text-xl leading-snug text-gray-50 group-hover:text-primary-100">{a.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-gray-400">{a.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="heading-lg mt-20">Market guides by location</h2>
        {lead && (
          <Link to={`/${lead.key}`} className="group mt-8 grid overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 lg:grid-cols-2">
            <div className="aspect-[16/10] overflow-hidden lg:aspect-auto">
              <img src={lead.meta?.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="flex flex-col p-8 lg:p-12">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-400">
                <PiMapPin className="h-4 w-4" /> {lead.eyebrow} · {lead.meta?.label}
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-gray-50 group-hover:text-primary-100">{lead.h1}</h2>
              <p className="mt-4 line-clamp-4 leading-relaxed text-gray-400">{lead.introduction}</p>
              <div className="mt-auto flex items-center justify-between pt-8 text-sm">
                <span className="text-gray-500">{readingTime(lead)}</span>
                <span className="flex items-center gap-1 font-semibold text-primary-300">Read guide <PiArrowUpRight className="h-4 w-4" /></span>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((g) => (
            <Link key={g.key} to={`/${g.key}`} className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-900 transition-colors hover:border-primary-400/30">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={g.meta?.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-400">{g.eyebrow} · {g.meta?.label}</p>
                <h2 className="mt-2 font-display text-xl leading-snug text-gray-50 group-hover:text-primary-100">{g.h1}</h2>
                <p className="mt-auto pt-5 text-xs text-gray-500">{readingTime(g)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogsPage;
