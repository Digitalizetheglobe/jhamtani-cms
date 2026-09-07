import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAdmin, registerAdmin, getCurrentAdmin, logoutAdmin, isAuthenticated, getStoredAdmin } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const storedAdmin = getStoredAdmin();
          if (storedAdmin) {
            // Verify token is still valid
            try {
              const response = await getCurrentAdmin();
              if (response.success) {
                setAdmin(response.data);
                localStorage.setItem('admin', JSON.stringify(response.data));
              } else {
                logoutAdmin();
                setAdmin(null);
              }
            } catch (err) {
              logoutAdmin();
              setAdmin(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        logoutAdmin();
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginAdmin({ email, password });
      
      if (response && response.success) {
        const adminData = response.data;
        if (adminData && adminData.token) {
          localStorage.setItem('adminToken', adminData.token);
          localStorage.setItem('admin', JSON.stringify(adminData));
          setAdmin(adminData);
          return { success: true };
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        const errorMsg = response?.message || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Login error:', err);
      // Handle different error formats
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerAdmin({ name, email, password });
      
      if (response.success) {
        const adminData = response.data;
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('admin', JSON.stringify(adminData));
        setAdmin(adminData);
        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutAdmin();
    setAdmin(null);
    setError(null);
  };

  const value = {
    admin,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;

