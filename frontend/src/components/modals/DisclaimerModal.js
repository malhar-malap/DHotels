import React, { useState, useEffect } from 'react';
import { FiShield, FiAlertTriangle, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);

  // Detect if the visitor is an automated search bot or inspection tool via User-Agent / webdriver check
  const isBot = typeof navigator !== 'undefined' && (
    Boolean(navigator.webdriver) ||
    /bot|googlebot|crawler|spider|robot|crawling|google-inspectiontool|inspectiontool|mediapartners-google|feedfetcher-google|storebot-google|google-site-verification|lighthouse|headlesschrome|screaming frog/i.test(navigator.userAgent)
  );

  useEffect(() => {
    if (isBot) return;

    const accepted = localStorage.getItem('dhotels_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, [isBot]);

  const handleAccept = () => {
    localStorage.setItem('dhotels_disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    // Redirect user away to exit the website
    window.location.href = 'https://www.google.com';
  };

  if (isBot || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 rounded-[2rem] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        {/* Accent Glow Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-white/5 bg-gray-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary-500/15 border border-primary-400/30 flex items-center justify-center text-primary-400 shadow-inner">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-400/20">
                  Mandatory Notice
                </span>
                <h2 id="disclaimer-title" className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                  Regulatory & Legal Disclaimer
                </h2>
              </div>
            </div>
            <img src="/images/logo.png" alt="DHotels24.com logo" className="w-10 h-10 object-contain opacity-80 hidden sm:block" />
          </div>
          <p className="text-gray-400 text-xs mt-2 leading-relaxed">
            Please read and acknowledge the following terms before accessing <span className="text-gray-200 font-semibold">dhotels24.com</span>, operated by <span className="text-gray-200 font-semibold">Dhumavati Consulting LLP</span>.
          </p>
        </div>

        {/* Scrollable Document Content */}
        <div 
          className="overflow-y-auto p-5 sm:p-7 space-y-6 text-gray-300 text-xs sm:text-sm leading-relaxed border-b border-white/5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
        >
          {/* Preamble Card */}
          <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15 text-primary-200/90 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary-400 uppercase tracking-wider text-[11px]">
              <FiAlertTriangle className="w-4 h-4 shrink-0" /> Important Acknowledgement
            </div>
            <p>
              The information contained on <a href="https://dhotels24.com/" className="underline font-semibold text-primary-300 hover:text-white" target="_blank" rel="noopener noreferrer">https://dhotels24.com/</a> (“Website”) is provided by <strong>Dhumavati Consulting LLP</strong> (“Dhumavati”, “we”, “us” or “our”) for general informational purposes only.
            </p>
            <p className="font-medium text-white/90">
              By accessing or using the Website, you acknowledge and agree to the following 16 provisions:
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">01.</span> General Information Only
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              The Content available on the Website is intended to provide general information concerning Dhumavati, its areas of activity, capabilities, services and matters relating to financing, acquisitions, M&A, capital and business opportunities. The Content is not intended to constitute professional advice or a substitute for independent professional advice.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">02.</span> No Financial or Investment Advice
            </h3>
            <div className="text-gray-400 text-xs pl-6 space-y-1.5 leading-relaxed">
              <p>Nothing on the Website constitutes:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>investment advice;</li>
                <li>financial advice;</li>
                <li>securities advice;</li>
                <li>a recommendation to acquire, dispose of or hold any security or asset;</li>
                <li>a recommendation to enter into any financing or acquisition;</li>
                <li>a valuation or fairness opinion; or</li>
                <li>a solicitation or offer to undertake any investment or transaction,</li>
              </ul>
              <p className="italic text-gray-500 text-[11px]">
                unless expressly stated otherwise in a separate written document issued for that specific purpose and subject to the terms stated therein.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">03.</span> No Legal, Tax or Accounting Advice
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              The Website does not provide legal, tax, accounting or other professional advice. Users should obtain advice from appropriately qualified professionals before acting upon information contained on the Website.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">04.</span> No Offer or Commitment
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              Nothing on the Website constitutes an offer, invitation, solicitation or commitment by Dhumavati to provide financing, arrange financing, advise on a transaction, acquire an asset, raise capital or enter into any other transaction. Any transaction or engagement is subject to separate documentation, due diligence, internal approvals, regulatory requirements and applicable commercial terms.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">05.</span> Financing and Capital
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              References to financing, capital, acquisition finance, technology funding or global capital should not be construed as a representation that financing will be available to any particular person or entity. Availability, pricing, structure, quantum and terms of financing depend upon factors including eligibility, creditworthiness, transaction structure, due diligence, lender/investor appetite, regulatory requirements and market conditions.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">06.</span> M&A and Transaction Opportunities
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              Information concerning businesses, acquisitions, sectors or potential transaction opportunities is provided for general informational purposes. No representation is made that any transaction will be completed or that any opportunity described on the Website will remain available. Users must undertake their own independent due diligence before entering into any transaction.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">07.</span> Accuracy and Completeness
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              We endeavour to ensure that Website Content is accurate and reasonably current. However, we do not warrant or represent that the Content is complete, accurate, current or free from errors or omissions. Information may change without notice.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">08.</span> Forward-Looking Information
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              Certain statements may relate to anticipated developments, opportunities, market conditions or future events. Such statements are inherently subject to risks, uncertainties and assumptions. Actual outcomes may differ materially from any expectations expressed or implied. Dhumavati undertakes no obligation to update such statements except where required by applicable law.
            </p>
          </div>

          {/* Section 9 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">09.</span> Third-Party Information
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              The Website may contain information obtained from third parties or links to third-party websites. Although reasonable care may be taken in selecting or presenting such information, Dhumavati does not independently guarantee the accuracy, completeness or reliability of third-party information.
            </p>
          </div>

          {/* Section 10 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">10.</span> No Client or Adviser Relationship
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              Access to or use of the Website does not, by itself, establish a client, adviser, fiduciary, agency, partnership, joint venture or other professional relationship between you and Dhumavati. Such a relationship will arise only pursuant to an express written engagement or agreement, where applicable.
            </p>
          </div>

          {/* Section 11 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">11.</span> No Warranty
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              To the maximum extent permitted by applicable law, the Website and its Content are provided on an “as is” and “as available” basis. Dhumavati makes no express or implied warranty concerning the Website, including its availability, accuracy, completeness, merchantability, fitness for a particular purpose or non-infringement.
            </p>
          </div>

          {/* Section 12 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">12.</span> Limitation of Liability
            </h3>
            <div className="text-gray-400 text-xs pl-6 space-y-1.5 leading-relaxed">
              <p>To the maximum extent permitted by applicable law, Dhumavati and its partners, employees, representatives and advisers shall not be liable for any loss or damage arising from or in connection with:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>reliance upon Website Content;</li>
                <li>any investment, financing, acquisition or business decision;</li>
                <li>any error or omission in Website Content;</li>
                <li>interruption or unavailability of the Website; or</li>
                <li>any third-party content or website.</li>
              </ul>
            </div>
          </div>

          {/* Section 13 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">13.</span> Independent Due Diligence
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              You are solely responsible for conducting such legal, financial, commercial, tax, regulatory and other due diligence as may be appropriate before taking any action based on information contained on the Website.
            </p>
          </div>

          {/* Section 14 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">14.</span> Changes
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              Dhumavati may amend, update or remove Website Content and this Disclaimer at any time without prior notice.
            </p>
          </div>

          {/* Section 15 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">15.</span> Governing Law
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              This Disclaimer shall be governed by the laws of India. Subject to applicable law, the courts in Mumbai having jurisdiction over the relevant dispute shall have exclusive jurisdiction.
            </p>
          </div>

          {/* Section 16 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary-400 font-mono">16.</span> Related Documents
            </h3>
            <p className="text-gray-400 text-xs pl-6 leading-relaxed">
              This Disclaimer should be read together with the Terms and Conditions, the Privacy Policy, and the Cookies Policy. In the event of a conflict between this Disclaimer and a specific written engagement or definitive transaction document, the latter shall prevail in respect of the relevant engagement or transaction.
            </p>
          </div>

          {/* Contact Sign-off */}
          <div className="pt-4 border-t border-white/5 text-[11px] text-gray-400 leading-relaxed">
            <p className="font-bold text-gray-200">Dhumavati Consulting LLP</p>
            <p>
              Website: <a href="https://dhotels24.com/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">https://dhotels24.com/</a>
            </p>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-6 bg-gray-950 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <p className="text-[11px] text-gray-400 text-center sm:text-left">
            By clicking <strong className="text-gray-200">"I Agree & Proceed"</strong>, you acknowledge and accept all terms of this disclaimer.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <FiX className="w-4 h-4" /> Decline & Exit
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-500 hover:from-primary-600 hover:to-primary-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <FiCheck className="w-4 h-4" /> I Agree & Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
