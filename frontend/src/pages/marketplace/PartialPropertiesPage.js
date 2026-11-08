import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PiChartLineUp, PiHandshake, PiBuildings, PiArrowRight } from 'react-icons/pi';
import { listingsAPI } from '../../services/api';
import { CATEGORIES } from '../../utils/hospitality';
import ListingCard, { ListingCardSkeleton } from '../../components/marketplace/ListingCard';
import Seo from '../../components/common/Seo';

const HOW_IT_WORKS = [
  { icon: PiBuildings, title: 'The owner keeps the hotel', text: 'Ownership of the land and building usually stays with the owner, who lists the share of operating profit on offer.' },
  { icon: PiHandshake, title: 'A partner brings capital or expertise', text: 'Investors, operators or brands contribute funds, management or distribution in return for that share.' },
  { icon: PiChartLineUp, title: 'Profit is shared on agreed terms', text: 'Split, lock-in, reporting and exit terms are agreed between the parties and documented before handover.' },
];

const PartialPropertiesPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    listingsAPI.getAll({ dealTypeName: 'Profit Sharing', size: 24, sortBy: 'createdAt', sortDirection: 'desc' })
      .then((res) => setListings(res.data?.data?.content || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-950">
      <Seo
        title="Profit Sharing & Hotel Co-Investments | DHotels24.com"
        description="Hotels across India open to profit-sharing partnerships — invest in or operate a hotel and share in its operating profit. Reviewed listings with rooms, area and title."
        path="/partial-properties"
      />

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <img src={CATEGORIES[0].image} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950/50" />
        </div>
        <div className="container-site py-16 md:py-24">
          <p className="eyebrow eyebrow-rule">Profit sharing</p>
          <h1 className="heading-xl mt-5 max-w-3xl">Co-own a hotel’s upside, without buying the building.</h1>
          <p className="lede mt-5 max-w-2xl">
            Hotel owners list their property for a profit-sharing partnership when they want capital, an operator or a brand — but want to keep the asset. Browse open opportunities below.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#opportunities" className="btn-brass">See opportunities</a>
            <Link to="/listings/create" className="btn-ghost">Offer your hotel</Link>
          </div>
        </div>
      </section>

      <section className="container-site py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-8 w-8 text-primary-400" />
              <h2 className="mt-4 text-lg font-semibold text-gray-50 font-sans">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="opportunities" className="scroll-mt-20 border-t border-white/[0.06] bg-gray-900/40 py-16">
        <div className="container-site">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow eyebrow-rule">Open opportunities</p>
              <h2 className="heading-lg mt-3">Hotels open to profit sharing</h2>
              {!loading && !error && <p className="mt-2 text-sm text-gray-400">{listings.length} {listings.length === 1 ? 'hotel' : 'hotels'} listed</p>}
            </div>
            <Link to="/hotels-for-sale-india" className="btn-quiet">All hotels <PiArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? [0, 1, 2].map((i) => <ListingCardSkeleton key={i} />) : listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>

          {!loading && listings.length === 0 && (
            <div className="surface mx-auto max-w-xl p-10 text-center">
              <h3 className="heading-md">{error ? 'We couldn’t load opportunities' : 'No profit-sharing hotels right now'}</h3>
              <p className="mt-3 text-gray-400">Tell us the size of partnership you are looking for and we will introduce you when one is listed.</p>
              <Link to="/contact-us" className="btn-brass mt-6">Share your requirement</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PartialPropertiesPage;
