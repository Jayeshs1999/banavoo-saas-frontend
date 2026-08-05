"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { galleryAPI } from "../../../services/api";
import { PageSpinner } from "@/components/Spinner";
import { Trash2, ImagePlus, X } from "lucide-react";

interface GalleryPhoto {
  _id: string;
  imageUrl: string;
  ownerName: string;
  pgName: string;
  city: string;
  caption: string;
  visitDate: string | null;
  createdAt: string;
}

export default function AdminGallery() {
  const { currentAdmin } = useAuth();
  const router = useRouter();

  const isSuperAdmin = (currentAdmin as any)?.role === "super_admin";

  const [photos, setPhotos]         = useState<GalleryPhoto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Upload form state — only used by super admin
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [ownerName, setOwnerName]   = useState("");
  const [pgName, setPgName]         = useState("");
  const [city, setCity]             = useState("");
  const [caption, setCaption]       = useState("");
  const [visitDate, setVisitDate]   = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formOpen, setFormOpen]     = useState(false);

  // ── guard ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentAdmin) router.push("/admin/login");
  }, [currentAdmin, router]);

  // ── load gallery ─────────────────────────────────────────────
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await galleryAPI.getPhotos({ limit: 100 });
      if (res.success) setPhotos(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  // ── file picker preview ──────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  // ── upload ───────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setUploadError("Please select an image."); return; }
    if (!ownerName.trim() || !pgName.trim() || !city.trim()) {
      setUploadError("Owner name, PG name and city are required.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("ownerName", ownerName.trim());
      fd.append("pgName", pgName.trim());
      fd.append("city", city.trim());
      if (caption.trim()) fd.append("caption", caption.trim());
      if (visitDate) fd.append("visitDate", visitDate);

      const res = await galleryAPI.uploadPhoto(fd);
      if (res.success) {
        setPhotos((prev) => [res.data, ...prev]);
        setFile(null); setPreview(null);
        setOwnerName(""); setPgName(""); setCity("");
        setCaption(""); setVisitDate("");
        setFormOpen(false);
      }
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ── delete ───────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo from the gallery?")) return;
    try {
      await galleryAPI.deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p._id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

  if (!currentAdmin) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><PageSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSuperAdmin
                ? "Upload and manage PG owner visit photos"
                : "View photos from our PG owner field visits"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.back()}
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ← Back
            </button>
            <Link
              href="/gallery"
              className="text-sm px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Public View ↗
            </Link>
            {isSuperAdmin && (
              <button
                onClick={() => setFormOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                <ImagePlus size={16} />
                {formOpen ? "Close Form" : "Add Photo"}
              </button>
            )}
          </div>
        </div>

        {/* ── Super-admin-only: Upload Form ───────────────────── */}
        {isSuperAdmin && formOpen && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4 text-base">Upload Visit Photo</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              {/* Image picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                {preview ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors bg-gray-50">
                    <ImagePlus className="text-gray-400 mb-1" size={28} />
                    <span className="text-xs text-gray-400">Click to select</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PG Owner Name *</label>
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PG Name *</label>
                  <input
                    value={pgName}
                    onChange={(e) => setPgName(e.target.value)}
                    placeholder="e.g. Sunrise PG"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption / Notes</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder="Brief note about the visit…"
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{uploadError}</p>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
              >
                <ImagePlus size={16} />
                {uploading ? "Uploading…" : "Upload Photo"}
              </button>
            </form>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
            <button onClick={fetchPhotos} className="ml-2 underline">Retry</button>
          </div>
        )}

        {/* ── Photos Grid ─────────────────────────────────────── */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col items-center text-center px-4">
            <div className="text-5xl mb-3">📷</div>
            <h3 className="font-semibold text-gray-700 mb-1">No photos yet</h3>
            <p className="text-sm text-gray-400">
              {isSuperAdmin ? "Click \"Add Photo\" to upload your first visit photo." : "Check back soon — the gallery will be filled with visit photos."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.ownerName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* delete button — super admin only */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-800 text-sm truncate">{photo.ownerName}</p>
                  <p className="text-xs text-indigo-600 font-medium truncate">{photo.pgName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {photo.city}
                    {fmt(photo.visitDate) && <span className="ml-1">· {fmt(photo.visitDate)}</span>}
                  </p>
                  {photo.caption && (
                    <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">{photo.caption}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">Added {fmt(photo.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center pt-2">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} in gallery
        </p>
      </div>
    </div>
  );
}
