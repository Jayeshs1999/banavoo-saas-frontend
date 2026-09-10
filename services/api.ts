import axios from "axios";
import type {
  User,
  Store,
  StoreTheme,
  StoreHomepage,
  SocialLinks,
  ContactSettings,
  StoreSeo,
  ImageField,
  RegisterPayload,
  RegisterData,
  ApiResponse,
  Product,
  Category,
  Pagination,
  ProductStatus,
} from "../types";

// Strip any trailing slash, then append /api so routes can be written as /auth/...
const rawBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const BASE_URL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

/**
 * Axios instance — all API calls go through this.
 * JWT is stored in an HTTP-only cookie set by the backend.
 * withCredentials ensures the browser sends the cookie on every request.
 */
const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

// ─── Response interceptor: unwrap errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data    = error.response?.data;
    const message = data?.message || error.message || "Request failed";
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
  register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterData>> => {
    const { data } = await api.post<ApiResponse<RegisterData>>("/auth/register", payload);
    return data;
  },
  verifyEmail: async (email: string, otp: string): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>("/auth/verify-email", { email, otp });
    return data;
  },
  resendOtp: async (email: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/resend-otp", { email });
    return data;
  },
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    const { data } = await api.post<ApiResponse<User>>("/auth/login", { email, password });
    return data;
  },
  logout: async (): Promise<void> => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data;
  },
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/forgot-password", { email });
    return data;
  },
  resetPassword: async (
    token: string, password: string, confirmPassword: string
  ): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/reset-password", {
      token, password, confirmPassword,
    });
    return data;
  },
};

// ─── Store API ─────────────────────────────────────────────────────────────

export interface CreateStorePayload {
  name:          string;
  description:   string;
  city:          string;
  state:         string;
  pickupPincode: string;
  slug?:         string;
}

export interface UpdateStorePayload {
  name?:          string;
  description?:   string;
  city?:          string;
  state?:         string;
  pickupPincode?: string;
}

export interface UpdateBrandingPayload {
  theme?:           Partial<StoreTheme>;
  homepage?:        Partial<StoreHomepage>;
  socialLinks?:     Partial<SocialLinks>;
  contactSettings?: Partial<ContactSettings>;
  seo?:             Partial<StoreSeo>;
}

export const storeAPI = {
  // ── Step 2 ─────────────────────────────────────────────────────────────
  createStore: async (payload: CreateStorePayload): Promise<ApiResponse<Store>> => {
    const { data } = await api.post<ApiResponse<Store>>("/stores", payload);
    return data;
  },
  getMyStore: async (): Promise<ApiResponse<Store>> => {
    const { data } = await api.get<ApiResponse<Store>>("/stores/me");
    return data;
  },
  getStoreBySlug: async (slug: string): Promise<ApiResponse<Store>> => {
    const { data } = await api.get<ApiResponse<Store>>(`/stores/${slug}`);
    return data;
  },
  updateMyStore: async (payload: UpdateStorePayload): Promise<ApiResponse<Store>> => {
    const { data } = await api.patch<ApiResponse<Store>>("/stores/me", payload);
    return data;
  },
  checkSlug: async (slug: string): Promise<{ slug: string; available: boolean; reason?: string }> => {
    const { data } = await api.get<{ slug: string; available: boolean; reason?: string }>(
      `/stores/check-slug/${encodeURIComponent(slug)}`
    );
    return data;
  },

  // ── Step 3 — theme ─────────────────────────────────────────────────────
  getTheme: async (): Promise<ApiResponse<StoreTheme>> => {
    const { data } = await api.get<ApiResponse<StoreTheme>>("/stores/me/theme");
    return data;
  },
  updateTheme: async (theme: Partial<StoreTheme>): Promise<ApiResponse<StoreTheme>> => {
    const { data } = await api.patch<ApiResponse<StoreTheme>>("/stores/me/theme", theme);
    return data;
  },

  // ── Step 3 — full branding PATCH ───────────────────────────────────────
  updateBranding: async (payload: UpdateBrandingPayload): Promise<ApiResponse<Store>> => {
    const { data } = await api.patch<ApiResponse<Store>>("/stores/me/branding", payload);
    return data;
  },

  // ── Step 3 — image uploads ─────────────────────────────────────────────
  uploadLogo: async (file: File): Promise<ApiResponse<ImageField>> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post<ApiResponse<ImageField>>("/stores/me/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  deleteLogo: async (): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>("/stores/me/logo");
    return data;
  },
  uploadBanner: async (file: File): Promise<ApiResponse<ImageField>> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post<ApiResponse<ImageField>>("/stores/me/banner", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  deleteBanner: async (): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>("/stores/me/banner");
    return data;
  },
  uploadFavicon: async (file: File): Promise<ApiResponse<ImageField>> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post<ApiResponse<ImageField>>("/stores/me/favicon", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  deleteFavicon: async (): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>("/stores/me/favicon");
    return data;
  },
};

// ─── Category API (Seller) ─────────────────────────────────────────────────

export interface CreateCategoryPayload {
  name:        string;
  description?: string;
  sortOrder?:  number;
  isActive?:   boolean;
}

