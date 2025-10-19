import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

// Helper function to render with Router
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByText('Join MUN Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Register with your Memorial University email to access the student marketplace')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REGISTER' })).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    renderWithRouter(<RegisterPage />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('shows password mismatch error', () => {
    renderWithRouter(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  test('clears password mismatch error when passwords match', () => {
    renderWithRouter(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  test('shows required field errors on submit', () => {
    renderWithRouter(<RegisterPage />);
    
    const submitButton = screen.getByRole('button', { name: 'REGISTER' });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  });

  test('has sign in button', () => {
    renderWithRouter(<RegisterPage />);
    
    const signInButton = screen.getByRole('button', { name: 'SIGN IN' });
    expect(signInButton).toBeInTheDocument();
  });

  test('has back to home button', () => {
    renderWithRouter(<RegisterPage />);
    
    const backButton = screen.getByText('← Back to Home');
    expect(backButton).toBeInTheDocument();
  });
});
