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
    
    expect(screen.getByText('MUN')).toBeInTheDocument();
    expect(screen.getByText('The Marketplace Exclusively for Memorial University Students')).toBeInTheDocument();
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
  });

  test('renders navigation on home page', () => {
    render(<App />);
    
    expect(screen.getAllByText('Home')).toHaveLength(2);
    expect(screen.getAllByText('Browse')).toHaveLength(2);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('renders search on home page', () => {
    render(<App />);
    
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What are you looking for?')).toBeInTheDocument();
  });
});