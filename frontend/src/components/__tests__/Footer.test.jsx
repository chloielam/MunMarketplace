import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer';

describe('Footer', () => {
  test('renders brand and links', () => {
    render(<Footer />);
    
    expect(screen.getByText('MUNMarketplace')).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('renders contact info', () => {
    render(<Footer />);
    
    expect(screen.getByText('munmarketplace@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Memorial University of Newfoundland')).toBeInTheDocument();
  });

  test('renders newsletter', () => {
    render(<Footer />);
    
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  test('newsletter works', () => {
    render(<Footer />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
    
    expect(emailInput.value).toBe('test@mun.ca');
  });
});
