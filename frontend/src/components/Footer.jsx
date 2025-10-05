import React from 'react';


const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-mun-gold">MUNMarketplace</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            MUN Marketplace is the dedicated platform for Memorial University students to buy, sell, and connect safely within our community.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com" className="text-white text-2xl hover:text-mun-gold transition-colors duration-300">📷</a>
            <a href="https://facebook.com" className="text-white text-2xl hover:text-mun-gold transition-colors duration-300">📘</a>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-mun-gold">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#home" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Home</a></li>
            <li><a href="#browse" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Browse</a></li>
            <li><a href="#requests" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Requests</a></li>
            <li><a href="#sell" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Sell Item</a></li>
            <li><a href="#about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">About</a></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-mun-gold">Categories</h4>
          <ul className="space-y-2">
            <li><a href="#textbooks" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Textbooks</a></li>
            <li><a href="#electronics" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Electronics</a></li>
            <li><a href="#housing" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Housing</a></li>
            <li><a href="#furniture" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Furniture</a></li>
            <li><a href="#transportation" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Transportation</a></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-mun-gold">Stay Connected</h4>
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">munmarketplace@gmail.com</p>
            <p className="text-gray-300 text-sm">Memorial University of Newfoundland</p>
          </div>
          
          <div className="mt-6">
            <h5 className="text-base font-bold text-mun-gold mb-2">Subscribe to campus events newsletter</h5>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-3 py-2 border-none rounded text-sm outline-none text-gray-800"
              />
              <button className="bg-mun-gold text-mun-red px-4 py-2 rounded font-bold hover:bg-mun-orange transition-colors duration-300 text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-center p-6 max-w-7xl mx-auto gap-4">
          <p className="text-gray-300 text-sm">
            © 2025 MUN Marketplace | Made by and for MUN Students
          </p>
          <div className="flex gap-6">
            <a href="#privacy" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Privacy Policy</a>
            <a href="#terms" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Terms of Service</a>
            <a href="#mun" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">Memorial University ↓</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
