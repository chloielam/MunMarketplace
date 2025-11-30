# Testing Guide

This document covers how to run tests and what's currently being tested in the frontend.

## Running Tests

The easiest way to run tests is just:
```bash
npm test
```

This starts Jest in watch mode, so it'll automatically rerun when you change files. Super handy during development.

If you want to run all tests once (like in CI), use:
```bash
npm test -- --watchAll=false
```

You can also run specific test files:
```bash
npm test -- ProfilePage.test.jsx --watchAll=false
```

Or filter by test name pattern:
```bash
npm test -- --testNamePattern="ratings"
```

## Current Test Status

Right now we have **213 tests** across **21 test files**, and they're all passing! The test suite covers most of the major functionality in the app.

### Test Files Breakdown

**Components (8 files):**
1. `Header.test.jsx` Tests navigation, auth buttons, chat button, and verifies search bar is removed
2. `Footer.test.jsx` Tests footer links, navigation, and category filtering
3. `Items.test.jsx` Item listing, filtering, sorting, search
4. `ItemDetail.test.jsx` Individual item display
5. `MainPage.test.jsx` Landing page components
6. `Layout.test.jsx` Layout wrapper
7. `ProfilePicture.test.jsx` Profile picture component (if exists)
8. `StarRating.test.jsx` Star rating display (if exists)

**Pages (13 files):**
1. `App.test.jsx` Main app routing
2. `LoginPage.test.jsx` Login form, validation, forgot password flow (18 tests)
3. `RegisterPage.test.jsx` Registration with OTP, navigation to login with success state
4. `ProfilePage.test.jsx` Profile management, edit mode, listings, ratings from buyers (55 tests)
5. `PublicProfilePage.test.jsx` Public profile view with ratings display (6 tests)
6. `ListingDetailPage.test.jsx` Listing details, seller navigation to profile
7. `CreateListingPage.test.jsx` Create listing form
8. `ListingCreatedPage.test.jsx` Success page after creating listing
9. `ListingDeletedPage.test.jsx` Confirmation page after deleting listing
10. `SellerRatingHistoryPage.test.jsx` Seller rating history view
11. `TestProfilePage.test.jsx` Test utility page
12. `DebugPage.test.jsx` Debug utilities

**Services (3 files):**
1. `api.test.js` API configuration and interceptors
2. `auth.test.js` Authentication service (26 tests)
3. `items.test.js` Items API service (12 tests)

## What's Actually Tested

### ProfilePage (55 tests)

This is probably the most thoroughly tested component. It covers:

**Basic rendering:**
1. Loading states
2. User info display (name, email, verification badge)
3. Profile details (bio, location, study program, etc.)
4. Statistics display (listings count, active items, rating)

**Edit functionality:**
1. Entering edit mode
2. Form fields populate with current data
3. Saving changes (both user and profile updates)
4. Canceling and resetting form
5. Image upload handling

**Listings management:**
1. Displaying user's listings
2. Empty state when no listings
3. Create Listing button (always visible, even with listings)
4. Delete listing with confirmation

**Ratings from buyers:**
1. Ratings section appears when seller has ratings
2. Summary view with average rating
3. "View all ratings" button loads and displays detailed ratings
4. Shows buyer names, profile pictures, star ratings, reviews, and dates
5. Hide/show toggle functionality
6. Loading and error states

**Password management:**
1. Change password form
2. Password validation (match, minimum length)
3. Success and error handling

**Error handling:**
1. Failed API calls
2. Missing profile data
3. Authentication redirects

### LoginPage (18 tests)

Covers the full login flow plus forgot password:

**Login:**
1. Form rendering
2. MUN email validation
3. Password required validation
4. Successful login

**Forgot password flow:**
1. Email input step
2. OTP verification
3. New password creation
4. Success handling
5. Navigation between steps
6. Registration success notification display

### RegisterPage (7 tests)

1. Form rendering
2. MUN email validation
3. Password matching
4. OTP verification flow
5. Navigation to login with success state after registration

### PublicProfilePage (6 tests)

1. User profile display
2. Ratings summary (collapsed by default)
3. Expand/collapse ratings functionality
4. Empty state when no ratings
5. Detailed rating display with buyer info

### ListingDetailPage (13 tests)

1. Listing details display
2. Seller information
3. Navigation to seller profile (not rating history)
4. Edit/delete functionality for owners

### Footer (10 tests)

1. All quick links navigate correctly (Home, Browse, Sell Item)
2. Category links filter items correctly
3. Newsletter form
4. External links (social media)

### Header (6 tests)

1. Logo and navigation
2. Auth buttons (Sign In vs Profile/Logout)
3. Chat button navigation
4. Search bar removal verification

### Items Component (15 tests)

1. Loading and error states
2. Item display
3. Category filtering (including Books → Textbooks normalization)
4. Search functionality
5. Sorting (price, date)
6. Authentication-based visibility
7. SOLD badge display

## Test Setup

The test setup is pretty standard for a React app using Create React App. We use:

1. **Jest** as the test runner (comes with CRA)
2. **React Testing Library** for component testing
3. **jsdom** for DOM simulation

**Key setup files:**
1. `src/setupTests.js` Configures Jest, mocks axios and window.alert
2. `jest.config.js` Test environment configuration
3. `src/__mocks__/axios.js` Axios mock
4. `src/__mocks__/react-router-dom.js` Router mocks

## Common Patterns

Most tests follow a similar pattern:
1. Mock the services/APIs
2. Render the component
3. Wait for async operations
4. Assert what should be on screen
5. Simulate user interactions
6. Assert the results

For example, testing a button click:
```javascript
await waitFor(() => {
  expect(screen.getByText('Button Text')).toBeInTheDocument();
});

fireEvent.click(screen.getByText('Button Text'));

await waitFor(() => {
  expect(mockNavigate).toHaveBeenCalledWith('/expected-path');
});
```

## Recent Updates

**January 2025:**
1. Added tests for ratings display in ProfilePage (ratings from buyers)
2. Added tests for PublicProfilePage ratings functionality
3. Updated Footer tests to cover navigation links
4. Added tests for registration success notification
5. Updated Header tests to verify search bar removal
6. Updated ProfilePage tests for Create Listing button always visible
7. Removed purchase history tests (feature was removed)

**December 2024:**
1. Added comprehensive forgot password flow tests
2. Added category filtering tests with Books/Textbooks normalization
3. Added seller rating history tests

## Notes

1. Some tests use `waitFor` with timeouts for async operations - this is normal
2. We mock most API calls to keep tests fast and isolated
3. The ProfilePage tests are pretty comprehensive because that component does a lot
4. We're using `screen.getByText` and similar queries from React Testing Library - they're pretty reliable

## Running Specific Test Suites

If you want to run just the component tests:
```bash
npm test -- --testPathPattern="components"
```

Or just page tests:
```bash
npm test -- --testPathPattern="pages"
```

Or a specific feature:
```bash
npm test -- --testPathPattern="ratings"
```

That's about it! The tests are pretty straightforward and should be easy to extend when adding new features.
