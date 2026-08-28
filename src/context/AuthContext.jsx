// src/context/AuthContext.jsx
// Provides login/register/logout state to the entire app.
// Any component can call useAuth() to get the current user or auth functions.

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Create the context (this is what other components will consume)
const AuthContext = createContext();

// Custom hook — instead of writing useContext(AuthContext) everywhere,
// components just call useAuth()
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // Try to load the user from localStorage on first render
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Show a loading state while we verify the token with the server
  const [loading, setLoading] = useState(true);

  // On app load, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        const freshUser = res.data.data;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token is invalid or expired — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Log in with email and password
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Create a new account
  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Log out — clear token and user from storage
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update local user state (e.g. after profile update)
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
