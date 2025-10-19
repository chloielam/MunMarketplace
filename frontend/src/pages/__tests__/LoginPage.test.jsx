import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Helper function to render with Router
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your Memorial University student marketplace account.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('clears MUN email validation error for valid email', () => {
    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
    
    expect(screen.queryByText('Please use your MUN email address (@mun.ca)')).not.toBeInTheDocument();
  });

  test('shows password required error', () => {
    renderWithRouter(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  test('has sign up button', () => {
    renderWithRouter(<LoginPage />);
    
    const signUpButton = screen.getByRole('button', { name: 'SIGN UP' });
    expect(signUpButton).toBeInTheDocument();
  });

  test('has back to home button', () => {
    renderWithRouter(<LoginPage />);
    
    const backButton = screen.getByText('← Back to Home');
    expect(backButton).toBeInTheDocument();
  });
});
