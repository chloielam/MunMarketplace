import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import TestProfilePage from '../TestProfilePage';
import { authUtils } from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUser = {
  id: 1,
  email: 'test@mun.ca',
  fullName: 'Test User'
};

describe('TestProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authUtils.getSessionUser.mockReturnValue(mockUser);
    authUtils.isAuthenticated.mockReturnValue(true);
    authUtils.getUserId.mockReturnValue(1);
  });

  test('renders test profile page', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Profile Page')).toBeInTheDocument();
    expect(screen.getByText('Authentication Status')).toBeInTheDocument();
  });

  test('displays authentication status', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Is authenticated:/)).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  test('displays user ID', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/User ID:/)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('displays stored session information', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Stored session:/)).toBeInTheDocument();
    expect(screen.getByText('Present')).toBeInTheDocument();
  });

  test('shows "None" when no session', () => {
    authUtils.getSessionUser.mockReturnValue(null);
    authUtils.isAuthenticated.mockReturnValue(false);
    authUtils.getUserId.mockReturnValue(null);
    
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('No')).toBeInTheDocument();
    // There might be multiple "None" elements, so use getAllByText
    expect(screen.getAllByText('None').length).toBeGreaterThan(0);
  });

  test('displays stored session user data', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Stored Session User:')).toBeInTheDocument();
    expect(screen.getByText(/"email"/)).toBeInTheDocument();
  });

  test('navigates to items page', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    const itemsButton = screen.getByText('Go to Items');
    fireEvent.click(itemsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/items');
  });

  test('navigates to home page', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    const homeButton = screen.getByText('Go to Home');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('navigates back to home from back button', () => {
    render(
      <BrowserRouter>
        <TestProfilePage />
      </BrowserRouter>
    );
    
    const backButton = screen.getByText('← Back to Home');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});

