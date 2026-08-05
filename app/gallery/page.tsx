"use client";

import { useState, useEffect, useCallback } from "react";
import { galleryAPI } from "../../services/api";

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

export default function GalleryPage() {
  const [photos, setPhotos]       = useState<GalleryPhoto[]>([]);
  const [cities, setCities]       = useState<string[]>([]);
  const [selectedCity, setCity]   = useState("");
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightbox, setLightbox]   = useState<GalleryPhoto | null>(null);

  // ── fetch cities once ──────────────────────────────────────────
  useEffect(() => {
    galleryAPI.getCities().then((r) => { if (r.success) setCities(r.data); }).catch(() => {});
  }, []);

  // ── fetch page 1 when city filter changes ─────────────────────
  const fetchPage1 = useCallback(async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getPhotos({ page: 1, limit: 18, city: selectedCity || undefined });
      if (res.success) {
        setPhotos(res.data);
        setHasMore(res.pagination.hasMore);
        setPage(2);
      }
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  }, [selectedCity]);

  useEffect(() => { fetchPage1(); }, [fetchPage1]);

  // ── load more ──────────────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await galleryAPI.getPhotos({ page, limit: 18, city: selectedCity || undefined });
      if (res.success) {
        setPhotos((p) => [...p, ...res.data]);
        setHasMore(res.pagination.hasMore);
        setPage((p) => p + 1);
      }
    } catch { /* silently ignore */ }
    finally { setLoadingMore(false); }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 px-4 py-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
          Our PG Owner Visits
        </h1>
        <p className="text-indigo-100 text-base max-w-xl mx-auto">
          A glimpse into our field visits — meeting PG owners, verifying properties and building trust across India.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── City filter pills ──────────────────────── */}
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCity("")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCity === ""
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              All Cities
            </button>
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedCity === c
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ───────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-200 animate-pulse aspect-[4/5]" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No photos yet</h3>
            <p className="text-sm text-gray-400">
              {selectedCity ? `No visit photos for ${selectedCity} yet.` : "Gallery is empty — check back soon!"}
            </p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="break-inside-avoid rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow cursor-pointer group bg-white"
                  onClick={() => setLightbox(photo)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={`${photo.ownerName} — ${photo.pgName}`}
                    loading="lazy"
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{photo.ownerName}</p>
                    <p className="text-xs text-indigo-600 font-medium truncate">{photo.pgName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <span>📍</span>{photo.city}
                      {fmt(photo.visitDate) && <span className="ml-1">· {fmt(photo.visitDate)}</span>}
                    </p>
                    {photo.caption && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">{photo.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.imageUrl}
              alt={lightbox.ownerName}
              className="w-full max-h-[60vh] object-contain bg-gray-100"
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-base">{lightbox.ownerName}</p>
                  <p className="text-indigo-600 font-medium text-sm truncate">{lightbox.pgName}</p>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span>📍</span> {lightbox.city}
                {fmt(lightbox.visitDate) && <span className="ml-2">🗓 {fmt(lightbox.visitDate)}</span>}
              </p>
              {lightbox.caption && (
                <p className="mt-2 text-sm text-gray-600 italic border-t border-gray-100 pt-2">{lightbox.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
