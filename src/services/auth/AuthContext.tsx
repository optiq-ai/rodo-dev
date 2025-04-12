import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message || 'Authentication failed');
        // Clear invalid auth data
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AuthService.login(username, password);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.error?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role || currentUser.role === 'admin';
  };

  // Check if user has specific permission
  const hasPermission = (resource, action) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    
    return currentUser.permissions?.includes(`${resource}:${action}`) || 
           currentUser.permissions?.includes(`${resource}:all`) ||
           currentUser.permissions?.includes('*:*');
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
