"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { productAPI, categoryAPI } from "@/services/api";
import type { Product, Category, Pagination } from "@/types";

// ── Format price ───────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    published: "bg-green-100 text-green-700 border-green-200",
    draft:     "bg-yellow-100 text-yellow-700 border-yellow-200",
    archived:  "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${s[status] ?? s.draft}`}>
      {status}
    </span>
  );
}

// ── Stock badge ────────────────────────────────────────────────────────────────
function StockBadge({ stockStatus }: { stockStatus?: string }) {
  if (stockStatus === "out_of_stock") return <span className="text-xs text-red-600 font-medium">Out of stock</span>;
  if (stockStatus === "low_stock")    return <span className="text-xs text-amber-600 font-medium">Low stock</span>;
  return <span className="text-xs text-green-600 font-medium">In stock</span>;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SellerProductsPage() {
  const router             = useRouter();
  const { currentUser, initializing } = useAuth();

  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [pagination,  setPagination]  = useState<Pagination | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [actionId,    setActionId]    = useState<string | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);

  // Filters
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [category, setCategory] = useState("");
  const [sort,     setSort]     = useState("-createdAt");
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    if (initializing) return;
    if (!currentUser || currentUser.role !== "seller") {
      router.replace(currentUser ? "/become-seller" : "/login");
    }
  }, [currentUser, initializing, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "20", sort };
      if (search)   params.search   = search;
      if (status)   params.status   = status;
      if (category) params.category = category;
      const res = await productAPI.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, sort, search, status, category]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    categoryAPI.getCategories({ limit: "100" }).then((res) => {
      if (res.success && res.data) setCategories(res.data.categories);
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this product? It will be hidden from the storefront.")) return;
    setActionId(id);
    try {
      await productAPI.archiveProduct(id);
      showToast("Product archived.");
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Archive failed.");
    } finally { setActionId(null); }
  };

  const handleDuplicate = async (id: string) => {
    setActionId(id);
    try {
      await productAPI.duplicateProduct(id);
      showToast("Product duplicated as a draft.");
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Duplicate failed.");
    } finally { setActionId(null); }
  };

  const handlePublish = async (product: Product) => {
    setActionId(product.id);
    try {
      await productAPI.updateProduct(product.id, { status: "published" });
      showToast("Product published.");
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Publish failed.");
    } finally { setActionId(null); }
  };

  const handleUnpublish = async (product: Product) => {
    setActionId(product.id);
    try {
      await productAPI.updateProduct(product.id, { status: "draft" });
      showToast("Product moved to draft.");
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unpublish failed.");
    } finally { setActionId(null); }
  };

  if (initializing) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!currentUser || currentUser.role !== "seller") return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination ? `${pagination.total} product${pagination.total !== 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/seller/categories">
              <Button variant="outline" size="sm">Categories</Button>
            </Link>
            <Link href="/seller/products/new">
              <Button variant="primary" size="sm">+ Add Product</Button>
            </Link>
          </div>
        </div>

        {/* Toast */}
        {toast && <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3">{toast}</div>}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search name or SKU…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-40"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="-name">Name Z–A</option>
            <option value="price">Price ↑</option>
            <option value="-price">Price ↓</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><Spinner /></div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 font-medium">No products found.</p>
              <p className="text-gray-400 text-sm mt-1">
                {search || status || category
                  ? "Try adjusting your filters."
                  : "Add your first product to start building your store."}
              </p>
              {!search && !status && !category && (
                <Link href="/seller/products/new">
                  <Button variant="primary" size="sm" className="mt-4">Add Product</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-semibold">Product</th>
                    <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">SKU</th>
                    <th className="text-left px-4 py-3 font-semibold">Price</th>
                    <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {p.images?.[0]?.url ? (
                              <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/seller/products/${p.id}/edit`} className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline line-clamp-1">
                              {p.name}
                            </Link>
                            {p.isFeatured && <span className="text-xs text-blue-600 font-medium ml-1">★ Featured</span>}
                          </div>
                        </div>
                      </td>
                      {/* SKU */}
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{p.sku || "—"}</td>
                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(p.pricing.price)}</td>
                      {/* Stock */}
                      <td className="px-4 py-3 hidden md:table-cell"><StockBadge stockStatus={p.stockStatus} /></td>
                      {/* Status */}
                      <td className="px-4 py-3"><StatusBadge status={p.status ?? "draft"} /></td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Link href={`/seller/products/${p.id}/edit`} className="text-xs text-blue-600 hover:underline px-1 py-0.5">Edit</Link>
                          <button
                            onClick={() => handleDuplicate(p.id)}
                            disabled={actionId === p.id}
                            className="text-xs text-gray-500 hover:text-gray-800 px-1 py-0.5 disabled:opacity-50"
                          >Dup</button>
                          {p.status === "published"
                            ? <button onClick={() => handleUnpublish(p)} disabled={actionId === p.id} className="text-xs text-amber-600 hover:text-amber-800 px-1 py-0.5 disabled:opacity-50">Unpublish</button>
                            : p.status === "draft"
                              ? <button onClick={() => handlePublish(p)} disabled={actionId === p.id} className="text-xs text-green-600 hover:text-green-800 px-1 py-0.5 disabled:opacity-50">Publish</button>
                              : null
                          }
                          {p.status !== "archived" && (
                            <button onClick={() => handleArchive(p.id)} disabled={actionId === p.id} className="text-xs text-red-500 hover:text-red-700 px-1 py-0.5 disabled:opacity-50">Archive</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/seller" className="text-blue-600 hover:underline">← Seller Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
