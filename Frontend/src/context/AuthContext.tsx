import React, { createContext, useContext, useState } from 'react';

export interface User {
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: User['role'], initialData?: Partial<User>) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: User['role'], initialData?: Partial<User>) => {
    setUser({
      name: initialData?.name || email.split('@')[0],
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataars/svg?seed=${email}`,
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
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};