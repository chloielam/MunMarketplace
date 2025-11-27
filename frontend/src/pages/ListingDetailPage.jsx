import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById, getMyListingById } from '../services/items';
import { authService, authUtils } from '../services/auth';
import ProfilePicture from '../components/ProfilePicture';
import StarRating from '../components/StarRating';

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const sessionUser = await authUtils.refreshSession();
        const userId = sessionUser?.id || authUtils.getUserId();
        setCurrentUserId(userId);

        let listingData = null;
        try {
          listingData = await getListingById(listingId);
        } catch (err) {
          if (err.response?.status === 404 && userId) {
            listingData = await getMyListingById(listingId);
          } else {
            throw err;
          }
        }
        setListing(listingData);

        // Fetch seller information
        if (listingData.seller_id) {
          try {
            const [sellerData, profileData] = await Promise.all([
              authService.getUser(listingData.seller_id),
              authService.getUserProfile(listingData.seller_id).catch(() => null)
            ]);
            setSeller(sellerData);
            setSellerProfile(profileData);
          } catch (err) {
            console.error('Error fetching seller info:', err);
            // Continue even if seller info fails
          }
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.message || 'Listing not found');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListingData();
    }
  }, [listingId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSellerClick = () => {
    const sellerId = seller?.id || seller?.user_id;
    if (sellerId) {
      navigate(`/users/${sellerId}`);
    }
  };

  const handleEditClick = () => {
    navigate(`/listings/${listingId}/edit`);
  };
  const handleChatClick = () => {
    const sellerName = seller
      ? `${seller.first_name || ''} ${seller.last_name || ''}`.trim() || 'Seller'
      : 'Seller';
    const chatContext = {
      currentUser: authUtils.getSessionUser(),
      otherUser: {
        id: listing.seller_id,
        name: sellerName,
        email: seller?.mun_email || seller?.email || '',
      },
      product: {
        productId: listing.id,
        ...listing
      }
    };
    navigate('/chat', { state: { chatContext } });
  };

  const isOwner = currentUserId && listing && currentUserId === listing.seller_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mun-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-lg">{error || 'Listing not found'}</p>
          <button 
            onClick={() => navigate('/items')}
            className="bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const images = listing.imageUrls && listing.imageUrls.length > 0 
    ? listing.imageUrls 
    : ['https://via.placeholder.com/800x600'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-lg aspect-square">
              <img
                src={images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {listing.status === 'SOLD' && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  SOLD
                </div>
              )}
              {listing.status === 'PENDING' && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                  PENDING
                </div>
              )}
              {listing.status === 'ACTIVE' && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  ACTIVE
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index 
                        ? 'border-mun-red' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-mun-red">
                  ${listing.price}
                </span>
                <span className="text-lg text-gray-600">{listing.currency}</span>
              </div>
            </div>

            {/* Category and Location */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium capitalize">{listing.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">{listing.city} • {listing.campus}</span>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {/* Listing Info */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Listed:</span>
                  <span className="ml-2 font-medium">{formatDate(listing.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium capitalize ${listing.status === 'SOLD' ? 'text-red-600' : listing.status === 'PENDING' ? 'text-yellow-600' : 'text-green-700'}`}>
                    {listing.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Section */}
            {seller && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h2>
                <div 
                  onClick={handleSellerClick}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-mun-red hover:shadow-md transition-all cursor-pointer"
                >
                  <ProfilePicture 
                    user={seller} 
                    size={64}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {seller.first_name} {seller.last_name}
                    </div>
                    {sellerProfile && (
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating 
                          rating={parseFloat(sellerProfile.rating || 0)} 
                          size="sm"
                        />
                        <span className="text-sm text-gray-600">
                          ({sellerProfile.total_ratings || 0} reviews)
                        </span>
                      </div>
                    )}
                    {sellerProfile?.location && (
                      <div className="text-sm text-gray-500 mt-1">
                        📍 {sellerProfile.location}
                      </div>
                    )}
                  </div>
                  <div className="text-mun-red">→</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {isOwner && (
                <button
                  onClick={handleEditClick}
                  className="px-6 py-3 bg-mun-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Edit Listing
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={handleChatClick}
                  className="flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center bg-mun-red hover:bg-red-600 text-white shadow-sm"
                >
                  <span className="mr-2">💬</span>
                  Chat with Seller
                </button>
              )}
              <button
                onClick={() => navigate('/items')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Browse More Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
