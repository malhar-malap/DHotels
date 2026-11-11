import React from 'react';
import { Link } from 'react-router-dom';
import {
  PiUser, PiShieldCheck, PiSealCheck, PiMagnifyingGlassBold, PiPhoneBold, PiCurrencyInrBold,
  PiHandshakeBold, PiFunnel, PiClock, PiTarget, PiCrown, PiLockKey, PiArrowRight,
  PiTrendUp, PiStar, PiLightning, PiHeadset, PiCreditCard, PiUserFocus,
} from 'react-icons/pi';
import { CATEGORIES, CONTACT_FEE } from '../../utils/hospitality';

/**
 * Explains the paid-connection model (the "Strategic workflow" infographic from DHAcquisitions),
 * rebuilt as markup so it is responsive and indexable. Figures are limited to what is true of the
 * product: the fee, the review step and how contact details are protected.
 */

const Card = ({ className = '', children }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gray-900/80 p-6 sm:p-7 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="font-display text-xl text-gray-50 sm:text-2xl">{children}</h3>
);

const WHY_PAY = [
  { icon: PiFunnel, title: 'We filter out the noise', text: 'Only reviewed, genuine listings are published.' },
  { icon: PiClock, title: 'You save time', text: 'Speak only to owners who are actually ready to deal.' },
  { icon: PiTarget, title: 'Better responses', text: 'Owners take an operator seriously when they reach out this way.' },
];

const STEPS = [
  { icon: PiMagnifyingGlassBold, title: 'Find a property', text: 'Search and shortlist the hotel or outlet that fits.' },
  { icon: PiCurrencyInrBold, title: `Pay ${CONTACT_FEE}`, text: 'One-time connection fee, paid securely.' },
  { icon: PiPhoneBold, title: 'Get owner details', text: 'Name, phone and email unlock instantly.' },
  { icon: PiHandshakeBold, title: 'Connect & close', text: 'Talk directly, visit, negotiate and close.' },
];

const VALUE = [
  { icon: PiCurrencyInrBold, title: 'High-value deals', text: 'Properties worth crores.' },
  { icon: PiShieldCheck, title: 'Low risk', text: 'We review. You decide.' },
  { icon: PiTrendUp, title: 'Better outcomes', text: 'Real conversations, real results.' },
  { icon: PiStar, title: 'Exclusive access', text: 'Serious listings, serious owners.' },
];

const TRUST = [
  { label: 'Reviewed', text: 'Every listing checked before it goes live' },
  { label: 'One-time', text: 'Pay per property — no subscription' },
  { label: 'Private', text: 'Owner numbers never shown publicly' },
];

