import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService, authUtils } from '../services/auth';
import { getUserListings } from '../services/items';
import ProfilePicture from '../components/ProfilePicture';
import StarRating from '../components/StarRating';

const PublicProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user ID to check if viewing own profile
        const sessionUser = await authUtils.refreshSession();
        const currentId = sessionUser?.id || authUtils.getUserId();
        setCurrentUserId(currentId);

        // If viewing own profile, redirect to profile page
        if (currentId === userId) {
          navigate('/profile');
          return;
        }

          // Fetch user and profile data
        // Note: Listings for other users not available yet (would need backend endpoint)
        const [userData, profileData] = await Promise.all([
          authService.getUser(userId).catch(err => {
            console.error('Error fetching user:', err);
            throw err;
          }),
          authService.getUserProfile(userId).catch(err => {
            console.log('Profile not found:', err.message);
            return null;
          })
        ]);
        
        // Try to fetch listings if viewing own profile (shouldn't happen due to redirect, but just in case)
        let listingsData = [];
        if (currentId === userId) {
          try {
            listingsData = await getUserListings();
          } catch (err) {
            console.log('Error fetching listings:', err);
          }
        }

        setUser(userData);
        setProfile(profileData);
        setListings(listingsData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setError('Invalid user ID');
      setLoading(false);
    }
  }, [userId, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mun-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
            onClick={() => navigate('/home')}
            className="bg-mun-red text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button 
            onClick={() => navigate('/home')}
            className="bg-mun-red text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.first_name || 'User';

  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const totalListings = listings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              ← Back
            </button>
            {currentUserId && (
              <button
                onClick={() => navigate('/profile')}
                className="text-mun-red hover:text-red-700"
              >
                My Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-mun-red text-white p-6">
            <div className="flex items-start gap-6">
              <ProfilePicture
                src={user?.profile_picture_url}
                size="xlarge"
                editable={false}
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {user?.is_email_verified && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                {profile && (
                  <div className="mt-2">
                    <StarRating 
                      rating={parseFloat(profile.rating || 0)} 
                      totalRatings={profile.total_ratings || 0}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Statistics */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-mun-red">{totalListings}</div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mun-red">{activeListings.length}</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mun-red">
                  {profile ? parseFloat(profile.rating || 0).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bio Section */}
              {profile?.bio && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {user?.phone_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-600">{user.phone_number}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-600">{user?.mun_email || user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Academic Information</h3>
                <div className="space-y-3">
                  {profile?.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-600">{profile.location}</p>
                    </div>
                  )}
                  {profile?.study_program && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Study Program</label>
                      <p className="text-gray-600">{profile.study_program}</p>
                    </div>
                  )}
                  {profile?.department && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <p className="text-gray-600">{profile.department}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Member Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-gray-600">{formatDate(user?.created_at)}</p>
                  </div>
                  {profile?.updated_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Last Updated</label>
                      <p className="text-gray-600">{formatDate(profile.updated_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User's Listings */}
            {listings.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Listings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.slice(0, 6).map((listing) => {
                    const listingId = listing.listing_id || listing.id;
                    const imageUrl = listing.image_url || (listing.imageUrls && listing.imageUrls[0]);
                    return (
                      <div
                        key={listingId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/items/${listingId}`)}
                      >
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={listing.title}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <h4 className="font-semibold text-gray-800 truncate">{listing.title}</h4>
                        <p className="text-mun-red font-bold">${listing.price}</p>
                        <p className="text-sm text-gray-500 capitalize">{listing.status}</p>
                      </div>
                    );
                  })}
                </div>
                {listings.length > 6 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate(`/items?seller=${userId}`)}
                      className="text-mun-red hover:underline"
                    >
                      View all {listings.length} listings →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;

