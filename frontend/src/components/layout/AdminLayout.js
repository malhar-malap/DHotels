import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authPath } from '../../utils/authRedirect';
import ErrorBoundary from '../common/ErrorBoundary';

const AdminLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={authPath(location)} replace />;
  }

  if (!user?.roles?.includes('ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout activeTab="Admin Panel">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default AdminLayout;
