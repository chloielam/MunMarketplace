import React from 'react';
import { authUtils } from '../services/auth';

const DebugPage = () => {
  const token = authUtils.getToken();
  const isAuth = authUtils.isAuthenticated();
  const userId = authUtils.getUserId();
  
  let decodedToken = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      decodedToken = payload;
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="space-y-4">
        <div>
          <strong>Token exists:</strong> {token ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Is authenticated:</strong> {isAuth ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User ID:</strong> {userId || 'None'}
        </div>
        <div>
          <strong>Token (first 50 chars):</strong> {token ? token.substring(0, 50) + '...' : 'None'}
        </div>
        <div>
          <strong>Decoded token:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(decodedToken, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
