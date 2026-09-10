"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { productAPI, categoryAPI } from "@/services/api";
import type {
  Product,
  Category,
  ProductImage,
  ProductVariant,
  VariantOption,
} from "@/types";
import { useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ProductFormValues {
  name:             string;
  shortDescription: string;
  description:      string;
  categoryIds:      string[];
  productType:      "simple" | "variable";
  pricing: {
    price:          string;
    compareAtPrice: string;
    costPrice:      string;
    currency:       string;
  };
  inventory: {
    trackInventory:    boolean;
    quantity:          string;
    lowStockThreshold: string;
    allowBackorder:    boolean;
  };
  sku:        string;
  status:     "draft" | "published" | "archived";
  isFeatured: boolean;
  seo: {
    title:       string;
    description: string;
  };
  shipping: {
    weight: string;
    length: string;
    width:  string;
    height: string;
  };
}

interface Props {
  mode:       "create" | "edit";
  productId?: string;
  initial?:   Product | null;
  onSaved:    (product: Product) => void;
}

const DEFAULT: ProductFormValues = {
  name:             "",
  shortDescription: "",
  description:      "",
  categoryIds:      [],
  productType:      "simple",
  pricing:          { price: "0", compareAtPrice: "", costPrice: "", currency: "INR" },
  inventory:        { trackInventory: true, quantity: "0", lowStockThreshold: "5", allowBackorder: false },
  sku:              "",
  status:           "draft",
  isFeatured:       false,
  seo:              { title: "", description: "" },
  shipping:         { weight: "", length: "", width: "", height: "" },
};

function productToForm(p: Product): ProductFormValues {
  return {
    name:             p.name,
    shortDescription: p.shortDescription,
    description:      p.description,
    categoryIds:      p.categoryIds,
    productType:      p.productType,
    pricing: {
      price:          String(p.pricing.price),
      compareAtPrice: p.pricing.compareAtPrice != null ? String(p.pricing.compareAtPrice) : "",
      costPrice:      p.pricing.costPrice      != null ? String(p.pricing.costPrice)      : "",
      currency:       p.pricing.currency,
    },
    inventory: {
      trackInventory:    p.inventory.trackInventory,
      quantity:          String(p.inventory.quantity ?? 0),
      lowStockThreshold: String(p.inventory.lowStockThreshold ?? 5),
      allowBackorder:    p.inventory.allowBackorder,
    },
    sku:        p.sku,
    status:     p.status ?? "draft",
    isFeatured: p.isFeatured,
    seo:        { title: p.seo?.title ?? "", description: p.seo?.description ?? "" },
    shipping: {
      weight: p.shipping?.weight != null ? String(p.shipping.weight) : "",
      length: p.shipping?.length != null ? String(p.shipping.length) : "",
      width:  p.shipping?.width  != null ? String(p.shipping.width)  : "",
      height: p.shipping?.height != null ? String(p.shipping.height) : "",
    },
  };
}

// ── Section heading helper ─────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const textareaCls = `${inputCls} resize-none`;

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductForm({ mode, productId, initial, onSaved }: Props) {
  const [form,       setForm]       = useState<ProductFormValues>(initial ? productToForm(initial) : DEFAULT);
  const [images,     setImages]     = useState<ProductImage[]>(initial?.images ?? []);
  const [variants,   setVariants]   = useState<ProductVariant[]>(initial?.variants ?? []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoryAPI.getCategories({ limit: "100" }).then((res) => {
      if (res.success && res.data) setCategories(res.data.categories);
    }).catch(() => {});
  }, []);

  // Sync if initial changes (edit mode re-fetch)
  useEffect(() => {
    if (initial) {
      setForm(productToForm(initial));
      setImages(initial.images ?? []);
      setVariants(initial.variants ?? []);
    }
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (key: keyof ProductFormValues, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Image upload ──────────────────────────────────────────────────────────

  const handleImageUpload = async (file: File) => {
    if (!productId && mode === "create") {
      // For new products, we need an ID first — save a draft, then upload
      setError("Save the product first, then upload images.");
      return;
    }
    const id = productId!;
    setImgUploading(true);
    try {
      const res = await productAPI.uploadImage(id, file, form.name);
      if (res.success && res.data) setImages(res.data.images as ProductImage[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setImgUploading(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!productId) return;
    try {
      await productAPI.deleteImage(productId, imageId);
      setImages((prev) => prev.filter((img) => img._id !== imageId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  // ── Variant helpers ───────────────────────────────────────────────────────

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        _id:           `new-${Date.now()}`,
        name:          "",
        sku:           "",
        options:       [{ name: "", value: "" }],
        price:         null,
        compareAtPrice: null,
        quantity:      0,
        isActive:      true,
      },
    ]);
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, ...patch } : v));
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariantOption = (vi: number, oi: number, patch: Partial<VariantOption>) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vi
          ? { ...v, options: v.options.map((o, j) => j === oi ? { ...o, ...patch } : o) }
          : v
      )
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name:             form.name,
      shortDescription: form.shortDescription,
      description:      form.description,
      categoryIds:      form.categoryIds,
      productType:      form.productType,
      pricing: {
        price:          parseFloat(form.pricing.price) || 0,
        compareAtPrice: form.pricing.compareAtPrice ? parseFloat(form.pricing.compareAtPrice) : undefined,
        costPrice:      form.pricing.costPrice       ? parseFloat(form.pricing.costPrice)      : undefined,
        currency:       form.pricing.currency,
      },
      inventory: {
        trackInventory:    form.inventory.trackInventory,
        quantity:          parseInt(form.inventory.quantity, 10) || 0,
        lowStockThreshold: parseInt(form.inventory.lowStockThreshold, 10) || 5,
        allowBackorder:    form.inventory.allowBackorder,
      },
      sku:        form.sku,
      status:     publishNow ? "published" as const : form.status,
      isFeatured: form.isFeatured,
      seo: {
        title:       form.seo.title,
        description: form.seo.description,
      },
      shipping: {
        weight: form.shipping.weight ? parseFloat(form.shipping.weight) : undefined,
        length: form.shipping.length ? parseFloat(form.shipping.length) : undefined,
        width:  form.shipping.width  ? parseFloat(form.shipping.width)  : undefined,
        height: form.shipping.height ? parseFloat(form.shipping.height) : undefined,
      },
    };

    try {
      let res;
      if (mode === "edit" && productId) {
        res = await productAPI.updateProduct(productId, payload);
        // Save variants separately
        if (form.productType === "variable" && variants.length > 0) {
          const varRes = await productAPI.setVariants(productId, variants);
          if (!varRes.success) throw new Error(varRes.message || "Failed to save variants.");
        }
      } else {
        res = await productAPI.createProduct(payload);
      }

      if (res.success && res.data) {
        onSaved(res.data);
      } else {
        setError(res.message || "Save failed.");
        if (res.errors && !Array.isArray(res.errors)) setFieldErrors(res.errors);
      }
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string> };
      setError(apiErr.message || "Save failed.");
      if (apiErr.errors) setFieldErrors(apiErr.errors);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">

      {/* Errors */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Section title="Basic Information">
        <Field label="Product Name *">
          <input type="text" value={form.name} onChange={(e) => patch("name", e.target.value)}
            maxLength={200} required className={inputCls} placeholder="e.g. Handmade Blue Ceramic Mug" />
          {fieldErrors.name && <p className="text-xs text-red-600 mt-0.5">{fieldErrors.name}</p>}
        </Field>
        <Field label="Short Description">
          <input type="text" value={form.shortDescription} onChange={(e) => patch("shortDescription", e.target.value)}
            maxLength={300} className={inputCls} placeholder="One-line summary" />
        </Field>
        <Field label="Full Description">
          <textarea value={form.description} onChange={(e) => patch("description", e.target.value)}
            rows={5} className={textareaCls} placeholder="Detailed product description" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU">
            <input type="text" value={form.sku} onChange={(e) => patch("sku", e.target.value.toUpperCase())}
              maxLength={100} className={inputCls} placeholder="MUG-BLUE-001" />
            {fieldErrors.sku && <p className="text-xs text-red-600 mt-0.5">{fieldErrors.sku}</p>}
          </Field>
          <Field label="Product Type">
            <select value={form.productType} onChange={(e) => patch("productType", e.target.value)} className={inputCls}>
              <option value="simple">Simple</option>
              <option value="variable">Variable (with variants)</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories yet. <a href="/seller/categories" className="text-blue-600 hover:underline">Create one first</a>.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const selected = form.categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? form.categoryIds.filter((id) => id !== cat.id)
                      : [...form.categoryIds, cat.id];
                    patch("categoryIds", next);
                  }}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:border-blue-400"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {/* Images */}
      <Section title="Images">
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img._id} className="relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200">
              <Image src={img.url} alt={img.alt} width={80} height={80} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => handleImageDelete(img._id)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < 8 && (
            <button
              type="button"
              disabled={imgUploading}
              onClick={() => imgInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              {imgUploading ? (
                <span className="text-xs">…</span>
              ) : (
                <>
                  <span className="text-xl leading-none">+</span>
                  <span className="text-xs mt-0.5">Add</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={imgInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-gray-400">Up to 8 images. First image is the primary. {mode === "create" && "(Save as draft first, then add images.)"}</p>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹) *">
            <input type="number" value={form.pricing.price} onChange={(e) => patch("pricing", { ...form.pricing, price: e.target.value })}
              min={0} step="0.01" required className={inputCls} />
            {fieldErrors["pricing.price"] && <p className="text-xs text-red-600 mt-0.5">{fieldErrors["pricing.price"]}</p>}
          </Field>
          <Field label="Compare-at Price (₹)" hint="Original price (crossed out)">
            <input type="number" value={form.pricing.compareAtPrice} onChange={(e) => patch("pricing", { ...form.pricing, compareAtPrice: e.target.value })}
              min={0} step="0.01" className={inputCls} placeholder="Optional" />
          </Field>
          <Field label="Cost Price (₹)" hint="Not shown to customers">
            <input type="number" value={form.pricing.costPrice} onChange={(e) => patch("pricing", { ...form.pricing, costPrice: e.target.value })}
              min={0} step="0.01" className={inputCls} placeholder="Optional" />
          </Field>
        </div>
      </Section>

      {/* Inventory (only for simple products) */}
      {form.productType === "simple" && (
        <Section title="Inventory">
          <div className="flex items-center gap-3 mb-3">
            <input type="checkbox" id="trackInventory" checked={form.inventory.trackInventory}
              onChange={(e) => patch("inventory", { ...form.inventory, trackInventory: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="trackInventory" className="text-sm text-gray-700">Track inventory</label>
          </div>
          {form.inventory.trackInventory && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity">
                <input type="number" value={form.inventory.quantity} onChange={(e) => patch("inventory", { ...form.inventory, quantity: e.target.value })}
                  min={0} className={inputCls} />
              </Field>
              <Field label="Low Stock Threshold">
                <input type="number" value={form.inventory.lowStockThreshold} onChange={(e) => patch("inventory", { ...form.inventory, lowStockThreshold: e.target.value })}
                  min={0} className={inputCls} />
              </Field>
            </div>
          )}
          <div className="flex items-center gap-3 mt-1">
            <input type="checkbox" id="allowBackorder" checked={form.inventory.allowBackorder}
              onChange={(e) => patch("inventory", { ...form.inventory, allowBackorder: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="allowBackorder" className="text-sm text-gray-700">Allow backorders</label>
          </div>
        </Section>
      )}

      {/* Variants */}
      {form.productType === "variable" && (
        <Section title="Variants">
          <div className="space-y-4">
            {variants.map((v, vi) => (
              <div key={v._id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Variant {vi + 1}</p>
                  <button type="button" onClick={() => removeVariant(vi)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Variant Name">
                    <input type="text" value={v.name} onChange={(e) => updateVariant(vi, { name: e.target.value })} className={inputCls} placeholder="e.g. Blue / M" />
                  </Field>
                  <Field label="SKU">
                    <input type="text" value={v.sku} onChange={(e) => updateVariant(vi, { sku: e.target.value.toUpperCase() })} className={inputCls} placeholder="KURTA-BLUE-M" />
                  </Field>
                  <Field label="Price (₹)">
                    <input type="number" value={v.price ?? ""} onChange={(e) => updateVariant(vi, { price: e.target.value ? parseFloat(e.target.value) : null })} min={0} className={inputCls} />
                  </Field>
                  <Field label="Quantity">
                    <input type="number" value={v.quantity ?? 0} onChange={(e) => updateVariant(vi, { quantity: parseInt(e.target.value, 10) || 0 })} min={0} className={inputCls} />
                  </Field>
                </div>
                {/* Options */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Options</p>
                  {v.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2 mb-2">
                      <input type="text" value={opt.name}  onChange={(e) => updateVariantOption(vi, oi, { name:  e.target.value })} placeholder="Name (e.g. Color)"  className={`${inputCls} flex-1`} />
                      <input type="text" value={opt.value} onChange={(e) => updateVariantOption(vi, oi, { value: e.target.value })} placeholder="Value (e.g. Blue)" className={`${inputCls} flex-1`} />
                      {v.options.length > 1 && (
                        <button type="button" onClick={() => updateVariant(vi, { options: v.options.filter((_, j) => j !== oi) })} className="text-xs text-red-400 hover:text-red-600 px-2">✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => updateVariant(vi, { options: [...v.options, { name: "", value: "" }] })} className="text-xs text-blue-600 hover:underline">+ Add option</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:underline">+ Add variant</button>
          </div>
        </Section>
      )}

      {/* SEO */}
      <Section title="SEO">
        <Field label="SEO Title" hint={`${form.seo.title.length}/70 characters`}>
          <input type="text" value={form.seo.title} onChange={(e) => patch("seo", { ...form.seo, title: e.target.value })}
            maxLength={70} className={inputCls} placeholder={form.name || "SEO title"} />
        </Field>
        <Field label="SEO Description" hint={`${form.seo.description.length}/170 characters`}>
          <textarea value={form.seo.description} onChange={(e) => patch("seo", { ...form.seo, description: e.target.value })}
            rows={2} maxLength={170} className={textareaCls} />
        </Field>
      </Section>

      {/* Shipping */}
      <Section title="Shipping">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight (g)">
            <input type="number" value={form.shipping.weight} onChange={(e) => patch("shipping", { ...form.shipping, weight: e.target.value })} min={0} className={inputCls} placeholder="0" />
          </Field>
          <Field label="Length (cm)">
            <input type="number" value={form.shipping.length} onChange={(e) => patch("shipping", { ...form.shipping, length: e.target.value })} min={0} className={inputCls} placeholder="0" />
          </Field>
          <Field label="Width (cm)">
            <input type="number" value={form.shipping.width} onChange={(e) => patch("shipping", { ...form.shipping, width: e.target.value })} min={0} className={inputCls} placeholder="0" />
          </Field>
          <Field label="Height (cm)">
            <input type="number" value={form.shipping.height} onChange={(e) => patch("shipping", { ...form.shipping, height: e.target.value })} min={0} className={inputCls} placeholder="0" />
          </Field>
        </div>
      </Section>

      {/* Publishing */}
      <Section title="Publishing">
        <div className="flex items-center gap-3 mb-3">
          <input type="checkbox" id="isFeatured" checked={form.isFeatured}
            onChange={(e) => patch("isFeatured", e.target.checked)}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="isFeatured" className="text-sm text-gray-700">Feature this product on the storefront</label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            {mode === "create" ? "Save as Draft" : "Save Changes"}
          </Button>
          {(mode === "create" || form.status !== "published") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={saving}
              onClick={(e) => handleSubmit(e, true)}
            >
              {mode === "create" ? "Save & Publish" : "Publish"}
            </Button>
          )}
        </div>
      </Section>
    </form>
  );
}
