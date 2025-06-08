import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  // Add other user properties as needed based on your backend User model
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage or session)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error responses from backend
      if (error.response?.data?.error) {
        return { success: false, error: error.response.data.error };
      } else if (error.response?.status === 401) {
        return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
      } else if (error.response?.status === 400) {
        return { success: false, error: 'Please fill in all required fields.' };
      } else {
        return { success: false, error: 'Login failed. Please try again later.' };
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const newUser = response.data;
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific error responses from backend
      if (error.response?.data?.error) {
        return { success: false, error: error.response.data.error };
      } else if (error.response?.status === 409) {
        return { success: false, error: 'An account with this email already exists. Please use a different email or try logging in.' };
      } else if (error.response?.status === 400) {
        return { success: false, error: 'Please fill in all required fields correctly.' };
      } else {
        return { success: false, error: 'Registration failed. Please try again later.' };
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 