const EnquiryFunnel = () => (
  <div className="flex h-full flex-col items-center justify-between gap-4 text-center" aria-hidden="true">
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-gray-800 ${i % 3 === 0 ? 'opacity-40' : 'opacity-80'}`}>
          <PiUser className="h-3.5 w-3.5 text-gray-300" />
        </span>
      ))}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-200">Many enquiries</p>
      <p className="text-xs text-gray-500">Most are not serious</p>
    </div>
    <div className="relative w-full max-w-[13rem]">
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient id="funnel-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#C9A25A" stopOpacity="0.22" />
            <stop offset="1" stopColor="#C9A25A" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d="M8 6 H192 L122 82 V114 H78 V82 Z" fill="url(#funnel-fill)" stroke="#C9A25A" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="100" cy="6" rx="92" ry="5" fill="none" stroke="#DFC07A" strokeOpacity="0.6" strokeWidth="1.5" />
      </svg>
      <PiShieldCheck className="absolute left-1/2 top-[22%] h-9 w-9 -translate-x-1/2 text-primary-300" />
    </div>
    <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-400 bg-gray-950 shadow-brass">
      <PiUserFocus className="h-7 w-7 text-primary-200" />
    </span>
    <div>
      <p className="font-display text-lg text-primary-200">Serious operators</p>
      <p className="text-xs text-gray-500">Ready to visit and negotiate</p>
    </div>
  </div>
);

const StrategicWorkflow = () => (
  <section className="border-t border-white/[0.06] bg-gray-950 py-20 lg:py-28" aria-labelledby="workflow-heading">
    <div className="container-site">
      <div className="max-w-2xl">
        <p className="eyebrow eyebrow-rule">Strategic workflow</p>
        <h2 id="workflow-heading" className="heading-lg mt-3">How a {CONTACT_FEE} connection works</h2>
        <p className="lede mt-3">Owners’ contact details stay private until an operator is serious enough to pay for them — which keeps every conversation worth having.</p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        {/* Row 1 */}
        <Card className="lg:col-span-5">
          <p className="font-display text-3xl leading-tight text-gray-50 sm:text-4xl">
            Connect with owners.<br />
            <span className="text-gradient">Close the right deal.</span>
          </p>
          <p className="mt-4 text-gray-300">We connect you only with active, serious owners — no spam, no wasted site visits.</p>
          <div className="mt-6 h-px w-12 bg-primary-400" />
          <p className="mt-6 text-sm font-semibold text-gray-200">Property types you can explore</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3">
            {CATEGORIES.map(({ name, label, path, icon: Icon }) => (
              <Link key={name} to={path} className="group flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] p-3 text-center transition-colors hover:border-primary-400/40">
                <Icon className="h-7 w-7 text-primary-300 transition-transform group-hover:-translate-y-0.5" />
                <span className="text-xs font-medium leading-tight text-gray-300">{label}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <EnquiryFunnel />
        </Card>

        <Card className="border-primary-400/40 bg-gradient-to-b from-primary-900/40 to-gray-900 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-md bg-primary-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-950">Premium connection</span>
            <PiCrown className="h-9 w-9 text-primary-300" />
          </div>
          <p className="mt-5 text-gray-300">To contact an owner and get their details, a small one-time connection fee applies.</p>
          <div className="relative mx-auto mt-6 max-w-xs rounded-2xl border-2 border-primary-400/70 bg-gray-950/70 px-6 py-5 text-center">
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-r-2 border-primary-400/70 bg-gray-900" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-l-2 border-primary-400/70 bg-gray-900" />
            <p className="stat-value text-5xl text-primary-200">{CONTACT_FEE}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-primary-300">per connection</p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[[PiSealCheck, 'Serious owners'], [PiPhoneBold, 'Direct contact'], [PiLockKey, 'Secure & private']].map(([Icon, text]) => (
              <div key={text} className="flex flex-col items-center gap-1.5">
                <Icon className="h-6 w-6 text-primary-300" />
                <span className="text-xs leading-tight text-gray-300">{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-950/60 px-4 py-2.5 text-sm text-primary-200">
            <PiLockKey className="h-4 w-4" /> One connection. Real opportunity.
          </p>
        </Card>

        {/* Row 2 */}
        <Card className="lg:col-span-5">
          <CardTitle>Why pay {CONTACT_FEE} per connection?</CardTitle>
          <ul className="mt-6 space-y-5">
            {WHY_PAY.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary-400/30 bg-primary-400/10">
                  <Icon className="h-5 w-5 text-primary-300" />
                </span>
                <span>
                  <span className="block font-semibold text-primary-100">{title}</span>
                  <span className="block text-sm text-gray-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-7">
          <CardTitle>How it works for operators</CardTitle>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-400 text-sm font-bold text-gray-950">{i + 1}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gray-950">
                    <Icon className="h-6 w-6 text-primary-200" />
                  </span>
                  {i < STEPS.length - 1 && <PiArrowRight className="hidden h-4 w-4 text-gray-600 xl:block" />}
                </div>
                <p className="mt-4 font-semibold text-primary-100">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">{text}</p>
              </li>
            ))}
          </ol>
        </Card>

        {/* Row 3 */}
        <Card className="lg:col-span-5">
          <CardTitle>
            Your {CONTACT_FEE} can lead to <span className="text-primary-300">big opportunities</span>
          </CardTitle>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {VALUE.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-600 text-gray-950">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-semibold text-gray-100">{title}</p>
                <p className="mt-1 text-xs text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardTitle>Built for <span className="text-primary-300">serious operators</span></CardTitle>
          <dl className="mt-6 divide-y divide-white/[0.06]">
            {TRUST.map((t) => (
              <div key={t.label} className="py-3 first:pt-0 last:pb-0">
                <dt className="font-display text-lg text-primary-200">{t.label}</dt>
                <dd className="text-sm text-gray-400">{t.text}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="flex flex-col lg:col-span-4">
          <CardTitle>Ready to connect with the right owner?</CardTitle>
          <p className="mt-2 text-gray-300">Find a property, pay <span className="font-semibold text-primary-200">{CONTACT_FEE}</span> and get connected straight away.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[[PiCreditCard, 'Secure payment'], [PiLightning, 'Instant access'], [PiHeadset, 'Support when you need it']].map(([Icon, text]) => (
              <div key={text} className="flex flex-col items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-400/30 bg-primary-400/10">
                  <Icon className="h-5 w-5 text-primary-300" />
                </span>
                <span className="text-xs leading-tight text-gray-300">{text}</span>
              </div>
            ))}
          </div>
          <div className="min-h-[1.75rem] flex-1" />
          <Link to="/listings" className="btn-brass w-full !py-3.5">
            Find a property <PiArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <PiShieldCheck className="h-4 w-4 text-emerald-400" /> Payments processed securely by Razorpay
          </p>
        </Card>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-center text-sm text-emerald-200">
        <PiLockKey className="h-4 w-4 shrink-0" /> We protect your privacy — owner details are shared only after a secure payment.
      </p>
    </div>
  </section>
);

export default StrategicWorkflow;
