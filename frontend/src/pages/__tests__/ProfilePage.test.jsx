import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';
import { authService, authUtils } from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUser = {
  id: 1,
  email: 'test@mun.ca',
  fullName: 'Test User',
  first_name: 'Test',
  university: 'Memorial University of Newfoundland',
  student_id: '201234567'
};

const mockProfile = {
  bio: 'Test bio',
  phone: '709-555-1234',
  campus: 'St. John\'s',
  year: '3rd Year',
  program: 'Computer Science'
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authUtils.refreshSession.mockResolvedValue(mockUser);
    authUtils.getUserId.mockReturnValue(1);
    authService.getUser.mockResolvedValue(mockUser);
    authService.getUserProfile.mockResolvedValue(mockProfile);
  });

  test('renders loading state initially', () => {
    authService.getUser.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  test('renders profile data after loading', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    expect(screen.getByText('test@mun.ca')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
    expect(screen.getByText('709-555-1234')).toBeInTheDocument();
    expect(screen.getByText('St. John\'s')).toBeInTheDocument();
  });

  test('renders error message on fetch failure', async () => {
    authService.getUser.mockRejectedValue(new Error('Failed to load'));
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });

  test('redirects to login when not authenticated', async () => {
    authUtils.refreshSession.mockResolvedValue(null);
    authUtils.getUserId.mockReturnValue(null);
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('enters edit mode when Edit Profile is clicked', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('cancels edit mode', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  test('updates profile when Save is clicked', async () => {
    authService.updateUser.mockResolvedValue(mockUser);
    authService.updateUserProfile.mockResolvedValue(mockProfile);
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    const bioTextarea = screen.getByPlaceholderText('Tell us about yourself...');
    fireEvent.change(bioTextarea, { target: { value: 'Updated bio' } });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(authService.updateUser).toHaveBeenCalled();
      expect(authService.updateUserProfile).toHaveBeenCalled();
    });
  });

  test('handles logout', async () => {
    authService.logout.mockResolvedValue();
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  test('navigates back to home', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    });
    
    const backButton = screen.getByText('← Back to Home');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});

