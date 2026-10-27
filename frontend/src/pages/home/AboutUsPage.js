import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTarget, 
  FiEye, 
  FiShield, 
  FiUsers, 
  FiCheckCircle, 
  FiArrowRight, 
  FiPhone, 
  FiMail, 
  FiFileText, 
  FiActivity,
  FiBriefcase,
  FiFilePlus,
  FiCalendar
} from 'react-icons/fi';
import ScheduleCallModal from '../../components/modals/ScheduleCallModal';
import SubmitMandateModal from '../../components/modals/SubmitMandateModal';
import Seo from '../../components/common/Seo';

const AboutUsPage = () => {
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showMandate, setShowMandate] = useState(false);

  const assetClasses = [
    {
      title: "Hospitals",
      desc: "Multi-speciality and speciality hospitals — navigating complex operational, clinical, and regulatory elements."
    },
    {
      title: "Pharmaceutical Companies",
      desc: "Formulation, API, contract manufacturing, nutraceuticals, and Ayurvedic manufacturers — focusing on facilities, IP, quality systems, and approvals."
    },
    {
      title: "Diagnostic Centres",
      desc: "Pathology labs, radiology, chains, and specialised testing facilities — emphasising equipment, workflows, and growth potential."
    },
    {
      title: "Dental Clinics",
      desc: "Single practices, multi-location groups, and speciality centres — supporting organised network expansion."
    },
    {
      title: "Pharmacies",
      desc: "Independent stores, hospital pharmacies, distributors, and franchise networks — addressing licensing, inventory, and supply chain needs."
    }
  ];

  const transactionSteps = [
    {
      title: "Strategic Planning",
      icon: <FiUsers className="w-6 h-6 text-[#db7c26]" />,
      desc: "Establishing goals, structuring plans, and preparing the business for listing or acquisition."
    },
    {
      title: "Confidential Matching",
      icon: <FiFilePlus className="w-6 h-6 text-[#db7c26]" />,
      desc: "Aligning buyers and sellers matching qualifications and maintaining strict confidentiality."
    },
    {
      title: "Due Diligence & Regulatory",
      icon: <FiShield className="w-6 h-6 text-[#db7c26]" />,
      desc: "Navigating licenses, audit, credentials, and legal compliance workflows securely."
    },
    {
      title: "Negotiation & Execution",
      icon: <FiActivity className="w-6 h-6 text-[#db7c26]" />,
      desc: "Structuring mutually beneficial agreements, prices, and terms across both parties."
    },
    {
      title: "Operational Handover",
      icon: <FiBriefcase className="w-6 h-6 text-[#db7c26]" />,
      desc: "Managing transitions smoothly to ensure continuity of care and stable operations."
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/5 pt-24 pb-32 font-sans text-white relative overflow-hidden">
      <Seo
        title="About Us | DH Acquisitions"
        description="Learn about DH Acquisitions, the healthcare marketplace and advisory team helping buyers and sellers of hospitals, pharma companies, clinics and diagnostic centres across India."
        path="/about"
      />
      
      {/* Saffron/Gold bottom-left decorative glow (visible on scroll down) */}
      <div className="absolute -left-48 bottom-0 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#db7c26]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 relative z-10">
        
        {/* Title & Introduction (About Us) - Centered Heading & Layout */}
        <div className="space-y-8 max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E3FCF9] text-[#3a5578] font-semibold text-sm">
            About Us
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            India's Dedicated <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7b538] via-[#db7c26] to-[#d8572a]">
              Healthcare Transaction Marketplace
            </span>
          </h1>
          <div className="space-y-6 text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto">
            <p>
              <strong>DHAcquisitions.co</strong> is India’s dedicated healthcare transaction marketplace, specialising in the acquisition, sale, lease, and operational transition of healthcare businesses. We focus exclusively on the healthcare sector — hospitals, pharmaceutical companies, diagnostic centres, dental clinics, pharmacies, and related assets.
            </p>
            <p>
              Healthcare businesses are more than commercial assets; they are vital institutions serving patients, families, and communities. Transactions in this sector demand exceptional diligence, regulatory expertise, and operational insight to ensure continuity of care and sustainable outcomes.
            </p>
            <p>
              Unlike fragmented networks and informal intermediaries common in India, DHAcquisitions.co delivers a structured, confidential, compliant, and professionally managed process. We provide end-to-end support — from transaction planning and buyer/seller matching to due diligence, regulatory coordination, negotiations, and seamless operational handovers.
            </p>
            <p className="font-medium text-[#db7c26]">
              Our goal is to connect qualified stakeholders and facilitate successful transitions that strengthen India’s healthcare infrastructure.
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 hover:border-[#db7c26]/20 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-[#f7b538]/20 rounded-2xl flex items-center justify-center mb-6">
                <FiEye className="w-7 h-7 text-[#db7c26]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Vision</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To become India’s most trusted healthcare business transaction platform — a transparent, efficient, and professionally managed marketplace for acquisitions, sales, leases, and operational partnerships.
                </p>
                <p>
                  We envision a future where healthcare entrepreneurs, investors, operators, and professionals can transact with confidence, supported by robust frameworks that protect patient care and unlock the full potential of quality assets across metros, Tier-2 cities, and regional markets.
                </p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 hover:border-[#db7c26]/20 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-[#f7b538]/20 rounded-2xl flex items-center justify-center mb-6">
                <FiTarget className="w-7 h-7 text-[#db7c26]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Mission</h2>
              <p className="text-gray-300 mb-6">
                To deliver successful healthcare transactions through commercial expertise, regulatory discipline, and deep operational understanding.
              </p>
              <div className="text-gray-300 space-y-3">
                <p className="font-semibold text-[#db7c26] text-sm uppercase tracking-wider mb-2">We achieve this by:</p>
                {[
                  "Connecting qualified buyers, sellers, lessors, lessees, investors, and operators on a trusted platform.",
                  "Maintaining the highest standards of confidentiality and professionalism.",
                  "Ensuring smooth ownership transitions without disrupting patient care.",
                  "Promoting transparency, accountability, and regulatory compliance.",
                  "Supporting the long-term productivity and growth of healthcare assets across India."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-[#db7c26] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <p className="pt-4 border-t border-white/5 text-sm italic text-gray-400">
                  We prioritise the right transactions — those built on realistic expectations, thorough planning, and aligned stakeholder objectives — over speed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Healthcare Asset Classes (Centered Grid on bottom row) */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Healthcare Asset Classes</h2>
            <p className="text-gray-400">We support transactions across key segments:</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {assetClasses.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-[#db7c26]/40 transition-all duration-300 relative group overflow-hidden w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] min-h-[220px] flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#db7c26]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#db7c26]/10 flex items-center justify-center text-[#db7c26] font-bold text-lg">
                    0{idx + 1}
                  </div>
                  <h4 className="text-xl font-bold text-white">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 max-w-2xl mx-auto text-sm italic pt-4">
            We also facilitate leasing, management agreements, operator partnerships, and hybrid structures for greater flexibility.
          </p>
        </div>

        {/* Leadership (No Image) */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 max-w-4xl mx-auto text-center md:text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#db7c26]/5 to-transparent opacity-40 pointer-events-none"></div>
          <div className="relative z-10 space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#E3FCF9] text-[#3a5578] font-medium text-xs">
              Leadership
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Manas Survee</h2>
              <p className="text-[#db7c26] font-medium text-lg">Founder, DHAcquisitions.co & CEO, Dhumavati Consulting LLP</p>
            </div>
            <p className="text-gray-300 leading-relaxed text-base">
              With over 16 years of experience in project development, business structuring, stakeholder management, and transaction execution, Manas brings deep expertise to healthcare M&A. His leadership is grounded in integrity, persistence, and value creation — principles essential for aligning commercial goals with regulatory and operational realities in India’s healthcare sector.
            </p>
          </div>
        </div>

        {/* Founding Philosophy */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center md:text-left">Founding Philosophy</h2>
          <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-8 space-y-6 text-gray-300 leading-relaxed">
            <p>
              The idea behind DHAcquisitions.co emerged from a simple observation. India possesses thousands of healthcare assets with significant untapped potential. Many owners are seeking succession solutions, growth partners, strategic investors, operators, or exit opportunities. At the same time, there are qualified buyers and operators actively searching for opportunities.
            </p>
            <p>
              However, the absence of a specialised transaction platform has often made it difficult for these stakeholders to connect and transact efficiently.
            </p>
            <p className="font-medium text-white">
              DHAcquisitions.co was created to bridge this gap by providing sector-specific expertise and transaction support designed exclusively for healthcare businesses.
            </p>
          </div>
        </div>

        {/* Our Approach */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Our Approach</h2>
            <p className="text-gray-300 leading-relaxed">
              Every mandate starts with a clear understanding of your objectives. We believe successful outcomes require more than a valuation or a marketing process. They require a deep understanding of the motivations, priorities, and constraints influencing each stakeholder.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-[#db7c26] mb-2">For Sellers</h4>
              <p className="text-gray-400 text-sm leading-relaxed">We focus on positioning the asset appropriately, protecting confidentiality, and identifying qualified counterparties.</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-[#db7c26] mb-2">For Buyers</h4>
              <p className="text-gray-400 text-sm leading-relaxed">We focus on understanding investment objectives, operational capabilities, and strategic goals before presenting opportunities.</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
              <h4 className="font-bold text-[#db7c26] mb-2">For Lessors & Operators</h4>
              <p className="text-gray-400 text-sm leading-relaxed">We focus on creating practical structures that support long-term success.</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 italic text-center">
            This disciplined approach helps improve transaction quality while reducing unnecessary delays and inefficiencies.
          </p>
        </div>

        {/* Healthcare Transaction Process */}
        <div className="space-y-12 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#db7c26]">Structural Pipeline</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Healthcare Transaction Process</h2>
          </div>
          
          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {transactionSteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-gray-900/50 border border-white/5 rounded-3xl hover:border-[#db7c26]/30 transition-all group">
                {/* Arrow lines between items */}
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-700 to-gray-800 z-0"></div>
                )}
                {/* Step badge */}
                <span className="absolute -top-3 left-6 bg-gray-800 text-[#db7c26] border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">
                  Step {idx + 1}
                </span>
                
                {/* Icon Wrapper */}
                <div className="w-14 h-14 bg-[#db7c26]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-lg">
                  {step.icon}
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2 relative z-10">{step.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Looking Ahead */}
        <div className="bg-gradient-to-br from-[#d8572a]/20 to-transparent border border-[#d8572a]/30 rounded-[2.5rem] p-8 md:p-12 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-white">Looking Ahead</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed text-base">
            <p>
              India’s healthcare sector is expected to continue expanding significantly over the coming decades. Increasing healthcare demand, rising investment activity, industry consolidation, technological advancement, and infrastructure development will create substantial transaction opportunities.
            </p>
            <p>
              DHAcquisitions.co aims to play a meaningful role in this transformation by providing a trusted platform for healthcare business transactions. Our goal is not merely to facilitate deals but to help create stronger healthcare institutions capable of delivering long-term value to patients, communities, investors, and operators.
            </p>
          </div>
        </div>

        {/* Get in Touch / Take the next step (Redesigned White/Grey cards matching the user screenshot) */}
        <div className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Get in Touch</h2>
            <p className="text-gray-400 leading-relaxed text-base">
              Every successful transaction begins with a conversation. Whether you are considering a sale, acquisition, lease, investment, or operational partnership, we are here to listen and advise — with complete confidentiality and professionalism.
            </p>
          </div>

          {/* Dark Glassmorphic Themed Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Contact Us Card */}
            <Link 
              to="/contact-us"
              className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:border-[#db7c26]/30 hover:shadow-2xl hover:shadow-[#db7c26]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-start text-left min-h-[260px] group"
            >
              <div className="space-y-6 w-full">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
                  <FiMail className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Contact us</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Send a message and we'll respond within one business day.
                  </p>
                </div>
              </div>
              <div className="text-gray-500 group-hover:text-blue-400 transition-colors pt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                Send Message <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Schedule a Call Card */}
            <button 
              onClick={() => setShowScheduleCall(true)}
              className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:border-[#db7c26]/30 hover:shadow-2xl hover:shadow-[#db7c26]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-start text-left min-h-[260px] group w-full"
            >
              <div className="space-y-6 w-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Schedule a call</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Book a time that works for you — 30 or 60-minute slots available.
                  </p>
                </div>
              </div>
              <div className="text-gray-500 group-hover:text-emerald-400 transition-colors pt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                Book Slot <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Submit Your Mandate Card */}
            <button 
              onClick={() => setShowMandate(true)}
              className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between items-start text-left min-h-[260px] group w-full"
            >
              <div className="space-y-6 w-full">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/5">
                  <FiFileText className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Submit your mandate</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Share your objectives and we'll outline a tailored approach.
                  </p>
                </div>
              </div>
              <div className="text-gray-500 group-hover:text-orange-400 transition-colors pt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                Submit Details <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        </div>

      </div>

      {showScheduleCall && <ScheduleCallModal onClose={() => setShowScheduleCall(false)} />}
      {showMandate && <SubmitMandateModal onClose={() => setShowMandate(false)} />}
    </div>
  );
};

export default AboutUsPage;
