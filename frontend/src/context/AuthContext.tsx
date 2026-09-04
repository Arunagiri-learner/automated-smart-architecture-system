import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  continueAsDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Session Initialization on Mount
  useEffect(() => {
    const initAuth = async () => {
      const isDemoFlag = localStorage.getItem('asas_is_demo');
      const token = localStorage.getItem('asas_token');

      if (isDemoFlag === 'true') {
        const demoUser: IUser = {
          id: 'demo-user-01',
          name: 'Arch. Alex Morgan',
          email: 'alex.morgan@asas-studio.com',
          role: 'Architect',
          isDemo: true,
        };
        setUser(demoUser);
        setIsLoading(false);
        return;
      }

      if (token) {
        try {
          const data = await api.getMe();
          setUser({ ...data.user, isDemo: false });
        } catch (err) {
          console.warn('Invalid token session, resetting to logged out state:', err);
          localStorage.removeItem('asas_token');
          localStorage.removeItem('asas_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      const authenticatedUser: IUser = {
        ...data.user,
        isDemo: false,
      };
      localStorage.setItem('asas_token', data.token);
      localStorage.setItem('asas_user', JSON.stringify(authenticatedUser));
      localStorage.removeItem('asas_is_demo');
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'Architect') => {
    setIsLoading(true);
    try {
      const data = await api.register({ name, email, password, role });
      const newUser: IUser = {
        ...data.user,
        isDemo: false,
      };
      localStorage.setItem('asas_token', data.token);
      localStorage.setItem('asas_user', JSON.stringify(newUser));
      localStorage.removeItem('asas_is_demo');
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsDemo = () => {
    const demoUser: IUser = {
      id: 'demo-user-01',
      name: 'Arch. Alex Morgan',
      email: 'alex.morgan@asas-studio.com',
      role: 'Architect',
      isDemo: true,
    };
    setUser(demoUser);
    localStorage.setItem('asas_is_demo', 'true');
    localStorage.setItem('asas_user', JSON.stringify(demoUser));
    localStorage.removeItem('asas_token');
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem('asas_token');
    localStorage.removeItem('asas_user');
    localStorage.removeItem('asas_is_demo');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isDemo: !!user?.isDemo,
        isLoading,
        login,
        register,
        continueAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
