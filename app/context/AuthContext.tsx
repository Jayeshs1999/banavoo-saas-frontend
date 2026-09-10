"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { User, RegisterPayload } from "../../types";
import { authAPI } from "../../services/api";

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  currentUser: User | null;
  /** True while an auth request is in flight */
  loading: boolean;
  /** True on first mount while we validate the existing session */
  initializing: boolean;
  error: string | null;
  /**
   * Returns { success, email } where email is needed to redirect to /verify-email
   */
  register: (payload: RegisterPayload) => Promise<{ success: boolean; email?: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; code?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading]         = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // On mount: try to restore session from the HTTP-only cookie
  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getMe();
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      } catch {
        // Cookie absent or expired — that's fine
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (
    payload: RegisterPayload
  ): Promise<{ success: boolean; email?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(payload);
      if (res.success) {
        return { success: true, email: res.data?.email };
      }
      setError(res.message || "Registration failed.");
      return { success: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      setError(message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; code?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.data) {
        setCurrentUser(res.data);
        return { success: true };
      }
      setError(res.message || "Login failed.");
      return { success: false };
    } catch (err: unknown) {
      const apiErr = err as Error & { code?: string };
      const message = apiErr.message || "Login failed.";
      setError(message);
      return { success: false, code: apiErr.code };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await authAPI.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        initializing,
        error,
        register,
        login,
        logout,
        clearError,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
