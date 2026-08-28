// src/api/axios.js
// A pre-configured Axios instance used for all API calls in the app.
//
// What this does:
// 1. Sets the base URL so we don't repeat it in every fetch call
// 2. Automatically attaches the user's JWT token to every request
// 3. Redirects to login if the server returns a 401 (unauthorized) error

import axios from 'axios';

const api = axios.create({
  // In production, use the VITE_API_URL env var. In dev, Vite proxy handles /api.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Before every request: attach the JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if 401, the token has expired — send user to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
