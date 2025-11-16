import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ListingDetailPage from '../ListingDetailPage';
import { getListingById, deleteListing } from '../../services/items';
import { authService, authUtils } from '../../services/auth';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ listingId: '123' }),
}));

// Mock services
jest.mock('../../services/items', () => ({
  getListingById: jest.fn(),
  deleteListing: jest.fn(),
}));

jest.mock('../../services/auth', () => ({
  authService: {
    getUser: jest.fn(),
    getUserProfile: jest.fn(),
  },
  authUtils: {
    refreshSession: jest.fn(),
    getUserId: jest.fn(),
  },
}));


describe('ListingDetailPage', () => {
  const mockListing = {
    id: '123',
    title: 'Test Item',
    price: 100,
    currency: 'CAD',
    category: 'Electronics',
    city: "St. John's",
    campus: 'MUN-StJohns',
    description: 'Test description',
    seller_id: 'seller123',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    imageUrls: ['https://example.com/image.jpg']
  };

  const mockSeller = {
    id: 'seller123',
    first_name: 'John',
    last_name: 'Doe'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    getListingById.mockResolvedValue(mockListing);
    authService.getUser.mockResolvedValue(mockSeller);
    authService.getUserProfile.mockResolvedValue({ rating: '4.5', total_ratings: 10 });
    authUtils.refreshSession.mockResolvedValue({ id: 'user123' });
    authUtils.getUserId.mockReturnValue('user123');
  });

  test('renders listing details', async () => {
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  test('shows delete button for listing owner', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete Listing' })).toBeInTheDocument();
    });
  });

  test('does not show delete button for non-owner', async () => {
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Delete Listing' })).not.toBeInTheDocument();
    });
  });

  test('shows confirmation modal when delete is clicked', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete Listing' })).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: 'Delete Listing' });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      // Check for modal title (h3 element)
      const modalTitle = screen.getByRole('heading', { name: 'Delete Listing' });
      expect(modalTitle).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });
  });

  test('deletes listing and navigates on confirm', async () => {
    deleteListing.mockResolvedValue({});
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete Listing' })).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: 'Delete Listing' });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(deleteListing).toHaveBeenCalledWith('123');
      expect(mockNavigate).toHaveBeenCalledWith('/listing-deleted', {
        state: { listingTitle: 'Test Item' }
      });
    });
  });

  test('handles error when listing not found', async () => {
    getListingById.mockRejectedValue(new Error('Listing not found'));
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Listing not found/)).toBeInTheDocument();
    });
  });
});

