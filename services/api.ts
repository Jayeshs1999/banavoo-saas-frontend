import axios from "axios";
import type { User, RegisterPayload, RegisterData, ApiResponse } from "../types";

// Strip any trailing slash, then append /api so routes can be written as /auth/...
// This handles both NEXT_PUBLIC_API_URL=http://localhost:5000
//                 and NEXT_PUBLIC_API_URL=http://localhost:5000/api
const rawBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const BASE_URL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

/**
 * Axios instance — all API calls go through this.
 * JWT is stored in an HTTP-only cookie set by the backend.
 * withCredentials ensures the browser sends the cookie on every request.
 */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Response interceptor: unwrap errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message = data?.message || error.message || "Request failed";
    // Attach the full error payload so callers can inspect code/errors
    const err: Error & { code?: string; errors?: Record<string, string>; status?: number } =
      new Error(message);
    err.code   = data?.code;
    err.errors = data?.errors;
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────
export const authAPI = {
  /** Register a new account */
  register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterData>> => {
    const { data } = await api.post<ApiResponse<RegisterData>>("/auth/register", payload);
    return data;
  },

  /** Verify email with OTP — returns logged-in user on success */
  verifyEmail: async (email: string, otp: string): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>("/auth/verify-email", { email, otp });
    return data;
  },

  /** Resend verification OTP */
  resendOtp: async (email: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/resend-otp", { email });
    return data;
  },

  /** Log in with email + password */
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>("/auth/login", { email, password });
    return data;
  },

  /** Logout — clears the HTTP-only cookie server-side */
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore — client-side state cleanup still proceeds
    }
  },

  /** Get the currently authenticated user */
  getMe: async (): Promise<ApiResponse<User>> => {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data;
  },

  /** Request a password reset email */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/forgot-password", { email });
    return data;
  },

  /** Reset password using the token from email */
  resetPassword: async (
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
    return data;
  },
};

export default api;
