import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiShield } from 'react-icons/fi';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Detect if the visitor is an automated search bot or inspection tool
  const isBot = typeof navigator !== 'undefined' && (
    Boolean(navigator.webdriver) ||
    /bot|googlebot|crawler|spider|robot|crawling|google-inspectiontool|inspectiontool|mediapartners-google|feedfetcher-google|storebot-google|google-site-verification|lighthouse|headlesschrome|screaming frog/i.test(navigator.userAgent)
  );

  useEffect(() => {
    if (isBot) return;

    // Check if user has already made a cookie choice
    const cookieConsent = localStorage.getItem('dhacquisitions_cookie_consent');
    if (!cookieConsent) {
      // Delay showing slightly for a smooth entrance and to not fight the initial load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isBot]);

  const handleAccept = () => {
    localStorage.setItem('dhacquisitions_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('dhacquisitions_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (isBot || !isVisible) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[9990] max-w-sm w-[calc(100%-2.5rem)] animate-slideUp transition-all duration-500"
      role="region"
      aria-label="Cookie consent banner"
    >
      <div className="bg-[#121620]/95 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-4">
        {/* Decorative Top Amber Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-[#db7c26] to-amber-500" />

        {/* Content Row */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#db7c26]/15 border border-[#db7c26]/30 flex items-center justify-center text-[#db7c26] shrink-0 text-lg shadow-inner">
            🍪
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Cookie Preferences
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We use cookies to ensure platform security, analyze traffic, and enhance your browsing experience.{' '}
              <Link 
                to="/cookies" 
                className="text-[#db7c26] hover:text-orange-400 underline font-semibold transition-colors"
              >
                Cookie Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-1"
          >
            <FiX className="w-3.5 h-3.5" /> Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1"
          >
            <FiCheck className="w-3.5 h-3.5" /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
