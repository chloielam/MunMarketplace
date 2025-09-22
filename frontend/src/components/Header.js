import React, { useState } from 'react';
import LoginModal from './LoginModal';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-white text-red-600 font-bold text-xl px-3 py-1 rounded">
            MUN
          </div>
        </div>
        <button 
          onClick={handleLoginClick}
          className="bg-white text-red-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition duration-200"
        >
          Log In
        </button>
      </header>
      
      <LoginModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default Header;
