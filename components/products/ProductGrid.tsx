"use client";

import type { Product } from "../../types";
import ProductCard from "./ProductCard";

interface Props {
  products:   Product[];
  storeSlug:  string;
  columns?:   number;
}

export default function ProductGrid({ products, storeSlug, columns = 4 }: Props) {
  const colClass =
    columns <= 2 ? "grid-cols-2" :
    columns === 3 ? "grid-cols-2 sm:grid-cols-3" :
    columns === 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" :
    columns === 6 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" :
    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">No products available yet.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-4`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
      ))}
    </div>
  );
}
