import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  getAuthUser,
  getAuthToken,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setAuthUser,
  authService,
} from '../services/authService';
import { clearApiAuthToken, setApiAuthToken } from '../services/api';

type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id?: number | string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'customer' | 'owner';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<{ user: User; nextView: string; token: string }>;
  register: (payload: RegisterPayload) => Promise<{ user: User; nextView: string; token: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: unknown): UserRole | null => {
  const value = String(role ?? '').toLowerCase();
  if (value === 'admin' || value === 'owner' || value === 'customer') {
    return value;
  }
  return null;
};

const mapApiUserToContextUser = (apiUser: any): User | null => {
  if (!apiUser) {
    return null;
  }

  const normalizedRole = normalizeRole(apiUser.role);
  if (!normalizedRole) {
    return null;
  }

  return {
    id: apiUser.id,
    name: apiUser.name ?? apiUser.email?.split('@')?.[0] ?? 'User',
    email: apiUser.email ?? '',
    role: normalizedRole,
    avatar: apiUser.avatar,
    phone: apiUser.phone,
    location: apiUser.location,
    bio: apiUser.bio,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => mapApiUserToContextUser(getAuthUser()));
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  useEffect(() => {
    if (token) {
      setApiAuthToken(token);
    } else {
      clearApiAuthToken();
    }
  }, [token]);

  // Debug log on mount and when auth state changes
  useEffect(() => {
    console.log('🔍 AuthProvider initialized');
    console.log('📦 Token from storage:', getAuthToken());
    console.log('👤 User from storage:', getAuthUser());
    console.log('🔑 isAuthenticated:', !!getAuthToken());
  }, []);

  useEffect(() => {
    console.log('🔄 Auth state changed:', { 
      user: user?.email, 
      role: user?.role, 
      token: token ? 'exists' : 'null',
      isAuthenticated: !!token && !!user
    });
  }, [user, token]);

  const login = async (payload: LoginPayload) => {
    console.log('📡 Login attempt for:', payload.email);
    
    try {
      const data = await loginRequest(payload);
      
      console.log('📡 Login response:', data);
      
      // Get token from response (your API uses access_token)
      const responseToken = data?.access_token;
      
      if (responseToken) {
        console.log('✅ Token received and stored');
        setToken(responseToken);
      } else {
        console.warn('⚠️ No token in response');
      }
      
      const nextUser = mapApiUserToContextUser(data?.user);
      if (!nextUser) {
        console.error('❌ Invalid user role');
        const error: any = new Error('Invalid account role');
        error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
        throw error;
      }
      
      setUser(nextUser);
      
      console.log('✅ Login successful:', {
        user: nextUser,
        role: nextUser.role,
        token: responseToken ? 'exists' : 'missing',
        nextView: data?.next_view
      });
      
      return { 
        user: nextUser, 
        nextView: data?.next_view ?? 'customer-dashboard',
        token: responseToken 
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      // If login fails, clear any stale local session to avoid confusing UX.
      try {
        authService.clearAuthToken();
        authService.clearAuthUser();
      } catch {
        // ignore
      }
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  const register = async (payload: RegisterPayload) => {
    console.log('📡 Register attempt for:', payload.email);
    
    try {
      const data = await registerRequest(payload);
      
      console.log('📡 Register response:', data);
      
      const responseToken = data?.access_token;
      
      if (responseToken) {
        console.log('✅ Token received and stored');
        setToken(responseToken);
      }
      
      const nextUser = mapApiUserToContextUser(data?.user);
      if (!nextUser) {
        console.error('❌ Invalid user role');
        const error: any = new Error('Invalid account role');
        error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
        throw error;
      }
      
      setUser(nextUser);
      
      console.log('✅ Register successful:', {
        user: nextUser,
        role: nextUser.role,
        nextView: data?.next_view
      });
      
      return { 
        user: nextUser, 
        nextView: data?.next_view ?? 'customer-dashboard',
        token: responseToken 
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('👋 Logging out');
    try {
      await logoutRequest();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      // authService.logout already clears storage
      console.log('✅ Logged out successfully');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return null;
      }

      const nextUser = { ...prev, ...updates };
      authService.setAuthUser(nextUser);
      console.log('📝 User updated:', nextUser);
      return nextUser;
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!token && !!user,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

