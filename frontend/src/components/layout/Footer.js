import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1a2744] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Brand Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-[#2a3d57] gap-4">
          <div className="flex items-center space-x-3">
            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">DHotels</span>
          </div>
          <p className="text-sm text-gray-400 max-w-xl">
            India's premier hospitality acquisitions marketplace. Buy, sell, lease and partner in hotels, cafes, restaurants, and event venues.
          </p>
        </div>

        {/* 4 Spacious Columns - Anchors kept on single lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/listings?category=Hotels" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Hotels for Sale & Lease
                </Link>
              </li>
              <li>
                <Link to="/listings?category=Restaurants" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Restaurants for Sale & Lease
                </Link>
              </li>
              <li>
                <Link to="/listings?category=Cafe" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Cafes for Sale & Lease
                </Link>
              </li>
              <li>
                <Link to="/listings?category=Banquet+halls" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Banquet Halls
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Hospitality Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Hospital & Healthcare Acquisitions</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/hospitals-for-sale-maharashtra" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Hospitals for Sale in Maharashtra
                </a>
              </li>
              <li>
                <a href="/hospitals-for-sale-pune" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Hospitals for Sale in Pune
                </a>
              </li>
              <li>
                <a href="/hospitals-for-sale-delhi" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Hospitals for Sale in Delhi
                </a>
              </li>
              <li>
                <a href="/hospitals-for-sale-bangalore" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Hospitals for Sale in Bangalore
                </a>
              </li>
              <li>
                <a href="/pharma-companies-for-sale-maharashtra" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Pharma Companies for Sale in Maharashtra
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Sellers</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/listings/create" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Post a Listing
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/healthcare-jobs-india/create" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Post a Job
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact-us" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm hover:text-[#f7b538] transition-colors whitespace-nowrap inline-block">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2a3d57] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} DHotels Marketplace. All rights reserved.</p>
          <p className="text-sm text-gray-400">Developed & Designed by Sahil & Malhar</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
