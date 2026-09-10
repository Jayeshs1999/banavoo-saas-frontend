// ─── Global Types — Banavoo SaaS ───────────────────────────────────────────

// ── Image field ──────────────────────────────────────────────────────────────
export interface ImageField {
  url: string | null;
  publicId: string | null;
}

// ── Product image ─────────────────────────────────────────────────────────────
export interface ProductImage {
  _id:       string;
  url:       string;
  publicId:  string;
  alt:       string;
  sortOrder: number;
}

// ── Variant option ────────────────────────────────────────────────────────────
export interface VariantOption {
  name:  string;
  value: string;
}

// ── Product variant ───────────────────────────────────────────────────────────
export interface ProductVariant {
  _id:           string;
  name:          string;
  sku:           string;
  options:       VariantOption[];
  price:         number | null;
  compareAtPrice: number | null;
  quantity?:     number; // not exposed in public API
  image?:        ImageField | null;
  isActive:      boolean;
}

// ── Product pricing ───────────────────────────────────────────────────────────
export interface ProductPricing {
  price:          number;
  compareAtPrice: number | null;
  costPrice?:     number | null; // only in seller view
  currency:       string;
}

// ── Product inventory ─────────────────────────────────────────────────────────
export interface ProductInventory {
  trackInventory:    boolean;
  quantity?:         number; // not exposed in public API
  lowStockThreshold?: number;
  allowBackorder:    boolean;
}

// ── Product shipping ──────────────────────────────────────────────────────────
export interface ProductShipping {
  weight: number | null;
  length: number | null;
  width:  number | null;
  height: number | null;
}

// ── Product ───────────────────────────────────────────────────────────────────
export type ProductStatus    = "draft" | "published" | "archived";
export type ProductType      = "simple" | "variable";
export type StockStatusLabel = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id:               string;
  storeId?:         string;   // present in seller view
  name:             string;
  slug:             string;
  shortDescription: string;
  description:      string;
  images:           ProductImage[];
  productType:      ProductType;
  pricing:          ProductPricing;
  inventory:        ProductInventory;
  variants:         ProductVariant[];
  categoryIds:      string[];
  sku:              string;
  status?:          ProductStatus;    // seller only
  isFeatured:       boolean;
  isActive?:        boolean;          // seller only
  seo?:             { title: string; description: string };
  shipping?:        ProductShipping;
  stockStatus?:     StockStatusLabel; // seller only
  inStock:          boolean;
  createdAt?:       string;
  updatedAt?:       string;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description: string;
  image:       ImageField;
  isActive?:   boolean;
  sortOrder?:  number;
  createdAt?:  string;
  updatedAt?:  string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Pagination {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

// ── Theme sub-types ───────────────────────────────────────────────────────────
export type StoreTemplate  = "classic" | "minimal" | "artisan";
export type StoreFont      = "Inter" | "Poppins" | "Playfair Display" | "Lora" | "Roboto" | "Montserrat";
export type ButtonStyle    = "rounded" | "square" | "pill";
export type ButtonSize     = "small" | "medium" | "large";
export type ContainerWidth = "narrow" | "wide" | "full";

export interface StoreTheme {
  template:   StoreTemplate;
  colors: {
    primary:    string;
    secondary:  string;
    accent:     string;
    text:       string;
    background: string;
  };
  typography: {
    headingFont: StoreFont;
    bodyFont:    StoreFont;
  };
  buttons: {
    style: ButtonStyle;
    size:  ButtonSize;
  };
  layout: {
    containerWidth: ContainerWidth;
    productColumns: number;
  };
}

// ── Homepage section types ─────────────────────────────────────────────────────
export interface HomepageHero {
  enabled:    boolean;
  title:      string;
  subtitle:   string;
  buttonText: string;
  buttonUrl:  string;
  image:      ImageField;
}

export interface HomepageAbout {
  enabled:     boolean;
  heading:     string;
  description: string;
  image:       ImageField;
}

export interface StoreHomepage {
  hero:             HomepageHero;
  featuredProducts: { enabled: boolean };
  categories:       { enabled: boolean };
  about:            HomepageAbout;
  whyUs:            { enabled: boolean };
  contact:          { enabled: boolean };
}

// ── Social links ───────────────────────────────────────────────────────────────
export interface SocialLinks {
  instagram: string;
  facebook:  string;
  youtube:   string;
  whatsapp:  string;
}

// ── Contact settings ───────────────────────────────────────────────────────────
export interface ContactSettings {
  showEmail: boolean;
  showPhone: boolean;
}

// ── SEO ────────────────────────────────────────────────────────────────────────
export interface StoreSeo {
  title:       string;
  description: string;
}

/**
 * Store shape returned from /api/stores and embedded in User (for sellers).
 */
export interface Store {
  id:            string;
  name:          string;
  slug:          string;
  description?:  string;
  city?:         string;
  state?:        string;
  pickupPincode?: string;
  status:        "draft" | "active" | "suspended" | "closed";
  logo?:    ImageField | null;
  banner?:  ImageField | null;
  favicon?: ImageField | null;
  theme?: StoreTheme;
  homepage?: StoreHomepage;
  socialLinks?:     SocialLinks;
  contactSettings?: ContactSettings;
  seo?: StoreSeo;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Authenticated user shape returned from /api/auth/me and login.
 */
export interface User {
  id:            string;
  fullName:      string;
  email:         string;
  phone?:        string | null;
  emailVerified: boolean;
  role:          "buyer" | "seller" | "admin";
  status:        "active" | "suspended";
  lastLoginAt?:  string | null;
  createdAt?:    string;
  store?: { id: string; name: string; slug: string; status: string } | null;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  code?:   string;
  data?:   T;
  errors?: Record<string, string> | string[];
}

export interface RegisterPayload {
  fullName:        string;
  email:           string;
  phone?:          string;
  password:        string;
  confirmPassword: string;
}

export interface RegisterData {
  email:                     string;
  requiresEmailVerification: boolean;
}
