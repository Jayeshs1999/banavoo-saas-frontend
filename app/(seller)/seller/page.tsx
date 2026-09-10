"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";
import Button from "../../../components/Button";
import type { UpdateStorePayload } from "../../../services/api";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:    "bg-green-100 text-green-700 border-green-200",
    draft:     "bg-yellow-100 text-yellow-700 border-yellow-200",
    suspended: "bg-red-100 text-red-700 border-red-200",
    closed:    "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${
        styles[status] ?? styles.draft
      }`}
    >
      {status}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const { currentUser, initializing } = useAuth();
  const { currentStore, storeLoading, updateStore } = useStore();

  const [editing, setEditing]             = useState(false);
  const [updateError, setUpdateError]     = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Initialise form from store — derived state, updated when store changes
  const [form, setForm] = useState<UpdateStorePayload>(() => ({
    name:          currentStore?.name          ?? "",
    description:   currentStore?.description   ?? "",
    city:          currentStore?.city          ?? "",
    state:         currentStore?.state         ?? "",
    pickupPincode: currentStore?.pickupPincode ?? "",
  }));

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initializing) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser.role !== "seller") {
      router.replace("/become-seller");
    }
  }, [currentUser, initializing, router]);

  // Sync form when store data first loads (after async fetch)
  const storeId = currentStore?.id;
  useEffect(() => {
    if (!currentStore) return;
    setForm({
      name:          currentStore.name,
      description:   currentStore.description   ?? "",
      city:          currentStore.city          ?? "",
      state:         currentStore.state         ?? "",
      pickupPincode: currentStore.pickupPincode ?? "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]); // only re-run when a different store loads, not on every field change

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);
    const result = await updateStore(form);
    if (result.success) {
      setUpdateSuccess(true);
      setEditing(false);
    } else {
      setUpdateError(result.error || "Update failed.");
    }
  };

  // ── Loading / redirect states ─────────────────────────────────────────────
  if (initializing || (currentUser?.role === "seller" && storeLoading && !currentStore)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "seller") return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStore?.name ?? "Your Store"}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {currentStore && <StatusBadge status={currentStore.status} />}
              {currentStore && (
                <a
                  href={`https://${currentStore.slug}.banavoo.in`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline font-mono"
                >
                  {currentStore.slug}.banavoo.in ↗
                </a>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing((v) => !v);
              setUpdateError(null);
              setUpdateSuccess(false);
            }}
          >
            {editing ? "Cancel" : "Edit Store"}
          </Button>
        </div>

        {/* Success banner */}
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            Store updated successfully.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Products" value={0} />
          <StatCard label="Orders" value={0} />
          <StatCard label="Revenue" value="₹0" />
        </div>

        {/* Store details / Edit form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Edit Store Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name ?? ""}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description ?? ""}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    name="city"
                    type="text"
                    value={form.city ?? ""}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={form.state ?? ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Pincode</label>
                <input
                  name="pickupPincode"
                  type="text"
                  inputMode="numeric"
                  value={form.pickupPincode ?? ""}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {updateError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {updateError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" size="sm" loading={storeLoading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Store Information</h2>
              <Row label="Name"          value={currentStore?.name} />
              <Row label="Description"   value={currentStore?.description} />
              <Row label="City"          value={currentStore?.city} />
              <Row label="State"         value={currentStore?.state} />
              <Row label="Pincode"       value={currentStore?.pickupPincode} />
              <Row label="Slug"          value={currentStore ? `${currentStore.slug}.banavoo.in` : undefined} />
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 text-sm items-center">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Dashboard
          </Link>
          <Link href="/seller/products"
            className="inline-flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg">
            Products
          </Link>
          <Link href="/seller/categories"
            className="inline-flex items-center text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg">
            Categories
          </Link>
          <Link
            href="/seller/store/customize"
            className="inline-flex items-center gap-1 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
          >
            ✦ Customize Store
          </Link>
          {currentStore && (
            <a
              href={`/store/${currentStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Storefront ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="w-28 shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value ?? "—"}</span>
    </div>
  );
}
