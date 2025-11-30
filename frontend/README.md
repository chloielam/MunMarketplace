# MUN Marketplace Frontend

This is the frontend application for the MUN Marketplace. It's built with React and uses Create React App as the build tool.

<!-- Note: Make sure teh backend is running before starting the frontend -->

## Tech Stack

1. **React 19.1.1** Main UI framework
2. **React Router DOM 6.28.0** Client side routing
3. **Axios 1.12.2** HTTP client for API calls
4. **Tailwind CSS 3.4.17** Utility first CSS framework
5. **Socket.io Client 4.8.1** Real time communication for chat
6. **React Icons 5.5.0** Icon library
7. **Create React App** Build tool and dev server (uses webpack under the hood)

## Getting Started

### Prerequisites

Make sure you have Node.js installed (version 14 or higher should work fine). You'll also need npm or yarn.

<!-- TODO: Update Node version requirement if we need newer features -->

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install all dependencies:
```bash
npm install
```

This will install all the packages listed in package.json. Might take a minute or two depending on your internet connection.

<!-- Sometimes npm install can be slow, be patient -->

### Running the Development Server

To start the dev server, just run:
```bash
npm start
```

The app will open at http://localhost:5173 by default. The page will automatically reload when you make changes to the code.

Note: The dev server uses Create React App's webpack dev server, so it's pretty fast for most changes.

<!-- Hot reload works great, saves alot of time during development -->

### Building for Production

When you're ready to deploy, create a production build:
```bash
npm run build
```

This creates an optimized build in the `build` folder. The build is minified and ready for deployment. You can serve it with any static file server.

<!-- The build process can take a while, especially on first run -->

## Project Structure

The project follows a pretty standard React app structure:

```
frontend/
├── public/              # Static files (index.html, favicon, etc.)
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Items.jsx
│   │   └── ...
│   ├── pages/          # Page components (routes)
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── ...
│   ├── services/       # API service layer
│   │   ├── api.js      # Axios instance configuration
│   │   ├── auth.js     # Authentication related API calls
│   │   └── items.js    # Listing/item related API calls
│   ├── config.js       # Configuration (API URLs, etc.)
│   ├── App.js          # Main app component with routing
│   └── index.js        # Entry point
├── package.json
└── README.md
```

## Configuration

### API Connection

The frontend connects to the backend API. By default, it expects the backend to be running at:

```
http://localhost:3000/api
```

You can change this in `src/config.js` if your backend is running on a different port or URL. Just update the `API_BASE_URL` constant.

<!-- Remember to update both API_BASE_URL and SOCKET_URL if backend port changes -->

The config file also has the socket URL for real time chat functionality, which defaults to `http://localhost:3000`.

### Environment Variables

If you need to override the API URL without changing code, you can use environment variables. Create React App supports `.env` files:

1. Create a `.env` file in the frontend directory
2. Add your variables:
```
REACT_APP_API_URL=http://localhost:3000/api
```

Note: Environment variables must start with `REACT_APP_` to be accessible in the code.

<!-- This is a Create React App requirement, not something we can change -->

## Available Scripts

1. **npm start** Starts the development server on port 5173
2. **npm run build** Creates a production build in the `build` folder
3. **npm test** Runs the test suite in watch mode
4. **npm test -- --watchAll=false** Runs all tests once (useful for CI)
5. **npm run test:e2e** Runs end to end tests with Playwright

## Key Features

1. **User Authentication** Login, registration with OTP verification, password reset
2. **Profile Management** Users can view and edit their profiles, upload profile pictures
3. **Listings** Create, edit, delete listings. Browse and filter items by category
4. **Ratings System** Sellers can see ratings given by buyers on their profile
5. **Real Time Chat** Socket.io based chat system for buyer seller communication
6. **Search and Filter** Filter listings by category, search by keywords
7. **Responsive Design** Works on desktop and mobile devices

## Development Notes

### Styling

We're using Tailwind CSS for styling. The config file is `tailwind.config.js` and it has custom colors for MUN branding:

<!-- The custom colors match MUN's official branding guidlines -->
1. `mun-red`: #8B0000
2. `mun-gold`: #FFD700
3. `mun-orange`: #FFA500

Global styles are in `src/index.css`. PostCSS processes the Tailwind classes.

### State Management

Currently using React's built in state management (useState, useEffect hooks). No Redux or other state management library. For API calls, we use async/await with the service layer.

<!-- We might need to add Redux later if state management gets to complicated -->

### API Service Layer

All API calls go through the service layer in `src/services/`. This keeps the components clean and makes it easy to mock for testing.

<!-- The service layer seperates API logic from UI components, which is good practice -->

1. **api.js** Sets up the Axios instance with base URL and interceptors
2. **auth.js** Handles authentication, user profile, ratings
3. **items.js** Handles listing operations (get, create, update, delete)

### Routing

React Router is used for client side routing. Main routes are defined in `src/App.js`. Routes include:

1. `/home` Landing page
2. `/items` Browse listings
3. `/login` Login page
4. `/register` Registration page
5. `/profile` User's own profile
6. `/users/:userId` Public profile view
7. `/listings/:id` Listing detail page
8. `/create-listing` Create new listing
9. `/chat` Chat interface

### Testing

We have a comprehensive test suite with 213 tests. See `TESTING.md` for details on how to run tests and what's covered.

Tests use Jest and React Testing Library. Most API calls are mocked to keep tests fast and isolated.

<!-- Mocking API calls means tests don't need a running backend server -->

## Common Issues

1. **Port already in use** If port 5173 is taken, you can change it by setting the PORT environment variable: `PORT=3001 npm start`

<!-- Common mistake is forgetting to start the backend server first -->

2. **API connection errors** Make sure the backend is running on port 3000. Check `src/config.js` if you're using a different port.

<!-- Common mistake is forgetting to start the backend server first -->

3. **Build fails** Try deleting `node_modules` and `package-lock.json`, then run `npm install` again. Sometimes dependencies get messed up.

<!-- This usually fixes weird dependency issues that can occure -->

4. **Tests failing** Make sure all mocks are set up correctly. Check the test files in `__tests__` folders for examples.

<!-- Most test failures are due to missing or incorrect mocks -->

## Contributing

When adding new features:

1. Follow the existing code structure
2. Add tests for new functionality
3. Update TESTING.md if you add significant test coverage
4. Use Tailwind classes for styling (avoid inline styles)
5. Keep components small and focused on one thing
6. Use the service layer for all API calls

<!-- Try to maintain consistancy with existing code patterns -->

## License

This project is part of the MUN Marketplace application.
