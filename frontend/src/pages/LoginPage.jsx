import React, { useState } from 'react';

// Login page
const LoginPage = ({ onBackToHome, onGoToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      alert("Login successful!");
      navigate("/dashboard"); // Adjust route as per your app
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Close button */}
      <button
        onClick={onBackToHome}
        className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        ×
      </button>
      
      <div className="h-screen flex">
        {/* Left side - Welcome Back */}
        <div className="flex-1 p-8 flex items-center justify-center">
              <div className="max-w-md mx-auto">
                <button
                  onClick={onBackToHome}
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
                    <button type="button" className="text-blue-600 hover:text-blue-800">
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
              onClick={onGoToRegister}
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
