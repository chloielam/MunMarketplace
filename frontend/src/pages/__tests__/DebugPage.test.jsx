import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DebugPage from '../DebugPage';
import { authService, authUtils } from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

const mockUser = {
  id: 1,
  email: 'test@mun.ca',
  fullName: 'Test User'
};

describe('DebugPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authUtils.getSessionUser.mockReturnValue(mockUser);
    authUtils.isAuthenticated.mockReturnValue(true);
    authUtils.getUserId.mockReturnValue(1);
    authUtils.refreshSession.mockResolvedValue(mockUser);
    authService.getSession.mockResolvedValue({ user: mockUser });
  });

  test('renders debug information', () => {
    render(<DebugPage />);
    
    expect(screen.getByText('Session Debug')).toBeInTheDocument();
    expect(screen.getByText(/Is authenticated:/)).toBeInTheDocument();
    expect(screen.getByText(/User ID:/)).toBeInTheDocument();
  });

  test('displays authentication status', () => {
    render(<DebugPage />);
    
    expect(screen.getByText(/Is authenticated:/)).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  test('displays user ID', () => {
    render(<DebugPage />);
    
    expect(screen.getByText(/User ID:/)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('displays stored session payload', () => {
    render(<DebugPage />);
    
    expect(screen.getByText(/Stored session payload:/)).toBeInTheDocument();
    expect(screen.getByText(/"email"/)).toBeInTheDocument();
  });

  test('shows "No" when not authenticated', () => {
    authUtils.isAuthenticated.mockReturnValue(false);
    authUtils.getSessionUser.mockReturnValue(null);
    authUtils.getUserId.mockReturnValue(null);
    
    render(<DebugPage />);
    
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('refreshes session when button is clicked', async () => {
    render(<DebugPage />);
    
    const refreshButton = screen.getByText('Refresh Session');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(authService.getSession).toHaveBeenCalled();
    });
  });

  test('displays error message if refresh fails', async () => {
    authService.getSession.mockRejectedValue(new Error('Session error'));
    
    render(<DebugPage />);
    
    const refreshButton = screen.getByText('Refresh Session');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Session error/)).toBeInTheDocument();
    });
  });
});

