<<<<<<< HEAD
import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  clearAuthUser,
  clearAuthToken,
  getAuthUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setAuthUser,
} from '../services/authService';

type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id?: number | string;
  name: string;
  email: string;
  role: UserRole;
=======
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
>>>>>>> chantrea/feature-customer
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

<<<<<<< HEAD
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
  login: (payload: LoginPayload) => Promise<{ user: User; nextView: string }>;
  register: (payload: RegisterPayload) => Promise<{ user: User; nextView: string }>;
  logout: () => Promise<void>;
=======
interface AuthContextType {
  user: User | null;
  login: (email: string, role: User['role'], initialData?: Partial<User>) => void;
  logout: () => void;
>>>>>>> chantrea/feature-customer
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
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

  const login = async (payload: LoginPayload) => {
    const data = await loginRequest(payload);
    const nextUser = mapApiUserToContextUser(data?.user);
    if (!nextUser) {
      clearAuthToken();
      clearAuthUser();
      const error: any = new Error('Invalid account role');
      error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
      throw error;
    }
    setUser(nextUser);
    return { user: nextUser, nextView: data?.next_view ?? 'customer-dashboard' };
  };

  const register = async (payload: RegisterPayload) => {
    const data = await registerRequest(payload);
    const nextUser = mapApiUserToContextUser(data?.user);
    if (!nextUser) {
      clearAuthToken();
      clearAuthUser();
      const error: any = new Error('Invalid account role');
      error.data = { message: 'Invalid account role. Allowed roles: admin, customer, owner.' };
      throw error;
    }
    setUser(nextUser);
    return { user: nextUser, nextView: data?.next_view ?? 'customer-dashboard' };
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      clearAuthToken();
      clearAuthUser();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return null;
      }

      const nextUser = { ...prev, ...updates };
      setAuthUser(nextUser);
      return nextUser;
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      login,
      register,
      logout,
      updateUser,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
=======
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: User['role'], initialData?: Partial<User>) => {
    setUser({
      name: initialData?.name || email.split('@')[0],
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      ...initialData
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
>>>>>>> chantrea/feature-customer
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
