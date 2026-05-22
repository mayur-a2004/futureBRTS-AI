// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { localStorage } from './utils';

interface AuthContextProps {
  children: React.ReactNode;
}

interface AuthContextValue {
  user: any;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthProvider = ({ children }: AuthContextProps) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string) => {
    const mockUsers = [
      { id: 1, email: 'john.doe@example.com', password: 'password123' },
      { id: 2, email: 'jane.doe@example.com', password: 'password123' },
    ];

    const foundUser = mockUsers.find((user) => user.email === email && user.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = (email: string, password: string) => {
    const mockUsers = [
      { id: 1, email: 'john.doe@example.com', password: 'password123' },
      { id: 2, email: 'jane.doe@example.com', password: 'password123' },
    ];

    const newUser = { id: mockUsers.length + 1, email, password };
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };