import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

// Register page
const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: 'Memorial University of Newfoundland',
    phoneNumber: '',
    studentId: '',
    program: '',
    yearOfStudy: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1: form, 2: OTP verification
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

        // Check password match
    if (name === 'confirmPassword') {
      console.log('Confirm password changed:', value);
      console.log('Current password:', formData.password);
      if (value && formData.password && value !== formData.password) {
        console.log('Passwords dont match');
        setErrors({
          ...errors,
          confirmPassword: 'Passwords do not match'
        });
      } else if (value && formData.password && value === formData.password) {
        console.log('Passwords match');
        setErrors({
          ...errors,
          confirmPassword: ''
        });
      }
    }

        // Check when password changes
    if (name === 'password' && formData.confirmPassword) {
      if (formData.confirmPassword && value && formData.confirmPassword !== value) {
        setErrors({
          ...errors,
          confirmPassword: 'Passwords do not match'
        });
      } else if (formData.confirmPassword && value && formData.confirmPassword === value) {
        setErrors({
          ...errors,
          confirmPassword: ''
        });
      }
    }

        // Check MUN email
    if (name === 'email') {
      console.log('Email changed:', value);
      if (value && !value.includes('@mun.ca')) {
        console.log('Bad email');
        setErrors({
          ...errors,
          email: 'Please use your MUN email address (@mun.ca)'
        });
      } else if (value && value.includes('@mun.ca')) {
        console.log('Good email');
        setErrors({
          ...errors,
          email: ''
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@mun.ca')) {
      newErrors.email = 'Please use your MUN email address (@mun.ca)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (registrationStep === 1) {
      // Step 1: Send OTP to email
      if (validateForm()) {
        setIsLoading(true);
        try {
          await authService.sendOtp(formData.email);
          setRegistrationStep(2);
        } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || err.message || "Failed to send OTP");
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Step 2: Verify OTP and complete registration
      if (!otpCode.trim()) {
        alert("Please enter the OTP code");
        return;
      }

      setIsLoading(true);
      try {
        // Step 1: Verify OTP
        await authService.verifyOtp(formData.email, otpCode);
        
        // Step 2: Complete registration
        const profileData = {
          university: formData.university,
          phoneNumber: formData.phoneNumber,
          studentId: formData.studentId,
          program: formData.program,
          yearOfStudy: formData.yearOfStudy
        };
        await authService.register(formData.email, formData.fullName, formData.password, profileData);
        
        navigate("/login");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Close button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        ×
      </button>
      
      <div className="h-screen flex">
        {/* Left side - Already Have Account */}
        <div className="flex-1 bg-mun-red p-8 flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white text-opacity-80 hover:text-white mb-6 flex items-center mx-auto"
            >
              ← Back to Home
            </button>
            
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="text-mun-red text-2xl font-bold">MUN</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Already Have An Account?</h3>
            <p className="text-white text-sm mb-6 leading-relaxed">
              Welcome back! Sign in to access your<br />
              Memorial University student<br />
              marketplace account
            </p>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-mun-red transition-colors duration-300"
            >
              SIGN IN
            </button>
          </div>
        </div>

        {/* Right side - Join MU Marketplace */}
        <div className="flex-1 p-8 flex items-center justify-center">
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {registrationStep === 1 ? 'Join MUN Marketplace' : 'Verify Your Email'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {registrationStep === 1 
                    ? 'Register with your Memorial University email to access the student marketplace'
                    : `We've sent a verification code to ${formData.email}. Please enter the 6-digit code below.`
                  }
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {registrationStep === 1 ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">👤</span>
                          </div>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                      </div>

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
                            placeholder="Create a password"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔒</span>
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
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
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🎓</span>
                          </div>
                          <input
                            type="text"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            placeholder="Memorial University of Newfoundland"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">📱</span>
                          </div>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="(709) 123-4567"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🆔</span>
                          </div>
                          <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            placeholder="e.g., 201234567"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Program of Study (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">📚</span>
                          </div>
                          <input
                            type="text"
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            placeholder="e.g., Computer Science"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year of Study (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">📅</span>
                          </div>
                          <select
                            name="yearOfStudy"
                            value={formData.yearOfStudy}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mun-red focus:border-transparent"
                          >
                            <option value="">Select year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Graduate">Graduate</option>
                            <option value="PhD">PhD</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
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
                          onChange={(e) => setOtpCode(e.target.value)}
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
                          onClick={() => setRegistrationStep(1)}
                          className="text-mun-red hover:underline"
                        >
                          try again
                        </button>
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-mun-red text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : (registrationStep === 1 ? 'SEND VERIFICATION CODE' : 'COMPLETE REGISTRATION')}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By registering, you agree to Memorial University's student marketplace terms and conditions
                  </p>
                </form>
              </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;