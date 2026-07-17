"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthData, useAuth } from "../../context/AuthContext";
import { pgAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Amenities {
  wifiAvailable?: boolean;
  acAvailable?: boolean;
  messAvailable?: boolean;
  gymAvailable?: boolean;
  twoWheelerParking?: boolean;
  fourWheelerParking?: boolean;
  attachedBathroom?: boolean;
  washingMachineAvailable?: boolean;
  powerBackup?: boolean;
  cctvAvailable?: boolean;
  studyRoomAvailable?: boolean;
  geyserAvailable?: boolean;
}

interface PG {
  _id: string;
  id?: string;
  name: string;
  photos: string[];
  structure: Array<{
    _id: string;
    id?: string;
    name: string;
    beds: Array<{ _id: string; id?: string; allocated: boolean; price: number }>;
    price: number;
    pricingPeriod: "day" | "month";
  }>;
  onlinePayment: boolean;
  amenities?: Amenities;
  location: {
    subcity: string;
    city: string;
    state: string;
    country: string;
    pin: string;
  };
  adminId?: { _id: string; pgName: string; ownerName: string; email: string };
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const PAGE_SIZE = 9;

const AMENITY_FILTERS: {
  key: keyof Amenities;
  label: string;
  icon: string;
}[] = [
  { key: "wifiAvailable",          label: "WiFi",           icon: "📶" },
  { key: "acAvailable",            label: "AC",             icon: "❄️" },
  { key: "messAvailable",          label: "Mess / Food",    icon: "🍽️" },
  { key: "gymAvailable",           label: "Gym",            icon: "💪" },
  { key: "twoWheelerParking",      label: "2W Parking",     icon: "🛵" },
  { key: "fourWheelerParking",     label: "4W Parking",     icon: "🚗" },
  { key: "attachedBathroom",       label: "Attached Bath",  icon: "🚿" },
  { key: "washingMachineAvailable",label: "Washing Machine",icon: "👕" },
  { key: "powerBackup",            label: "Power Backup",   icon: "🔋" },
  { key: "cctvAvailable",          label: "CCTV",           icon: "📷" },
  { key: "studyRoomAvailable",     label: "Study Room",     icon: "📚" },
  { key: "geyserAvailable",        label: "Geyser",         icon: "🚰" },
];

const SORT_OPTIONS = [
  { value: "default",   label: "Default" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc",label: "Price: High → Low" },
  { value: "beds_desc", label: "Most Beds Available" },
  { value: "name_asc",  label: "Name: A → Z" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getAvailableBeds(pg: PG) {
  return pg.structure.reduce(
    (acc, room) => acc + room.beds.filter((b) => !b.allocated).length,
    0,
  );
}
function getMinPrice(pg: PG) {
  if (!pg.structure.length) return 0;
  return Math.min(...pg.structure.map((r) => r.price));
}

/* ─── Skeleton card ─────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded-full w-20" />
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
}

/* ─── PG Card ────────────────────────────────────────────────────────────── */
function PGCard({ pg, onBook }: { pg: PG; onBook: (id: string) => void }) {
  const router = useRouter();
  const availBeds = getAvailableBeds(pg);
  const minPrice  = getMinPrice(pg);
  const pgId = pg._id || pg.id!;

  const shownAmenities = AMENITY_FILTERS.filter(
    (a) => pg.amenities?.[a.key],
  ).slice(0, 4);

  return (
    <article className="group rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* ── Photo ── */}
      <div
        className="relative h-48 cursor-pointer overflow-hidden flex-shrink-0"
        onClick={() => router.push(`/pg/${pgId}`)}
      >
        {pg.photos?.[0] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={pg.photos[0]}
            alt={pg.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        {/* Gradient overlay + name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <h3 className="absolute bottom-0 left-0 right-0 px-3 pb-2 text-white font-semibold text-base leading-snug drop-shadow">
          {pg.name}
        </h3>
        {/* Availability badge top-right */}
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
          availBeds > 0
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}>
          {availBeds > 0 ? `${availBeds} beds free` : "Full"}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Location */}
        <div className="flex items-start gap-1.5 text-sm text-gray-500">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="leading-tight">
            {pg.location?.subcity}, {pg.location?.city}, {pg.location?.state}
          </span>
        </div>

        {/* Amenity pills */}
        {shownAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shownAmenities.map((a) => (
              <span key={a.key} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                {a.icon} {a.label}
              </span>
            ))}
            {AMENITY_FILTERS.filter((a) => pg.amenities?.[a.key]).length > 4 && (
              <span className="text-xs text-gray-400">
                +{AMENITY_FILTERS.filter((a) => pg.amenities?.[a.key]).length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Price + tags */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">from</span>
            <div className="text-lg font-bold text-blue-600 leading-tight">
              ₹{minPrice.toLocaleString()}
              <span className="text-xs text-gray-400 font-normal ml-0.5">
                /{pg.structure[0]?.pricingPeriod === "day" ? "day" : "mo"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {pg.onlinePayment && (
              <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                💳 Online Pay
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onBook(pgId)}
            disabled={availBeds === 0}
            className="flex-1 py-2 px-3 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {availBeds === 0 ? "Fully Occupied" : pg.onlinePayment ? "Book Now" : "Send Request"}
          </button>
          <button
            onClick={() => router.push(`/pg/${pgId}`)}
            className="py-2 px-3 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function UserDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { t }  = useTranslation();

  /* ── Filter state ── */
  const [search,      setSearch]      = useState("");
  const [city,        setCity]        = useState("");
  const [subcity,     setSubcity]     = useState("");
  const [state,       setState]       = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [onlyAvail,   setOnlyAvail]   = useState(false);
  const [onlyOnline,  setOnlyOnline]  = useState(false);
  const [amenFilters, setAmenFilters] = useState<Set<keyof Amenities>>(new Set());
  const [sortBy,      setSortBy]      = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ── Server-pagination state ── */
  const [pgs,        setPgs]        = useState<PG[]>([]);        // accumulated pages
  const [total,      setTotal]      = useState(0);               // total matching on server
  const [page,       setPage]       = useState(1);               // next page to fetch
  const [hasMore,    setHasMore]    = useState(false);
  const [loading,    setLoading]    = useState(true);            // initial / filter load
  const [loadingMore,setLoadingMore]= useState(false);           // sentinel load
  const [error,      setError]      = useState<string | null>(null);

  /* ── Quick-filter pills: collected from first page results ── */
  const [allCities, setAllCities]   = useState<string[]>([]);
  const [allStates, setAllStates]   = useState<string[]>([]);

  /* ── Debounce timer ref ── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Sentinel ref ── */
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  Build query params object from current filter state                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const buildParams = useCallback((pageNum: number) => {
    const params: Parameters<typeof pgAPI.getAllPGsPublic>[0] = {
      page:  pageNum,
      limit: PAGE_SIZE,
    };
    if (search)      params.search       = search;
    if (city)        params.city         = city;
    if (subcity)     params.subcity      = subcity;
    if (state)       params.state        = state;
    if (minPrice)    params.minPrice     = minPrice;
    if (maxPrice)    params.maxPrice     = maxPrice;
    if (onlyAvail)   params.availableOnly= true;
    if (onlyOnline)  params.onlinePayment= true;
    if (sortBy !== "default") params.sortBy = sortBy;
    if (amenFilters.size > 0) params.amenities = [...amenFilters].join(",");
    return params;
  }, [search, city, subcity, state, minPrice, maxPrice, onlyAvail, onlyOnline, sortBy, amenFilters]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  Fetch page 1 — replaces the current list (called when filters change)  */
  /* ──────────────────────────────────────────────────────────────────────── */
  const fetchPage1 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pgAPI.getAllPGsPublic(buildParams(1));
      if (res.success) {
        setPgs(res.data);
        setTotal(res.pagination.total);
        setHasMore(res.pagination.hasMore);
        setPage(2);
        // Collect unique cities/states for quick-select pills (first load only)
        setAllCities((prev) => {
          const merged = [...new Set([...prev, ...res.data.map((p: PG) => p.location?.city).filter(Boolean)])].sort();
          return merged;
        });
        setAllStates((prev) => {
          const merged = [...new Set([...prev, ...res.data.map((p: PG) => p.location?.state).filter(Boolean)])].sort();
          return merged;
        });
      } else {
        setError("Failed to load PGs");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load PGs");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  Fetch next page — appends to the current list (called by sentinel)     */
  /* ──────────────────────────────────────────────────────────────────────── */
  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await pgAPI.getAllPGsPublic(buildParams(page));
      if (res.success) {
        setPgs((prev) => [...prev, ...res.data]);
        setTotal(res.pagination.total);
        setHasMore(res.pagination.hasMore);
        setPage((p) => p + 1);
      }
    } catch {
      // silently ignore — user can scroll up and back down to retry
    } finally {
      setLoadingMore(false);
    }
  }, [buildParams, page, hasMore, loadingMore]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  Debounce filter changes → fetch page 1                                 */
  /* ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage1();
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchPage1]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  IntersectionObserver — triggers next-page fetch                        */
  /* ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchNextPage(); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage]);

  /* ── Auth guard ── */
  if (!currentUser) {
    const authData = getAuthData();
    if (authData?.userType === "user") { router.push("/user/dashboard"); return null; }
    router.push("/user/login");
    return <div>Loading…</div>;
  }

  /* ── Helpers ── */
  const handleBook = (pgId: string) => router.push(`/user/booking?pgId=${pgId}`);

  const toggleAmen = (key: keyof Amenities) =>
    setAmenFilters((prev) => {
      const n = new Set(prev);
      if (n.has(key)) { n.delete(key); } else { n.add(key); }
      return n;
    });

  const clearAll = () => {
    setSearch(""); setCity(""); setSubcity(""); setState("");
    setMinPrice(""); setMaxPrice("");
    setOnlyAvail(false); setOnlyOnline(false);
    setAmenFilters(new Set()); setSortBy("default");
    setFiltersOpen(false)
  };

  const activeFilterCount =
    (search ? 1 : 0) + (city ? 1 : 0) + (subcity ? 1 : 0) + (state ? 1 : 0) +
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) +
    (onlyAvail ? 1 : 0) + (onlyOnline ? 1 : 0) + amenFilters.size;

  /* ─── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero / Search bar ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-4 py-10">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {t("userDashboard.welcome")}, {currentUser.firstName}! 👋
          </h1>
          <p className="text-blue-200 mt-2 text-base">
            {t("userDashboard.findYourPerfectPG")}
          </p>
        </div>
        {/* Global search */}
        <div className="max-w-2xl mx-auto relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, city, area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-xl text-gray-800 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── Toolbar row ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-white text-blue-600 rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 underline">Clear all</button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {loading ? "Loading…" : `${total} PG${total !== 1 ? "s" : ""} found`}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Expandable filter panel ── */}
        {filtersOpen && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  placeholder="e.g. Pune"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {allCities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {allCities.slice(0, 6).map((c) => (
                      <button key={c} onClick={() => setCity(city === c ? "" : c)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${city === c ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Area / Subcity */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Area / Subcity</label>
                <input
                  type="text"
                  placeholder="e.g. Kothrud"
                  value={subcity}
                  onChange={(e) => setSubcity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All States</option>
                  {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Price Range (₹/mo)</label>
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="Min" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-gray-400 flex-shrink-0">–</span>
                  <input type="number" placeholder="Max" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4 mb-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 font-medium">Available beds only</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyOnline} onChange={(e) => setOnlyOnline(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 font-medium">Online payment only</span>
              </label>
            </div>

            {/* Amenity toggles */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_FILTERS.map((a) => (
                  <button key={a.key} onClick={() => toggleAmen(a.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      amenFilters.has(a.key) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && !filtersOpen && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search     && <Chip label={`"${search}"`}        onRemove={() => setSearch("")} />}
            {city       && <Chip label={`City: ${city}`}      onRemove={() => setCity("")} />}
            {subcity    && <Chip label={`Area: ${subcity}`}   onRemove={() => setSubcity("")} />}
            {state      && <Chip label={`State: ${state}`}    onRemove={() => setState("")} />}
            {minPrice   && <Chip label={`Min ₹${minPrice}`}   onRemove={() => setMinPrice("")} />}
            {maxPrice   && <Chip label={`Max ₹${maxPrice}`}   onRemove={() => setMaxPrice("")} />}
            {onlyAvail  && <Chip label="Available only"       onRemove={() => setOnlyAvail(false)} />}
            {onlyOnline && <Chip label="Online pay"           onRemove={() => setOnlyOnline(false)} />}
            {[...amenFilters].map((k) => {
              const a = AMENITY_FILTERS.find((x) => x.key === k)!;
              return <Chip key={k} label={`${a.icon} ${a.label}`} onRemove={() => toggleAmen(k)} />;
            })}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchPage1} className="text-sm underline hover:text-red-900">Retry</button>
          </div>
        )}

        {/* ── Initial loading skeletons ── */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && pgs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-xl font-semibold text-gray-700">No PGs found</p>
            <p className="text-gray-400 mt-1">Try adjusting your filters</p>
            {activeFilterCount > 0 && (
              <button onClick={clearAll}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── PG grid ── */}
        {!loading && pgs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pgs.map((pg) => (
              <PGCard key={pg._id || pg.id} pg={pg} onBook={handleBook} />
            ))}
          </div>
        )}

        {/* ── Sentinel + loading-more indicator ── */}
        {!loading && (
          <div ref={sentinelRef} className="py-8 flex justify-center">
            {loadingMore ? (
              /* Skeleton row while fetching next page */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : hasMore ? (
              /* Bouncing dots — visible only if sentinel is near but fetch hasn't triggered */
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            ) : pgs.length > 0 ? (
              <p className="text-sm text-gray-400">All {total} PGs loaded</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Chip ───────────────────────────────────────────────────────────────── */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none">✕</button>
    </span>
  );
}
