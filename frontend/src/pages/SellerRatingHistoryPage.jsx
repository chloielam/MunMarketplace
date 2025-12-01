import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import ProfilePicture from '../components/ProfilePicture';
import StarRating from '../components/StarRating';

const SellerRatingHistoryPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedReviews, setLikedReviews] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sellerData, profileData, ratingsData] = await Promise.all([
          authService.getUser(sellerId).catch(() => null),
          authService.getUserProfile(sellerId).catch(() => null),
          authService.getSellerRatings(sellerId).catch(() => [])
        ]);
        
        setSeller(sellerData);
        setSellerProfile(profileData);
        setRatings(ratingsData || []);
      } catch (err) {
        console.error('Error fetching seller rating data:', err);
        setError('Failed to load rating history');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchData();
    }
  }, [sellerId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleLike = (ratingId) => {
    setLikedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ratingId)) {
        newSet.delete(ratingId);
      } else {
        newSet.add(ratingId);
      }
      return newSet;
    });
  };

  // Extract strengths from reviews
  const extractStrengths = () => {
    const strengthKeywords = {
      'Pricing': ['price', 'pricing', 'affordable', 'cheap', 'value', 'cost'],
      'Item description': ['description', 'accurate', 'as described', 'matches'],
      'Punctuality': ['punctual', 'on time', 'timely', 'quick', 'fast'],
      'Communication': ['communication', 'responsive', 'reply', 'message', 'contact']
    };

    const strengthCounts = {};
    
    ratings.forEach(rating => {
      if (rating.review) {
        const reviewLower = rating.review.toLowerCase();
        Object.keys(strengthKeywords).forEach(strength => {
          if (strengthKeywords[strength].some(keyword => reviewLower.includes(keyword))) {
            strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(strengthCounts)
      .map(([strength, count]) => ({ strength, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mun-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rating history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Seller not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;
  const strengths = extractStrengths();
  const sellerName = seller.first_name && seller.last_name 
    ? `${seller.first_name} ${seller.last_name}` 
    : seller.first_name || 'Seller';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
        >
          ← Back
        </button>

        {/* Seller Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <ProfilePicture 
              src={seller.profile_picture_url}
              size="large"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{sellerName}</h1>
              {sellerProfile && (
                <div className="flex items-center gap-2 mb-2">
                  <StarRating 
                    rating={parseFloat(sellerProfile.rating || 0)} 
                    totalRatings={sellerProfile.total_ratings || 0}
                    size="md"
                  />
                </div>
              )}
              {sellerProfile?.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {sellerProfile.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating History Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {ratings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No ratings yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seller Ratings Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Seller ratings</h2>
                <div className="flex items-center gap-3 mb-2">
                  <StarRating 
                    rating={averageRating} 
                    totalRatings={ratings.length}
                    size="md"
                    showCount={false}
                  />
                </div>
                <p className="text-sm text-gray-600">Based on {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}</p>
              </div>

              {/* Strengths Section */}
              {strengths.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {seller.first_name || 'Seller'}'s strengths
                    </h2>
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Here's what buyers appreciate about {seller.first_name || 'this seller'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map(({ strength, count }, index) => (
                      <button
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {strength} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Reviews Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Seller reviews ({ratings.length})
                </h2>
                <div className="space-y-4">
                  {ratings.map((rating) => {
                    const buyerName = rating.buyer 
                      ? `${rating.buyer.first_name || ''} ${rating.buyer.last_name || ''}`.trim() || 'Anonymous'
                      : 'Anonymous';
                    const isLiked = likedReviews.has(rating.id);

                    return (
                      <div key={rating.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <ProfilePicture 
                              src={rating.buyer?.profile_picture_url}
                              size="small"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 truncate">{buyerName}</span>
                              <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                                {formatDate(rating.createdAt)}
                              </span>
                            </div>
                            <div className="mb-2">
                              <StarRating 
                                rating={rating.rating} 
                                size="sm"
                                showCount={false}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {rating.review && (
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{rating.review}</p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(rating.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                              isLiked 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-500 hover:text-gray-600'
                            }`}
                          >
                            <svg 
                              className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} 
                              fill={isLiked ? 'currentColor' : 'none'} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm">{likedReviews.has(rating.id) ? '1' : '0'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRatingHistoryPage;

