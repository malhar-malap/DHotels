import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiList, FiMail, FiBriefcase, FiFileText, 
  FiUser, FiLogOut, FiSettings, FiMenu, FiX, FiShield
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, activeTab = 'Overview' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { title: 'Overview', icon: FiHome, href: '/dashboard' },
    { title: 'My Listings', icon: FiList, href: '/dashboard/listings' },
    { title: 'Inquiries', icon: FiMail, href: '/dashboard/inquiries' },
    { title: 'My Jobs', icon: FiBriefcase, href: '/dashboard/jobs' },
    { title: 'Applications', icon: FiFileText, href: '/dashboard/applications' },
    { title: 'Account Settings', icon: FiSettings, href: '/dashboard/profile' },
  ];

  if (user?.roles?.includes('ADMIN')) {
    navItems.push({ title: 'Admin Panel', icon: FiShield, href: '/admin' });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10 flex">
      {/* Sidebar Overlay for Mobile */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 btn-gradient rounded-full shadow-lg flex items-center justify-center text-white"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      )}

      {/* Backdrop Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* Removed border-r, glass-card styles that created sticked look. Kept transparent and seamless. */}
      <aside className={`fixed top-16 bottom-0 left-0 z-40 w-72 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0 bg-gray-900/95 backdrop-blur-xl' : '-translate-x-full'} lg:translate-x-0 lg:transform-none lg:transition-none lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] self-start lg:bg-transparent`}>
        <div className="h-full flex flex-col pt-8">
          {/* Sidebar Header */}
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <span className="font-black text-xl text-white">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-[#e5e7eb]"><FiX className="w-6 h-6" /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d8572a] to-[#d8572a] flex items-center justify-center text-white shadow-sm">
                <FiUser className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-black text-sm text-white break-all">{user?.fullName || 'Health Professional'}</h3>
                <p className="text-[10px] font-bold text-[#db7c26] uppercase tracking-widest break-all">{user?.email || 'Member'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.title === activeTab;
              return (
                <Link 
                  key={item.title} 
                  to={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-300 group ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-cyan-500/5 text-[#e5e7eb] hover:text-cyan-400'}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'} transition-colors`} />
                  <span className="font-bold text-xs uppercase tracking-widest">{item.title}</span>
                </Link>
              );
            })}
                        <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors duration-300 group"
            >
              <FiLogOut className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-16 pt-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
