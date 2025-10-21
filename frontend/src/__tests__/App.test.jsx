import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders home page by default', () => {
    render(<App />);
    
    expect(screen.getAllByText('MUN').length).toBeGreaterThanOrEqual(2); // Header and Footer
    expect(screen.getByText('The Marketplace Exclusively for Memorial University Students')).toBeInTheDocument();
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
  });

  test('renders navigation on home page', () => {
    render(<App />);
    
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(2); // Header and Footer
    expect(screen.getAllByText('Browse').length).toBeGreaterThanOrEqual(2); // Header and Footer
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1); // Header and possibly other components
  });

  test('renders search on home page', () => {
    render(<App />);
    
    expect(screen.getAllByPlaceholderText('Search products...').length).toBeGreaterThanOrEqual(2); // Header and Footer
    expect(screen.getByPlaceholderText('What are you looking for?')).toBeInTheDocument();
  });
});