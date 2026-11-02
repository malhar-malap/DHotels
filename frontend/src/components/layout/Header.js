import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  PiList, PiX, PiCaretDown, PiSignOut, PiGear, PiSquaresFour, PiTag, PiEnvelopeSimple,
  PiBriefcase, PiFileText, PiShieldCheck, PiPlus, PiArrowRight,
} from 'react-icons/pi';
import { CATEGORIES } from '../../utils/hospitality';

const DEAL_LINKS = [
  { label: 'For Sale', to: '/listings?dealType=For+Sale' },
  { label: 'For Lease', to: '/listings?dealType=For+Lease' },
  { label: 'Profit Sharing', to: '/partial-properties' },
];

const NAV_LINKS = [
  { label: 'Profit Sharing', to: '/partial-properties' },
  { label: 'Careers', to: '/jobs' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact-us', wide: true },
];

const ACCOUNT_LINKS = [
  { label: 'Dashboard', to: '/dashboard', icon: PiSquaresFour },
  { label: 'My listings', to: '/dashboard/listings', icon: PiTag },
  { label: 'Inquiries', to: '/dashboard/inquiries', icon: PiEnvelopeSimple },
  { label: 'My jobs', to: '/dashboard/jobs', icon: PiBriefcase },
  { label: 'Applications', to: '/dashboard/applications', icon: PiFileText },
  { label: 'Profile settings', to: '/dashboard/profile', icon: PiGear },
];

const Brand = () => (
  <Link to="/" className="group flex items-center gap-2.5" aria-label="DHotels24.in home">
    <img src="/images/logo.png" alt="" className="h-9 w-9 object-contain transition-transform duration-300 group-hover:rotate-12" />
    <span className="flex flex-col leading-none">
      <span className="font-display text-[1.35rem] text-gray-50">DHotels24<span className="text-primary-400">.in</span></span>
      <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.28em] text-primary-400 sm:block">Hospitality Marketplace</span>
    </span>
  </Link>
);

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);

  // Close every menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
    setIsMegaOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setIsAccountOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setIsAccountOpen(false);
        setIsMegaOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Lock page scroll behind the mobile sheet
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isAdmin = user?.roles?.includes('ADMIN');
  const marketplaceActive = (location.pathname.startsWith('/listings') && !/\/(create|edit)$/.test(location.pathname))
    || CATEGORIES.some((c) => c.path === location.pathname);
  const navLinkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors xl:px-3.5 ${isActive ? 'text-primary-200' : 'text-gray-300 hover:text-gray-50'}`;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || isMenuOpen ? 'glass' : 'border-b border-transparent bg-gray-950/40 backdrop-blur-md'}`}>
      <div className="container-site">
        <div className="flex h-16 items-center justify-between gap-6">
          <Brand />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            <div
              className="relative"
              onMouseEnter={() => setIsMegaOpen(true)}
              onMouseLeave={() => setIsMegaOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMegaOpen((v) => !v)}
                aria-expanded={isMegaOpen}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium xl:px-3.5 transition-colors ${marketplaceActive || isMegaOpen ? 'text-primary-200' : 'text-gray-300 hover:text-gray-50'}`}
              >
                Marketplace <PiCaretDown className={`h-3.5 w-3.5 transition-transform ${isMegaOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMegaOpen && (
                <div className="absolute left-1/2 top-full w-[44rem] -translate-x-1/2 pt-3 animate-fadeIn">
                  <div className="surface-raised grid grid-cols-[1fr_13rem] overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 p-3">
                      {CATEGORIES.map(({ name, label, blurb, path, icon: Icon }) => (
                        <Link key={name} to={path} className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.04]">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-400/20 bg-primary-400/10 text-primary-300">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-gray-100 group-hover:text-primary-200">{label}</span>
                            <span className="mt-0.5 block text-xs leading-snug text-gray-400">{blurb}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="flex flex-col border-l border-white/[0.06] bg-gray-900/60 p-5">
                      <p className="eyebrow">By deal type</p>
                      <div className="mt-3 flex flex-col gap-1">
                        {DEAL_LINKS.map((d) => (
                          <Link key={d.label} to={d.to} className="rounded-lg px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-gray-50">
                            {d.label}
                          </Link>
                        ))}
                      </div>
                      <Link to="/listings" className="btn-quiet mt-auto pt-4">
                        All listings <PiArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={(state) => `${navLinkClass(state)} ${l.wide ? 'hidden xl:inline-flex' : ''}`}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/listings/create" className="btn-brass hidden whitespace-nowrap !px-4 !py-2 md:inline-flex">
              <PiPlus className="h-4 w-4" /> <span className="xl:hidden">List property</span><span className="hidden xl:inline">List your property</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((v) => !v)}
                  aria-expanded={isAccountOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full border border-white/10 p-1 pr-2 transition-colors hover:border-primary-400/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-400/15 text-sm font-semibold text-primary-200">
                    {user?.profilePhotoUrl
                      ? <img src={user.profilePhotoUrl} alt="" className="h-8 w-8 object-cover" />
                      : (user?.fullName?.charAt(0) || 'U')}
                  </span>
                  <PiCaretDown className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
                </button>
                {isAccountOpen && (
                  <div className="surface-raised absolute right-0 mt-3 w-64 py-2 animate-fadeIn">
                    <div className="border-b border-white/[0.06] px-4 pb-3 pt-1">
                      <p className="truncate text-sm font-semibold text-gray-50">{user?.fullName}</p>
                      <p className="truncate text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
                        <Link key={to} to={to} className="dropdown-item mx-2 rounded-lg"><Icon className="h-4 w-4 text-gray-400" />{label}</Link>
                      ))}
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item mx-2 rounded-lg !text-primary-200"><PiShieldCheck className="h-4 w-4" />Admin panel</Link>
                      )}
                    </div>
                    <div className="border-t border-white/[0.06] pt-1">
                      <button type="button" onClick={handleLogout} className="dropdown-item mx-2 w-[calc(100%-1rem)] rounded-lg !text-rose-300">
                        <PiSignOut className="h-4 w-4" />Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:text-gray-50 sm:inline-flex">
                Log in
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-200 lg:hidden"
            >
              {isMenuOpen ? <PiX className="h-5 w-5" /> : <PiList className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] bg-gray-950 lg:hidden animate-fadeIn">
          <nav className="container-site flex flex-col gap-8 py-6" aria-label="Mobile">
            <div>
              <p className="eyebrow">Browse by category</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CATEGORIES.map(({ name, label, path, icon: Icon }) => (
                  <Link key={name} to={path} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-gray-900 px-3 py-3 text-sm font-medium text-gray-100">
                    <Icon className="h-5 w-5 text-primary-300" /> {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col divide-y divide-white/[0.06] border-y border-white/[0.06]">
              <Link to="/listings" className="py-3.5 text-base font-medium text-gray-100">All listings</Link>
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="py-3.5 text-base font-medium text-gray-100">{l.label}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/listings/create" className="btn-brass w-full"><PiPlus className="h-4 w-4" /> List your property</Link>
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="btn-ghost">Log in</Link>
                  <Link to="/register" className="btn-ghost">Create account</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
