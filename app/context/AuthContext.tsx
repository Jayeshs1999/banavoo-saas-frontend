'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PGAdmin, User } from '../../types';
import { dummyPGAdmins, dummyUsers } from '../../utils';

// Helper function to set auth in localStorage
const setAuthData = (userType: 'admin' | 'user', userData: PGAdmin | User) => {
  const authData = {
    userType,
    token: Date.now().toString(),
    user: userData,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem('authData', JSON.stringify(authData));
  // Also set a minimal cookie for middleware
  document.cookie = `authToken=${authData.token};path=/;max-age=${7 * 24 * 60 * 60}`;
  document.cookie = `userType=${userType};path=/;max-age=${7 * 24 * 60 * 60}`;
};

// Helper function to get auth data from localStorage
const getAuthData = () => {
  try {
    const data = localStorage.getItem('authData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('authData');
  document.cookie = 'authToken=;path=/;max-age=0';
  document.cookie = 'userType=;path=/;max-age=0';
};

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

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      if (authData.userType === 'admin') {
        setCurrentAdmin(authData.user);
      } else if (authData.userType === 'user') {
        setCurrentUser(authData.user);
      }
    }
  }, []);

  const loginAdmin = (email: string, password: string): boolean => {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
      setCurrentAdmin(admin);
      setCurrentUser(null);
      setAuthData('admin', admin);
      return true;
    }
    return false;
  };

  const loginUser = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentAdmin(null);
      setAuthData('user', user);
      return true;
    }
    return false;
  };

  const registerAdmin = (adminData: Omit<PGAdmin, 'id'>) => {
    const newAdmin: PGAdmin = { ...adminData, id: `admin${admins.length + 1}` };
    setAdmins([...admins, newAdmin]);
    setCurrentAdmin(newAdmin);
    setAuthData('admin', newAdmin);
  };

  const registerUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `user${users.length + 1}` };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setAuthData('user', newUser);
  };

  const logout = () => {
    setCurrentAdmin(null);
    setCurrentUser(null);
    clearAuthData();
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