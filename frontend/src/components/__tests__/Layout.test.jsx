import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../Layout';

// Mock Header and Footer components
jest.mock('../Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

describe('Layout', () => {
  test('renders Header and Footer', () => {
    render(
      <Layout>
        <div data-testid="content">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('renders children between Header and Footer', () => {
    render(
      <Layout>
        <div data-testid="main-content">Main Content</div>
      </Layout>
    );
    
    const header = screen.getByTestId('header');
    const footer = screen.getByTestId('footer');
    const content = screen.getByTestId('main-content');
    
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
