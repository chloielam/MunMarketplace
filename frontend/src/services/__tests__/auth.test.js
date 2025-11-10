import { authService, authUtils } from '../auth';
import api from '../api';

// Mock api
jest.mock('../api', () => {
  const mockApiInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockApiInstance
  };
});

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login calls correct endpoint', async () => {
    api.post.mockResolvedValue({ data: { user: { id: 1 } } });
    
    await authService.login('test@mun.ca', 'password123');
    
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@mun.ca',
      password: 'password123'
    });
  });

  test('register calls correct endpoint', async () => {
    api.post.mockResolvedValue({ data: { user: { id: 1 } } });
    
    await authService.register('test@mun.ca', 'Test User', 'password123');
    
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@mun.ca',
      fullName: 'Test User',
      password: 'password123'
    });
  });

  test('getUser calls /users/me when no userId provided', async () => {
    api.get.mockResolvedValue({ data: { id: 1 } });
    
    await authService.getUser();
    
    expect(api.get).toHaveBeenCalledWith('/users/me');
  });

  test('getUser calls /users/:id when userId provided', async () => {
    api.get.mockResolvedValue({ data: { id: 1 } });
    
    await authService.getUser(1);
    
    expect(api.get).toHaveBeenCalledWith('/users/1');
  });

  test('getUserProfile calls /users/me/profile when no userId provided', async () => {
    api.get.mockResolvedValue({ data: { bio: 'Test bio' } });
    
    await authService.getUserProfile();
    
    expect(api.get).toHaveBeenCalledWith('/users/me/profile');
  });

  test('updateUser calls correct endpoint', async () => {
    api.patch.mockResolvedValue({ data: { id: 1 } });
    
    await authService.updateUser(undefined, { fullName: 'New Name' });
    
    expect(api.patch).toHaveBeenCalledWith('/users/me', {
      fullName: 'New Name'
    });
  });

  test('logout calls correct endpoint', async () => {
    api.post.mockResolvedValue({});
    
    await authService.logout();
    
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });

  test('changePassword calls correct endpoint with correct data', async () => {
    api.post.mockResolvedValue({ data: { message: 'Password changed successfully' } });
    
    const result = await authService.changePassword('oldPassword123', 'newPassword123');
    
    expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123'
    });
    expect(result).toEqual({ message: 'Password changed successfully' });
  });
});

describe('authUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('setSessionUser stores user in localStorage', () => {
    const user = { id: 1, email: 'test@mun.ca' };
    authUtils.setSessionUser(user);
    
    expect(localStorage.getItem('sessionUser')).toBe(JSON.stringify(user));
  });

  test('setSessionUser clears localStorage when user is null', () => {
    localStorage.setItem('sessionUser', JSON.stringify({ id: 1 }));
    authUtils.setSessionUser(null);
    
    expect(localStorage.getItem('sessionUser')).toBeNull();
  });

  test('getSessionUser returns parsed user from localStorage', () => {
    const user = { id: 1, email: 'test@mun.ca' };
    localStorage.setItem('sessionUser', JSON.stringify(user));
    
    expect(authUtils.getSessionUser()).toEqual(user);
  });

  test('getSessionUser returns null when no user in localStorage', () => {
    expect(authUtils.getSessionUser()).toBeNull();
  });

  test('clearSession removes sessionUser from localStorage', () => {
    localStorage.setItem('sessionUser', JSON.stringify({ id: 1 }));
    authUtils.clearSession();
    
    expect(localStorage.getItem('sessionUser')).toBeNull();
  });

  test('isAuthenticated returns true when user exists', () => {
    localStorage.setItem('sessionUser', JSON.stringify({ id: 1 }));
    
    expect(authUtils.isAuthenticated()).toBe(true);
  });

  test('isAuthenticated returns false when no user', () => {
    expect(authUtils.isAuthenticated()).toBe(false);
  });

  test('getUserId returns user id', () => {
    const user = { id: 1, email: 'test@mun.ca' };
    localStorage.setItem('sessionUser', JSON.stringify(user));
    
    expect(authUtils.getUserId()).toBe(1);
  });

  test('getUserId returns null when no user', () => {
    expect(authUtils.getUserId()).toBeNull();
  });

  test('refreshSession updates session user', async () => {
    const user = { id: 1, email: 'test@mun.ca' };
    api.get.mockResolvedValue({ data: { user } });
    
    const result = await authUtils.refreshSession();
    
    expect(result).toEqual(user);
    expect(localStorage.getItem('sessionUser')).toBe(JSON.stringify(user));
  });

  test('refreshSession clears session when no user returned', async () => {
    localStorage.setItem('sessionUser', JSON.stringify({ id: 1 }));
    api.get.mockResolvedValue({ data: {} });
    
    const result = await authUtils.refreshSession();
    
    expect(result).toBeNull();
    expect(localStorage.getItem('sessionUser')).toBeNull();
  });

  test('refreshSession clears session on error', async () => {
    localStorage.setItem('sessionUser', JSON.stringify({ id: 1 }));
    api.get.mockRejectedValue(new Error('Network error'));
    
    const result = await authUtils.refreshSession();
    
    expect(result).toBeNull();
    expect(localStorage.getItem('sessionUser')).toBeNull();
  });
});

