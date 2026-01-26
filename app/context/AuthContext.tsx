"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { PGAdmin, User } from "../../types";
import { authAPI } from "../../services/api";

/* -------------------- HELPERS -------------------- */

const setAuthData = (
  userType: "admin" | "user",
  userData: PGAdmin | User,
  token: string,
) => {
  const authData = {
    userType,
    token,
    user: userData,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem("authData", JSON.stringify(authData));
  localStorage.setItem("token", token);
};

const getAuthData = () => {
  try {
    const data = localStorage.getItem("authData");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const clearAuthData = () => {
  localStorage.removeItem("authData");
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

/* -------------------- CONTEXT TYPE -------------------- */

interface AuthContextType {
  currentAdmin: PGAdmin | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;

  loginAdmin: (email: string, password: string) => Promise<boolean>;
  loginUser: (email: string, password: string) => Promise<boolean>;

  registerAdmin: (admin: Omit<PGAdmin, "id">) => Promise<boolean>;
  registerUser: (user: Omit<User, "id">) => Promise<boolean>;

  sendMobileOtp: (mobile: string) => Promise<void>;
  verifyMobileOtp: (mobile: string, otp: string) => Promise<boolean>;

  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;

  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authData = getAuthData();
    if (authData?.userType === "admin") {
      setCurrentAdmin(authData.user);
    }
    if (authData?.userType === "user") {
      setCurrentUser(authData.user);
    }
  }, []);

  const clearError = () => setError(null);

  /* -------------------- LOGIN -------------------- */

  const loginAdmin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.adminLogin(email, password);

      // Store token and admin data
      localStorage.setItem("token", response.token || "admin-token");
      setCurrentAdmin(response);
      setCurrentUser(null);

      setAuthData("admin", response, response.token || "admin-token");
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.adminLogin(email, password); // Note: Using admin login for now, will need user login API

      // Store token and user data
      localStorage.setItem("token", response.token || "user-token");
      setCurrentUser(response);
      setCurrentAdmin(null);

      setAuthData("user", response, response.token || "user-token");
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- OTP LOGIC -------------------- */

  const sendMobileOtp = async (mobile: string) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.sendMobileOtp(mobile);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async (
    mobile: string,
    otp: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.verifyMobileOtp(mobile, otp);
      return true;
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.sendEmailOtp(email);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (
    email: string,
    otp: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.verifyEmailOtp(email, otp);
      return true;
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- REGISTER -------------------- */

  const registerAdmin = async (
    adminData: Omit<PGAdmin, "id">,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.adminRegister({
        pgName: adminData.pgName,
        ownerName: adminData.ownerName,
        email: adminData.email,
        mobile: adminData.mobile,
        password: adminData.password,
        address: adminData.address,
      });

      // Store token and admin data
      localStorage.setItem("token", response.token || "admin-token");
      setCurrentAdmin(response);
      setCurrentUser(null);

      setAuthData("admin", response, response.token || "admin-token");
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: Omit<User, "id">): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Note: User registration API not implemented yet
      setError("User registration not available yet");
      return false;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- LOGOUT -------------------- */

  const logout = () => {
    authAPI.logout();
    setCurrentAdmin(null);
    setCurrentUser(null);
    clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        currentUser,
        loading,
        error,
        loginAdmin,
        loginUser,
        registerAdmin,
        registerUser,
        sendMobileOtp,
        verifyMobileOtp,
        sendEmailOtp,
        verifyEmailOtp,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
