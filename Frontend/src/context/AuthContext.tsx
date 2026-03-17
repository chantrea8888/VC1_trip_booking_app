import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType, ApiUser } from '../types';

// Helper function to convert API user to frontend user
const convertApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role === 'customer' ? 'Customer' : 
        apiUser.role === 'owner' ? 'Owner' : 
        apiUser.role === 'admin' ? 'Admin' : 'User',
  status: 'Active',
  joinedDate: new Date(apiUser.created_at).toLocaleDateString(),
  avatar: undefined,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      authService.getCurrentUser(storedToken)
        .then(({ user }) => {
          const frontendUser = convertApiUserToUser(user);
          setUser(frontendUser);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: 'customer' | 'owner' | 'admin'): Promise<{ next_view: string }> => {
    try {
      console.log('AuthContext: Starting login process');
      const response = await authService.login({ email, password, role });
      console.log('AuthContext: Login successful, storing token');
      setToken(response.access_token);
      localStorage.setItem('auth_token', response.access_token);
      console.log('AuthContext: Setting user data');
      const frontendUser = convertApiUserToUser(response.user);
      setUser({
        ...frontendUser,
        avatar: `https://api.dicebear.com/7.x/avataars/svg?seed=${email}`,
      });
      console.log('AuthContext: Login complete, returning next_view:', response.next_view);
      return { next_view: response.next_view };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role?: 'customer' | 'owner'): Promise<{ next_view: string }> => {
    try {
      console.log('AuthContext: Starting register process');
      const response = await authService.register({ name, email, password, password_confirmation: password, role });
      console.log('AuthContext: Register successful, storing token');
      setToken(response.access_token);
      localStorage.setItem('auth_token', response.access_token);
      console.log('AuthContext: Setting user data');
      const frontendUser = convertApiUserToUser(response.user);
      setUser({
        ...frontendUser,
        avatar: `https://api.dicebear.com/7.x/avataars/svg?seed=${email}`,
      });
      console.log('AuthContext: Register complete, returning next_view:', response.next_view);
      return { next_view: response.next_view };
    } catch (error) {
      console.error('AuthContext: Register failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isLoading
    }}>
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