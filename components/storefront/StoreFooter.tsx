"use client";

import Link from "next/link";
import Image from "next/image";
import type { Store } from "../../types";

interface Props {
  store: Store;
}

function whatsappUrl(val: string): string {
  if (val.startsWith("http")) return val;
  return `https://wa.me/${val.replace(/\D/g, "")}`;
}

export default function StoreFooter({ store }: Props) {
  const socials = store.socialLinks;
  const year    = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--color-primary)",
        color:      "var(--color-secondary)",
        fontFamily: "var(--font-body)",
      }}
      className="w-full"
    >
      <div
        style={{ maxWidth: "var(--container-max-width)" }}
        className="mx-auto px-4 py-10"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {store.logo?.url ? (
              <Image
                src={store.logo.url}
                alt={store.name}
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8"
              />
            ) : (
              <div
                style={{
                  background: "var(--color-secondary)",
                  color:      "var(--color-primary)",
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              style={{ fontFamily: "var(--font-heading)" }}
              className="font-semibold text-sm"
            >
              {store.name}
            </span>
          </div>

          {/* Social links */}
          {(socials?.instagram || socials?.facebook || socials?.youtube || socials?.whatsapp) && (
            <div className="flex items-center gap-4">
              {socials.instagram && (
                <Link
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--color-secondary)" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.849c-.062 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.585-.012-4.85-.07c-1.366-.062-2.633-.333-3.608-1.308C2.495 19.383 2.225 18.116 2.163 16.75 2.105 15.484 2.093 15.104 2.093 12s.012-3.585.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.415 2.175 8.795 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 5.775.13 4.602.402 3.635 1.37 2.668 2.337 2.396 3.51 2.338 4.788 2.279 6.068 2.266 6.477 2.266 12s.013 5.932.072 7.212c.058 1.278.33 2.451 1.297 3.418.967.967 2.14 1.239 3.418 1.297C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.058 2.451-.33 3.418-1.297.967-.967 1.239-2.14 1.297-3.418.059-1.28.072-1.688.072-7.213s-.013-5.932-.072-7.212c-.058-1.278-.33-2.451-1.297-3.418-.967-.967-2.14-1.24-3.418-1.297C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </Link>
              )}
              {socials.facebook && (
                <Link
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--color-secondary)" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.254h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                </Link>
              )}
              {socials.whatsapp && (
                <Link
                  href={whatsappUrl(socials.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--color-secondary)" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            opacity:   0.6,
          }}
        >
          <span>© {year} {store.name}. All rights reserved.</span>
          <span>
            Powered by{" "}
            <Link
              href="https://banavoo.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-semibold"
              style={{ color: "var(--color-secondary)" }}
            >
              Banavoo
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
