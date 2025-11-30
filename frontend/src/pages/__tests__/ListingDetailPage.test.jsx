import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ListingDetailPage from '../ListingDetailPage';
import * as itemsService from '../../services/items';
import { authService, authUtils } from '../../services/auth';

const { getListingById, getMyListingById, deleteListing, updateListing } = itemsService;

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
  getMyListingById: jest.fn(),
  deleteListing: jest.fn(),
  updateListing: jest.fn(),
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
    getMyListingById.mockResolvedValue(mockListing);
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

  test('shows delete button inside edit form for listing owner', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  test('shows confirmation modal when delete is clicked from edit form', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
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
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
    
    // Get the delete button from the form (first one)
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    const deleteButton = deleteButtons[0];
    fireEvent.click(deleteButton);
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Delete Listing' })).toBeInTheDocument();
    });
    
    // Get the confirm button from the modal (should be the last Delete button)
    const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
    const confirmButton = confirmButtons[confirmButtons.length - 1];
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

  test('shows edit button for listing owner', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
  });

  test('does not show edit button for non-owner', async () => {
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Edit Listing' })).not.toBeInTheDocument();
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Listing' })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    });
  });

  test('cancels edit form when cancel button is clicked', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Edit Listing' })).not.toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  test('updates listing when form is submitted', async () => {
    const updatedListing = {
      ...mockListing,
      title: 'Updated Title',
      price: 150
    };
    
    updateListing.mockResolvedValue(updatedListing);
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    });
    
    const titleInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    const priceInput = screen.getByDisplayValue('100');
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(updateListing).toHaveBeenCalledWith('123', expect.objectContaining({
        title: 'Updated Title',
        price: 150
      }));
    });
  });

  test('shows delete button inside edit form', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  test('navigates to seller profile when seller card is clicked', async () => {
    const mockSellerWithUserId = {
      ...mockSeller,
      user_id: 'seller123'
    };
    
    authService.getUser.mockResolvedValue(mockSellerWithUserId);
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const sellerCard = screen.getByText('John Doe').closest('div[role="button"]');
    fireEvent.click(sellerCard);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/users/seller123');
    });
  });

  test('validates edit form fields', async () => {
    authUtils.refreshSession.mockResolvedValue({ id: 'seller123' });
    authUtils.getUserId.mockReturnValue('seller123');
    
    render(
      <BrowserRouter>
        <ListingDetailPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Listing' })).toBeInTheDocument();
    });
    
    const editButton = screen.getByRole('button', { name: 'Edit Listing' });
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    });
    
    // Clear required fields
    const titleInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(updateListing).not.toHaveBeenCalled();
    });
  });
});

