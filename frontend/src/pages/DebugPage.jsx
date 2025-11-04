import React, { useEffect, useState } from 'react';
import { authService, authUtils } from '../services/auth';

const DebugPage = () => {
  const [sessionUser, setSessionUser] = useState(authUtils.getSessionUser());
  const [lastSyncError, setLastSyncError] = useState(null);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const user = await authUtils.refreshSession();
        if (!active) return;
        setSessionUser(user);
        setLastSyncError(null);
      } catch (error) {
        if (!active) return;
        setSessionUser(null);
        setLastSyncError(error.message || 'Failed to refresh session');
      }
    };
    sync();
    return () => { active = false; };
  }, []);

  const handleManualRefresh = async () => {
    try {
      const { user } = await authService.getSession();
      setSessionUser(user || null);
      if (!user) authUtils.clearSession();
      setLastSyncError(null);
    } catch (error) {
      setSessionUser(null);
      authUtils.clearSession();
      setLastSyncError(error.message || 'Failed to refresh session');
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Session Debug</h1>
      <div>
        <strong>Is authenticated:</strong> {authUtils.isAuthenticated() ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>User ID:</strong> {authUtils.getUserId() || 'None'}
      </div>
      <div>
        <strong>Stored session payload:</strong>
        <pre className="bg-gray-100 p-3 rounded text-sm mt-2">
          {JSON.stringify(sessionUser, null, 2)}
        </pre>
      </div>
      {lastSyncError && (
        <div className="text-red-500">
          <strong>Last sync error:</strong> {lastSyncError}
        </div>
      )}
      <button
        onClick={handleManualRefresh}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Refresh Session
      </button>
    </div>
  );
};

export default DebugPage;
