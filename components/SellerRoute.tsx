"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../app/context/AuthContext";

interface SellerRouteProps {
  children: React.ReactNode;
  /**
   * "require-seller" (default) — only sellers may access; buyers/guests are redirected.
   * "require-buyer"            — only non-sellers may access (e.g. /become-seller).
   */
  mode?: "require-seller" | "require-buyer";
}

/**
 * SellerRoute — client-side guard for seller-specific pages.
 *
 * Usage (require-seller):
 *   Unauthenticated → /login
 *   Email not verified → /verify-email
 *   Buyer (no store) → /become-seller
 *   Seller → renders children ✓
 *
 * Usage (require-buyer):
 *   Unauthenticated → /login
 *   Seller (has store) → /seller
 *   Buyer / unverified → renders children ✓
 */
export default function SellerRoute({
  children,
  mode = "require-seller",
}: SellerRouteProps) {
  const router = useRouter();
  const { currentUser, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (mode === "require-seller") {
      if (!currentUser.emailVerified) {
        router.replace("/verify-email");
        return;
      }
      if (currentUser.role !== "seller") {
        router.replace("/become-seller");
      }
    }

    if (mode === "require-buyer") {
      if (currentUser.role === "seller") {
        router.replace("/seller");
      }
    }
  }, [currentUser, initializing, mode, router]);

  // Render nothing during initialisation or while redirecting
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!currentUser) return null;
  if (mode === "require-seller" && currentUser.role !== "seller") return null;
  if (mode === "require-buyer"  && currentUser.role === "seller")  return null;

  return <>{children}</>;
}
