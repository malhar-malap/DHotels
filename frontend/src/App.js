import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Main Pages (home loads eagerly; every other page is code-split into its own chunk)
import HomePage from './pages/home/HomePage';
const AboutUsPage = lazy(() => import('./pages/home/AboutUsPage'));
const ContactUsPage = lazy(() => import('./pages/home/ContactUsPage'));

const LegalCenterPage = lazy(() => import('./pages/legal/LegalCenterPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ListingsPage = lazy(() => import('./pages/marketplace/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/marketplace/ListingDetailPage'));
const CreateListingPage = lazy(() => import('./pages/marketplace/CreateListingPage'));
const PartialPropertiesPage = lazy(() => import('./pages/marketplace/PartialPropertiesPage'));
const BlogsPage = lazy(() => import('./pages/marketplace/BlogsPage'));
const BlogArticlePage = lazy(() => import('./pages/marketplace/BlogArticlePage'));
const SeoLandingPage = lazy(() => import('./pages/marketplace/SeoLandingPage'));
const JobsPage = lazy(() => import('./pages/jobs/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));
const CreateJobPage = lazy(() => import('./pages/jobs/CreateJobPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import { seoData } from './pages/marketplace/seoData';
import { CATEGORIES } from './utils/hospitality';

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminListingsPage = lazy(() => import('./pages/admin/AdminListingsPage'));
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminContactMessagesPage = lazy(() => import('./pages/admin/AdminContactMessagesPage'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'));
const AdminConsultationsPage = lazy(() => import('./pages/admin/AdminConsultationsPage'));
const AdminMandatesPage = lazy(() => import('./pages/admin/AdminMandatesPage'));

// Additional Pages (remaining placeholders)
const remaining = (name) => lazy(() => import('./pages/RemainingPages').then((m) => ({ default: m[name] })));
const MyListingsPage = remaining('MyListingsPage');
const MyInquiriesPage = remaining('MyInquiriesPage');
const MyJobsPage = remaining('MyJobsPage');
const MyApplicationsPage = remaining('MyApplicationsPage');
const ProfilePage = remaining('ProfilePage');

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
      <div className="min-h-screen flex flex-col bg-gray-950">
        <Toaster 
          position="top-right"
          containerStyle={{
            top: 80,
            right: 24,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#131D22',
              color: '#F4F6F5',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '14px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#C9A25A', secondary: '#091013' } },
          }}
        />
        <Header />
        <main className="flex-grow pt-16">
          <ErrorBoundary>
            <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-primary-400" /></div>}>
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
            {CATEGORIES.map((c) => (
              <Route key={c.path} path={c.path} element={<ListingsPage />} />
            ))}
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/partial-properties" element={<PartialPropertiesPage />} />
            
            {/* Blogs & SEO Landing Pages */}
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<BlogArticlePage />} />
            {Object.keys(seoData).map((pathKey) => (
              <Route key={pathKey} path={`/${pathKey}`} element={<SeoLandingPage pathKey={pathKey} />} />
            ))}
            
            {/* Jobs Routes */}
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/hospitality-jobs-india" element={<JobsPage />} />
            <Route path="/hospitality-jobs-india/:id" element={<JobDetailPage />} />
            
            {/* Private/Protected Routes (Require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/listings/create" element={<CreateListingPage />} />
              <Route path="/listings/:id/edit" element={<CreateListingPage />} />
              <Route path="/jobs/create" element={<CreateJobPage />} />
              <Route path="/jobs/:id/edit" element={<CreateJobPage />} />
              <Route path="/hospitality-jobs-india/create" element={<CreateJobPage />} />
              <Route path="/hospitality-jobs-india/:id/edit" element={<CreateJobPage />} />
              
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
            </Suspense>
        </ErrorBoundary>
      </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;



