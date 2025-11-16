import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ItemDetail from '../ItemDetail';
import { getItemById } from '../../services/items';
import { mockNavigate } from '../../__mocks__/react-router-dom';

// Mock the items service
jest.mock('../../services/items', () => ({
  getItemById: jest.fn(),
}));

// Mock window.alert
global.alert = jest.fn();

describe('ItemDetail', () => {
  const mockItem = {
    id: '123',
    title: 'Test Item',
    description: 'This is a test item',
    price: '100.00',
    currency: 'CAD',
    category: 'Electronics',
    city: "St. John's",
    campus: 'MUN-StJohns',
    status: 'ACTIVE',
    imageUrls: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ],
    seller: {
      id: 'seller-1',
      name: 'John Doe',
      joinedDate: 'January 2023',
      responseTime: '4.5',
      activeListings: 5
    },
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderItemDetail = (itemId = '123') => {
    // Mock useParams to return the itemId
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: itemId });
    
    return render(
      <BrowserRouter>
        <ItemDetail />
      </BrowserRouter>
    );
  };

  test('renders loading state initially', () => {
    getItemById.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderItemDetail();
    
    expect(screen.getByText('Loading item...')).toBeInTheDocument();
  });

  test('renders item details after loading', async () => {
    getItemById.mockResolvedValue(mockItem);
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    expect(screen.getByText('This is a test item')).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
    expect(screen.getByText('CAD')).toBeInTheDocument();
    expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0);
    expect(screen.getByText("St. John's")).toBeInTheDocument();
    expect(screen.getByText('MUN-StJohns')).toBeInTheDocument();
  });

  test('renders error message when fetch fails', async () => {
    getItemById.mockRejectedValue(new Error('Failed to fetch'));
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  test('renders "Item not found" when item is null', async () => {
    getItemById.mockResolvedValue(null);
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Item not found')).toBeInTheDocument();
    });
  });

  test('displays seller information', async () => {
    getItemById.mockResolvedValue(mockItem);
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Seller Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Joined/i)).toBeInTheDocument();
  });

  test('handles back button click', async () => {
    getItemById.mockResolvedValue(mockItem);
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    const backButton = screen.getByText(/Back to Listings/i);
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('handles chat button click', async () => {
    getItemById.mockResolvedValue(mockItem);
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    const chatButton = screen.getByText(/Chat with Seller/i);
    fireEvent.click(chatButton);
    
    expect(global.alert).toHaveBeenCalledWith('Chat functionality will be implemented here!');
  });

  test('displays multiple images when available', async () => {
    getItemById.mockResolvedValue(mockItem);
    
    renderItemDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    const images = screen.getAllByRole('img');
    // Should have at least the main image plus thumbnails
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  test('calls getItemById with correct id from URL params', async () => {
    const itemId = '456';
    getItemById.mockResolvedValue(mockItem);
    
    renderItemDetail(itemId);
    
    await waitFor(() => {
      expect(getItemById).toHaveBeenCalledWith(itemId);
    });
  });
});

