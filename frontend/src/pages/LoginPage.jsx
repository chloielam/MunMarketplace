import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authUtils } from '../services/auth';

// Login page
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot password flow state
  const [forgotPasswordStep, setForgotPasswordStep] = useState('login'); // 'login' | 'email' | 'otp' | 'newPassword' | 'success'
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Check MUN email
    if (name === 'email') {
      if (value && !value.includes('@mun.ca')) {
        setErrors({
          ...errors,
          email: 'Please use your MUN email address (@mun.ca)'
        });
      } else if (value && value.includes('@mun.ca')) {
        setErrors({
          ...errors,
          email: ''
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@mun.ca')) {
      newErrors.email = 'Please use your MUN email address (@mun.ca)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const data = await authService.login(formData.email, formData.password);

        if (data.user) {
          authUtils.setSessionUser(data.user);
        }
        const refreshedUser = await authUtils.refreshSession();

        // Dispatch auth change event to update Header
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: refreshedUser ?? data.user ?? null } }));
        
        // Redirect to listings page without popup
        navigate("/items");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Login failed");
      }
    }
  };

  // Forgot password handlers
  const handleForgotPasswordClick = () => {
    setForgotPasswordStep('email');
    setForgotEmail('');
    setForgotPasswordErrors({});
  };

  const validateForgotEmail = () => {
    const newErrors = {};
    if (!forgotEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!forgotEmail.includes('@mun.ca')) {
      newErrors.email = 'Please use your MUN email address (@mun.ca)';
    }
    setForgotPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (validateForgotEmail()) {
      setIsLoading(true);
      try {
        await authService.forgotPassword(forgotEmail);
        setForgotPasswordStep('otp');
        setOtpCode('');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Failed to send OTP");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      alert("Please enter a valid 6-digit OTP code");
      return;
    }
    
    setIsLoading(true);
    try {
      // Verify OTP before moving to password step
      await authService.verifyPasswordResetOtp(forgotEmail, otpCode);
      setForgotPasswordStep('newPassword');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Invalid OTP. Please check your code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateNewPassword = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setForgotPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (validateNewPassword()) {
      setIsLoading(true);
      try {
        await authService.resetPassword(forgotEmail, otpCode, newPassword);
        setForgotPasswordStep('success');
        setTimeout(() => {
          // Reset state and redirect to login
          setForgotPasswordStep('login');
          setForgotEmail('');
          setOtpCode('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotPasswordErrors({});
          navigate('/login');
        }, 2000);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Password reset failed");
      } finally {
        setIsLoading(false);
      }
    }
  };


  // Render forgot password flow
  if (forgotPasswordStep === 'email') {
    return (
      <div className="min-h-screen bg-gray-50">
        <button
          onClick={() => navigate('/home')}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        
        <div className="h-screen flex">
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setForgotPasswordStep('login')}
                className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
              >
                ← Back to Login
              </button>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-gray-600 mb-8">
                Enter your MUN email address and we'll send you a verification code to reset your password.
              </p>
              
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">✉️</span>
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotPasswordErrors.email) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, email: '' });
                        }
                      }}
                      placeholder="your.name@mun.ca"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                        forgotPasswordErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {forgotPasswordErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{forgotPasswordErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-mun-red text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex-1 bg-mun-red flex items-center justify-center">
            <div className="text-center max-w-md px-8">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-mun-red text-2xl font-bold">MUN</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Forgot Password?</h3>
              <p className="text-white text-base mb-8 leading-relaxed">
                Don't worry! We'll help you reset your password and get back into your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (forgotPasswordStep === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50">
        <button
          onClick={() => navigate('/home')}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        
        <div className="h-screen flex">
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setForgotPasswordStep('email')}
                className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
              >
                ← Back
              </button>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
              <p className="text-gray-600 mb-8">
                We've sent a verification code to {forgotEmail}. Please enter the 6-digit code below.
              </p>
              
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔐</span>
                    </div>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Didn't receive the code? Check your spam folder or{' '}
                    <button 
                      type="button" 
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await authService.forgotPassword(forgotEmail);
                          alert('Verification code resent!');
                        } catch (err) {
                          alert(err.response?.data?.message || err.message || "Failed to resend OTP");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-mun-red hover:underline"
                    >
                      resend
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-mun-red text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex-1 bg-mun-red flex items-center justify-center">
            <div className="text-center max-w-md px-8">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-mun-red text-2xl font-bold">MUN</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Check Your Email</h3>
              <p className="text-white text-base mb-8 leading-relaxed">
                Enter the 6-digit verification code sent to your email address to continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (forgotPasswordStep === 'newPassword') {
    return (
      <div className="min-h-screen bg-gray-50">
        <button
          onClick={() => navigate('/home')}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        
        <div className="h-screen flex">
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setForgotPasswordStep('otp')}
                className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
              >
                ← Back
              </button>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Password</h2>
              <p className="text-gray-600 mb-8">
                Please enter your new password. Make sure it's at least 6 characters long.
              </p>
              
              <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (forgotPasswordErrors.newPassword) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, newPassword: '' });
                        }
                        if (confirmPassword && e.target.value !== confirmPassword) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, confirmPassword: 'Passwords do not match' });
                        } else if (confirmPassword && e.target.value === confirmPassword) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, confirmPassword: '' });
                        }
                      }}
                      placeholder="Enter new password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                        forgotPasswordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-600"
                        onMouseDown={() => setShowNewPassword(true)}
                        onMouseUp={() => setShowNewPassword(false)}
                        onMouseLeave={() => setShowNewPassword(false)}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  {forgotPasswordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{forgotPasswordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔒</span>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (forgotPasswordErrors.confirmPassword) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, confirmPassword: '' });
                        }
                        if (newPassword && e.target.value !== newPassword) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, confirmPassword: 'Passwords do not match' });
                        } else if (newPassword && e.target.value === newPassword) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, confirmPassword: '' });
                        }
                      }}
                      placeholder="Confirm new password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                        forgotPasswordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        type="button" 
                        className="text-gray-400 hover:text-gray-600"
                        onMouseDown={() => setShowConfirmPassword(true)}
                        onMouseUp={() => setShowConfirmPassword(false)}
                        onMouseLeave={() => setShowConfirmPassword(false)}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  {forgotPasswordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{forgotPasswordErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-mun-red text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex-1 bg-mun-red flex items-center justify-center">
            <div className="text-center max-w-md px-8">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-mun-red text-2xl font-bold">MUN</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">New Password</h3>
              <p className="text-white text-base mb-8 leading-relaxed">
                Choose a strong password that you'll remember. Make sure it's at least 6 characters long.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (forgotPasswordStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Password Changed Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Close button */}
      <button
        onClick={() => navigate('/home')}
        className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        ×
      </button>
      
      <div className="h-screen flex">
        {/* Left side - Welcome Back */}
        <div className="flex-1 p-8 flex items-center justify-center">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => navigate('/home')}
                  className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
                >
                  ← Back to Home
                </button>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600 mb-8">
                  Sign in to access your Memorial University student marketplace account.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">✉️</span>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.name@mun.ca"
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔒</span>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button 
                          type="button" 
                          className="text-gray-400 hover:text-gray-600"
                          onMouseDown={() => setShowPassword(true)}
                          onMouseUp={() => setShowPassword(false)}
                          onMouseLeave={() => setShowPassword(false)}
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Having trouble remembering your password? </span>
                    <button 
                      type="button" 
                      onClick={handleForgotPasswordClick}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Click here
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-mun-red text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>

        {/* Right side - New Here */}
        <div className="flex-1 bg-mun-red flex items-center justify-center">
          <div className="text-center max-w-md px-8">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="text-mun-red text-2xl font-bold">MUN</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">New Here?</h3>
            <p className="text-white text-base mb-8 leading-relaxed">
              Create your Memorial University marketplace account and start buying, selling, and connecting with other students.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-mun-red transition-colors duration-300"
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
