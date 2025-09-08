import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useCallback to memoize the function
  const fetchCurrentUser = useCallback(async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);  // No dependencies needed here

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);  // Add fetchCurrentUser as a dependency

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName, role) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        fullName,
        role
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
