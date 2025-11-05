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
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Get user profile
  async getUserProfile(userId) {
    const endpoint = userId ? `/users/${userId}/profile` : '/users/me/profile';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Update user
  async updateUser(userId, userData) {
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    const response = await api.patch(endpoint, userData);
    return response.data;
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    const endpoint = userId ? `/users/${userId}/profile` : '/users/me/profile';
    const response = await api.patch(endpoint, profileData);
    return response.data;
  },

  async getSession() {
    const response = await api.get('/auth/session');
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  }
};

// Auth state management
export const authUtils = {
  sessionKey: 'sessionUser',

  setSessionUser(user) {
    if (!user) {
      this.clearSession();
      return;
    }
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
  },

  getSessionUser() {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to parse stored session user', error);
      localStorage.removeItem(this.sessionKey);
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(this.sessionKey);
  },

  isAuthenticated() {
    return !!this.getSessionUser();
  },

  getUserId() {
    const user = this.getSessionUser();
    return user?.id || null;
  },

  async refreshSession() {
    try {
      const { user } = await authService.getSession();
      if (user) {
        this.setSessionUser(user);
        return user;
      }
      this.clearSession();
      return null;
    } catch (error) {
      this.clearSession();
      return null;
    }
  },
};
