import React from 'react';

// Main landing page with main
const MainPage = () => {
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
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              className="flex-1 px-4 py-4 border-none rounded-full text-lg outline-none"
            />
            <button className="bg-mun-gold text-mun-red px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-mun-orange transition-all duration-300 text-sm md:text-base w-32 md:w-auto mx-auto md:mx-0">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl text-gray-800 text-center mb-4">Browse by Category</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">Find exactly what you need, organized by category.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏠</div>
              <h3 className="text-xl text-gray-800 mb-2">Housing</h3>
              <p className="text-gray-600 text-sm">Roommates and student housing</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🪑</div>
              <h3 className="text-xl text-gray-800 mb-2">Furniture</h3>
              <p className="text-gray-600 text-sm">Desks, chairs, shelves and more</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚗</div>
              <h3 className="text-xl text-gray-800 mb-2">Transportation</h3>
              <p className="text-gray-600 text-sm">Bikes, scooters, rideshares and more</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📚</div>
              <h3 className="text-xl text-gray-800 mb-2">Textbooks</h3>
              <p className="text-gray-600 text-sm">Course books, study guides, notes</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💻</div>
              <h3 className="text-xl text-gray-800 mb-2">Electronics</h3>
              <p className="text-gray-600 text-sm">Laptops, calculators, accessories</p>
            </div>
            
            <div className="text-center p-8 border border-gray-200 rounded-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
              <h3 className="text-xl text-gray-800 mb-2">Academic Services</h3>
              <p className="text-gray-600 text-sm">Tutoring, editing, and study groups</p>
            </div>
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
            <a href="#signin" className="text-orange-500 font-medium hover:text-orange-600">Sign in to access all features and products</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center" 
                  alt="Calculus Textbook" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold">Sign in to View</div>
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">good</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg text-gray-800 mb-2">Calculus Textbook - MATH 1000</h3>
                <p className="text-xl font-bold text-mun-red mb-1">$45.00</p>
                <p className="text-gray-600 text-sm mb-1">Like new</p>
                <p className="text-gray-500 text-sm">Posted by Sarah M.</p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative">
                <img 
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center" 
                  alt="MacBook Air" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold">Sign in to View</div>
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">new</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg text-gray-800 mb-2">MacBook Air 13" - Perfect for Students</h3>
                <p className="text-xl font-bold text-mun-red mb-1">$899.00</p>
                <p className="text-gray-600 text-sm mb-1">Excellent</p>
                <p className="text-gray-500 text-sm">Posted by Milos T.</p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center" 
                  alt="Ergonomic Chair" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold">Sign in to View</div>
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">good</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg text-gray-800 mb-2">Dorm Desk Chair - Ergonomic</h3>
                <p className="text-xl font-bold text-mun-red mb-1">$85.00</p>
                <p className="text-gray-600 text-sm mb-1">Good</p>
                <p className="text-gray-500 text-sm">Posted by Emma L.</p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-48 relative">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&crop=center" 
                  alt="Student Apartment" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-bold">Sign in to View</div>
                <div className="absolute top-2 left-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">available</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg text-gray-800 mb-2">Student Apartment Sublet - Available Sept</h3>
                <p className="text-xl font-bold text-mun-red mb-1">$650/month</p>
                <p className="text-gray-600 text-sm mb-1">Available</p>
                <p className="text-gray-500 text-sm">Posted by Alex R.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button className="bg-mun-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-800 transition-all duration-300">
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
            <button className="bg-mun-gold text-mun-red px-8 py-4 rounded-full font-bold hover:bg-mun-orange transition-all duration-300">
              Get Started Today →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MainPage;
