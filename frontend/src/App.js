//frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Footer from './components/Footer.jsx';
import TestItems from './components/testpage.jsx';  

// Main ap component - MUN Marketplace landing page
function App() {
    return (
    <Router>
      <Header />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<MainPage />} />

        {/* Item List Page */}
        <Route path="/items" element={<TestItems />} />

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
