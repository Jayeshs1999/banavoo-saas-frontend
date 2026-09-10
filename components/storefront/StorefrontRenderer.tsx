"use client";

import { useMemo } from "react";
import type { Store } from "../../types";
import { getEffectiveTheme, themeToCssVars } from "../../lib/storeTheme";
import StoreHeader  from "./StoreHeader";
import StoreHero    from "./StoreHero";
import StoreAbout   from "./StoreAbout";
import StoreContact from "./StoreContact";
import StoreFooter  from "./StoreFooter";

interface Props {
  store:  Store;
  /** Seller's email — shown only if contactSettings.showEmail is true */
  email?: string | null;
  /** Seller's phone — shown only if contactSettings.showPhone is true */
  phone?: string | null;
}

/**
 * StorefrontRenderer
 *
 * Applies the store's theme as CSS custom properties on the wrapper div
 * and renders all storefront sections in the correct order.
 *
 * Products section is intentionally omitted here (Step 4 scope).
 */
export default function StorefrontRenderer({ store, email, phone }: Props) {
  const theme   = getEffectiveTheme(store);
  const cssVars = useMemo(() => themeToCssVars(theme), [theme]);

  return (
    <div
      style={{
        ...(cssVars as React.CSSProperties),
        backgroundColor: "var(--color-background)",
        color:           "var(--color-text)",
        fontFamily:      "var(--font-body)",
        minHeight:       "100vh",
      }}
    >
      <StoreHeader  store={store} />
      <main>
        <StoreHero    store={store} />
        {/* Featured Products placeholder — Step 4 */}
        {store.homepage?.featuredProducts?.enabled && (
          <section
            className="w-full py-12 px-4"
            style={{ background: "var(--color-background)" }}
          >
            <div
              className="mx-auto text-center"
              style={{ maxWidth: "var(--container-max-width)" }}
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
              >
                Our Products
              </h2>
              <p className="text-sm mt-4" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                Products coming soon.
              </p>
            </div>
          </section>
        )}
        <StoreAbout   store={store} />
        <StoreContact store={store} email={email} phone={phone} />
      </main>
      <StoreFooter  store={store} />
    </div>
  );
}
