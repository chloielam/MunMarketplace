// frontend/src/services/auth.js
import api from './api';

export const authService = {
  // Login user
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register user
  async register(email, fullName, password, profileData = {}) {
    const response = await api.post('/auth/register', { 
      email, 
      fullName, 
      password,
      ...profileData 
    });
    return response.data;
  },

  // Send OTP
  async sendOtp(email) {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  // Verify OTP
  async verifyOtp(email, code) {
    const response = await api.post('/auth/verify-otp', { email, code });
    return response.data;
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(email, code, newPassword) {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  // Get user info
  async getUser(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Get user profile
  async getUserProfile(userId) {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  // Update user
  async updateUser(userId, userData) {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    const response = await api.patch(`/users/${userId}/profile`, profileData);
    return response.data;
  }
};

// Auth state management
export const authUtils = {
  // Set auth token
  setToken(token) {
    localStorage.setItem('token', token);
    // Set default authorization header for all requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  },

  // Remove auth token
  removeToken() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get user ID from token (you might need to decode JWT)
  getUserId() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Simple JWT decode (you might want to use a proper JWT library)
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub || payload.userId || payload.id;
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
};
