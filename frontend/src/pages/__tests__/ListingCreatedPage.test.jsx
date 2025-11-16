import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ListingCreatedPage from '../ListingCreatedPage';

// Mock useLocation and useNavigate
const mockNavigate = jest.fn();
const mockLocation = {
  state: { listingTitle: 'Test Item', listingId: '123' },
  pathname: '/listing-created',
  search: '',
  hash: '',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}));

describe('ListingCreatedPage', () => {
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
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Listing Created!')).toBeInTheDocument();
    expect(screen.getByText('"Test Item" has been successfully created and is now live on the marketplace.')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(
      <BrowserRouter>
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: 'View Listing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse Listings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'My Profile' })).toBeInTheDocument();
  });

  test('navigates to listing detail when View Listing is clicked', () => {
    render(
      <BrowserRouter>
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    const viewButton = screen.getByRole('button', { name: 'View Listing' });
    fireEvent.click(viewButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/listings/123');
  });

  test('navigates to listings when Browse Listings is clicked', () => {
    render(
      <BrowserRouter>
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    const browseButton = screen.getByRole('button', { name: 'Browse Listings' });
    fireEvent.click(browseButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/items');
  });

  test('navigates to profile when My Profile is clicked', () => {
    render(
      <BrowserRouter>
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    const profileButton = screen.getByRole('button', { name: 'My Profile' });
    fireEvent.click(profileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('auto-redirects after 5 seconds', async () => {
    render(
      <BrowserRouter>
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Redirecting to listings page in 5 seconds/)).toBeInTheDocument();
    
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/items');
    });
  });

  test('does not show View Listing button when listingId is missing', () => {
    mockLocation.state = { listingTitle: 'Test Item' };
    
    render(
      <BrowserRouter>
        <ListingCreatedPage />
      </BrowserRouter>
    );
    
    expect(screen.queryByRole('button', { name: 'View Listing' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse Listings' })).toBeInTheDocument();
  });
});

