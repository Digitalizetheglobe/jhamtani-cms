import axios from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Admin Registration
export const registerAdmin = async (adminData) => {
  try {
    const response = await api.post('/api/auth/register', adminData);
    return response.data;
  } catch (error) {
    // Handle different error structures
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.message) {
      throw { message: error.message, success: false };
    } else {
      throw { message: 'Registration failed. Please check your network connection.', success: false };
    }
  }
};

// Admin Login
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Handle different error structures
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.message) {
      throw { message: error.message, success: false };
    } else {
      throw { message: 'Login failed. Please check your network connection.', success: false };
    }
  }
};

// Get Current Admin
export const getCurrentAdmin = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get admin info' };
  }
};

// Logout (client-side only)
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
};

// Check if admin is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

// Get stored admin data
export const getStoredAdmin = () => {
  const admin = localStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
};

export default api;

