import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Helper function to render with Router
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Header', () => {
  test('renders logo and navigation', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('MUN')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  test('renders search and sign in', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('search works', () => {
    renderWithRouter(<Header />);
    
    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'textbook' } });
    
    expect(searchInput.value).toBe('textbook');
  });

  test('logo links to home page', () => {
    renderWithRouter(<Header />);
    
    const logoLink = screen.getByText('MUN').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('sign in button links to login page', () => {
    renderWithRouter(<Header />);
    
    const signInLink = screen.getByText('Sign In');
    expect(signInLink).toHaveAttribute('href', '/login');
  });
});
