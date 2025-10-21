import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

describe('LoginPage', () => {
  test('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your Memorial University student marketplace account.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('clears MUN email validation error for valid email', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
    
    expect(screen.queryByText('Please use your MUN email address (@mun.ca)')).not.toBeInTheDocument();
  });

  test('shows password required error', () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  test('has navigation buttons', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    expect(screen.getByText('SIGN UP')).toBeInTheDocument();
  });
});
