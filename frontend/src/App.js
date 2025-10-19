import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import MainPage from './components/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Main app component - MUN Marketplace with React Router
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home page with Layout (Header + Footer) */}
          <Route 
            path="/" 
            element={
              <Layout>
                <MainPage />
              </Layout>
            } 
          />
          
          {/* Login page without Layout */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Register page without Layout */}
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
