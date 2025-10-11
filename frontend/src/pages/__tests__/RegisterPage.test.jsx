import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../RegisterPage';

// Mock the navigation functions
const mockProps = {
  onBackToHome: jest.fn(),
  onGoToLogin: jest.fn()
};

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    render(<RegisterPage {...mockProps} />);
    
    expect(screen.getByText('Join MUN Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Register with your Memorial University email to access the student marketplace')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REGISTER' })).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    render(<RegisterPage {...mockProps} />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('shows password mismatch error', () => {
    render(<RegisterPage {...mockProps} />);
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  test('clears password mismatch error when passwords match', () => {
    render(<RegisterPage {...mockProps} />);
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  test('shows required field errors on submit', () => {
    render(<RegisterPage {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'REGISTER' });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  });

  test('navigates to login page', () => {
    render(<RegisterPage {...mockProps} />);
    
    const signInButton = screen.getByRole('button', { name: 'SIGN IN' });
    fireEvent.click(signInButton);
    
    expect(mockProps.onGoToLogin).toHaveBeenCalledTimes(1);
  });

  test('navigates back to home', () => {
    render(<RegisterPage {...mockProps} />);
    
    const backButton = screen.getByText('← Back to Home');
    fireEvent.click(backButton);
    
    expect(mockProps.onBackToHome).toHaveBeenCalledTimes(1);
  });
});
