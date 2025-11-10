# Testing

## Running Tests

### Basic Commands

Run all tests in watch mode (automatically reruns when files change):
```bash
npm test
```

Run tests once without watch mode:
```bash
npm test -- --watchAll=false
```

Run tests for a specific file:
```bash
npm test -- Header.test.jsx
```

Run tests matching a pattern:
```bash
npm test -- --testNamePattern="renders"
```

## Test Coverage

The frontend has **88 unit tests** across **14 test suites**, covering:

### Components (6 test files)
1. `src/__tests__/App.test.jsx` - Main app component and routing
2. `src/components/__tests__/Header.test.jsx` - Navigation header
3. `src/components/__tests__/Footer.test.jsx` - Footer component
4. `src/components/__tests__/MainPage.test.jsx` - Landing page
5. `src/components/__tests__/Layout.test.jsx` - Layout wrapper
6. `src/components/__tests__/Items.test.jsx` - Items listing with filtering and sorting

### Pages (5 test files)
1. `src/pages/__tests__/LoginPage.test.jsx` - Login form and validation
2. `src/pages/__tests__/RegisterPage.test.jsx` - Registration form and validation
3. `src/pages/__tests__/ProfilePage.test.jsx` - User profile management
4. `src/pages/__tests__/DebugPage.test.jsx` - Debug utility page
5. `src/pages/__tests__/TestProfilePage.test.jsx` - Test utility page

### Services (3 test files)
1. `src/services/__tests__/api.test.js` - API configuration and interceptors
2. `src/services/__tests__/auth.test.js` - Authentication service functions
3. `src/services/__tests__/items.test.js` - Items API service

## Setup Files

- `src/setupTests.js` - Jest configuration and global mocks (axios)
- `jest.config.js` - Test environment setup
- `src/__mocks__/axios.js` - Axios mock for testing
- `src/__mocks__/react-router-dom.js` - React Router mocks

## Dependencies

Required testing dependencies (already in package.json):
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation

## What's Tested

The tests verify that components render properly and functionality works as expected.

### App Component
1. Renders without crashing
2. Home page renders by default
3. Navigation works correctly
4. Search functionality exists

### Header Component
1. Logo and navigation render
2. Sign in button displays
3. Logo links to home page

### Footer Component
1. Brand name and links render
2. Contact information displays
3. Newsletter signup form works

### MainPage Component
1. Hero section displays
2. Categories show up
3. Featured products display
4. "How it works" section renders

### Layout Component
1. Renders Header and Footer
2. Wraps children content correctly

### Items Component
1. Loading state displays
2. Items render after loading
3. Error handling works
4. Category filtering works
5. Search functionality works
6. Sorting (price, date) works
7. Authentication-based visibility
8. SOLD badge displays for sold items

### LoginPage Component
1. Form renders with email and password fields
2. MUN email validation (shows error for non-MUN emails)
3. Password required validation
4. Navigation buttons work

### RegisterPage Component
1. Form renders with all required fields
2. MUN email validation
3. Password matching validation
4. Required field validation
5. Navigation buttons work

### ProfilePage Component
1. Loading state displays
2. Profile data renders after loading
3. Error handling works
4. Edit mode functionality
5. Profile updates work
6. Logout functionality

### DebugPage Component
1. Debug information displays
2. Authentication status shows
3. Session refresh works

### TestProfilePage Component
1. Authentication status displays
2. Navigation buttons work

### API Service
1. Axios instance created correctly
2. API methods available

### Auth Service
1. Login endpoint calls
2. Register endpoint calls
3. User data fetching
4. Profile management
5. Session management (localStorage)
6. Authentication state utilities

### Items Service
1. Items fetching from API
2. Error handling
