import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to authenticate with existing token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('imovies_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
      }
      throw new Error(res.data?.message || 'Login failed');
    } catch (err) {
      // If server is unreachable, allow seamless simulated session for portfolio showcase
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const role = (email.toLowerCase().includes('admin') || password === 'admin123') ? 'admin' : 'user';
        const mockUser = {
          _id: role === 'admin' ? 'user_admin_001' : 'user_shopper_002',
          name: role === 'admin' ? 'Operations Admin' : (email.split('@')[0] || 'Movie Lover'),
          email,
          role,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        };
        const mockToken = 'imovies_session_token_' + Date.now();
        localStorage.setItem('imovies_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        return mockUser;
      }
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await authService.register({ name, email, password, phone });
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('imovies_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
      }
      throw new Error(res.data?.message || 'Registration failed');
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const mockUser = {
          _id: 'user_new_' + Date.now(),
          name,
          email,
          role: 'user',
          phone,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        };
        const mockToken = 'imovies_session_token_' + Date.now();
        localStorage.setItem('imovies_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        return mockUser;
      }
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const demoLogin = async (role = 'user') => {
    const credentials =
      role === 'admin'
        ? { email: 'admin@imovies.com', password: 'admin123' }
        : { email: 'user@imovies.com', password: 'user123' };

    return await login(credentials.email, credentials.password);
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        demoLogin,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
