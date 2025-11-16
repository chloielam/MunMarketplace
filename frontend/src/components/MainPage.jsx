import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems } from '../services/items';
import { authUtils } from '../services/auth';

// Main landing page with main
const MainPage = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;

    const updateAuthState = (user) => {
      if (!active) return;
      setIsAuthenticated(!!user);
    };

    const handleStorageChange = () => {
      updateAuthState(authUtils.getSessionUser());
    };

    const handleAuthChange = (event) => {
      if (event?.detail && Object.prototype.hasOwnProperty.call(event.detail, 'user')) {
        updateAuthState(event.detail.user);
        return;
      }
      handleStorageChange();
    };

    const fetchFeaturedItems = async () => {
      try {
        const items = await getItems();
        // Get first 4 items as featured
        setFeaturedItems(items.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    updateAuthState(authUtils.getSessionUser());
    authUtils.refreshSession().then(updateAuthState);
    fetchFeaturedItems();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to browse page with search query
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/items?category=${encodeURIComponent(category)}`);
  };

  const handleViewAllProducts = () => {
    navigate('/items');
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/items');
    } else {
      navigate('/login');
    }
  };

  return (
    <main className="pt-20">
      {/* main section */}
      <section className="bg-mun-red text-white py-16 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            The Marketplace Exclusively for Memorial University Students
          </h1>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Buy and sell textbooks, furniture, electronics, housing, and more — all within the MUN community. Safe, local, and built for students.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-4 border-none rounded-full text-lg outline-none text-gray-800 placeholder-gray-400"
            />
            <button 
              type="submit"
              className="bg-mun-gold text-mun-red px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-mun-orange transition-all duration-300 text-sm md:text-base w-32 md:w-auto mx-auto md:mx-0"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl text-gray-800 text-center mb-4">Browse by Category</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">Find exactly what you need, organized by category.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <button 
              onClick={() => handleCategoryClick('Housing')}
              className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏠</div>
              <h3 className="text-xl text-gray-800 mb-2">Housing</h3>
              <p className="text-gray-600 text-sm">Roommates and student housing</p>
            </button>
            
            <button 
              onClick={() => handleCategoryClick('Furniture')}
              className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🪑</div>
              <h3 className="text-xl text-gray-800 mb-2">Furniture</h3>
              <p className="text-gray-600 text-sm">Desks, chairs, shelves and more</p>
            </button>
            
            <button 
              onClick={() => handleCategoryClick('Transportation')}
              className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚗</div>
              <h3 className="text-xl text-gray-800 mb-2">Transportation</h3>
              <p className="text-gray-600 text-sm">Bikes, scooters, rideshares and more</p>
            </button>
            
            <button 
              onClick={() => handleCategoryClick('Textbooks')}
              className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📚</div>
              <h3 className="text-xl text-gray-800 mb-2">Textbooks</h3>
              <p className="text-gray-600 text-sm">Course books, study guides, notes</p>
            </button>
            
            <button 
              onClick={() => handleCategoryClick('Electronics')}
              className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💻</div>
              <h3 className="text-xl text-gray-800 mb-2">Electronics</h3>
              <p className="text-gray-600 text-sm">Laptops, calculators, accessories</p>
            </button>
            
            <button 
              onClick={() => handleCategoryClick('Academic Services')}
              className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
              <h3 className="text-xl text-gray-800 mb-2">Academic Services</h3>
              <p className="text-gray-600 text-sm">Tutoring, editing, and study groups</p>
            </button>
          </div>
        </div>
      </section>

      {/* Featured prducts */}
      <section className="bg-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="bg-mun-gold text-mun-red px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">TOP PICKS</span>
            <h2 className="text-4xl text-gray-800 mt-4 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg mb-4">Popular items from our marketplace</p>
            <button 
              onClick={() => navigate('/login')}
              className="text-orange-500 font-medium hover:text-orange-600 cursor-pointer"
            >
              Sign in to access all features and products
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))
            ) : featuredItems.length > 0 ? (
              featuredItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/listings/${item.id}`)}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="h-48 relative">
                    <img 
                      src={item.imageUrls?.[0] || "https://via.placeholder.com/400x300"} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    {!isAuthenticated && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold">Sign in to View</div>
                    )}
                    {item.status === 'SOLD' && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">SOLD</div>
                    )}
                    {item.status === 'ACTIVE' && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">Available</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg text-gray-800 mb-2 truncate">{item.title}</h3>
                    <p className="text-xl font-bold text-mun-red mb-1">${item.price} {item.currency}</p>
                    <p className="text-gray-600 text-sm mb-1 capitalize">{item.category}</p>
                    <p className="text-gray-500 text-sm">{item.city} • {item.campus}</p>
                  </div>
                </div>
              ))
            ) : (
              // No items available
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No listings available at the moment</p>
                {!isAuthenticated && (
                  <p className="text-gray-400 mt-2">Sign in to see all available listings</p>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center">
            <button 
              onClick={handleViewAllProducts}
              className="bg-mun-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-800 transition-all duration-300"
            >
              View All Products →
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="bg-mun-gold text-mun-red px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">SIMPLE PROCESS</span>
            <h2 className="text-4xl text-gray-800 mt-4 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">MUN Marketplace makes buying and selling simple and secure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-mun-red text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
              <h3 className="text-xl text-gray-800 mb-4">Sign Up with MUN Email</h3>
              <p className="text-gray-600 leading-relaxed">Verify your account with your @mun.ca email to join our trusted student community.</p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-mun-red text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
              <h3 className="text-xl text-gray-800 mb-4">Browse or List Items</h3>
              <p className="text-gray-600 leading-relaxed">Search for what you need or post something to sell. Easy listing with photos and descriptions.</p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-mun-red text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💬</div>
              <h3 className="text-xl text-gray-800 mb-4">Message & Negotiate</h3>
              <p className="text-gray-600 leading-relaxed">Chat securely with other MUN students through our messaging system.</p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-mun-red text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏠</div>
              <h3 className="text-xl text-gray-800 mb-4">Meet & Exchange</h3>
              <p className="text-gray-600 leading-relaxed">Complete your deal safely on or near campus. Connect with your local student community.</p>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={handleGetStarted}
              className="bg-mun-gold text-mun-red px-8 py-4 rounded-full font-bold hover:bg-mun-orange transition-all duration-300"
            >
              Get Started Today →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MainPage;
