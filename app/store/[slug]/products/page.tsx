import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGrid from "../../../../components/products/ProductGrid";
import StoreHeader  from "../../../../components/storefront/StoreHeader";
import StoreFooter  from "../../../../components/storefront/StoreFooter";
import type { Store, Category, Product, Pagination } from "../../../../types";
import { getEffectiveTheme, themeToCssVars } from "../../../../lib/storeTheme";

// ── Data fetching ──────────────────────────────────────────────────────────────

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const BASE = API.endsWith("/api") ? API : `${API}/api`;

async function fetchStore(slug: string): Promise<Store | null> {
  try {
    const res = await fetch(`${BASE}/stores/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const j = await res.json();
    return j.success ? j.data : null;
  } catch { return null; }
}

async function fetchProducts(
  storeSlug: string,
  params: Record<string, string> = {}
): Promise<{ products: Product[]; pagination: Pagination } | null> {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/public/stores/${storeSlug}/products${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.success ? j.data : null;
  } catch { return null; }
}

async function fetchCategories(storeSlug: string): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE}/public/stores/${storeSlug}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const j = await res.json();
    return j.success ? j.data : [];
  } catch { return []; }
}

// ── generateMetadata ───────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStore(slug);
  if (!store) return { title: "Store not found — Banavoo" };
  return {
    title: `Products — ${store.seo?.title || store.name}`,
    description: store.seo?.description || store.description || `Shop all products at ${store.name}`,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function StoreProductsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug }   = await params;
  const sp         = await searchParams;
  const store      = await fetchStore(slug);
  if (!store) notFound();

  const theme   = getEffectiveTheme(store);
  const cssVars = themeToCssVars(theme) as Record<string, string>;

  const categories = await fetchCategories(slug);

  const queryParams: Record<string, string> = { page: sp.page || "1", limit: "20" };
  if (sp.search)   queryParams.search   = sp.search;
  if (sp.category) queryParams.category = sp.category;
  if (sp.sort)     queryParams.sort     = sp.sort;
  if (sp.featured) queryParams.featured = sp.featured;

  const result = await fetchProducts(slug, queryParams);
  const products   = result?.products   ?? [];
  const pagination = result?.pagination ?? null;

  return (
    <div style={{ ...cssVars, backgroundColor: "var(--color-background)", color: "var(--color-text)", minHeight: "100vh" } as React.CSSProperties}>
      <StoreHeader store={store} />
      <main>
        <div className="px-4 py-10 mx-auto" style={{ maxWidth: "var(--container-max-width, 1280px)" }}>

          {/* Header */}
          <div className="mb-6">
            <nav className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <Link href={`/store/${slug}`} className="hover:underline">Home</Link>
              <span>›</span>
              <span>Products</span>
            </nav>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {sp.category
                ? categories.find((c) => c.slug === sp.category)?.name ?? "Products"
                : "All Products"}
            </h1>
            {pagination && (
              <p className="text-sm text-gray-400 mt-1">{pagination.total} product{pagination.total !== 1 ? "s" : ""}</p>
            )}
          </div>

          {/* Filters */}
          <form method="GET" className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              name="search"
              defaultValue={sp.search ?? ""}
              placeholder="Search products…"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <select name="category" defaultValue={sp.category ?? ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select name="sort" defaultValue={sp.sort ?? "-createdAt"} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
              <option value="-createdAt">Newest</option>
              <option value="price">Price ↑</option>
              <option value="-price">Price ↓</option>
              <option value="name">Name A–Z</option>
              <option value="featured">Featured</option>
            </select>
            <button type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-85"
              style={{ background: "var(--color-primary)", color: "var(--color-secondary)", borderRadius: "var(--btn-radius)" }}>
              Apply
            </button>
          </form>

          {/* Grid */}
          <ProductGrid
            products={products}
            storeSlug={slug}
            columns={theme.layout.productColumns}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              {pagination.page > 1 && (
                <Link href={`/store/${slug}/products?${new URLSearchParams({ ...sp, page: String(pagination.page - 1) })}`}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-500 transition-colors">
                  ← Prev
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.page < pagination.totalPages && (
                <Link href={`/store/${slug}/products?${new URLSearchParams({ ...sp, page: String(pagination.page + 1) })}`}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-500 transition-colors">
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
