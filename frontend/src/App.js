import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MainPage from './components/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PublicProfilePage from './pages/PublicProfilePage.jsx';
import TestProfilePage from './pages/TestProfilePage.jsx';
import DebugPage from './pages/DebugPage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import ListingDetailPage from './pages/ListingDetailPage.jsx';
import ListingDeletedPage from './pages/ListingDeletedPage.jsx';
import ListingCreatedPage from './pages/ListingCreatedPage.jsx';
import SellerRatingHistoryPage from './pages/SellerRatingHistoryPage.jsx';
import Items from './components/Items.jsx';
import { authUtils } from './services/auth';
import ChatPage from './pages/ChatPage';
import ItemDetail from './components/ItemDetail.jsx';

// Main app component 
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

  useEffect(() => {
    authUtils.refreshSession();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to /home */}
          <Route
            path="/"
            element={<Navigate to="/home" replace />}
          />

          {/* Home route - main page */}
          <Route
            path="/home"
            element={
              <>
                <Header />
                <MainPage />
                <Footer />
              </>
            }
          />

          {/* Items/Browse route */}
          <Route
            path="/items"
            element={
              <>
                <Header />
                <Items />
                <Footer />
              </>
            }
          />

          
          {/* Create Listing route */}
          <Route 
            path="/create-listing" 
            element={
              <>
                <Header />
                <CreateListingPage />
                <Footer />
              </>
            } 
          />
          
          {/* Listing Detail route */}
          <Route 
            path="/listings/:listingId" 
            element={
              <>
                <Header />
                <ListingDetailPage />
                <Footer />
              </>
            } 
          />
          
          {/* Item Detail route (legacy) */}
          <Route
            path="/items/:id"
            element={
              <>
                <Header />
                <ItemDetail />
                <Footer />
              </>
            }
          />

          {/* Listing Deleted confirmation route */}
          <Route 
            path="/listing-deleted" 
            element={
              <>
                <Header />
                <ListingDeletedPage />
                <Footer />
              </>
            } 
          />
          
          {/* Listing Created confirmation route */}
          <Route 
            path="/listing-created" 
            element={
              <>
                <Header />
                <ListingCreatedPage />
                <Footer />
              </>
            } 
          />
          
          {/* Login route */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Register route */}
          <Route
            path="/register"
            element={<RegisterPage />}
          />

          {/* Profile route */}
          <Route
            path="/profile"
            element={
              <>
                <Header />
                <ProfilePage />
                <Footer />
              </>
            }
          />

          {/* Public Profile route */}
          <Route
            path="/users/:userId"
            element={
              <>
                <Header />
                <PublicProfilePage />
                <Footer />
              </>
            }
          />

          {/* Seller Rating History route */}
          <Route
            path="/sellers/:sellerId/ratings"
            element={
              <>
                <Header />
                <SellerRatingHistoryPage />
                <Footer />
              </>
            }
          />

          {/* Test Profile route */}
          <Route
            path="/test-profile"
            element={<TestProfilePage />}
          />

          {/* Debug route */}
          <Route
            path="/debug"
            element={<DebugPage />}
          />

          {/* Catch all route - redirect to home */}
          <Route
            path="*"
            element={<Navigate to="/home" replace />}
          />
          <Route
            path="/chat"
            element={
              <>
                <Header />
                <ChatPage />
                <Footer />
              </>
            }
          />

        </Routes>


      </div>
    </Router>
  );
}

export default App;
