'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PGAdmin, User } from '../../types';
import { dummyPGAdmins, dummyUsers } from '../../utils';

interface AuthContextType {
  currentAdmin: PGAdmin | null;
  currentUser: User | null;
  loginAdmin: (email: string, password: string) => boolean;
  loginUser: (email: string, password: string) => boolean;
  registerAdmin: (admin: Omit<PGAdmin, 'id'>) => void;
  registerUser: (user: Omit<User, 'id'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<PGAdmin | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admins, setAdmins] = useState<PGAdmin[]>(dummyPGAdmins);
  const [users, setUsers] = useState<User[]>(dummyUsers);

  const loginAdmin = (email: string, password: string): boolean => {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
      setCurrentAdmin(admin);
      setCurrentUser(null);
      return true;
    }
    return false;
  };

  const loginUser = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentAdmin(null);
      return true;
    }
    return false;
  };

  const registerAdmin = (adminData: Omit<PGAdmin, 'id'>) => {
    const newAdmin: PGAdmin = { ...adminData, id: `admin${admins.length + 1}` };
    setAdmins([...admins, newAdmin]);
    setCurrentAdmin(newAdmin);
  };

  const registerUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `user${users.length + 1}` };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentAdmin(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentAdmin,
      currentUser,
      loginAdmin,
      loginUser,
      registerAdmin,
      registerUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};