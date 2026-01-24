'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { PGAdmin, User } from '../../types';
import { dummyPGAdmins, dummyUsers } from '../../utils';

/* -------------------- HELPERS -------------------- */

const setAuthData = (userType: 'admin' | 'user', userData: PGAdmin | User) => {
  const authData = {
    userType,
    token: Date.now().toString(),
    user: userData,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem('authData', JSON.stringify(authData));
  document.cookie = `authToken=${authData.token};path=/;max-age=${7 * 24 * 60 * 60}`;
  document.cookie = `userType=${userType};path=/;max-age=${7 * 24 * 60 * 60}`;
};

const getAuthData = () => {
  try {
    const data = localStorage.getItem('authData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const clearAuthData = () => {
  localStorage.removeItem('authData');
  document.cookie = 'authToken=;path=/;max-age=0';
  document.cookie = 'userType=;path=/;max-age=0';
};

/* -------------------- CONTEXT TYPE -------------------- */

interface AuthContextType {
  currentAdmin: PGAdmin | null;
  currentUser: User | null;

  loginAdmin: (email: string, password: string) => boolean;
  loginUser: (email: string, password: string) => boolean;

  registerAdmin: (admin: Omit<PGAdmin, 'id'>) => void;
  registerUser: (user: Omit<User, 'id'>) => void;

  sendMobileOtp: (mobile: string) => Promise<void>;
  verifyMobileOtp: (mobile: string, otp: string) => Promise<boolean>;

  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;

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

/* -------------------- PROVIDER -------------------- */

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<PGAdmin | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [admins, setAdmins] = useState<PGAdmin[]>(dummyPGAdmins);
  const [users, setUsers] = useState<User[]>(dummyUsers);

  // TEMP OTP STORES (keyed by mobile/email)
  const [mobileOtps, setMobileOtps] = useState<Record<string, string>>({});
  const [emailOtps, setEmailOtps] = useState<Record<string, string>>({});

  useEffect(() => {
    const authData = getAuthData();
    if (authData?.userType === 'admin') {
      setCurrentAdmin(authData.user);
    }
    if (authData?.userType === 'user') {
      setCurrentUser(authData.user);
    }
  }, []);

  /* -------------------- LOGIN -------------------- */

  const loginAdmin = (email: string, password: string): boolean => {
    const admin = admins.find(
      a => a.email === email && a.password === password
    );
    if (!admin) return false;

    setCurrentAdmin(admin);
    setCurrentUser(null);
    setAuthData('admin', admin);
    return true;
  };

  const loginUser = (email: string, password: string): boolean => {
    const user = users.find(
      u => u.email === email && u.password === password
    );
    if (!user) return false;

    setCurrentUser(user);
    setCurrentAdmin(null);
    setAuthData('user', user);
    return true;
  };

  /* -------------------- OTP LOGIC -------------------- */

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const sendMobileOtp = async (mobile: string) => {
    const otp = generateOtp();
    setMobileOtps(prev => ({ ...prev, [mobile]: otp }));
    console.log('Mobile OTP (dev only):', otp);
  };

  const verifyMobileOtp = async (mobile: string, otp: string) => {
    const valid = mobileOtps[mobile] === otp;
    if (valid) {
      const { [mobile]: _, ...rest } = mobileOtps;
      setMobileOtps(rest);
    }
    return valid;
  };

  const sendEmailOtp = async (email: string) => {
    const otp = generateOtp();
    setEmailOtps(prev => ({ ...prev, [email]: otp }));
    console.log('Email OTP (dev only):', otp);
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    const valid = emailOtps[email] === otp;
    if (valid) {
      const { [email]: _, ...rest } = emailOtps;
      setEmailOtps(rest);
    }
    return valid;
  };

  /* -------------------- REGISTER -------------------- */

  const registerAdmin = (adminData: Omit<PGAdmin, 'id'>) => {
    const newAdmin: PGAdmin = {
      ...adminData,
      id: `admin${admins.length + 1}`,
    };
    setAdmins(prev => [...prev, newAdmin]);
    setCurrentAdmin(newAdmin);
    setAuthData('admin', newAdmin);
  };

  const registerUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user${users.length + 1}`,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthData('user', newUser);
  };

  /* -------------------- LOGOUT -------------------- */

  const logout = () => {
    setCurrentAdmin(null);
    setCurrentUser(null);
    clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        currentUser,
        loginAdmin,
        loginUser,
        registerAdmin,
        registerUser,
        sendMobileOtp,
        verifyMobileOtp,
        sendEmailOtp,
        verifyEmailOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
