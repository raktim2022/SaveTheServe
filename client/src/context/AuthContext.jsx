'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken, getUser, setUser as saveUser, isTokenExpired } from '@/lib/auth';
import { getDashboardRoute } from '@/utils/permissions';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getToken();
    const userData = getUser();

    if (token && userData && !isTokenExpired(token)) {
      setUser(userData);
    } else {
      removeToken();
    }
    
    setLoading(false);
  }, []);

  const login = async (token, userData) => {
    setToken(token);
    saveUser(userData);
    setUser(userData);
    
    // Redirect to appropriate dashboard
    const dashboardRoute = getDashboardRoute(userData);
    router.push(dashboardRoute);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (userData) => {
    saveUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

