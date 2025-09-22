import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h3 className="text-lg font-semibold mb-4">About MUN Marketplace</h3>
            <p className="text-gray-300 text-sm">
              A dedicated marketplace for Memorial University of Newfoundland students 
              to buy and sell items.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                  Browse Items
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                  Sell Items
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Memorial University of Newfoundland</p>
              <p>St. John's, NL, Canada</p>
              <p>Email: </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 MUN Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
