import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { authUtils } from '../../services/auth';
import { mockNavigate } from '../../__mocks__/react-router-dom';

// Mock auth services
jest.mock('../../services/auth', () => ({
  authService: {
    logout: jest.fn(),
  },
  authUtils: {
    refreshSession: jest.fn(),
    getSessionUser: jest.fn(),
    isAuthenticated: jest.fn(),
    clearSession: jest.fn(),
  },
}));

// Helper function to render with Router
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    authUtils.getSessionUser.mockReturnValue(null);
    authUtils.refreshSession.mockResolvedValue(null);
    authUtils.isAuthenticated.mockReturnValue(false);
  });

  test('renders logo and navigation', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('MUN')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  test('renders sign in button when not authenticated', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('renders profile and logout when authenticated', async () => {
    authUtils.getSessionUser.mockReturnValue({ id: '123', first_name: 'John' });
    authUtils.refreshSession.mockResolvedValue({ id: '123', first_name: 'John' });
    authUtils.isAuthenticated.mockReturnValue(true);
    
    renderWithRouter(<Header />);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  test('logo links to home page', () => {
    renderWithRouter(<Header />);
    
    const logoLink = screen.getByText('MUN').closest('a');
    expect(logoLink).toHaveAttribute('href', '/home');
  });

  test('Chat button navigates to login when not authenticated', () => {
    renderWithRouter(<Header />);
    
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('Chat button navigates to chat when authenticated', async () => {
    authUtils.getSessionUser.mockReturnValue({ id: '123' });
    authUtils.refreshSession.mockResolvedValue({ id: '123' });
    authUtils.isAuthenticated.mockReturnValue(true);
    
    renderWithRouter(<Header />);
    
    await waitFor(() => {
      const chatButton = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });
});
