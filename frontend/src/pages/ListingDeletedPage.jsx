import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ListingDeletedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const listingTitle = location.state?.listingTitle || 'the listing';

  useEffect(() => {
    // Auto-redirect to listings page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/items');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Listing Deleted
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            "{listingTitle}" has been successfully deleted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/items')}
              className="flex-1 bg-mun-red text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Browse Listings
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              My Profile
            </button>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-sm text-gray-500 mt-6">
            Redirecting to listings page in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingDeletedPage;

