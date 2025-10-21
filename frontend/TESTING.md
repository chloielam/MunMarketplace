# Testing

## Running Tests

```bash
npm test
```
I have added a watch mode in testing which automatically reruns tests  if any changes done on the code.
To run tests without watch mode:
```bash
npm test -- --watchAll=false
```

## Files Needed for Testing

### Test Files
- `src/components/__tests__/Header.test.jsx`
- `src/components/__tests__/MainPage.test.jsx` 
- `src/components/__tests__/Footer.test.jsx`
- `src/__tests__/App.test.jsx`
- `src/pages/__tests__/LoginPage.test.jsx`
- `src/pages/__tests__/RegisterPage.test.jsx`

### Setup Files
- `src/setupTests.js` Jest configuration
- `jest.config.js`  Test environment setup

### Dependencies (in package.json)
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@testing-library/user-event`

## these can be tested through unit tests

The tests check that the main components render properly and basic functionality works.

### Header
1. Logo shows up
2. Navigation links work
3. Search box is there
4. Sign in button works

### Main Page  
1. Hero section displays
2. Categories show up
3. Featured products display
4. How it works section renders

### Footer
1. Brand name shows
2. Contact info displays
3. Newsletter signup works
4. Links are clickable

### App
1. Everything loads without crashing
2. Main sections render
3. Navigation works
4. Search functionality exists

### Login Page
1. Form renders with email and password fields
2. MUN email validation works (shows error for non-MUN emails)
3. Password required validation works
4. Navigation to register page works
5. Back to home navigation works

### Register Page
1. Form renders with all required fields
2. MUN email validation works (shows error for non-MUN emails)
3. Password matching validation works
4. Required field validation works
5. Navigation to login page works
6. Back to home navigation works
