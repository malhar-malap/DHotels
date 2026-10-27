import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Main Pages
import HomePage from './pages/home/HomePage';
import AboutUsPage from './pages/home/AboutUsPage';
import ContactUsPage from './pages/home/ContactUsPage';

import LegalCenterPage from './pages/legal/LegalCenterPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ListingsPage from './pages/marketplace/ListingsPage';
import ListingDetailPage from './pages/marketplace/ListingDetailPage';
import CreateListingPage from './pages/marketplace/CreateListingPage';
import PartialPropertiesPage from './pages/marketplace/PartialPropertiesPage';
import BlogsPage from './pages/marketplace/BlogsPage';
import SeoLandingPage from './pages/marketplace/SeoLandingPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import CreateJobPage from './pages/jobs/CreateJobPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminContactMessagesPage from './pages/admin/AdminContactMessagesPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import AdminConsultationsPage from './pages/admin/AdminConsultationsPage';
import AdminMandatesPage from './pages/admin/AdminMandatesPage';

// Additional Pages (remaining placeholders)
import {
  MyListingsPage,
  MyInquiriesPage,
  MyJobsPage,
  MyApplicationsPage,
  ProfilePage
} from './pages/RemainingPages';

// Context
import { AuthProvider } from './context/AuthContext';

// Scroll to top on route change
import ScrollToTop from './components/ScrollToTop';
import DisclaimerModal from './components/modals/DisclaimerModal';
import CookieConsentBanner from './components/common/CookieConsentBanner';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <DisclaimerModal />
      <CookieConsentBanner />
      <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10">
        <Toaster 
          position="top-right"
          containerStyle={{
            top: 80,
            right: 24,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '12px 18px',
            },
          }}
        />
        <Header />
        <main className="flex-grow pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/terms" element={<LegalCenterPage />} />
            <Route path="/privacy" element={<LegalCenterPage />} />
            <Route path="/cookies" element={<LegalCenterPage />} />
            <Route path="/cookie-policy" element={<LegalCenterPage />} />
            <Route path="/refund-policy" element={<LegalCenterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Marketplace Routes */}
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/hospitals-for-sale-india" element={<ListingsPage />} />
            <Route path="/pharma-companies-for-sale-india" element={<ListingsPage />} />
            <Route path="/diagnostic-centers-for-sale-india" element={<ListingsPage />} />
            <Route path="/dental-clinics-for-sale-india" element={<ListingsPage />} />
            <Route path="/pharmacies-for-sale-india" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/partial-properties" element={<PartialPropertiesPage />} />
            
            {/* Blogs & SEO Landing Pages */}
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/hospitals-for-sale-maharashtra" element={<SeoLandingPage pathKey="hospitals-maharashtra" />} />
            <Route path="/pharma-companies-for-sale-maharashtra" element={<SeoLandingPage pathKey="pharma-maharashtra" />} />
            <Route path="/hospitals-for-sale-bangalore" element={<SeoLandingPage pathKey="hospitals-bangalore" />} />
            <Route path="/hospitals-for-sale-delhi" element={<SeoLandingPage pathKey="hospitals-delhi" />} />
            <Route path="/hospitals-for-sale-pune" element={<SeoLandingPage pathKey="hospitals-pune" />} />
            
            {/* Jobs Routes */}
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/healthcare-jobs-india" element={<JobsPage />} />
            <Route path="/healthcare-jobs-india/:id" element={<JobDetailPage />} />
            
            {/* Private/Protected Routes (Require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/listings/create" element={<CreateListingPage />} />
              <Route path="/listings/:id/edit" element={<CreateListingPage />} />
              <Route path="/jobs/create" element={<CreateJobPage />} />
              <Route path="/jobs/:id/edit" element={<CreateJobPage />} />
              <Route path="/healthcare-jobs-india/create" element={<CreateJobPage />} />
              <Route path="/healthcare-jobs-india/:id/edit" element={<CreateJobPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/listings" element={<MyListingsPage />} />
              <Route path="/dashboard/inquiries" element={<MyInquiriesPage />} />
              <Route path="/dashboard/jobs" element={<MyJobsPage />} />
              <Route path="/dashboard/applications" element={<MyApplicationsPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="listings" element={<AdminListingsPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="contact-messages" element={<AdminContactMessagesPage />} />
              <Route path="consultations" element={<AdminConsultationsPage />} />
              <Route path="mandates" element={<AdminMandatesPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;



