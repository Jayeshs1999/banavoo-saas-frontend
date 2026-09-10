"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { categoryAPI } from "@/services/api";
import type { Category } from "@/types";

// ── Sub-components ─────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  onEdit:   (cat: Category) => void;
  onToggle: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {category.image?.url ? (
          <Image src={category.image.url} alt={category.name} width={40} height={40} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
        <p className="text-xs text-gray-400">{category.slug}</p>
      </div>

      {/* Sort */}
      <span className="text-xs text-gray-400 hidden sm:block">#{category.sortOrder ?? 0}</span>

      {/* Status */}
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
        category.isActive
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-gray-100 text-gray-500 border-gray-200"
      }`}>
        {category.isActive ? "Active" : "Inactive"}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(category)} className="text-xs text-blue-600 hover:underline px-2 py-1">Edit</button>
        <button onClick={() => onToggle(category)} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1">
          {category.isActive ? "Deactivate" : "Activate"}
        </button>
        <button onClick={() => onDelete(category)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Delete</button>
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  category?: Category | null;
  onClose:   () => void;
  onSaved:   () => void;
}

function CategoryModal({ category, onClose, onSaved }: ModalProps) {
  const isEdit = !!category;
  const [name,        setName]        = useState(category?.name        ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [sortOrder,   setSortOrder]   = useState(String(category?.sortOrder ?? 0));
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && category) {
        await categoryAPI.updateCategory(category.id, { name, description, sortOrder: Number(sortOrder) });
      } else {
        await categoryAPI.createCategory({ name, description, sortOrder: Number(sortOrder) });
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Handmade Jewelry"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SellerCategoriesPage() {
  const router             = useRouter();
  const { currentUser, initializing } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);

  useEffect(() => {
    if (initializing) return;
    if (!currentUser || currentUser.role !== "seller") {
      router.replace(currentUser ? "/become-seller" : "/login");
    }
  }, [currentUser, initializing, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await categoryAPI.getCategories(params);
      if (res.success && res.data) setCategories(res.data.categories);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (cat: Category) => {
    try {
      await categoryAPI.updateCategory(cat.id, { isActive: !cat.isActive });
      showToast(`Category ${cat.isActive ? "deactivated" : "activated"}.`);
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      await categoryAPI.deleteCategory(cat.id);
      showToast("Category deleted.");
      load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (initializing) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!currentUser || currentUser.role !== "seller") return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organise your products into categories.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            + New Category
          </Button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3">{toast}</div>
        )}

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3">
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner /></div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">No categories yet.</p>
              <p className="text-gray-400 text-xs mt-1">Create a category to organise your products.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onEdit={(c) => { setEditing(c); setModalOpen(true); }}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Back */}
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
          ← Back
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <CategoryModal
          category={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); showToast("Category saved."); load(); }}
        />
      )}
    </div>
  );
}
