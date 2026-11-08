import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/home/HomePage';
import AboutUsPage from './pages/home/AboutUsPage';
import ListingsPage from './pages/marketplace/ListingsPage';
import PartialPropertiesPage from './pages/marketplace/PartialPropertiesPage';
import BlogsPage from './pages/marketplace/BlogsPage';
import BlogArticlePage from './pages/marketplace/BlogArticlePage';
import SeoLandingPage from './pages/marketplace/SeoLandingPage';
import { seoData } from './pages/marketplace/seoData';
import { blogArticles } from './pages/marketplace/blogArticles';
import { CATEGORIES } from './utils/hospitality';

// Pages only call the API in effects, which don't run during server rendering
jest.mock('./services/api', () => ({ listingsAPI: {}, jobsAPI: {}, masterAPI: {}, paymentAPI: {} }));

// jsdom looks like a browser; force Helmet's server path so it fills the render context
HelmetProvider.canUseDOM = false;

const pages = [
  ['/', <HomePage />],
  ['/about', <AboutUsPage />],
  ['/listings', <ListingsPage />],
  ...CATEGORIES.map((c) => [c.path, <ListingsPage />]),
  ['/partial-properties', <PartialPropertiesPage />],
  ['/blogs', <BlogsPage />],
  ...blogArticles.map((a) => [`/blogs/${a.slug}`, null]),
  ...Object.keys(seoData).map((key) => [`/${key}`, <SeoLandingPage pathKey={key} />]),
];

const renderHead = (path, element) => {
  const helmetContext = {};
  const body = renderToString(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/blogs/:slug" element={<BlogArticlePage />} />
          <Route path="*" element={element} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
  const { helmet } = helmetContext;
  return {
    body,
    title: helmet.title.toString().replace(/<[^>]+>/g, ''),
    meta: helmet.meta.toString(),
    link: helmet.link.toString(),
    schema: helmet.script.toString(),
  };
};

describe('SEO tags on every indexable page', () => {
  const seen = { titles: new Set(), descriptions: new Set() };

  test.each(pages)('%s', (path, element) => {
    const head = renderHead(path, element);
    const description = (head.meta.match(/name="description" content="([^"]*)"/) || [])[1] || '';

    expect(head.title).toMatch(/DHotels24.com/);
    expect(head.title.length).toBeLessThanOrEqual(90);
    expect(description.length).toBeGreaterThan(50);
    expect(head.link).toContain(`href="https://dhotels24.com${path}"`);
    expect(head.meta).not.toMatch(/noindex/);
    expect((head.body.match(/<h1[\s>]/g) || []).length).toBe(1);
    expect(head.body + head.meta + head.schema).not.toMatch(/hospital(?!ity)|pharma|dhacquisitions/i);

    expect(seen.titles.has(head.title)).toBe(false);
    expect(seen.descriptions.has(description)).toBe(false);
    seen.titles.add(head.title);
    seen.descriptions.add(description);
  });

  test('articles and landing pages carry structured data', () => {
    expect(renderHead(`/blogs/${blogArticles[0].slug}`, null).schema).toMatch(/"Article".*"BreadcrumbList"|"BreadcrumbList".*"Article"/s);
    expect(renderHead('/hotels-for-sale-goa', <SeoLandingPage pathKey="hotels-for-sale-goa" />).schema).toContain('"FAQPage"');
  });
});
