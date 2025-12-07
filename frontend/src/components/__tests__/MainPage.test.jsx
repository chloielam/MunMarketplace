import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from '../MainPage';
import { getItems } from '../../services/items';
import { authUtils } from '../../services/auth';

// Mock the services
jest.mock('../../services/items');
jest.mock('../../services/auth');

describe('MainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getItems.mockResolvedValue([
      {
        id: 1,
        title: 'Calculus Textbook - MATH 1000',
        price: '45.00',
        currency: 'CAD',
        category: 'Textbooks',
        city: 'St. John\'s',
        campus: 'St. John\'s',
        createdAt: '2024-01-01T00:00:00Z',
        imageUrls: ['https://example.com/image1.jpg'],
        status: 'ACTIVE',
        seller_id: 'seller-123'
      }
    ]);
    authUtils.getSessionUser.mockReturnValue(null);
    authUtils.refreshSession.mockResolvedValue(null);
  });
  test('renders hero section', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('The Marketplace Exclusively for Memorial University Students')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('What are you looking for?')).toBeInTheDocument();
  });

  test('renders categories', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    });
    expect(screen.getByText('Housing')).toBeInTheDocument();
    // There might be multiple "Textbooks" elements (in category list and item cards)
    expect(screen.getAllByText('Textbooks').length).toBeGreaterThan(0);
  });

  test('renders featured products', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      expect(screen.getByText('Calculus Textbook - MATH 1000')).toBeInTheDocument();
    });
    // Price might be formatted as "$45.00 CAD" or "$45 CAD"
    expect(screen.getByText(/\$45/)).toBeInTheDocument();
  });

  test('renders how it works', async () => {
    render(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });
    expect(screen.getByText('Sign Up with MUN Email')).toBeInTheDocument();
  });
});
