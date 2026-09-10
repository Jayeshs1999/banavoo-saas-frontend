// ─── Global Types ──────────────────────────────────────────────────────────
// Define your application-wide TypeScript types here.

/**
 * Base authenticated user shape.
 * Extend or replace with your own fields.
 */
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: "user" | "admin" | "super_admin";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}
