"use client";

import Image from "next/image";
import Link from "next/link";
import type { Store } from "../../types";

interface Props {
  store: Store;
}

export default function StoreHeader({ store }: Props) {
  return (
    <header
      style={{
        backgroundColor: "var(--color-primary)",
        color:           "var(--color-secondary)",
        fontFamily:      "var(--font-body)",
      }}
      className="w-full"
    >
      <div
        style={{ maxWidth: "var(--container-max-width)" }}
        className="mx-auto px-4 py-4 flex items-center justify-between gap-4"
      >
        {/* Logo + store name */}
        <Link href={`/store/${store.slug}`} className="flex items-center gap-3 group">
          {store.logo?.url ? (
            <Image
              src={store.logo.url}
              alt={`${store.name} logo`}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10 shrink-0"
            />
          ) : (
            <div
              style={{
                background: "var(--color-secondary)",
                color:      "var(--color-primary)",
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0"
            >
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-secondary)" }}
            className="text-lg font-bold leading-tight group-hover:opacity-80 transition-opacity"
          >
            {store.name}
          </span>
        </Link>

        {/* Simple nav */}
        <nav className="flex items-center gap-5 text-sm" style={{ color: "var(--color-secondary)" }}>
          <Link
            href={`/store/${store.slug}`}
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            Home
          </Link>
          <Link
            href={`/store/${store.slug}/products`}
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            Products
          </Link>
          {store.homepage?.about?.enabled && (
            <Link
              href={`/store/${store.slug}#about`}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              About
            </Link>
          )}
          {store.homepage?.contact?.enabled && (
            <Link
              href={`/store/${store.slug}#contact`}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              Contact
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
