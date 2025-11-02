import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Khởi tạo - kiểm tra token khi app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);  // ✅ Set true nếu có token
        setError(null);
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  // Đăng ký tài khoản mới
  const register = async (username, email, password, confirmPassword) => {
    try {
      setError(null);
      
      if (!username || !email || !password) {
        setError('All fields are required');
        return { success: false, message: 'All fields are required' };
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return { success: false, message: 'Passwords do not match' };
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      const res = await api.post('/auth/register', { 
        username, 
        email, 
        password 
      });

      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);  // ✅ SET TRUE
      setError(null);
      
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      setIsAuthenticated(false);  // ✅ SET FALSE
      return { success: false, message: errorMsg };
    }
  };

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setError(null);
      
      if (!email || !password) {
        setError('Email and password required');
        return { success: false, message: 'Email and password required' };
      }

      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      console.log('✅ Login response:', { token, user });  // Debug
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);  // ✅ QUAN TRỌNG - SET TRUE
      setError(null);
      
      console.log('✅ Auth state updated:', { isAuthenticated: true, user });  // Debug
      
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      console.error('❌ Login error:', errorMsg);
      setError(errorMsg);
      setIsAuthenticated(false);  // ✅ SET FALSE
      setUser(null);
      return { success: false, message: errorMsg };
    }
  };

  // Đăng xuất
  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);  // ✅ SET FALSE
    setError(null);
  };

  // Cập nhật profile
  const updateProfile = async (userId, profileData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const res = await api.put(`/users/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = res.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setError(null);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Update failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Cập nhật avatar
  const updateAvatar = async (userId, avatarUrl) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const res = await api.patch(`/users/${userId}/avatar`, { avatar: avatarUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = res.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setError(null);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Avatar update failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Đổi mật khẩu
  const changePassword = async (userId, oldPassword, newPassword) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const res = await api.post(`/users/${userId}/change-password`, 
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError(null);
      return { success: true, message: res.data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password change failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Kiểm tra user là admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Lấy token hiện tại
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    isAdmin,
    getToken,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};