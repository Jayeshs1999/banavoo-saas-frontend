"use client";

import Image from "next/image";
import type { Store } from "../../types";

interface Props {
  store: Store;
}

export default function StoreAbout({ store }: Props) {
  const about = store.homepage?.about;

  if (!about?.enabled) return null;

  const heading     = about.heading     || `About ${store.name}`;
  const description = about.description || store.description || "";

  if (!heading && !description) return null;

  return (
    <section
      id="about"
      className="w-full py-16 px-4"
      style={{
        background: "var(--color-background)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        className="mx-auto flex flex-col md:flex-row items-center gap-10"
        style={{ maxWidth: "var(--container-max-width)" }}
      >
        {/* Optional about image */}
        {about.image?.url && (
          <div className="shrink-0 w-full md:w-80">
            <Image
              src={about.image.url}
              alt={heading}
              width={320}
              height={320}
              className="rounded-2xl object-cover w-full aspect-square"
            />
          </div>
        )}

        {/* Text */}
        <div className="flex-1">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              color:      "var(--color-text)",
            }}
          >
            {heading}
          </h2>
          <p
            className="text-base leading-relaxed whitespace-pre-line"
            style={{ color: "var(--color-text)", opacity: 0.8 }}
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
