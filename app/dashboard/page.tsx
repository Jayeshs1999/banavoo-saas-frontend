"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import ProtectedRoute from "../../components/ProtectedRoute";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:    "bg-green-100 text-green-700 border-green-200",
    draft:     "bg-yellow-100 text-yellow-700 border-yellow-200",
    suspended: "bg-red-100 text-red-700 border-red-200",
    closed:    "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const { currentStore } = useStore();

  const isSeller = currentUser?.role === "seller";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">Banavoo</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

          {/* Welcome card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold text-lg">
                {currentUser?.fullName?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-lg leading-tight truncate">
                {currentUser?.fullName}
              </p>
              <p className="text-sm text-gray-500 truncate">{currentUser?.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                {currentUser?.role}
              </span>
              {currentUser?.emailVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* ── SELLER: store summary ─────────────────────────────────────── */}
          {isSeller && currentStore && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{currentStore.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={currentStore.status} />
                    <a
                      href={`https://${currentStore.slug}.banavoo.in`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-500 hover:underline"
                    >
                      {currentStore.slug}.banavoo.in ↗
                    </a>
                  </div>
                </div>
                <Link
                  href="/seller"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Manage Store →
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Products", value: "0" },
                  { label: "Orders",   value: "0" },
                  { label: "Revenue",  value: "₹0" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SELLER: store still loading ───────────────────────────────── */}
          {isSeller && !currentStore && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          )}

          {/* ── BUYER: become seller CTA ──────────────────────────────────── */}
          {!isSeller && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">🛍️</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">Start selling on Banavoo</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">
                    Create your handmade store and reach buyers across India.
                  </p>
                  <Link
                    href="/become-seller"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Activate My Shop →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
            {isSeller && (
              <Link href="/seller" className="hover:text-gray-800 transition-colors">Seller Panel</Link>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
