import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Axios instance — all API calls go through this.
 * The Authorization header is injected automatically from localStorage.
 */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach JWT ──────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: unwrap errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────
export const authAPI = {
  /**
   * Log in with email + password.
   * Returns the full response data (including token).
   */
  login: async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
  },

  /** Register a new account */
  register: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
  }) => {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },

  /** Logout (clears server-side cookie if used) */
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore — client-side cleanup still proceeds
    }
  },
};

// ─── Example: User profile API ────────────────────────────────────────────
export const userAPI = {
  getProfile: async () => {
    const { data } = await api.get("/api/users/profile");
    return data;
  },

  updateProfile: async (payload: Partial<{ firstName: string; lastName: string; mobile: string }>) => {
    const { data } = await api.put("/api/users/profile", payload);
    return data;
  },
};

// ─── Add more resource APIs below ─────────────────────────────────────────
// export const productAPI = { ... };
// export const orderAPI   = { ... };

export default api;
