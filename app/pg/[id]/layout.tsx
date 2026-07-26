import type { Metadata } from "next";

// Fetches minimal PG data for metadata — the full page data is fetched client-side in page.tsx
async function fetchPGForMeta(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api"}/pgs/public/${id}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const pg = await fetchPGForMeta(params.id);

  if (!pg) {
    return {
      title: "PG Details — Bedwale.in",
      description: "View PG accommodation details and book a bed on Bedwale.in.",
    };
  }

  const city = pg.location?.city ?? "";
  const subcity = pg.location?.subcity ?? "";
  const locationStr = [subcity, city].filter(Boolean).join(", ");
  const minPrice = pg.structure
    ?.flatMap((r: { beds: { price: number }[] }) => r.beds.map((b) => b.price))
    .filter((p: number) => p > 0)
    .sort((a: number, b: number) => a - b)[0];
  const priceStr = minPrice ? ` from ₹${minPrice}/month` : "";

  const title = `${pg.name}${locationStr ? ` — PG in ${locationStr}` : ""} | Bedwale.in`;
  const description = `Book a bed at ${pg.name}${locationStr ? ` in ${locationStr}` : ""}${priceStr}. View rooms, amenities and availability on Bedwale.in.`;

  return {
    title,
    description,
    keywords: [
      `PG in ${city}`,
      `PG ${subcity}`,
      "book PG online",
      "PG accommodation India",
      pg.name,
    ].filter(Boolean),
    alternates: { canonical: `https://www.bedwale.in/pg/${params.id}` },
    openGraph: {
      title,
      description,
      url: `https://www.bedwale.in/pg/${params.id}`,
      siteName: "Bedwale.in",
      images: pg.photos?.[0]
        ? [{ url: pg.photos[0], width: 1200, height: 630, alt: pg.name }]
        : [{ url: "https://www.bedwale.in/logo3.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: pg.photos?.[0]
        ? [pg.photos[0]]
        : ["https://www.bedwale.in/logo3.png"],
    },
  };
}

export default function PGLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
