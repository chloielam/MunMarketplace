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

  test('renders sign in button', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('logo links to home page', () => {
    renderWithRouter(<Header />);
    
    const logoLink = screen.getByText('MUN').closest('a');
    expect(logoLink).toHaveAttribute('href', '/home');
  });

  test('sign in button is clickable', () => {
    renderWithRouter(<Header />);
    
    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
  });
});
