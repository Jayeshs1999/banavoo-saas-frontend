"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";
import { storeAPI } from "../../../services/api";
import Button from "../../../components/Button";

// ── Indian states list (mirrors backend validator) ────────────────────────────
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

// ── Slug generation (mirrors backend slug.js) ─────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  description: string;
  city: string;
  state: string;
  pickupPincode: string;
}

interface FieldErrors {
  name?: string;
  description?: string;
  city?: string;
  state?: string;
  pickupPincode?: string;
  general?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BecomeSellerPage() {
  const router = useRouter();
  const { currentUser, initializing } = useAuth();
  const { createStore, storeLoading } = useStore();

  const [form, setForm] = useState<FormState>({
    name:          "",
    description:   "",
    city:          "",
    state:         "",
    pickupPincode: "",
  });

  const [slugPreview, setSlugPreview]       = useState("");
  const [slugAvailable, setSlugAvailable]   = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking]     = useState(false);
  const [errors, setErrors]                 = useState<FieldErrors>({});

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initializing) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (!currentUser.emailVerified) {
      router.replace("/verify-email");
      return;
    }
    if (currentUser.role === "seller") {
      router.replace("/seller");
    }
  }, [currentUser, initializing, router]);

  // ── Slug preview + debounced availability check ───────────────────────────
  useEffect(() => {
    const slug = generateSlug(form.name);
    setSlugPreview(slug);
    setSlugAvailable(null);
  }, [form.name]);

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) return;
    setSlugChecking(true);
    try {
      const res = await storeAPI.checkSlug(slug);
      setSlugAvailable(res.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!slugPreview) return;
    const timer = setTimeout(() => checkSlugAvailability(slugPreview), 600);
    return () => clearTimeout(timer);
  }, [slugPreview, checkSlugAvailability]);

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = await createStore({
      name:          form.name.trim(),
      description:   form.description.trim(),
      city:          form.city.trim(),
      state:         form.state,
      pickupPincode: form.pickupPincode.trim(),
    });

    if (result.success) {
      router.push("/seller");
      return;
    }

    // Parse structured error if available
    const err = result.error || "Failed to create store.";
    // Check if the error message contains field-level info
    setErrors({ general: err });
  };

  // ── Loading / redirect states ─────────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role === "seller") return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Start selling on Banavoo</h1>
        <p className="text-sm text-gray-500 mb-8">
          Set up your store in minutes. You can update these details later.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Store Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="off"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Priya Crafts"
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}

            {/* Slug preview */}
            {slugPreview && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Your store URL:{" "}
                  <span className="font-mono font-medium text-gray-700">
                    {slugPreview}.banavoo.in
                  </span>
                </span>
                {slugChecking && (
                  <span className="text-xs text-gray-400">checking…</span>
                )}
                {!slugChecking && slugAvailable === true && (
                  <span className="text-xs text-green-600 font-medium">✓ available</span>
                )}
                {!slugChecking && slugAvailable === false && (
                  <span className="text-xs text-red-500 font-medium">✗ taken</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell buyers what you sell (min 10 characters)"
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-0.5">{form.description.length}/500</p>
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* City + State row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Jaipur"
                maxLength={100}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
            </div>
          </div>

          {/* Pickup Pincode */}
          <div>
            <label htmlFor="pickupPincode" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Pincode <span className="text-red-500">*</span>
            </label>
            <input
              id="pickupPincode"
              name="pickupPincode"
              type="text"
              inputMode="numeric"
              value={form.pickupPincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              maxLength={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.pickupPincode && (
              <p className="mt-1 text-xs text-red-600">{errors.pickupPincode}</p>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.general}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={storeLoading}
            className="w-full"
          >
            Create My Store
          </Button>
        </form>
      </div>
    </div>
  );
}
