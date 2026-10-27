import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <Seo
      title={`Page Not Found | DH Acquisitions`}
      description="The page you are looking for does not exist or has been moved."
      noindex
      statusCode={404}
    />
    <div className="text-center max-w-md">
      <p className="text-6xl font-bold text-primary-500 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-200 mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you are looking for does not exist or has been moved.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary px-6 py-3">Go to Home</Link>
        <Link to="/listings" className="btn btn-secondary px-6 py-3">Browse Marketplace</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
