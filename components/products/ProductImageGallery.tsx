"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "../../types";

interface Props {
  images:      ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-2 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </div>
    );
  }

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const current = sorted[active];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={current.url}
          alt={current.alt || productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img._id}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-blue-600"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
