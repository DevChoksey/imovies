import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, HAS_REACHABLE_BACKEND } from '../services/api';

const AuthContext = createContext();

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
const LOCAL_TOKEN_PREFIX = 'imovies_session_token_';
const STORAGE_KEYS = {
  TOKEN: 'imovies_token',
  USER: 'imovies_user',
  LOCAL_ACCOUNTS: 'imovies_local_accounts',
};

const readStoredJson = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to persist ${key}:`, err);
  }
};

const isNetworkFailure = (err) =>
  !err?.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredJson(STORAGE_KEYS.USER));
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((userData, sessionToken) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, sessionToken);
    } catch (_) {}
    writeStoredJson(STORAGE_KEYS.USER, userData);
    setUser(userData);
    setToken(sessionToken);
    return userData;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (_) {}
    setToken(null);
    setUser(null);
  }, []);

  // Verify existing session on mount or token change without wiping local/offline sessions
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      const cachedUser = readStoredJson(STORAGE_KEYS.USER);

      // Local session tokens (created on Vercel or offline) do not exist on remote backend
      if (token.startsWith(LOCAL_TOKEN_PREFIX) || !HAS_REACHABLE_BACKEND) {
        if (isMounted) {
          if (cachedUser) {
            setUser(cachedUser);
          } else {
            logout();
          }
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authService.getMe();
        if (isMounted && res.data?.success) {
          writeStoredJson(STORAGE_KEYS.USER, res.data.user);
          setUser(res.data.user);
        }
      } catch (err) {
        if (!isMounted) return;
        // Force logout only when server explicitly rejects the token
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
        } else if (cachedUser) {
          setUser(cachedUser);
        } else {
          logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  const loginLocalAccount = (email, password) => {
    const trimmedEmail = (email || '').trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    const accounts = readStoredJson(STORAGE_KEYS.LOCAL_ACCOUNTS, {});
    const existing = accounts[normalizedEmail];

    if (existing) {
      if (existing.password && existing.password !== password) {
        throw new Error('Invalid email or password');
      }
      const { password: _ignored, ...safeUser } = existing;
      return persistSession(safeUser, `${LOCAL_TOKEN_PREFIX}${Date.now()}`);
    }

    const role = normalizedEmail.includes('admin') || password === 'admin123' ? 'admin' : 'user';
    const mockUser = {
      _id: role === 'admin' ? 'user_admin_001' : `user_demo_${Date.now()}`,
      name: role === 'admin' ? 'Operations Admin' : trimmedEmail.split('@')[0] || 'Movie Lover',
      email: trimmedEmail,
      role,
      avatar: DEFAULT_AVATAR,
    };
    return persistSession(mockUser, `${LOCAL_TOKEN_PREFIX}${Date.now()}`);
  };

  const registerLocalAccount = (name, email, password, phone) => {
    const trimmedEmail = (email || '').trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    const trimmedName = (name || '').trim() || normalizedEmail.split('@')[0] || 'Movie Lover';
    const accounts = readStoredJson(STORAGE_KEYS.LOCAL_ACCOUNTS, {});
    const existing = accounts[normalizedEmail];

    const newUser = {
      _id: existing?._id || `user_new_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: 'user',
      phone: (phone || '').trim(),
      avatar: DEFAULT_AVATAR,
    };

    accounts[normalizedEmail] = { ...newUser, password };
    writeStoredJson(STORAGE_KEYS.LOCAL_ACCOUNTS, accounts);
    return persistSession(newUser, `${LOCAL_TOKEN_PREFIX}${Date.now()}`);
  };

  const executeAuthAction = async (remoteCall, localFallback, fallbackError) => {
    if (!HAS_REACHABLE_BACKEND) {
      return localFallback();
    }

    try {
      const res = await remoteCall();
      if (res.data?.success) {
        const { token: newToken, user: userData } = res.data;
        return persistSession(userData, newToken);
      }
      throw new Error(res.data?.message || fallbackError);
    } catch (err) {
      if (isNetworkFailure(err)) {
        return localFallback();
      }
      throw new Error(err.response?.data?.message || err.message || fallbackError);
    }
  };

  const login = (email, password) =>
    executeAuthAction(
      () => authService.login({ email, password }),
      () => loginLocalAccount(email, password),
      'Login failed'
    );

  const register = (name, email, password, phone) =>
    executeAuthAction(
      () => authService.register({ name, email, password, phone }),
      () => registerLocalAccount(name, email, password, phone),
      'Registration failed'
    );

  const demoLogin = async (role = 'user') => {
    const credentials =
      role === 'admin'
        ? { email: 'admin@imovies.com', password: 'admin123' }
        : { email: 'user@imovies.com', password: 'user123' };

    return await login(credentials.email, credentials.password);
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
