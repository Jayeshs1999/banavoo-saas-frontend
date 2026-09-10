"use client";

import Image from "next/image";
import Link from "next/link";
import type { Store } from "../../types";

interface Props {
  store: Store;
}

export default function StoreHero({ store }: Props) {
  const hero = store.homepage?.hero;

  if (!hero?.enabled) return null;

  const hasBannerImage = store.banner?.url;
  const hasHeroImage   = hero.image?.url;
  const bgImage        = hasHeroImage ? hero.image.url : hasBannerImage ? store.banner?.url : null;

  const title    = hero.title    || store.name;
  const subtitle = hero.subtitle || store.description || "";
  const btnText  = hero.buttonText || "Shop Now";
  const btnUrl   = hero.buttonUrl  || `/store/${store.slug}/products`;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:  bgImage ? undefined : "var(--color-primary)",
        minHeight:   "380px",
        fontFamily:  "var(--font-body)",
      }}
    >
      {bgImage && (
        <Image
          src={bgImage!}
          alt={`${store.name} hero banner`}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: bgImage
            ? "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.6))"
            : undefined,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20"
        style={{ minHeight: "380px" }}
      >
        <h1
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
          style={{
            fontFamily: "var(--font-heading)",
            color:      bgImage ? "#FFFFFF" : "var(--color-secondary)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-base md:text-lg max-w-xl mb-8 leading-relaxed"
            style={{ color: bgImage ? "rgba(255,255,255,0.85)" : "var(--color-secondary)" }}
          >
            {subtitle}
          </p>
        )}

        <Link
          href={btnUrl}
          className="inline-block px-8 py-3 font-semibold text-sm transition-opacity hover:opacity-85"
          style={{
            background:   "var(--color-accent)",
            color:        "#FFFFFF",
            borderRadius: "var(--btn-radius)",
          }}
        >
          {btnText}
        </Link>
      </div>
    </section>
  );
}
