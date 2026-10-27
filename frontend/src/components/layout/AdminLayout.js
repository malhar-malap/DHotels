import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d8572a]"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.roles?.includes('ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout activeTab="Admin Panel">
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
