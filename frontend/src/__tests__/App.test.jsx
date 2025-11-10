import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { getItems } from '../services/items';
import { authUtils } from '../services/auth';

// Mock the services
jest.mock('../services/items');
jest.mock('../services/auth');

describe('App', () => {
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
        status: 'AVAILABLE'
      }
    ]);
    authUtils.getSessionUser.mockReturnValue(null);
    authUtils.refreshSession.mockResolvedValue(null);
  });
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders home page by default', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getAllByText('MUN').length).toBeGreaterThanOrEqual(2); // Header and Footer
    });
    expect(screen.getByText('The Marketplace Exclusively for Memorial University Students')).toBeInTheDocument();
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
  });

  test('renders navigation on home page', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(2); // Header and Footer
    });
    expect(screen.getAllByText('Browse').length).toBeGreaterThanOrEqual(2); // Header and Footer
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1); // Header and possibly other components
  });

  test('renders search on home page', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('What are you looking for?')).toBeInTheDocument();
    });
  });
});