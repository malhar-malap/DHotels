import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    let lastChecked = Date.now();

    const handleInteraction = async () => {
      const now = Date.now();
      // Only check once every 15 seconds to avoid spamming the server
      if (now - lastChecked > 15000) {
        lastChecked = now;
        try {
          const res = await authAPI.getCurrentUser();
          if (res.data?.data) {
            const freshUser = res.data.data;
            if (freshUser.status === 'SUSPENDED') {
              toast.error("Your account has been suspended. For more info contact us.");
              logout();
            }
          }
        } catch (err) {
          // If 401/unauthorized or status check fails, auto logout is managed by interceptors
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('focus', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('focus', handleInteraction);
    };
  }, [user]);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Safeguard against 'Mayank' or invalid sessions
        if (parsedUser.fullName === 'Mayank' || !parsedUser.email) {
          logout();
          return;
        }
        
        // Set immediately for fast UI load
        setUser(parsedUser);

        // Silently fetch the absolute latest user data (roles, etc.) from the backend
        try {
          const res = await authAPI.getCurrentUser();
          if (res.data?.data) {
            const freshUser = res.data.data;
            if (freshUser.status === 'SUSPENDED') {
                toast.error("Your account has been suspended. For more info contact us.");
                logout();
                return;
            }
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (fetchErr) {
          console.error("Silent auth sync failed:", fetchErr);
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const sendOtp = async (email) => {
    try {
      await authAPI.sendOtp(email);
      toast.success('Verification code sent to your email!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code';
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyOtpAndRegister = async (registrationData) => {
    try {
      const response = await authAPI.verifyOtpRegister(registrationData);
      const { accessToken, refreshToken, user: newUser } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      toast.success('Email verified and registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed. Please check the code.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    sendOtp,
    verifyOtpAndRegister,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


