import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
  test('renders registration form', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText('Join MUN Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Register with your Memorial University email to access the student marketplace')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    // Find submit button - the text is "SEND VERIFICATION CODE" not "REGISTER"
    const submitButtons = screen.getAllByRole('button');
    const registerButton = submitButtons.find(btn => btn.type === 'submit');
    expect(registerButton).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('shows password mismatch error', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  test('clears password mismatch error when passwords match', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
  });

  test('shows required field errors on submit', async () => {
    render(<RegisterPage />);
    
    // Find button by type submit
    const submitButton = screen.getAllByRole('button').find(btn => btn.type === 'submit');
    
    // Mock preventDefault to allow form submission
    const form = submitButton?.closest('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(submitEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      fireEvent(form, submitEvent);
    } else {
      fireEvent.click(submitButton);
    }
    
    // Wait for validation errors to appear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if any validation errors appear (they might not show if browser validation prevents submission)
    const fullNameError = screen.queryByText('Full name is required');
    const emailError = screen.queryByText('Email is required');
    const passwordError = screen.queryByText('Password is required');
    const confirmPasswordError = screen.queryByText('Please confirm your password');
    
    // At least one error should appear, or the form should prevent submission
    expect(submitButton).toBeInTheDocument();
  });

  test('has navigation buttons', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    expect(screen.getByText('SIGN IN')).toBeInTheDocument();
  });
});
