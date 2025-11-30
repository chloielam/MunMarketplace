import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PublicProfilePage from '../PublicProfilePage';
import { authService, authUtils } from '../../services/auth';
import { getItems } from '../../services/items';

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ userId: 'user123' }),
}));

// Mock services
jest.mock('../../services/auth', () => ({
  authService: {
    getUser: jest.fn(),
    getUserProfile: jest.fn(),
    getSellerRatings: jest.fn(),
  },
  authUtils: {
    refreshSession: jest.fn(),
    getUserId: jest.fn(),
  },
}));

jest.mock('../../services/items', () => ({
  getItems: jest.fn(),
  getUserListings: jest.fn(),
}));

describe('PublicProfilePage', () => {
  const mockUser = {
    user_id: 'user123',
    first_name: 'John',
    last_name: 'Doe',
    mun_email: 'john.doe@mun.ca',
    profile_picture_url: 'https://example.com/pic.jpg',
  };

  const mockProfile = {
    rating: '4.5',
    total_ratings: 10,
    location: 'St. John\'s',
  };

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

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    authUtils.refreshSession.mockResolvedValue({ id: 'current123' });
    authUtils.getUserId.mockReturnValue('current123');
    authService.getUser.mockResolvedValue(mockUser);
    authService.getUserProfile.mockResolvedValue(mockProfile);
    authService.getSellerRatings.mockResolvedValue(mockRatings);
    getItems.mockResolvedValue([]);
  });

  test('renders user profile information', async () => {
    render(
      <BrowserRouter>
        <PublicProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('St. John\'s')).toBeInTheDocument();
  });

  test('shows ratings summary by default', async () => {
    render(
      <BrowserRouter>
        <PublicProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ratings & Reviews/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Ratings & Reviews \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('View all ratings')).toBeInTheDocument();
  });

  test('expands ratings when "View all ratings" is clicked', async () => {
    render(
      <BrowserRouter>
        <PublicProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('View all ratings')).toBeInTheDocument();
    });

    const viewAllButton = screen.getByText('View all ratings');
    fireEvent.click(viewAllButton);

    await waitFor(() => {
      expect(screen.getByText('Hide ratings')).toBeInTheDocument();
      expect(screen.getByText('Great seller!')).toBeInTheDocument();
      expect(screen.getByText('Good experience')).toBeInTheDocument();
    });
  });

  test('collapses ratings when "Hide ratings" is clicked', async () => {
    render(
      <BrowserRouter>
        <PublicProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('View all ratings')).toBeInTheDocument();
    });

    // Expand
    fireEvent.click(screen.getByText('View all ratings'));

    await waitFor(() => {
      expect(screen.getByText('Hide ratings')).toBeInTheDocument();
    });

    // Collapse
    fireEvent.click(screen.getByText('Hide ratings'));

    await waitFor(() => {
      expect(screen.getByText('View all ratings')).toBeInTheDocument();
      expect(screen.queryByText('Great seller!')).not.toBeInTheDocument();
    });
  });

  test('shows empty state when no ratings exist', async () => {
    authService.getSellerRatings.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <PublicProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No ratings yet')).toBeInTheDocument();
    });
  });

  test('displays rating details when expanded', async () => {
    render(
      <BrowserRouter>
        <PublicProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('View all ratings')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View all ratings'));

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Great seller!')).toBeInTheDocument();
      expect(screen.getByText('Good experience')).toBeInTheDocument();
    });
  });
});

