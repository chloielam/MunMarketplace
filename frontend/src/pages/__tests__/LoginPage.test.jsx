import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../LoginPage';

// Mock the navigation functions
const mockProps = {
  onBackToHome: jest.fn(),
  onGoToRegister: jest.fn()
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<LoginPage {...mockProps} />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your Memorial University student marketplace account.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    render(<LoginPage {...mockProps} />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('clears MUN email validation error for valid email', () => {
    render(<LoginPage {...mockProps} />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
    
    expect(screen.queryByText('Please use your MUN email address (@mun.ca)')).not.toBeInTheDocument();
  });

  test('shows password required error', () => {
    render(<LoginPage {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  test('navigates to register page', () => {
    render(<LoginPage {...mockProps} />);
    
    const signUpButton = screen.getByRole('button', { name: 'SIGN UP' });
    fireEvent.click(signUpButton);
    
    expect(mockProps.onGoToRegister).toHaveBeenCalledTimes(1);
  });

  test('navigates back to home', () => {
    render(<LoginPage {...mockProps} />);
    
    const backButton = screen.getByText('← Back to Home');
    fireEvent.click(backButton);
    
    expect(mockProps.onBackToHome).toHaveBeenCalledTimes(1);
  });
});
