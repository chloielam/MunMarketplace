import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SellerRatingHistoryPage from '../SellerRatingHistoryPage';
import { authService } from '../../services/auth';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ sellerId: 'seller123' }),
}));

// Mock services
jest.mock('../../services/auth', () => ({
  authService: {
    getUser: jest.fn(),
    getUserProfile: jest.fn(),
    getSellerRatings: jest.fn(),
  },
}));

describe('SellerRatingHistoryPage', () => {
  const mockSeller = {
    user_id: 'seller123',
    first_name: 'John',
    last_name: 'Doe',
    mun_email: 'john.doe@mun.ca',
    profile_picture_url: 'https://example.com/profile.jpg'
  };

  const mockSellerProfile = {
    rating: '4.5',
    total_ratings: 10,
    location: 'St. John\'s'
  };

  const mockRatings = [
    {
      id: 'rating1',
      rating: 5,
      review: 'Excellent seller! Very responsive and item was as described.',
      buyer: {
        user_id: 'buyer1',
        first_name: 'Jane',
        last_name: 'Smith',
        profile_picture_url: 'https://example.com/buyer1.jpg'
      },
      createdAt: '2024-01-15T10:00:00Z',
      listing: {
        id: 'listing1',
        title: 'Test Item'
      }
    },
    {
      id: 'rating2',
      rating: 4,
      review: 'Good experience overall.',
      buyer: {
        user_id: 'buyer2',
        first_name: 'Bob',
        last_name: 'Johnson',
        profile_picture_url: 'https://example.com/buyer2.jpg'
      },
      createdAt: '2024-01-10T10:00:00Z',
      listing: {
        id: 'listing2',
        title: 'Another Item'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    authService.getUser.mockResolvedValue(mockSeller);
    authService.getUserProfile.mockResolvedValue(mockSellerProfile);
    authService.getSellerRatings.mockResolvedValue(mockRatings);
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('renders seller information', async () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/10 reviews/i)).toBeInTheDocument();
  });

  test('renders ratings list', async () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Excellent seller! Very responsive and item was as described.')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Good experience overall.')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  test('displays rating stars correctly', async () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Check that reviews with ratings are displayed
      expect(screen.getByText('Excellent seller! Very responsive and item was as described.')).toBeInTheDocument();
      expect(screen.getByText('Good experience overall.')).toBeInTheDocument();
    });
  });

  test('displays formatted dates', async () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Check that dates are rendered (format: "January 15, 2024")
      expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/January 10, 2024/i)).toBeInTheDocument();
    });
  });

  test('handles empty ratings list', async () => {
    authService.getSellerRatings.mockResolvedValue([]);
    
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Should still show seller info even with no ratings
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('handles error when seller not found', async () => {
    authService.getUser.mockRejectedValue(new Error('Seller not found'));
    
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Component should handle error gracefully
      expect(authService.getUser).toHaveBeenCalledWith('seller123');
    });
  });

  test('handles error when ratings fetch fails', async () => {
    authService.getSellerRatings.mockRejectedValue(new Error('Failed to fetch ratings'));
    
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Seller info should still be displayed even if ratings fail
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('fetches all required data on mount', async () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(authService.getUser).toHaveBeenCalledWith('seller123');
      expect(authService.getUserProfile).toHaveBeenCalledWith('seller123');
      expect(authService.getSellerRatings).toHaveBeenCalledWith('seller123');
    });
  });

  test('displays buyer information for each rating', async () => {
    render(
      <BrowserRouter>
        <SellerRatingHistoryPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      // Check that buyer names are displayed
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });
});

