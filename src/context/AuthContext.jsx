import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Start loading until the initial refresh is done

  const refreshAccessToken = useCallback(async () => {
    try {
      const { data } = await api.post('/admin/refresh');
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      setAccessToken(null);
      throw error;
    }
  }, []);

  // On initial app load, try to refresh the token ONCE to restore a session.
  useEffect(() => {
    refreshAccessToken().catch(() => {
      // We expect this to fail if the user doesn't have a valid refresh token.
      // No need to do anything here. The user is simply not logged in.
    }).finally(() => {
      setIsAuthLoading(false);
    });
  }, [refreshAccessToken]);
  
  const login = useCallback((token) => {
    setAccessToken(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } catch (error) {
      console.error("Logout request failed, but clearing token on client-side anyway.", error);
    } finally {
      setAccessToken(null);
    }
  }, []);
  
  const value = {
    accessToken,
    isAuthenticated: !!accessToken,
    isAuthLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 