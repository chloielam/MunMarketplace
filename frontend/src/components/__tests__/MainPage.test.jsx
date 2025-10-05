import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from '../MainPage';

describe('MainPage', () => {
  test('renders hero section', () => {
    render(<MainPage />);
    
    expect(screen.getByText('The Marketplace Exclusively for Memorial University Students')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What are you looking for?')).toBeInTheDocument();
  });

  test('renders categories', () => {
    render(<MainPage />);
    
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Housing')).toBeInTheDocument();
    expect(screen.getByText('Textbooks')).toBeInTheDocument();
  });

  test('renders featured products', () => {
    render(<MainPage />);
    
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
    expect(screen.getByText('Calculus Textbook - MATH 1000')).toBeInTheDocument();
    expect(screen.getByText('$45.00')).toBeInTheDocument();
  });

  test('renders how it works', () => {
    render(<MainPage />);
    
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Sign Up with MUN Email')).toBeInTheDocument();
  });
});
