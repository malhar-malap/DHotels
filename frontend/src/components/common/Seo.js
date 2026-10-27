import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SITE_URL = 'https://dhacquisitions.co';
export const SITE_NAME = 'DH Acquisitions';
const DEFAULT_IMAGE = `${SITE_URL}/images/logo.png`;

// Turns a relative path (e.g. /api/uploads/x.jpg) into an absolute URL for crawlers & link previews
export const absoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};

// Trims long descriptions to a search-snippet friendly length without cutting words in half
export const truncate = (text, max = 160) => {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

/**
 * Seo - Per-page <head> tags: title, description, canonical, robots, Open Graph, Twitter and JSON-LD.
 * `path` is the canonical path (no query string); `schema` is a JSON-LD object or array of objects.
 */
const Seo = ({ title, description, path, image, type = 'website', noindex = false, schema, statusCode }) => {
  const url = path != null ? absoluteUrl(path) : undefined;
  const imageUrl = absoluteUrl(image) || DEFAULT_IMAGE;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex, follow" />}
      {/* Read by prerender services to return the real HTTP status to crawlers */}
      {statusCode && <meta name="prerender-status-code" content={String(statusCode)} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((s, idx) => (
        <script key={idx} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
