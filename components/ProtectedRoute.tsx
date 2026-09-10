"use client";

import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "../Spinner";

/**
 * ProtectedRoute — wraps pages that require authentication.
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
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, loading, router]);

  if (loading) return <Spinner size="lg" />;
  if (!currentUser) return null;
  return <>{children}</>;
}
