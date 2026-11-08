import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PiArrowLeft, PiClock, PiCalendarBlank, PiArrowRight, PiArrowUpRight } from 'react-icons/pi';
import Seo, { SITE_URL, absoluteUrl } from '../../components/common/Seo';
import NotFoundPage from '../NotFoundPage';
import { blogArticles, getBlogArticle } from './blogArticles';
import { unsplashSrcSet } from '../../utils/hospitality';

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const BlogArticlePage = () => {
  const { slug } = useParams();
  const article = getBlogArticle(slug);

  if (!article) return <NotFoundPage />;

  const path = `/blogs/${article.slug}`;
  const related = blogArticles.filter((a) => a.slug !== article.slug).slice(0, 3);
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: absoluteUrl(article.image),
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: { '@type': 'Organization', name: 'DHotels24.com', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'DHotels24.com', logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` } },
      mainEntityOfPage: `${SITE_URL}${path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/blogs` },
        { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}${path}` },
      ],
    },
  ];

  return (
    <div className="bg-gray-950">
      <Seo title={`${article.title} | DHotels24.com`} description={article.description} path={path} image={article.image} type="article" schema={schema} />

      <article className="container-site max-w-3xl py-12 md:py-16">
        <Link to="/blogs" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200">
          <PiArrowLeft className="h-4 w-4" /> All insights
        </Link>

        <header className="mt-8">
          <span className="chip-brass">{article.category}</span>
          <h1 className="mt-5 font-display text-4xl leading-tight text-gray-50 md:text-5xl">{article.title}</h1>
          <p className="lede mt-4">{article.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><PiCalendarBlank className="h-4 w-4" /><time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time></span>
            <span className="flex items-center gap-1.5"><PiClock className="h-4 w-4" />{article.readTime}</span>
          </div>
        </header>

        <div className="mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.06]">
          <img src={article.image} srcSet={unsplashSrcSet(article.image)} sizes="(min-width: 768px) 768px, 100vw" alt={article.title} className="h-full w-full object-cover" />
        </div>

        <div className="mt-12 space-y-10">
          {article.sections.map((section, idx) => (
            <section key={section.heading || idx} className="space-y-4">
              {section.heading && <h2 className="font-display text-2xl text-gray-50 md:text-3xl">{section.heading}</h2>}
              {section.paragraphs?.map((p) => <p key={p} className="text-[17px] leading-relaxed text-gray-300">{p}</p>)}
              {section.list && (
                <ul className="space-y-3">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-gray-300">
                      <span className="mt-3 h-px w-3 shrink-0 bg-primary-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-gray-500">
          This article is general information, not legal, tax or financial advice. Rules vary by state and change over time, so consult qualified professionals before making a transaction decision.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/listings" className="btn-brass">Browse listings <PiArrowRight className="h-4 w-4" /></Link>
          <Link to="/contact-us" className="btn-ghost">Talk to an advisor</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-white/[0.06] bg-gray-900/40 py-14">
          <div className="container-site">
            <h2 className="heading-md">Keep reading</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((a) => (
                <Link key={a.slug} to={`/blogs/${a.slug}`} className="group surface flex flex-col p-6 transition-colors hover:border-primary-400/30">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-400">{a.category}</p>
                  <h3 className="mt-2 font-display text-xl leading-snug text-gray-50 group-hover:text-primary-100">{a.title}</h3>
                  <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-primary-300">Read <PiArrowUpRight className="h-4 w-4" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogArticlePage;
