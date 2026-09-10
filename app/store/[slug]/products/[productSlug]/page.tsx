import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import StoreHeader  from "../../../../../components/storefront/StoreHeader";
import StoreFooter  from "../../../../../components/storefront/StoreFooter";
import ProductImageGallery  from "../../../../../components/products/ProductImageGallery";
import ProductVariantSelector from "../../../../../components/products/ProductVariantSelector";
import type { Store, Product, Category } from "../../../../../types";
import { getEffectiveTheme, themeToCssVars } from "../../../../../lib/storeTheme";

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

async function fetchProduct(storeSlug: string, productSlug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE}/public/stores/${storeSlug}/products/${productSlug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.success ? j.data : null;
  } catch { return null; }
}

// ── generateMetadata ───────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const [store, product] = await Promise.all([fetchStore(slug), fetchProduct(slug, productSlug)]);
  if (!store || !product) return { title: "Product not found — Banavoo" };

  const title       = product.seo?.title       || product.name;
  const description = product.seo?.description || product.shortDescription || `Buy ${product.name} at ${store.name}`;
  const image       = product.images?.[0]?.url;

  return {
    title: `${title} — ${store.name}`,
    description,
    openGraph: {
      title: `${title} — ${store.name}`,
      description,
      images: image ? [{ url: image }] : [],
    },
  };
}

// ── Price formatter ────────────────────────────────────────────────────────────
function fmt(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;

  const [store, product] = await Promise.all([
    fetchStore(slug),
    fetchProduct(slug, productSlug),
  ]);

  if (!store) notFound();
  if (!product) notFound();

  const theme   = getEffectiveTheme(store);
  const cssVars = themeToCssVars(theme) as Record<string, string>;

  const isOnSale = product.pricing.compareAtPrice && product.pricing.compareAtPrice > product.pricing.price;
  const discount = isOnSale
    ? Math.round(((product.pricing.compareAtPrice! - product.pricing.price) / product.pricing.compareAtPrice!) * 100)
    : 0;

  return (
    <div
      style={{ ...cssVars, backgroundColor: "var(--color-background)", color: "var(--color-text)", minHeight: "100vh" } as React.CSSProperties}
    >
      <StoreHeader store={store} />
      <main>
        <div className="px-4 py-10 mx-auto" style={{ maxWidth: "var(--container-max-width, 1280px)" }}>

          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
            <Link href={`/store/${slug}`} className="hover:underline">Home</Link>
            <span>›</span>
            <Link href={`/store/${slug}/products`} className="hover:underline">Products</Link>
            <span>›</span>
            <span>{product.name}</span>
          </nav>

          {/* Product layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Left: Images */}
            <div>
              <ProductImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: Info */}
            <div className="space-y-5">
              {/* Featured badge */}
              {product.isFeatured && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Featured
                </span>
              )}

              {/* Name */}
              <h1
                className="text-2xl md:text-3xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {fmt(product.pricing.price, product.pricing.currency)}
                </span>
                {isOnSale && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {fmt(product.pricing.compareAtPrice!, product.pricing.currency)}
                    </span>
                    <span className="text-sm font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: "var(--color-accent)" }}>
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="text-base leading-relaxed" style={{ opacity: 0.8 }}>
                  {product.shortDescription}
                </p>
              )}

              {/* Variants */}
              {product.productType === "variable" && product.variants.length > 0 && (
                <ProductVariantSelector
                  variants={product.variants}
                  selectedVariantId={product.variants.find((v) => v.isActive)?._id ?? null}
                  onChange={() => {}} // client-side selection handled in a future step
                />
              )}

              {/* Stock */}
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    <span className="text-sm text-green-700 font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Add to cart placeholder */}
              <button
                disabled
                className="w-full py-3 text-sm font-semibold rounded-lg transition-opacity opacity-50 cursor-not-allowed"
                style={{ background: "var(--color-primary)", color: "var(--color-secondary)", borderRadius: "var(--btn-radius)" }}
              >
                Add to Cart — Coming Soon
              </button>

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-gray-400">SKU: {product.sku}</p>
              )}
            </div>
          </div>

          {/* Full description */}
          {product.description && (
            <div className="mt-12 max-w-2xl">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Description</h2>
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ opacity: 0.85 }}>
                {product.description}
              </div>
            </div>
          )}

        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  );
}
