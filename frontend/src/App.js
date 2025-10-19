import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Footer from './components/Footer.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Main app component - MUN Marketplace with page navigation
function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleGoToRegister = () => {
    setCurrentPage('register');
  };

  const handleGoToLogin = () => {
    setCurrentPage('login');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage 
            onBackToHome={handleBackToHome}
            onGoToRegister={handleGoToRegister}
          />
        );
      case 'register':
        return (
          <RegisterPage 
            onBackToHome={handleBackToHome}
            onGoToLogin={handleGoToLogin}
          />
        );
      default:
        return (
          <>
            <Header onLoginClick={handleLoginClick} />
            <MainPage />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
