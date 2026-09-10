import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StorefrontRenderer from "../../../components/storefront/StorefrontRenderer";
import type { Store } from "../../../types";

// ─── Data fetching ─────────────────────────────────────────────────────────────

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "");
const BASE_URL = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

async function fetchStore(slug: string): Promise<Store | null> {
  try {
    const res = await fetch(`${BASE_URL}/stores/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 s
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStore(slug);
  if (!store) {
    return { title: "Store not found — Banavoo" };
  }

  const title       = store.seo?.title       || `${store.name} — Banavoo`;
  const description = store.seo?.description || store.description || `Shop at ${store.name} on Banavoo`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: store.banner?.url ? [{ url: store.banner.url }] : [],
      siteName: "Banavoo",
    },
    icons: {
      icon: store.favicon?.url || "/favicon.ico",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await fetchStore(slug);

  if (!store) notFound();

  return (
    <StorefrontRenderer
      store={store}
      // Contact info is not returned from public API for privacy —
      // those are shown only when the seller explicitly enables them
      // and the server returns the sanitised seller profile.
      // For now pass null; Step 4 will wire up seller public profile.
      email={null}
      phone={null}
    />
  );
}
