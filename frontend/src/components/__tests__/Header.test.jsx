import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

describe('Header', () => {
  test('renders logo and navigation', () => {
    render(<Header />);
    
    expect(screen.getByText('MUN')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  test('renders search and sign in', () => {
    render(<Header />);
    
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('search works', () => {
    render(<Header />);
    
    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'textbook' } });
    
    expect(searchInput.value).toBe('textbook');
  });
});
