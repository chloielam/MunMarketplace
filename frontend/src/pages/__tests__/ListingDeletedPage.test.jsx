import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ListingDeletedPage from '../ListingDeletedPage';

// Mock useLocation and useNavigate
const mockNavigate = jest.fn();
const mockLocation = {
  state: { listingTitle: 'Test Item' },
  pathname: '/listing-deleted',
  search: '',
  hash: '',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}));

describe('ListingDeletedPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders success message with listing title', () => {
    render(
      <BrowserRouter>
        <ListingDeletedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Listing Deleted')).toBeInTheDocument();
    expect(screen.getByText('"Test Item" has been successfully deleted.')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(
      <BrowserRouter>
        <ListingDeletedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: 'Browse Listings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'My Profile' })).toBeInTheDocument();
  });

  test('navigates to listings when Browse Listings is clicked', () => {
    render(
      <BrowserRouter>
        <ListingDeletedPage />
      </BrowserRouter>
    );
    
    const browseButton = screen.getByRole('button', { name: 'Browse Listings' });
    fireEvent.click(browseButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/items');
  });

  test('navigates to profile when My Profile is clicked', () => {
    render(
      <BrowserRouter>
        <ListingDeletedPage />
      </BrowserRouter>
    );
    
    const profileButton = screen.getByRole('button', { name: 'My Profile' });
    fireEvent.click(profileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('auto-redirects after 3 seconds', async () => {
    render(
      <BrowserRouter>
        <ListingDeletedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Redirecting to listings page in 3 seconds/)).toBeInTheDocument();
    
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/items');
    });
  });

  test('handles missing listing title', () => {
    mockLocation.state = null;
    
    render(
      <BrowserRouter>
        <ListingDeletedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('"the listing" has been successfully deleted.')).toBeInTheDocument();
  });
});

