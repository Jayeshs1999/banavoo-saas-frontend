// ─── Global Types — Banavoo SaaS ───────────────────────────────────────────

/**
 * Authenticated user shape returned from /api/auth/me and login.
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  emailVerified: boolean;
  role: "buyer" | "seller" | "admin";
  status: "active" | "suspended";
  lastLoginAt?: string | null;
  createdAt?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Registration payload
 */
export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

/**
 * Registration response data
 */
export interface RegisterData {
  email: string;
  requiresEmailVerification: boolean;
}
