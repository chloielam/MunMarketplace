import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

// Layout component that wraps Header and Footer around main content
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
