import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authUtils } from '../services/auth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    phone: '',
    campus: '',
    year: '',
    program: '',
    university: '',
    studentId: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = authUtils.getUserId();
        if (!userId) {
          navigate('/login');
          return;
        }
        const [userData, profileData] = await Promise.all([
          authService.getUser(userId).catch(err => {
            console.error('Error fetching user:', err);
            throw err;
          }),
          authService.getUserProfile(userId).catch(err => {
            console.log('Profile not found (this is OK):', err.message);
            return null; // Profile might not exist yet
          })
        ]);

        setUser(userData);
        setProfile(profileData);
        
        // Initialize edit form with current data
        setEditForm({
          fullName: userData.fullName || userData.first_name || '',
          bio: profileData?.bio || '',
          phone: profileData?.phone || userData.phone_number || '',
          campus: profileData?.campus || '',
          year: profileData?.year || userData.year_of_study || '',
          program: profileData?.program || userData.program || '',
          university: userData.university || '',
          studentId: userData.student_id || ''
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
      fullName: user?.fullName || user?.first_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || user?.phone_number || '',
      campus: profile?.campus || '',
      year: profile?.year || user?.year_of_study || '',
      program: profile?.program || user?.program || '',
      university: user?.university || '',
      studentId: user?.student_id || ''
    });
  };

  const handleSave = async () => {
    try {
      const userId = authUtils.getUserId();
      
      // Update user basic info
      await authService.updateUser(userId, {
        fullName: editForm.fullName
      });

      // Update profile info
      await authService.updateUserProfile(userId, {
        bio: editForm.bio,
        phone: editForm.phone,
        campus: editForm.campus,
        year: editForm.year,
        program: editForm.program
      });

      // Refresh data
      const [userData, profileData] = await Promise.all([
        authService.getUser(userId),
        authService.getUserProfile(userId)
      ]);

      setUser(userData);
      setProfile(profileData);
      setIsEditing(false);
      
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    authUtils.removeToken();
    navigate('/');
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
            onClick={() => navigate('/')}
            className="bg-mun-red text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              ← Back to Home
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-mun-red text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      className="bg-white text-mun-red px-3 py-1 rounded"
                    />
                  ) : (
                    user?.fullName || 'User Profile'
                  )}
                </h1>
                <p className="text-white opacity-90 mt-1">{user?.email}</p>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-white text-mun-red px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-mun-red"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-mun-red"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
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
                    rows="3"
                  />
                ) : (
                  <p className="text-gray-600">
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{profile?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Academic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Campus</label>
                    {isEditing ? (
                      <select
                        value={editForm.campus}
                        onChange={(e) => setEditForm({...editForm, campus: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      >
                        <option value="">Select Campus</option>
                        <option value="St. John's">St. John's</option>
                        <option value="Grenfell">Grenfell</option>
                        <option value="Marine Institute">Marine Institute</option>
                      </select>
                    ) : (
                      <p className="text-gray-600">{profile?.campus || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    {isEditing ? (
                      <select
                        value={editForm.year}
                        onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-600">{profile?.year || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Program</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.program}
                        onChange={(e) => setEditForm({...editForm, program: e.target.value})}
                        placeholder="e.g., Computer Science"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{profile?.program || user?.program || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">University</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.university}
                        onChange={(e) => setEditForm({...editForm, university: e.target.value})}
                        placeholder="e.g., Memorial University of Newfoundland"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{user?.university || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.studentId}
                        onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}
                        placeholder="e.g., 201234567"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600">{user?.student_id || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
