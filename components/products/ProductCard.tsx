"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "../../types";

interface Props {
  product:   Product;
  storeSlug: string;
}

/** Format price in INR */
function formatPrice(price: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function ProductCard({ product, storeSlug }: Props) {
  const primaryImage = product.images?.[0];
  const isOnSale     = product.pricing.compareAtPrice && product.pricing.compareAtPrice > product.pricing.price;
  const discount     = isOnSale
    ? Math.round(((product.pricing.compareAtPrice! - product.pricing.price) / product.pricing.compareAtPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/store/${storeSlug}/products/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden border transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--color-background, #e5e7eb)" }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {primaryImage?.url ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-2 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOnSale && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: "var(--color-accent, #F59E0B)" }}>
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
              Featured
            </span>
          )}
          {!product.inStock && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-white">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 leading-snug"
          style={{ color: "var(--color-text, #111827)", fontFamily: "var(--font-body, sans-serif)" }}>
          {product.name}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-sm"
            style={{ color: "var(--color-primary, #111827)" }}>
            {formatPrice(product.pricing.price, product.pricing.currency)}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.pricing.compareAtPrice!, product.pricing.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
