import React, { useEffect } from 'react';
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
import Items from './components/Items.jsx';
import { authUtils } from './services/auth';
import ItemDetail from './components/ItemDetail.jsx'; 

// Main app component 
function App() {
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
          
           {/*Item Detail route */}
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
