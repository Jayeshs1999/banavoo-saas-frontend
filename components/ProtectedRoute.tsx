"use client";

import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "./Spinner";

/**
 * ProtectedRoute — wraps pages that require authentication.
 *
 * Waits for session initialization (cookie → /api/auth/me) before deciding
 * whether to redirect, so we don't flash a redirect on first load.
 *
 * Usage:
 *   export default function Page() {
 *     return (
 *       <ProtectedRoute>
 *         <MyProtectedContent />
 *       </ProtectedRoute>
 *     );
 *   }
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, initializing, router]);

  // Show spinner while we confirm the session (cookie → /api/auth/me)
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not logged in — render nothing while the redirect fires
  if (!currentUser) return null;

  return <>{children}</>;
}
