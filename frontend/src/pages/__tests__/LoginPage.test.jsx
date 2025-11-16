import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { authService } from '../../services/auth';
import { mockNavigate } from '../../__mocks__/react-router-dom';

// Mock authService
jest.mock('../../services/auth', () => ({
  authService: {
    login: jest.fn(),
    forgotPassword: jest.fn(),
    verifyPasswordResetOtp: jest.fn(),
    resetPassword: jest.fn(),
  },
  authUtils: {
    setSessionUser: jest.fn(),
    refreshSession: jest.fn(),
  },
}));

// Mock window.dispatchEvent
global.window.dispatchEvent = jest.fn();

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your Memorial University student marketplace account.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.name@mun.ca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows MUN email validation error', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    
    expect(screen.getByText('Please use your MUN email address (@mun.ca)')).toBeInTheDocument();
  });

  test('clears MUN email validation error for valid email', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
    fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
    
    expect(screen.queryByText('Please use your MUN email address (@mun.ca)')).not.toBeInTheDocument();
  });

  test('shows password required error', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  test('has navigation buttons', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    expect(screen.getByText('SIGN UP')).toBeInTheDocument();
  });

  describe('Forgot Password Flow', () => {
    test('clicking "Click here" shows email input step', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText(/Enter your MUN email address/)).toBeInTheDocument();
    });

    test('email step validates MUN email', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Click "Click here" to start forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      // Try to submit with invalid email
      const submitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    test('email step sends OTP on valid email', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'OTP sent' });
      
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Click "Click here" to start forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      // Enter valid email
      const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
      fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@mun.ca');
      });
      
      // Should move to OTP step
      await waitFor(() => {
        expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      });
    });

    test('OTP step validates 6-digit code', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'OTP sent' });
      
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Start forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      // Enter email and submit
      const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
      fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
      const emailSubmitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(emailSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      });
      
      // Try to submit with invalid OTP
      const otpSubmitButton = screen.getByRole('button', { name: 'Verify Code' });
      fireEvent.click(otpSubmitButton);
      
      // Should show alert for invalid OTP
      await waitFor(() => {
        expect(screen.getByText('Verify Code')).toBeInTheDocument();
      });
    });

    test('OTP step verifies code and moves to password step', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'OTP sent' });
      authService.verifyPasswordResetOtp.mockResolvedValue({ message: 'OTP verified' });
      
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Start forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      // Enter email and submit
      const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
      fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
      const emailSubmitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(emailSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      });
      
      // Enter OTP
      const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
      fireEvent.change(otpInput, { target: { value: '123456' } });
      
      // Submit OTP
      const otpSubmitButton = screen.getByRole('button', { name: 'Verify Code' });
      fireEvent.click(otpSubmitButton);
      
      await waitFor(() => {
        expect(authService.verifyPasswordResetOtp).toHaveBeenCalledWith('test@mun.ca', '123456');
      });
      
      // Should move to password step
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
    });

    test('OTP step shows error on invalid OTP', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'OTP sent' });
      authService.verifyPasswordResetOtp.mockRejectedValue({
        response: { data: { message: 'Invalid OTP' } }
      });
      
      // Mock window.alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Start forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      // Enter email and submit
      const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
      fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
      const emailSubmitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(emailSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      });
      
      // Enter invalid OTP
      const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
      fireEvent.change(otpInput, { target: { value: '000000' } });
      
      // Submit OTP
      const otpSubmitButton = screen.getByRole('button', { name: 'Verify Code' });
      fireEvent.click(otpSubmitButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Invalid OTP');
      });
      
      // Should still be on OTP step
      expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      
      alertSpy.mockRestore();
    });

    test('password step validates password match', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'OTP sent' });
      authService.verifyPasswordResetOtp.mockResolvedValue({ message: 'OTP verified' });
      
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Navigate through forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
      fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
      const emailSubmitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(emailSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      });
      
      const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
      fireEvent.change(otpInput, { target: { value: '123456' } });
      const otpSubmitButton = screen.getByRole('button', { name: 'Verify Code' });
      fireEvent.click(otpSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      // Try to submit with mismatched passwords
      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      
      fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
      
      const passwordSubmitButton = screen.getByRole('button', { name: /Reset Password/i });
      fireEvent.click(passwordSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    test('password step successfully resets password', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'OTP sent' });
      authService.verifyPasswordResetOtp.mockResolvedValue({ message: 'OTP verified' });
      authService.resetPassword.mockResolvedValue({ message: 'Password reset successful' });
      
      // Mock setTimeout
      jest.useFakeTimers();
      
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Navigate through forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      const emailInput = screen.getByPlaceholderText('your.name@mun.ca');
      fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
      const emailSubmitButton = screen.getByRole('button', { name: /Send Verification Code/i });
      fireEvent.click(emailSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
      });
      
      const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
      fireEvent.change(otpInput, { target: { value: '123456' } });
      const otpSubmitButton = screen.getByRole('button', { name: 'Verify Code' });
      fireEvent.click(otpSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Password')).toBeInTheDocument();
      });
      
      // Enter matching passwords
      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      
      fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
      
      const passwordSubmitButton = screen.getByRole('button', { name: /Reset Password/i });
      fireEvent.click(passwordSubmitButton);
      
      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith('test@mun.ca', '123456', 'newPassword123');
      });
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Password Changed Successfully!')).toBeInTheDocument();
      });
      
      // Fast-forward timers within act
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
      
      jest.useRealTimers();
    });

    test('can navigate back from email step to login', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
      
      // Click "Click here" to start forgot password flow
      const clickHereButton = screen.getByText('Click here');
      fireEvent.click(clickHereButton);
      
      // Should be on email step
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      
      // Click back button
      const backButton = screen.getByText('← Back to Login');
      fireEvent.click(backButton);
      
      // Should be back on login step
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });
});