export interface UpdateCategoryPayload {
  name?:        string;
  description?: string;
  sortOrder?:   number;
  isActive?:    boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: Pagination;
}

export const categoryAPI = {
  getCategories: async (params?: Record<string, string>): Promise<ApiResponse<CategoryListResponse>> => {
    const { data } = await api.get<ApiResponse<CategoryListResponse>>("/seller/categories", { params });
    return data;
  },
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const { data } = await api.get<ApiResponse<Category>>(`/seller/categories/${id}`);
    return data;
  },
  createCategory: async (payload: CreateCategoryPayload): Promise<ApiResponse<Category>> => {
    const { data } = await api.post<ApiResponse<Category>>("/seller/categories", payload);
    return data;
  },
  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<ApiResponse<Category>> => {
    const { data } = await api.patch<ApiResponse<Category>>(`/seller/categories/${id}`, payload);
    return data;
  },
  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>(`/seller/categories/${id}`);
    return data;
  },
  uploadImage: async (id: string, file: File): Promise<ApiResponse<ImageField>> => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post<ApiResponse<ImageField>>(
      `/seller/categories/${id}/image`, form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
  deleteImage: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>(`/seller/categories/${id}/image`);
    return data;
  },
};

// ─── Product API (Seller) ──────────────────────────────────────────────────

export interface CreateProductPayload {
  name:             string;
  shortDescription?: string;
  description?:     string;
  categoryIds?:     string[];
  productType?:     "simple" | "variable";
  pricing:          { price: number; compareAtPrice?: number | null; costPrice?: number | null; currency?: string };
  inventory?:       { trackInventory?: boolean; quantity?: number; lowStockThreshold?: number; allowBackorder?: boolean };
  sku?:             string;
  status?:          ProductStatus;
  isFeatured?:      boolean;
  seo?:             { title?: string; description?: string };
  shipping?:        { weight?: number; length?: number; width?: number; height?: number };
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, "pricing"> & {
  pricing?: Partial<CreateProductPayload["pricing"]>;
}>;

export interface ProductListResponse {
  products:   Product[];
  pagination: Pagination;
}

export const productAPI = {
  // ── Seller ──────────────────────────────────────────────────────────────
  getProducts: async (params?: Record<string, string>): Promise<ApiResponse<ProductListResponse>> => {
    const { data } = await api.get<ApiResponse<ProductListResponse>>("/seller/products", { params });
    return data;
  },
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await api.get<ApiResponse<Product>>(`/seller/products/${id}`);
    return data;
  },
  createProduct: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
    const { data } = await api.post<ApiResponse<Product>>("/seller/products", payload);
    return data;
  },
  updateProduct: async (id: string, payload: UpdateProductPayload): Promise<ApiResponse<Product>> => {
    const { data } = await api.patch<ApiResponse<Product>>(`/seller/products/${id}`, payload);
    return data;
  },
  archiveProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await api.patch<ApiResponse<Product>>(`/seller/products/${id}/archive`);
    return data;
  },
  duplicateProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await api.post<ApiResponse<Product>>(`/seller/products/${id}/duplicate`);
    return data;
  },
  setVariants: async (id: string, variants: unknown[]): Promise<ApiResponse<Product>> => {
    const { data } = await api.put<ApiResponse<Product>>(`/seller/products/${id}/variants`, { variants });
    return data;
  },
  // Images
  uploadImage: async (productId: string, file: File, alt?: string): Promise<ApiResponse<{ images: Product["images"] }>> => {
    const form = new FormData();
    form.append("image", file);
    if (alt) form.append("alt", alt);
    const { data } = await api.post<ApiResponse<{ images: Product["images"] }>>(
      `/seller/products/${productId}/images`, form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
  deleteImage: async (productId: string, imageId: string): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>(`/seller/products/${productId}/images/${imageId}`);
    return data;
  },
  reorderImages: async (productId: string, images: { _id: string; sortOrder: number }[]): Promise<ApiResponse> => {
    const { data } = await api.patch<ApiResponse>(`/seller/products/${productId}/images/reorder`, { images });
    return data;
  },
};

// ─── Public Store API ──────────────────────────────────────────────────────

export const publicStoreAPI = {
  getProducts: async (storeSlug: string, params?: Record<string, string>): Promise<ApiResponse<ProductListResponse>> => {
    const { data } = await api.get<ApiResponse<ProductListResponse>>(
      `/public/stores/${storeSlug}/products`, { params }
    );
    return data;
  },
  getProduct: async (storeSlug: string, productSlug: string): Promise<ApiResponse<Product>> => {
    const { data } = await api.get<ApiResponse<Product>>(
      `/public/stores/${storeSlug}/products/${productSlug}`
    );
    return data;
  },
  getCategories: async (storeSlug: string): Promise<ApiResponse<Category[]>> => {
    const { data } = await api.get<ApiResponse<Category[]>>(
      `/public/stores/${storeSlug}/categories`
    );
    return data;
  },
  getProductsByCategory: async (storeSlug: string, categorySlug: string, params?: Record<string, string>) => {
    const { data } = await api.get(
      `/public/stores/${storeSlug}/categories/${categorySlug}/products`, { params }
    );
    return data;
  },
};

export default api;
