import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Architect' | 'Construction Manager' | 'Facility Manager';
  isDemo: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: string) => void;
  continueAsDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('asas_user');
    return saved ? JSON.parse(saved) : {
      id: 'demo-user-01',
      name: 'Arch. Alex Morgan',
      email: 'alex.morgan@asas-studio.com',
      role: 'Architect',
      isDemo: true,
    };
  });

  const login = (email: string, role: string = 'Architect') => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role: role as any,
      isDemo: false,
    };
    setUser(newUser);
    localStorage.setItem('asas_user', JSON.stringify(newUser));
  };

  const continueAsDemo = () => {
    const demoUser: User = {
      id: 'demo-user-01',
      name: 'Arch. Alex Morgan',
      email: 'alex.morgan@asas-studio.com',
      role: 'Architect',
      isDemo: true,
    };
    setUser(demoUser);
    localStorage.setItem('asas_user', JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('asas_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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
