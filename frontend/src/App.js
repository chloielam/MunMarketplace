import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Footer from './components/Footer.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ChatPage from './pages/ChatPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Page navigation handlers
  const handleLoginClick = () => setCurrentPage('login');
  const handleGoToRegister = () => setCurrentPage('register');
  const handleGoToLogin = () => setCurrentPage('login');
  const handleBackToHome = () => setCurrentPage('home');
  const handleGoToChat = () => setCurrentPage('chat');

  // Render page based on currentPage
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
          <>
            <Header onLoginClick={handleLoginClick} onGoToChat={handleGoToChat} />
            <ChatPage />
          </>
        );
      default:
        return (
          <>
            <Header onLoginClick={handleLoginClick} onGoToChat={handleGoToChat} />
            <MainPage />
            <Footer />
          </>
        );
    }
  };

  return <div className="App">{renderCurrentPage()}</div>;
}

export default App;
