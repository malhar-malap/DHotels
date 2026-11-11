import React from 'react';
import { Link } from 'react-router-dom';
import { PiArrowUpRight } from 'react-icons/pi';
import { CATEGORIES } from '../../utils/hospitality';

const COLUMNS = [
  {
    title: 'Marketplace',
    links: CATEGORIES.map((c) => ({ label: c.label, to: c.path })),
  },
  {
    title: 'Popular searches',
    links: [
      { label: 'Hotels for lease in Goa', to: '/hotels-for-lease-goa' },
      { label: 'Hotels for lease in Maharashtra', to: '/hotels-for-lease-maharashtra' },
      { label: 'Restaurants for lease in Mumbai', to: '/restaurants-for-lease-mumbai' },
      { label: 'Resorts for lease in Kerala', to: '/resorts-for-lease-kerala' },
      { label: 'Banquet halls in Delhi NCR', to: '/banquet-halls-for-lease-delhi' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About DHotels24.com', to: '/about' },
      // { label: 'Profit sharing', to: '/partial-properties' }, // sale & profit sharing paused
      { label: 'Hospitality careers', to: '/jobs' },
      { label: 'Insights', to: '/blogs' },
      { label: 'Contact us', to: '/contact-us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Cookie policy', to: '/cookies' },
      { label: 'Refund policy', to: '/refund-policy' },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-white/[0.06] bg-gray-950">
    <div className="container-site">
      {/* Seller CTA */}
      <div className="flex flex-col gap-6 border-b border-white/[0.06] py-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow eyebrow-rule">For owners</p>
          <h2 className="heading-lg mt-3">Looking to lease out your property?</h2>
          <p className="mt-3 text-gray-400">List it privately in minutes. Our team reviews every listing before it goes live.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/listings/create" className="btn-brass">List your property</Link>
          <Link to="/contact-us" className="btn-ghost">Talk to an advisor <PiArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>

      <div className="grid gap-10 py-12 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="" className="h-9 w-9 object-contain" />
            <span className="font-display text-2xl text-gray-50">DHotels24<span className="text-primary-400">.com</span></span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
            India's marketplace to lease hotels, resorts, restaurants, cafés, bars and banquet halls.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-300 transition-colors hover:text-primary-200">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-white/[0.06] py-6 text-xs text-gray-500 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} DHotels24.com Marketplace. All rights reserved.</p>
        <p>Developed &amp; designed by Sahil &amp; Malhar</p>
      </div>
    </div>
  </footer>
);

export default Footer;
