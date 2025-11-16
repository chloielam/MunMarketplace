import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authUtils } from '../services/auth';
import { getUserListings, deleteListing } from '../services/items';
import ProfilePicture from '../components/ProfilePicture';
import StarRating from '../components/StarRating';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    location: '',
    studyProgram: '',
    department: '',
    profilePictureUrl: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionUser = await authUtils.refreshSession();
        const userId = sessionUser?.id || authUtils.getUserId();
        if (!userId) {
          navigate('/login');
          return;
        }
        const [userData, profileData, listingsData] = await Promise.all([
          authService.getUser().catch(err => {
            console.error('Error fetching user:', err);
            throw err;
          }),
          authService.getUserProfile().catch(err => {
            console.log('Profile not found (this is OK):', err.message);
            return null; // Profile might not exist yet
          }),
          getUserListings().catch(err => {
            console.log('Error fetching listings:', err);
            return [];
          })
        ]);

        setUser(userData);
        setProfile(profileData);
        setListings(listingsData || []);
        
        // Initialize edit form with current data
        setEditForm({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          bio: profileData?.bio || '',
          phone: userData.phone_number || '',
          location: profileData?.location || '',
          studyProgram: profileData?.study_program || '',
          department: profileData?.department || '',
          profilePictureUrl: userData.profile_picture_url || ''
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      bio: profile?.bio || '',
      phone: user?.phone_number || '',
      location: profile?.location || '',
      studyProgram: profile?.study_program || '',
      department: profile?.department || '',
      profilePictureUrl: user?.profile_picture_url || ''
    });
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      // For now, we'll use a data URL. In production, you'd upload to a service like S3/Cloudinary
      // and get back a URL to store in profile_picture_url
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        // Update form with preview
        setEditForm({...editForm, profilePictureUrl: dataUrl});
        
        // In a real app, you'd upload the file to a storage service here
        // For now, we'll just update the preview. The actual upload would happen on save.
        // Example: const uploadResult = await uploadToStorage(file);
        // setEditForm({...editForm, profilePictureUrl: uploadResult.url});
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Failed to process image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    setEditForm({...editForm, profilePictureUrl: ''});
  };

  const handleSave = async () => {
    try {
      // Prepare user update data - only include fields with values
      const userUpdateData = {};
      if (editForm.firstName && editForm.firstName.trim()) {
        userUpdateData.first_name = editForm.firstName.trim();
      }
      if (editForm.lastName && editForm.lastName.trim()) {
        userUpdateData.last_name = editForm.lastName.trim();
      }
      if (editForm.phone && editForm.phone.trim()) {
        userUpdateData.phone_number = editForm.phone.trim();
      }
      // Only send profile_picture_url if it's a valid HTTP/HTTPS URL
      // Data URLs (base64) are not accepted by backend validation
      // In production, you'd upload the image to a storage service first
      if (editForm.profilePictureUrl) {
        if (editForm.profilePictureUrl.startsWith('http://') || editForm.profilePictureUrl.startsWith('https://')) {
          userUpdateData.profile_picture_url = editForm.profilePictureUrl;
        } else if (editForm.profilePictureUrl.startsWith('data:')) {
          // Data URL - skip for now, show message
          console.warn('Data URLs need to be uploaded to a storage service first. Skipping profile picture update.');
          // You could show a message to the user here
        }
      } else if (editForm.profilePictureUrl === '') {
        // Allow clearing the profile picture
        userUpdateData.profile_picture_url = null;
      }

      // Update user basic info (only if there's data to update)
      if (Object.keys(userUpdateData).length > 0) {
        try {
          await authService.updateUser(undefined, userUpdateData);
        } catch (userErr) {
          console.error('Error updating user:', userErr);
          // Check if it's a validation error
          if (userErr.response?.data?.message) {
            throw new Error(`User update failed: ${userErr.response.data.message}`);
          }
          throw userErr;
        }
      }

      // Prepare profile update data - only include fields with values
      const profileUpdateData = {};
      if (editForm.bio !== undefined) {
        profileUpdateData.bio = editForm.bio.trim() || null;
      }
      if (editForm.location && editForm.location.trim()) {
        profileUpdateData.location = editForm.location.trim();
      }
      if (editForm.studyProgram && editForm.studyProgram.trim()) {
        profileUpdateData.study_program = editForm.studyProgram.trim();
      }
      if (editForm.department && editForm.department.trim()) {
        profileUpdateData.department = editForm.department.trim();
      }

      // Update profile info (only if there's data to update)
      if (Object.keys(profileUpdateData).length > 0) {
        try {
          await authService.updateUserProfile(undefined, profileUpdateData);
        } catch (profileErr) {
          console.error('Error updating profile:', profileErr);
          // Check if it's a validation error
          if (profileErr.response?.data?.message) {
            throw new Error(`Profile update failed: ${profileErr.response.data.message}`);
          }
          throw profileErr;
        }
      }

      // Refresh data
      const [userData, profileData] = await Promise.all([
        authService.getUser(),
        authService.getUserProfile()
      ]);

      setUser(userData);
      setProfile(profileData);
      setIsEditing(false);
      
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      let errorMessage = 'Failed to update profile';
      
      if (err.response?.data) {
        // Handle validation errors
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          // Multiple validation errors
          errorMessage = err.response.data.message.join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
      }

      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      alert('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      console.error('Error changing password:', err);
      alert(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      setDeletingListingId(listingId);
      
      // Get listing title before deleting
      const listingToDelete = listings.find(l => (l.listing_id || l.id) === listingId);
      const listingTitle = listingToDelete?.title || 'the listing';
      
      await deleteListing(listingId);
      
      setShowDeleteConfirm(null);
      setDeletingListingId(null);
      
      // Navigate to deleted confirmation page
      navigate('/listing-deleted', { 
        state: { listingTitle } 
      });
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing');
      setDeletingListingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const totalListings = listings.length;

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

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.first_name || user?.fullName || 'User Profile';

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-mun-red to-red-700 text-white p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <ProfilePicture
                  src={isEditing ? editForm.profilePictureUrl : user?.profile_picture_url}
                  size="xlarge"
                  editable={isEditing}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-white/80 mb-1">First Name</label>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          placeholder="First Name"
                          className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-mun-red"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-white/80 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          placeholder="Last Name"
                          className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-mun-red"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl font-bold">{displayName}</h1>
                      {user?.is_email_verified && (
                        <span className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-white/90 text-lg">{user?.mun_email || user?.email}</p>
                    {profile && (
                      <div className="pt-1">
                        <StarRating 
                          rating={parseFloat(profile.rating || 0)} 
                          totalRatings={profile.total_ratings || 0}
                          size="sm"
                          variant="dark"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={uploadingImage}
                      className="bg-white text-mun-red px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {uploadingImage ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Statistics */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {totalListings > 0 ? (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">{totalListings}</div>
                    <div className="text-sm text-gray-600">My Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">{activeListings.length}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">0</div>
                    <div className="text-sm text-gray-600">Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">
                      {profile ? parseFloat(profile.rating || 0).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">0</div>
                    <div className="text-sm text-gray-600">Items Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">0</div>
                    <div className="text-sm text-gray-600">Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">0</div>
                    <div className="text-sm text-gray-600">Saved Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mun-red">
                      {profile ? parseFloat(profile.rating || 0).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bio Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                    rows="4"
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {profile?.bio || 'No bio available'}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="e.g., (709) 555-1234"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{user?.phone_number || 'Not provided'}</p>
                    )}
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="e.g., St. John's, NL"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{profile?.location || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Study Program</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.studyProgram}
                        onChange={(e) => setEditForm({...editForm, studyProgram: e.target.value})}
                        placeholder="e.g., Computer Science"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{profile?.study_program || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        placeholder="e.g., Faculty of Science"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{profile?.department || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-gray-600">{formatDate(user?.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="text-gray-600">{formatDateTime(user?.last_login)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Verification</label>
                    <p className="text-gray-600">
                      {user?.is_email_verified ? (
                        <span className="text-green-600 font-medium">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">⚠ Not Verified</span>
                      )}
                    </p>
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

            {/* Activity Sections */}
            <div className="mt-8 space-y-6">
              {/* My Listings Section - Only show if user has listings */}
              {listings.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">My Listings</h3>
                    <button
                      onClick={() => navigate('/items?myListings=true')}
                      className="text-mun-red hover:underline text-sm"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.slice(0, 6).map((listing) => {
                      const listingId = listing.listing_id || listing.id;
                      const imageUrl = listing.image_url || (listing.imageUrls && listing.imageUrls[0]);
                      return (
                        <div
                          key={listingId}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
                        >
                          <div
                            className="cursor-pointer"
                            onClick={() => navigate(`/listings/${listingId}`)}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(listingId);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                            title="Delete listing"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Show empty state for sellers if they have no listings
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">My Listings</h3>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-600 mb-2">No listings yet</p>
                    <p className="text-sm text-gray-500">Start selling to see your listings here</p>
                    <button
                      onClick={() => navigate('/create-listing')}
                      className="mt-4 bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Create Listing
                    </button>
                  </div>
                </div>
              )}

              {/* Purchase History Section - Always show for buyers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Purchase History</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-600 mb-2">No purchases yet</p>
                  <p className="text-sm text-gray-500">Start shopping to see your purchase history here</p>
                  <button
                    onClick={() => navigate('/items')}
                    className="mt-4 bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Browse Items
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Security Settings</h3>
              
              {!showChangePassword ? (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800">Change Password</h4>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="bg-mun-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Listing</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(null);
                  setDeletingListingId(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(showDeleteConfirm)}
                disabled={deletingListingId !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingListingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
