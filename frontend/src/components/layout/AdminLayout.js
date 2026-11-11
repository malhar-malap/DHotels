import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authPath } from '../../utils/authRedirect';
import ErrorBoundary from '../common/ErrorBoundary';

const AdminLayout = () => {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const location = useLocation();
  const isAdmin = !!user?.roles?.includes('ADMIN');
  // The saved account can predate a role change (e.g. someone was just made admin), so check
  // with the server once before sending a non-admin away
  const [rechecked, setRechecked] = useState(false);
  const recheckStarted = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin && !recheckStarted.current) {
      recheckStarted.current = true;
      refreshUser().finally(() => setRechecked(true));
    }
  }, [loading, isAuthenticated, isAdmin, refreshUser]);

  if (loading || (isAuthenticated && !isAdmin && !rechecked)) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={authPath(location)} replace />;
  }

  if (!isAdmin) {
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
