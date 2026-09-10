"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ProductForm from "@/components/seller/ProductForm";
import Spinner from "@/components/Spinner";
import { productAPI } from "@/services/api";
import type { Product } from "@/types";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, initializing } = useAuth();

  const [product,  setProduct]  = useState<Product | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast,    setToast]    = useState<string | null>(null);

  useEffect(() => {
    if (initializing) return;
    if (!currentUser || currentUser.role !== "seller") {
      router.replace(currentUser ? "/become-seller" : "/login");
      return;
    }
    productAPI.getProduct(id)
      .then((res) => {
        if (res.success && res.data) setProduct(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, currentUser, initializing, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (initializing || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3">
        <p className="text-gray-500">Product not found.</p>
        <Link href="/seller/products" className="text-blue-600 hover:underline text-sm">← Back to Products</Link>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "seller") return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/seller/products" className="text-sm text-gray-500 hover:text-gray-800">← Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">{product?.name ?? "Edit Product"}</span>
        </div>

        {/* Toast */}
        {toast && <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3">{toast}</div>}

        {/* Actions row */}
        <div className="flex gap-3 text-sm items-center">
          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${
            product?.status === "published" ? "bg-green-50 text-green-700 border-green-200" :
            product?.status === "archived"  ? "bg-gray-100 text-gray-500 border-gray-200" :
            "bg-yellow-100 text-yellow-700 border-yellow-200"
          }`}>{product?.status}</span>
          {product?.status === "published" && (
            <a
              href={`/store/${currentUser.store?.slug}/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              View on storefront ↗
            </a>
          )}
        </div>

        {/* Form */}
        <ProductForm
          mode="edit"
          productId={id}
          initial={product}
          onSaved={(updated) => {
            setProduct(updated);
            showToast("Product saved.");
          }}
        />
      </div>
    </div>
  );
}
