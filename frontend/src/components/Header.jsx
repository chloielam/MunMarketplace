import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, authUtils } from '../services/auth';

// Navigation header with logo, menu, search, and sign in
const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    const applySession = (sessionUser) => {
      if (!active) return;
      setIsAuthenticated(!!sessionUser);
      setUser(sessionUser);
    };

    const syncSession = async () => {
      const sessionUser = await authUtils.refreshSession();
      applySession(sessionUser);
    };

    // Initial load
    applySession(authUtils.getSessionUser());
    syncSession();

    const handleStorageChange = () => {
      applySession(authUtils.getSessionUser());
    };

    const handleAuthChange = () => {
      syncSession();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      authUtils.clearSession();
      setIsAuthenticated(false);
      setUser(null);
      window.dispatchEvent(new CustomEvent('authChange'));
      navigate('/home');
    }
  };

  const handleProfileClick = () => {
    // Force check authentication state
    const currentAuth = authUtils.isAuthenticated();
    
    if (!currentAuth) {
      navigate('/login');
      return;
    }
    
    navigate('/profile');
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          {/* Logo and navigation */}
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2">
              <div className="bg-mun-red text-white w-12 h-10 flex items-center justify-center font-bold text-base border-2 border-mun-red rounded">
                MUN
              </div>
              <span className="text-gray-800 text-2xl font-bold">Marketplace</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link 
                to="/home"
                className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300"
              >
                Home
              </Link>
              <Link 
                to="/items"
                className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300"
              >
                Browse
              </Link>
              <a href="#requests" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Requests</a>
              <a href="#messages" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Messages</a>
              <a href="#sell" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Sell</a>
              <a href="#about" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">About</a>
            </nav>
          </div>
                    {/* Auth buttons */} 
          <div className="flex items-center gap-4">
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleProfileClick}
                  className="bg-mun-red text-white px-6 py-2 rounded-full font-medium hover:bg-red-800 transition-all duration-300"
                >
                  Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="bg-mun-red text-white px-6 py-2 rounded-full font-medium hover:bg-red-800 transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
