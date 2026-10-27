import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiList, FiMail, FiBriefcase, FiFileText, FiHome, FiShoppingBag, FiTool, FiUsers } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if we are on the landing page
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => { logout(); navigate('/'); };
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <header className="glass fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center space-x-2 group">
            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-base sm:text-xl font-black text-white tracking-tighter">DHotels</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center space-x-1 text-[#e5e7eb] font-semibold hover:text-[#d8572a] transition-colors tracking-tight"><span>Buy / Lease</span></button>
              <div className="absolute top-full left-0 mt-3 w-56 bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-900/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 p-2">
                <Link to="/listings?category=Hotels" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Hotels</Link>
                <Link to="/listings?category=Restaurants" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Restaurants</Link>
                <Link to="/listings?category=Cafe" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Cafes</Link>
                <Link to="/listings?category=Banquet+halls" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Banquet Halls</Link>
                <Link to="/listings?category=Restaurants+and+Bar" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Restaurants & Bar</Link>
                <Link to="/listings?category=Resorts" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Resorts</Link>
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-[#e5e7eb] font-semibold hover:text-[#d8572a] transition-colors tracking-tight"><span>Jobs</span></button>
              <div className="absolute top-full left-0 mt-3 w-56 bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-900/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 p-2">
                <Link to="/jobs" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Find Hospitality Jobs</Link>
                <Link to="/jobs/create" className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-[#db7c26]/10 hover:text-[#db7c26] rounded-xl transition-colors">Post a Job</Link>
              </div>
            </div>
            <Link to="/listings?dealType=Profit+Sharing" className="text-[#e5e7eb] font-semibold hover:text-[#d8572a] transition-colors tracking-tight">Profit Sharing</Link>
            <Link to="/about" className="text-[#e5e7eb] font-semibold hover:text-[#d8572a] transition-colors tracking-tight">About Us</Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/listings/create" className="btn btn-gradient text-xs py-2 px-5 !hidden sm:!flex font-bold uppercase tracking-wider rounded-xl">Post an Ad</Link>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={toggleDropdown} className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-10 h-10 bg-[#db7c26]/10 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-sm overflow-hidden">
                      {user?.profilePhotoUrl ? <img src={user.profilePhotoUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" /> : <span className="text-[#db7c26] font-medium">{user?.fullName?.charAt(0) || 'U'}</span>}
                    </div>
                    <div className="hidden md:block text-left mr-2">
                      <p className="text-sm font-bold text-gray-200 leading-tight">{user?.fullName?.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter"></p>
                    </div>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-900/20 py-2 z-50 transform origin-top-right transition-all animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-800 mb-1">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                      </div>
                      <Link to="/dashboard" className="dropdown-item py-2.5 mx-2 rounded-xl" onClick={() => setIsDropdownOpen(false)}><FiHome size={16} />Dashboard</Link>
                      <Link to="/dashboard/listings" className="dropdown-item py-2.5 mx-2 rounded-xl" onClick={() => setIsDropdownOpen(false)}><FiList size={16} />My Listings</Link>
                      <Link to="/dashboard/inquiries" className="dropdown-item py-2.5 mx-2 rounded-xl" onClick={() => setIsDropdownOpen(false)}><FiMail size={16} />Inquiries</Link>
                      <Link to="/dashboard/jobs" className="dropdown-item py-2.5 mx-2 rounded-xl" onClick={() => setIsDropdownOpen(false)}><FiBriefcase size={16} />My Jobs</Link>
                      <Link to="/dashboard/applications" className="dropdown-item py-2.5 mx-2 rounded-xl" onClick={() => setIsDropdownOpen(false)}><FiFileText size={16} />Applications</Link>
                      <Link to="/dashboard/profile" className="dropdown-item py-2.5 mx-2 rounded-xl" onClick={() => setIsDropdownOpen(false)}><FiSettings size={16} />Profile Settings</Link>
                      {user?.roles?.includes('ADMIN') && <Link to="/admin" className="dropdown-item py-2.5 mx-2 rounded-xl text-[#db7c26]" onClick={() => setIsDropdownOpen(false)}><FiUsers size={16} />Admin Panel</Link>}
                      <div className="border-t border-gray-800 my-1 pt-1">
                        <button onClick={handleLogout} className="dropdown-item py-2.5 mx-2 rounded-xl text-red-500 w-[calc(100%-1rem)]"><FiLogOut size={16} />Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-3">
                <Link to="/login" className="text-sm font-bold text-[#e5e7eb] hover:text-[#d8572a] px-2 sm:px-4 hidden sm:inline-block">Login</Link>
                <Link to="/register" className="btn btn-gradient text-xs py-2 px-5 font-bold uppercase tracking-wider rounded-xl hidden md:inline-flex">Sign Up</Link>
              </div>
            )}
            <button onClick={toggleMenu} className="md:hidden p-2 text-gray-400 hover:text-primary-500">
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700/50">
            <nav className="flex flex-col space-y-1">
              <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Buy / Lease</p>
              <Link to="/listings" className="px-6 py-2.5 text-gray-400 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}><FiShoppingBag className="inline mr-2" />All Listings</Link>
              <Link to="/hospitals-for-sale-india" className="px-8 py-2 text-gray-500 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Hospitals</Link>
              <Link to="/pharma-companies-for-sale-india" className="px-8 py-2 text-gray-500 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Pharma Companies</Link>
              <Link to="/diagnostic-centers-for-sale-india" className="px-8 py-2 text-gray-500 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Diagnostics</Link>
              <Link to="/dental-clinics-for-sale-india" className="px-8 py-2 text-gray-500 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Dental Clinics</Link>
              <Link to="/pharmacies-for-sale-india" className="px-8 py-2 text-gray-500 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Pharmacies</Link>
              
              <div className="border-t border-gray-700/30 my-1"></div>
              <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jobs</p>
              <Link to="/healthcare-jobs-india" className="px-6 py-2.5 text-gray-400 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}><FiBriefcase className="inline mr-2" />Find Jobs</Link>
              <Link to="/healthcare-jobs-india/create" className="px-8 py-2 text-gray-500 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}>Post a Job</Link>
              
              <div className="border-t border-gray-700/30 my-1"></div>
              <Link to="/partial-properties" className="px-4 py-2.5 text-gray-400 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}><FiHome className="inline mr-2" />Partial Stake Sale</Link>
              <Link to="/about" className="px-4 py-2.5 text-gray-400 hover:bg-gray-800 rounded-lg text-sm" onClick={() => setIsMenuOpen(false)}><FiUsers className="inline mr-2" />About Us</Link>
              {isAuthenticated && (
                <div className="pt-2 px-4">
                  <Link to="/listings/create" className="btn btn-gradient w-full text-center text-sm py-2.5 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>Post an Ad</Link>
                </div>
              )}
              {!isAuthenticated && (
                <div className="flex gap-3 pt-2 px-4">
                  <Link to="/login" className="btn btn-secondary flex-1 text-center text-sm py-2.5 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn btn-gradient flex-1 text-center text-sm py-2.5 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;




