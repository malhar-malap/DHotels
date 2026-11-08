import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiArrowRight, PiEnvelopeSimple, PiCalendarBlank, PiFileText, PiCheck } from 'react-icons/pi';
import ScheduleCallModal from '../../components/modals/ScheduleCallModal';
import SubmitMandateModal from '../../components/modals/SubmitMandateModal';
import Seo from '../../components/common/Seo';
import { CATEGORIES } from '../../utils/hospitality';

const PRINCIPLES = [
  'Connect qualified buyers, sellers, lessors, operators and investors on one trusted platform.',
  'Keep owners’ identities and numbers private until a buyer is serious.',
  'Review every listing before it is published.',
  'Plan ownership transitions so guests, staff and bookings are not disrupted.',
  'Favour well-prepared, realistic transactions over fast ones.',
];

const STEPS = [
  { title: 'Plan', text: 'Clarify goals, price expectations and the right structure — sale, lease or profit sharing.' },
  { title: 'Match', text: 'Put the property in front of qualified counterparties, confidentially.' },
  { title: 'Diligence', text: 'Title, approvals, licences (FSSAI, excise, fire), financials and operating data.' },
  { title: 'Negotiate', text: 'Agree price, terms, lock-ins and handover conditions.' },
  { title: 'Hand over', text: 'Transfer licences, staff and supplier contracts with minimal downtime.' },
];

const AUDIENCES = [
  { title: 'For sellers', text: 'Position the property properly, protect confidentiality and reach counterparties who can close.' },
  { title: 'For buyers', text: 'Understand your investment goals and operating strengths before presenting opportunities.' },
  { title: 'For owners & operators', text: 'Lease and profit-sharing structures that work for both sides over the long term.' },
];

const AboutUsPage = () => {
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showMandate, setShowMandate] = useState(false);

  return (
    <div className="bg-gray-950">
      <Seo
        title="About DHotels24.com | India’s Hospitality Marketplace"
        description="DHotels24.com is a marketplace and advisory team for buying, selling, leasing and co-owning hotels, resorts, restaurants, cafés, bars and banquet halls across India."
        path="/about"
      />

      {/* Intro */}
      <section className="container-site py-16 md:py-24">
        <p className="eyebrow eyebrow-rule">About DHotels24.com</p>
        <h1 className="heading-xl mt-5 max-w-4xl">A dedicated marketplace for hospitality property — and the people who run it.</h1>
        <div className="mt-10 grid gap-8 text-lg leading-relaxed text-gray-300 md:grid-cols-2">
          <p>
            DHotels24.com is India’s transaction marketplace for hospitality businesses. We help owners sell, lease or bring in profit-sharing partners for hotels, resorts, restaurants, cafés, bars and banquet halls — and help buyers and operators find properties worth their time.
          </p>
          <p>
            Hotels and restaurants are not just real estate. They carry licences, teams, guest reputations and seasonal cash flows. We replace informal brokers and scattered WhatsApp forwards with a structured, confidential process — from the first listing to the final handover.
          </p>
        </div>
      </section>

      {/* What we cover */}
      <section className="border-y border-white/[0.06] bg-gray-900/40 py-16 md:py-20">
        <div className="container-site">
          <h2 className="heading-lg">What we cover</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ name, label, blurb, path, icon: Icon, dealTypes }) => (
              <Link key={name} to={path} className="group bg-gray-950 p-7 transition-colors hover:bg-gray-900">
                <Icon className="h-7 w-7 text-primary-400" />
                <h3 className="mt-5 text-lg font-semibold text-gray-50 group-hover:text-primary-200">{label}</h3>
                <p className="mt-1.5 text-sm text-gray-400">{blurb}</p>
                <p className="mt-4 text-xs text-gray-500">{dealTypes.join(' · ')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="container-site grid gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Vision</p>
          <p className="mt-4 font-display text-2xl leading-snug text-gray-50 md:text-3xl">
            To be India’s most trusted platform for hospitality transactions — transparent, efficient and professionally managed, from metros to Tier-2 cities and leisure destinations.
          </p>
        </div>
        <div>
          <p className="eyebrow">How we work</p>
          <ul className="mt-5 space-y-4">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex gap-3 text-gray-300">
                <PiCheck className="mt-1 h-4 w-4 shrink-0 text-primary-400" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-white/[0.06] py-16 md:py-24">
        <div className="container-site">
          <p className="eyebrow eyebrow-rule">Our process</p>
          <h2 className="heading-lg mt-3">How a transaction comes together</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative border-t border-white/10 pt-6">
                <span className="absolute -top-px left-0 h-px w-10 bg-primary-400" />
                <span className="font-display text-sm text-primary-400">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="surface p-6">
                <h3 className="font-semibold text-primary-200">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="border-t border-white/[0.06] bg-gray-900/40 py-16 md:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow eyebrow-rule">Leadership</p>
            <h2 className="heading-lg mt-3">Manas Survee</h2>
            <p className="mt-2 text-primary-300">Founder, DHotels24.com &amp; CEO, Dhumavati Consulting LLP</p>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-gray-300">
            <p>
              With over 16 years in project development, business structuring, stakeholder management and transaction execution, Manas brings practical deal experience to hospitality M&amp;A — grounded in integrity, persistence and long-term value creation.
            </p>
            <p>
              DHotels24.com began with a simple observation: India has thousands of hotels and restaurants whose owners want an exit, a successor, an operator or a growth partner — and just as many buyers looking for them, with no specialised place to meet. DHotels24.com was built to close that gap.
            </p>
          </div>
        </div>
      </section>

      {/* Contact options */}
      <section className="container-site py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="heading-lg">Start with a conversation</h2>
          <p className="lede mt-3">Whether you are selling, buying, leasing or looking for a partner, we will listen first — confidentially.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: PiEnvelopeSimple, title: 'Send a message', text: 'We reply within one business day.', action: 'Contact us', to: '/contact-us' },
            { icon: PiCalendarBlank, title: 'Schedule a call', text: 'Pick a 30 or 60-minute slot that suits you.', action: 'Book a slot', onClick: () => setShowScheduleCall(true) },
            { icon: PiFileText, title: 'Submit a mandate', text: 'Share what you want to buy or sell and we will outline an approach.', action: 'Submit details', onClick: () => setShowMandate(true) },
          ].map(({ icon: Icon, title, text, action, to, onClick }) => {
            const body = (
              <>
                <Icon className="h-7 w-7 text-primary-400" />
                <h3 className="mt-6 text-lg font-semibold text-gray-50">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-gray-400">{text}</p>
                <span className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary-300 group-hover:text-primary-200">
                  {action} <PiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </>
            );
            const cls = 'group surface flex flex-col p-7 text-left transition-colors hover:border-primary-400/30';
            return to
              ? <Link key={title} to={to} className={cls}>{body}</Link>
              : <button key={title} type="button" onClick={onClick} className={cls}>{body}</button>;
          })}
        </div>
      </section>

      {showScheduleCall && <ScheduleCallModal onClose={() => setShowScheduleCall(false)} />}
      {showMandate && <SubmitMandateModal onClose={() => setShowMandate(false)} />}
    </div>
  );
};

export default AboutUsPage;
