import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CreateListingPage from '../CreateListingPage';
import { createListing } from '../../services/items';
import { authUtils } from '../../services/auth';
import { mockNavigate } from '../../__mocks__/react-router-dom';

// Mock services
jest.mock('../../services/items', () => ({
  createListing: jest.fn(),
}));

jest.mock('../../services/auth', () => ({
  authUtils: {
    refreshSession: jest.fn(),
    getUserId: jest.fn(),
  },
}));

describe('CreateListingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    authUtils.refreshSession.mockResolvedValue({ id: 'user123' });
    authUtils.getUserId.mockReturnValue('user123');
  });

  test('renders create listing form', async () => {
    render(
      <BrowserRouter>
        <CreateListingPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Create New Listing')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('e.g., MacBook Pro 2020')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your item in detail...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Listing' })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(
      <BrowserRouter>
        <CreateListingPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Listing' })).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: 'Create Listing' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createListing).not.toHaveBeenCalled();
    });
  });

  test('submits form with valid data', async () => {
    const mockListing = { id: '123', title: 'Test Item' };
    createListing.mockResolvedValue(mockListing);
    
    render(
      <BrowserRouter>
        <CreateListingPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., MacBook Pro 2020')).toBeInTheDocument();
    });
    
    // Fill in form - using getByRole and getByLabelText for better reliability
    const titleInput = screen.getByPlaceholderText('e.g., MacBook Pro 2020');
    fireEvent.change(titleInput, { target: { value: 'Test Item' } });
    
    // Find price input by its name attribute
    const priceInput = document.querySelector('input[name="price"]');
    if (priceInput) {
      fireEvent.change(priceInput, { target: { value: '100' } });
    }
    
    // Find category select by its name attribute
    const categorySelect = document.querySelector('select[name="category"]');
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    }
    
    const cityInput = screen.getByPlaceholderText("e.g., St. John's");
    fireEvent.change(cityInput, { target: { value: "St. John's" } });
    
    const campusInput = screen.getByPlaceholderText('e.g., MUN-StJohns');
    fireEvent.change(campusInput, { target: { value: 'MUN-StJohns' } });
    
    const submitButton = screen.getByRole('button', { name: 'Create Listing' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createListing).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/listing-created', {
        state: {
          listingTitle: 'Test Item',
          listingId: '123'
        }
      });
    });
  });

  test('redirects to login if not authenticated', async () => {
    authUtils.refreshSession.mockResolvedValue(null);
    authUtils.getUserId.mockReturnValue(null);
    
    render(
      <BrowserRouter>
        <CreateListingPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

