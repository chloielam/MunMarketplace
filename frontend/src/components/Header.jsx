import React from 'react';

// Navigation header with logo, menu, search, and sign in
const Header = ({ onLoginClick, onChatClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          {/* Logo and navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-mun-red text-white w-12 h-10 flex items-center justify-center font-bold text-base border-2 border-mun-red rounded">
                MUN
              </div>
              <span className="text-gray-800 text-2xl font-bold">Marketplace</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#home" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Home</a>
              <a href="#browse" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Browse</a>
              <a href="#requests" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Requests</a>
              <a href="#messages" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Messages</a>
              <a href="#sell" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">Sell</a>
              <a href="#about" className="text-gray-800 font-medium hover:text-mun-red transition-colors duration-300">About</a>
            </nav>
          </div>
                    {/* Search and signin */} 
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 min-w-64">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="border-none bg-transparent outline-none flex-1 px-1 text-sm"
              />
              <button className="text-gray-600 hover:text-gray-800">🔍</button>
            </div>
            <button 
              onClick={onChatClick}
              className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-all duration-300"
            >
              💬 Chat
            </button>
            <button 
              onClick={onLoginClick}
              className="bg-mun-red text-white px-6 py-2 rounded-full font-medium hover:bg-red-800 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
