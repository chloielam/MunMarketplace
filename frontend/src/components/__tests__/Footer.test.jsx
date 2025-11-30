import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock window.scrollTo
global.scrollTo = jest.fn();

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders brand and links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    expect(screen.getByText('MUNMarketplace')).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('renders contact info', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    expect(screen.getByText('munmarketplace@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Memorial University of Newfoundland')).toBeInTheDocument();
  });

  test('renders newsletter', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  test('newsletter works', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@mun.ca' } });
    
    expect(emailInput.value).toBe('test@mun.ca');
  });

  test('navigates to home when Home link is clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/home');
    expect(global.scrollTo).toHaveBeenCalled();
  });

  test('navigates to items when Browse link is clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const browseButton = screen.getByText('Browse');
    fireEvent.click(browseButton);

    expect(mockNavigate).toHaveBeenCalledWith('/items');
    expect(global.scrollTo).toHaveBeenCalled();
  });

  test('navigates to create listing when Sell Item link is clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const sellItemButton = screen.getByText('Sell Item');
    fireEvent.click(sellItemButton);

    expect(mockNavigate).toHaveBeenCalledWith('/create-listing');
    expect(global.scrollTo).toHaveBeenCalled();
  });

  test('navigates to items with category filter when category link is clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const textbooksButton = screen.getByText('Textbooks');
    fireEvent.click(textbooksButton);

    expect(mockNavigate).toHaveBeenCalledWith('/items?category=Textbooks');
    expect(global.scrollTo).toHaveBeenCalled();
  });

  test('navigates to items with Electronics category when clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const electronicsButton = screen.getByText('Electronics');
    fireEvent.click(electronicsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/items?category=Electronics');
  });

  test('navigates to items with Furniture category when clicked', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const furnitureButton = screen.getByText('Furniture');
    fireEvent.click(furnitureButton);

    expect(mockNavigate).toHaveBeenCalledWith('/items?category=Furniture');
  });
});
