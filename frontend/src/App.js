import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Footer from './components/Footer.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Items from './components/Items.jsx';

// Main app component 
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home route */}
          <Route 
            path="/" 
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
          
          {/* Catch all route - redirect to home */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
