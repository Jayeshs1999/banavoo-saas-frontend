"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../../types";
import { authAPI } from "../../services/api";

// ─── Storage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "authData";

const persistAuth = (user: User, token: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  localStorage.setItem("token", token);
};

const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("token");
};

const loadAuth = (): { user: User; token: string } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Context type ─────────────────────────────────────────────────────────

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
  }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const saved = loadAuth();
    if (saved) {
      setCurrentUser(saved.user);
      setToken(saved.token);
    }
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(email, password);
      setCurrentUser(res.user ?? res);
      setToken(res.token);
      persistAuth(res.user ?? res, res.token);
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(payload);
      setCurrentUser(res.user ?? res);
      setToken(res.token);
      persistAuth(res.user ?? res, res.token);
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setToken(null);
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
