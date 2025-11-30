import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';
import { authService, authUtils } from '../../services/auth';
import { getUserListings } from '../../services/items';

// Mock window.alert
global.alert = jest.fn();

// Mock dependencies
jest.mock('../../services/auth');
jest.mock('../../services/items');
jest.mock('../../components/ProfilePicture', () => {
  return function MockProfilePicture({ src, editable, onUpload, onRemove }) {
    const mockFile = { name: 'test.jpg', type: 'image/jpeg', size: 0 };
    return (
      <div data-testid="profile-picture">
        {src && <img src={src} alt="Profile" />}
        {editable && (
          <>
            <button onClick={() => onUpload && onUpload(mockFile)}>
              Upload
            </button>
            <button onClick={onRemove}>Remove</button>
          </>
        )}
      </div>
    );
  };
});
jest.mock('../../components/StarRating', () => {
  return function MockStarRating({ rating, totalRatings }) {
    return (
      <div data-testid="star-rating">
        Rating: {rating} ({totalRatings} reviews)
      </div>
    );
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ProfilePage', () => {
  const mockUser = {
    user_id: '123',
    first_name: 'John',
    last_name: 'Doe',
    mun_email: 'john.doe@mun.ca',
    phone_number: '(709) 555-1234',
    profile_picture_url: 'https://example.com/profile.jpg',
    is_email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z',
  };

  const mockProfile = {
    profile_id: '456',
    user_id: '123',
    bio: 'Test bio',
    rating: '4.5',
    total_ratings: 10,
    location: 'St. John\'s, NL',
    study_program: 'Computer Science',
    department: 'Faculty of Science',
    updated_at: '2024-01-10T00:00:00Z',
  };

  const mockListings = [
    {
      id: '1',
      title: 'Test Item 1',
      price: '50.00',
      status: 'ACTIVE',
      imageUrls: ['https://example.com/image1.jpg'],
    },
    {
      id: '2',
      title: 'Test Item 2',
      price: '75.00',
      status: 'ACTIVE',
      imageUrls: ['https://example.com/image2.jpg'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Default mocks
    authUtils.refreshSession.mockResolvedValue({ id: '123' });
    authUtils.getUserId.mockReturnValue('123');
    authService.getUser.mockResolvedValue(mockUser);
    authService.getUserProfile.mockResolvedValue(mockProfile);
    authService.getSellerRatings.mockResolvedValue([]);
    getUserListings.mockResolvedValue(mockListings);
  });

  const renderProfilePage = () => {
    return render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
  };

  describe('Loading and Initial Render', () => {
    test('shows loading state initially', () => {
      authService.getUser.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderProfilePage();
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    test('redirects to login if no user ID', async () => {
      authUtils.refreshSession.mockResolvedValue(null);
      authUtils.getUserId.mockReturnValue(null);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    test('displays user information after loading', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Email appears in multiple places, so use getAllByText
      expect(screen.getAllByText('john.doe@mun.ca').length).toBeGreaterThan(0);
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    test('displays profile information', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Test bio')).toBeInTheDocument();
      });
      
      expect(screen.getByText('St. John\'s, NL')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Faculty of Science')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    test('displays correct statistics for seller', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getAllByText('My Listings').length).toBeGreaterThan(0);
      });
      
      // Check for the stats numbers - they appear multiple times, so check they exist
      const statsNumbers = screen.getAllByText('2');
      expect(statsNumbers.length).toBeGreaterThan(0);
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Saved Items')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
    });

    test('displays correct statistics for buyer (no listings)', async () => {
      getUserListings.mockResolvedValue([]);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Items Sold')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Saved Items')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
    });

    test('displays rating correctly', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        // Rating appears multiple times, so use getAllByText
        const ratings = screen.getAllByText('4.5');
        expect(ratings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edit Mode', () => {
    test('enters edit mode when Edit Profile is clicked', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('shows input fields in edit mode', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      });
      
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument();
    });

    test('populates form fields with current data', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        const firstNameInput = screen.getByDisplayValue('John');
        expect(firstNameInput).toBeInTheDocument();
      });
      
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    });

    test('cancels edit mode and resets form', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        const firstNameInput = screen.getByDisplayValue('John');
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      });
      
      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    test('saves profile changes successfully', async () => {
      const updatedUser = { ...mockUser, first_name: 'Jane' };
      const updatedProfile = { ...mockProfile, bio: 'Updated bio' };
      
      authService.updateUser.mockResolvedValue(updatedUser);
      authService.updateUserProfile.mockResolvedValue(updatedProfile);
      authService.getUser.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(updatedUser);
      authService.getUserProfile.mockResolvedValueOnce(mockProfile).mockResolvedValueOnce(updatedProfile);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      });
      
      const firstNameInput = screen.getByPlaceholderText('First Name');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      
      const bioTextarea = screen.getByPlaceholderText('Tell us about yourself...');
      fireEvent.change(bioTextarea, { target: { value: 'Updated bio' } });
      
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(authService.updateUser).toHaveBeenCalled();
        expect(authService.updateUserProfile).toHaveBeenCalled();
      });
      
      // Check that alert was called with success message
      expect(global.alert).toHaveBeenCalledWith('Profile updated successfully!');
    });

    test('handles save errors gracefully', async () => {
      const error = { response: { data: { message: 'Update failed' } } };
      authService.updateUser.mockRejectedValue(error);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Save'));
      });
      
      await waitFor(() => {
        expect(authService.updateUser).toHaveBeenCalled();
      });
    });
  });

  describe('My Listings Section', () => {
    test('displays items for sale when user has listings', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
      // Price appears as separate text nodes ($ and amount), so check for parts
      expect(screen.getByText(/50\.00/)).toBeInTheDocument();
      expect(screen.getByText(/75\.00/)).toBeInTheDocument();
    });

    test('shows empty state when user has no listings', async () => {
      getUserListings.mockResolvedValue([]);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('No listings yet')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Start selling to see your listings here')).toBeInTheDocument();
      expect(screen.getByText('Create Listing')).toBeInTheDocument();
    });
  });

  describe('My Listings - Create Listing Button', () => {
    test('shows Create Listing button when user has listings', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        const listingsTexts = screen.getAllByText('My Listings');
        expect(listingsTexts.length).toBeGreaterThan(0);
      });
      
      // Create Listing button should be visible
      const createButtons = screen.getAllByText('Create Listing');
      expect(createButtons.length).toBeGreaterThan(0);
    });

    test('shows Create Listing button in empty state when user has no listings', async () => {
      getUserListings.mockResolvedValue([]);
      
      renderProfilePage();
      
      await waitFor(() => {
        const createButtons = screen.getAllByText('Create Listing');
        expect(createButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Account Information', () => {
    test('displays account information', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Member Since')).toBeInTheDocument();
      expect(screen.getByText('Last Login')).toBeInTheDocument();
      expect(screen.getByText('Email Verification')).toBeInTheDocument();
    });

    test('displays email verification status', async () => {
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('✓ Verified')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    // Note: Back button has been removed from ProfilePage (navigation is now in Header)
    test.skip('navigates back to home when back button is clicked', async () => {
      // Back button has been moved to Header component
    });

    // Note: Logout functionality is now in the Header component, not ProfilePage
    // This test is skipped as logout is no longer part of ProfilePage
    test.skip('handles logout', async () => {
      // Logout button has been moved to Header component
    });
  });

  describe('Error Handling', () => {
    test('displays error message when user fetch fails', async () => {
      const error = { response: { data: { message: 'Failed to load user' } } };
      authService.getUser.mockRejectedValue(error);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load user')).toBeInTheDocument();
      });
    });

    test('handles missing profile gracefully', async () => {
      authService.getUserProfile.mockRejectedValue({ message: 'Profile not found' });
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Should still render even without profile
      expect(screen.getByText('No bio available')).toBeInTheDocument();
    });
  });

  describe('Change Password', () => {
    const waitForPageLoad = async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    };

    const getChangePasswordButton = () => {
      const buttons = screen.getAllByText('Change Password');
      // Return the button (not the heading)
      return buttons.find(btn => btn.tagName === 'BUTTON') || buttons[buttons.length - 1];
    };

    test('shows change password form when button is clicked', async () => {
      renderProfilePage();
      
      await waitForPageLoad();
      
      await waitFor(() => {
        const buttons = screen.getAllByText('Change Password');
        expect(buttons.length).toBeGreaterThan(0);
      });
      
      const changePasswordButton = getChangePasswordButton();
      fireEvent.click(changePasswordButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter new password (min 6 characters)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
      });
    });

    test('validates that new passwords match', async () => {
      renderProfilePage();
      
      await waitForPageLoad();
      
      await waitFor(() => {
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
      });
      
      fireEvent.click(getChangePasswordButton());
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), {
        target: { value: 'oldPassword123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter new password (min 6 characters)'), {
        target: { value: 'newPassword123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
        target: { value: 'differentPassword' }
      });
      
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('New passwords do not match');
      });
      
      expect(authService.changePassword).not.toHaveBeenCalled();
    });

    test('validates minimum password length', async () => {
      renderProfilePage();
      
      await waitForPageLoad();
      
      await waitFor(() => {
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
      });
      
      fireEvent.click(getChangePasswordButton());
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), {
        target: { value: 'oldPassword123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter new password (min 6 characters)'), {
        target: { value: '12345' }
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
        target: { value: '12345' }
      });
      
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('New password must be at least 6 characters long');
      });
      
      expect(authService.changePassword).not.toHaveBeenCalled();
    });

    test('successfully changes password when validation passes', async () => {
      authService.changePassword.mockResolvedValue({ message: 'Password changed successfully' });
      
      renderProfilePage();
      
      await waitForPageLoad();
      
      await waitFor(() => {
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
      });
      
      fireEvent.click(getChangePasswordButton());
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), {
        target: { value: 'oldPassword123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter new password (min 6 characters)'), {
        target: { value: 'newPassword123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
        target: { value: 'newPassword123' }
      });
      
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(authService.changePassword).toHaveBeenCalledWith('oldPassword123', 'newPassword123');
        expect(global.alert).toHaveBeenCalledWith('Password changed successfully!');
      });
    });

    test('handles password change errors', async () => {
      const error = { response: { data: { message: 'Current password is incorrect' } } };
      authService.changePassword.mockRejectedValue(error);
      
      renderProfilePage();
      
      await waitForPageLoad();
      
      await waitFor(() => {
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
      });
      
      fireEvent.click(getChangePasswordButton());
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter current password'), {
        target: { value: 'wrongPassword' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter new password (min 6 characters)'), {
        target: { value: 'newPassword123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
        target: { value: 'newPassword123' }
      });
      
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Current password is incorrect');
      });
    });

    test('can cancel change password form', async () => {
      renderProfilePage();
      
      await waitForPageLoad();
      
      await waitFor(() => {
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
      });
      
      fireEvent.click(getChangePasswordButton());
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter current password')).not.toBeInTheDocument();
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Ratings Given by Buyers', () => {
    const mockRatings = [
      {
        id: 'rating1',
        rating: 5,
        review: 'Great seller!',
        createdAt: '2024-01-15T10:00:00Z',
        buyer: {
          first_name: 'Jane',
          last_name: 'Smith',
          profile_picture_url: 'https://example.com/jane.jpg',
        },
      },
      {
        id: 'rating2',
        rating: 4,
        review: 'Good experience',
        createdAt: '2024-01-10T10:00:00Z',
        buyer: {
          first_name: 'Bob',
          last_name: 'Johnson',
        },
      },
    ];

    test('shows ratings section when seller has ratings', async () => {
      // mockProfile already has total_ratings: 10, so it should show
      renderProfilePage();
      
      // Wait for profile to load first
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Then wait for ratings section to appear
      await waitFor(() => {
        expect(screen.getByText(/Ratings Given by Buyers/)).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText('Average Rating')).toBeInTheDocument();
      expect(screen.getByText('View all ratings')).toBeInTheDocument();
    });

    test('does not show ratings section when seller has no ratings', async () => {
      const profileNoRatings = { ...mockProfile, total_ratings: 0, rating: '0' };
      authService.getUserProfile.mockResolvedValue(profileNoRatings);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Ratings Given by Buyers')).not.toBeInTheDocument();
    });

    test('loads and displays ratings when View all ratings is clicked', async () => {
      authService.getSellerRatings.mockResolvedValue(mockRatings);
      
      renderProfilePage();
      
      // Wait for profile and ratings section to load
      await waitFor(() => {
        expect(screen.getByText('View all ratings')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const viewAllButton = screen.getByText('View all ratings');
      fireEvent.click(viewAllButton);
      
      await waitFor(() => {
        expect(authService.getSellerRatings).toHaveBeenCalled();
      });
      
      // Wait for ratings to load and display
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Great seller!')).toBeInTheDocument();
      expect(screen.getByText('Good experience')).toBeInTheDocument();
    });

    test('hides ratings when Hide ratings is clicked', async () => {
      authService.getSellerRatings.mockResolvedValue(mockRatings);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('View all ratings')).toBeInTheDocument();
      });
      
      // Expand
      fireEvent.click(screen.getByText('View all ratings'));
      
      await waitFor(() => {
        expect(screen.getByText('Hide ratings')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Collapse
      fireEvent.click(screen.getByText('Hide ratings'));
      
      await waitFor(() => {
        expect(screen.getByText('View all ratings')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    test('shows loading state when fetching ratings', async () => {
      authService.getSellerRatings.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('View all ratings')).toBeInTheDocument();
      });
      
      const viewAllButton = screen.getByText('View all ratings');
      fireEvent.click(viewAllButton);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    test('handles error when fetching ratings fails', async () => {
      const error = { response: { data: { message: 'Failed to load ratings' } } };
      authService.getSellerRatings.mockRejectedValue(error);
      
      renderProfilePage();
      
      await waitFor(() => {
        expect(screen.getByText('View all ratings')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('View all ratings'));
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to load ratings');
      });
    });
  });
});
