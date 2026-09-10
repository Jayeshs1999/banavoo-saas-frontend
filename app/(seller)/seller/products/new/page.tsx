"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import ProductForm from "@/components/seller/ProductForm";
import Spinner from "@/components/Spinner";
import type { Product } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const { currentUser, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    if (!currentUser || currentUser.role !== "seller") {
      router.replace(currentUser ? "/become-seller" : "/login");
    }
  }, [currentUser, initializing, router]);

  if (initializing) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!currentUser || currentUser.role !== "seller") return null;

  const handleSaved = (product: Product) => {
    router.push(`/seller/products/${product.id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/seller/products" className="text-sm text-gray-500 hover:text-gray-800">← Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-900">New Product</span>
        </div>
        <ProductForm mode="create" onSaved={handleSaved} />
      </div>
    </div>
  );
}
