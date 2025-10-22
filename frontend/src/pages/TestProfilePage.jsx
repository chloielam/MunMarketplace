import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../services/auth';

const TestProfilePage = () => {
  const navigate = useNavigate();
  const token = authUtils.getToken();
  const isAuth = authUtils.isAuthenticated();
  const userId = authUtils.getUserId();
  
  // Debug JWT token
  let decodedToken = null;
  if (token) {
    try {
      const parts = token.split('.');
      console.log('Token parts:', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        decodedToken = payload;
        console.log('Decoded JWT payload:', payload);
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 mb-6 flex items-center"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Profile Page</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Token exists:</strong> {token ? 'Yes' : 'No'}</p>
            <p><strong>Is authenticated:</strong> {isAuth ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {userId || 'None'}</p>
            <p><strong>Token (first 50 chars):</strong> {token ? token.substring(0, 50) + '...' : 'None'}</p>
          </div>
          
          {decodedToken && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Decoded JWT Payload:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Actions</h3>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/items')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Go to Items
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProfilePage;
