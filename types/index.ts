// ─── Global Types — Banavoo SaaS ───────────────────────────────────────────

/**
 * Store shape returned from /api/stores and embedded in User (for sellers).
 */
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  city?: string;
  state?: string;
  pickupPincode?: string;
  status: "draft" | "active" | "suspended" | "closed";
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  logo?: { url: string; publicId: string } | null;
  banner?: { url: string; publicId: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

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
  /** Present when role === "seller" */
  store?: { id: string; name: string; slug: string; status: string } | null;
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
