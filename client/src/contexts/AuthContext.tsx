import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import { authApi, usersApi } from '../api/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token exists and validate on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('job_tracker_token');
        const storedUser = localStorage.getItem('job_tracker_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('job_tracker_token');
        localStorage.removeItem('job_tracker_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token: newToken, user: newUser } = response;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('job_tracker_token', newToken);
      localStorage.setItem('job_tracker_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('job_tracker_token');
    localStorage.removeItem('job_tracker_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('job_tracker_user', JSON.stringify(updatedUser));
  };

  const checkAuth = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Verify token is still valid by attempting to fetch user data
      // This would be a dedicated endpoint in production
      setIsLoading(false);
    } catch (error) {
      logout();
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
