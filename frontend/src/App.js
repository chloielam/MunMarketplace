import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Footer from './components/Footer.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ChatPage from './pages/ChatPage';
import RegisterPage from './pages/RegisterPage.jsx';

// Main app component - MUN Marketplace with page navigation
function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = urlParams.get('page') || 'home';
  
  const [currentPage, setCurrentPage] = useState(initialPage);

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

  const handleGoToChat = () => {
    setCurrentPage('chat');
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
        case 'chat':
        return (
          <ChatPage 
            onBackToHome={handleBackToHome}
          />
        );
      default:
        return (
          <>
            <Header onLoginClick={handleLoginClick} onChatClick={handleGoToChat} />
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
