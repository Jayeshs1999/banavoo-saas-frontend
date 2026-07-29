"use client";

import {
  useState, useEffect, useCallback, useRef,
  type ChangeEvent, type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { superAdminAPI } from "@/services/api";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const LIMIT = 10;
const DEBOUNCE_MS = 400;

type Tab = "overview" | "pg-owners" | "users" | "pgs" | "locations" | "bookings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "pg-owners", label: "PG Owners", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "users",     label: "Users",     icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "pgs",       label: "PGs",       icon: "M3 9.75L12 3l9 6.75V21H3V9.75z" },
  { id: "locations", label: "Locations", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { id: "bookings",  label: "Bookings",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

const BOOKING_STATUSES = ["", "pending", "approved", "rejected", "cancelled"] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   PURE HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fmt  = (n: number | null | undefined) => (n ?? 0).toLocaleString("en-IN");
const fmtRs = (n: number | null | undefined) => "₹" + (n ?? 0).toLocaleString("en-IN");
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM HOOK: useDebounce
───────────────────────────────────────────────────────────────────────────── */
function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM HOOK: useServerTable
   Manages page, search input (debounced), loading, error, data + pagination
   for a single server-side paginated list.
───────────────────────────────────────────────────────────────────────────── */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function useServerTable<TRow, TExtra = undefined>(
  fetcher: (params: { page: number; limit: number; search: string }) => Promise<any>,
  extraExtractor?: (res: any) => TExtra,
) {
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState("");
  const [data,    setData]    = useState<TRow[]>([]);
  const [meta,    setMeta]    = useState<PaginationMeta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [extra,   setExtra]   = useState<TExtra | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  // bump this to force a re-fetch (used by retry)
  const [tick,    setTick]    = useState(0);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // When search changes, reset to page 1
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  // The actual fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetcher({ page, limit: LIMIT, search: debouncedSearch })
      .then((res) => {
        if (cancelled) return;
        setData(res.data ?? []);
        setMeta(res.pagination ?? { page, limit: LIMIT, total: 0, totalPages: 0 });
        if (extraExtractor) setExtra(extraExtractor(res));
      })
      .catch((e: any) => {
        if (!cancelled) setError(e.message ?? "Failed to load");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, debouncedSearch, fetcher, tick]);

  const retry = useCallback(() => {
    setError("");
    setTick((n) => n + 1); // increment tick to force re-fetch
  }, []);

  return { page, setPage, search, setSearch, data, meta, extra, loading, error, retry };
}

/* ─────────────────────────────────────────────────────────────────────────────
   UI ATOMS
───────────────────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14">
      <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-sm text-red-600 font-medium text-center max-w-xs">{message}</p>
      <button onClick={onRetry} className="text-xs border border-primary/30 text-primary px-4 py-1.5 rounded-lg hover:bg-primary/5">Retry</button>
    </div>
  );
}

function KpiCard({ label, value, sub, accent = "text-gray-900" }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

type BadgeColor = "green" | "red" | "yellow" | "gray" | "blue" | "purple";
function Badge({ label, color }: { label: string; color: BadgeColor }) {
  const cls: Record<BadgeColor, string> = {
    green:  "bg-green-100 text-green-700",
    red:    "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray:   "bg-gray-100 text-gray-500",
    blue:   "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cls[color]}`}>{label}</span>;
}

function statusColor(s: string): BadgeColor {
  return s === "approved" ? "green" : s === "pending" ? "yellow" : s === "rejected" ? "red" : "gray";
}

/* ─────────────────────────────────────────────────────────────────────────────
   SERVER-PAGINATED TABLE WRAPPER
───────────────────────────────────────────────────────────────────────────── */
interface TableWrapperProps {
  columns: string[];
  rows: ReactNode[][];
  loading: boolean;
  error: string;
  onRetry: () => void;
  meta: PaginationMeta;
  onPageChange: (p: number) => void;
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  /** Optional extra controls (e.g. status filter) */
  extraControls?: ReactNode;
}

function TableWrapper({
  columns, rows, loading, error, onRetry,
  meta, onPageChange,
  search, onSearch, searchPlaceholder = "Search…",
  extraControls,
}: TableWrapperProps) {
  const { page, total, totalPages, limit } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums: (number | "…")[] = [1];
    if (page > 3)            nums.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) nums.push(i);
    if (page < totalPages - 2) nums.push("…");
    if (totalPages > 1)      nums.push(totalPages);
    return nums;
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {extraControls}
        </div>
        <p className="text-xs text-gray-400 shrink-0">
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 border border-gray-300 border-t-primary rounded-full animate-spin" />
              Loading…
            </span>
          ) : (
            <>
              <span className="font-medium text-gray-700">{start}–{end}</span> of{" "}
              <span className="font-medium text-gray-700">{fmt(total)}</span> results
            </>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {error ? (
              <tr><td colSpan={columns.length}><ErrorState message={error} onRetry={onRetry} /></td></tr>
            ) : loading ? (
              <tr><td colSpan={columns.length}><Spinner /></td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-sm text-gray-400">
                  {search ? `No results for "${search}"` : "No records found."}
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50/70 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-700 whitespace-nowrap text-sm">{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!error && !loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-1.5 text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === p ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function SuperAdminPortal() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── auth guard ── */
  useEffect(() => {
    if (currentAdmin === null) return;
    if ((currentAdmin as any).role !== "super_admin") router.push("/admin/login");
  }, [currentAdmin, router]);

  /* ── Overview data (simple, no pagination) ── */
  const [dashData,    setDashData]    = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError,   setDashError]   = useState("");

  const fetchDash = useCallback(() => {
    setDashLoading(true);
    setDashError("");
    superAdminAPI.getDashboard()
      .then(setDashData)
      .catch((e: any) => setDashError(e.message ?? "Failed"))
      .finally(() => setDashLoading(false));
  }, []);

  useEffect(() => {
    if ((currentAdmin as any)?.role === "super_admin") fetchDash();
  }, [currentAdmin, fetchDash]);

  /* ── PG Owners tab ── */
  const adminsTable = useServerTable(
    useCallback((p) => superAdminAPI.getAdmins(p), []),
  );

  /* ── Users tab ── */
  const usersTable = useServerTable(
    useCallback((p) => superAdminAPI.getUsers(p), []),
  );

  /* ── PGs tab ── */
  const pgsTable = useServerTable(
    useCallback((p) => superAdminAPI.getPGs(p), []),
  );

  /* ── Locations tab ── */
  const [locSearch,  setLocSearch]  = useState("");
  const debouncedLocSearch = useDebounce(locSearch, DEBOUNCE_MS);
  const [locData,    setLocData]    = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [locError,   setLocError]   = useState("");

  const fetchLocations = useCallback((search: string) => {
    setLocLoading(true);
    setLocError("");
    superAdminAPI.getLocations({ search })
      .then((res) => setLocData(res.data ?? res))
      .catch((e: any) => setLocError(e.message ?? "Failed"))
      .finally(() => setLocLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "locations") fetchLocations(debouncedLocSearch);
  }, [activeTab, debouncedLocSearch, fetchLocations]);

  /* ── Bookings tab (has an extra status filter) ── */
  const [bookStatus, setBookStatus] = useState("");
  const debouncedBookStatus = bookStatus; // status change is instant, no debounce needed

  const bookingsTable = useServerTable<any, any>(
    useCallback(
      (p) => superAdminAPI.getBookings({ ...p, status: bookStatus }),
      [bookStatus],
    ),
    (res) => res.stats,
  );
  // When status filter changes, reset to page 1
  useEffect(() => { bookingsTable.setPage(1); }, [debouncedBookStatus]);

  /* ── Lazy-start tabs on first visit ── */
  const visitedRef = useRef<Set<Tab>>(new Set(["overview"]));
  useEffect(() => {
    if ((currentAdmin as any)?.role !== "super_admin") return;
    if (visitedRef.current.has(activeTab)) return;
    visitedRef.current.add(activeTab);
    // trigger initial load by forcing page/search effect on useServerTable
    // Each useServerTable fires its own useEffect on mount when the tab mounts —
    // but since the component is always mounted, we need to bump the page to trigger.
    // The hook's useEffect runs on mount already — this is automatic.
  }, [activeTab, currentAdmin]);

  if (!(currentAdmin as any) || (currentAdmin as any).role !== "super_admin") return null;

  /* ─────────────────── TAB RENDERS ─────────────────── */

  /* OVERVIEW */
  const renderOverview = () => {
    if (dashLoading) return <Spinner />;
    if (dashError)   return <ErrorState message={dashError} onRetry={fetchDash} />;
    if (!dashData)   return null;

    const bk = dashData.bookingStats ?? {};

    return (
      <div className="space-y-8">
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Platform</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="PG Owners"  value={fmt(dashData.adminStats?.totalAdmins)} />
            <KpiCard label="Active PGs" value={fmt(dashData.pgStats?.activePGs)} sub={`of ${fmt(dashData.pgStats?.totalPGs)} total`} accent="text-green-600" />
            <KpiCard label="Total Beds" value={fmt(dashData.roomStats?.totalBeds)} sub={`${fmt(dashData.roomStats?.availableBeds)} free`} />
            <KpiCard label="Occupancy"  value={`${dashData.roomStats?.occupancyRate ?? 0}%`} accent="text-primary" />
          </div>
        </section>
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Bookings</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard label="Total"     value={fmt(bk.total)} />
            <KpiCard label="Pending"   value={fmt(bk.pending)}   accent="text-yellow-600" />
            <KpiCard label="Approved"  value={fmt(bk.approved)}  accent="text-green-600" />
            <KpiCard label="Rejected"  value={fmt(bk.rejected)}  accent="text-red-500" />
            <KpiCard label="Revenue"   value={fmtRs(bk.totalRevenue)} accent="text-primary" sub="approved only" />
          </div>
        </section>
      </div>
    );
  };

  /* PG OWNERS */
  const renderPGOwners = () => (
    <TableWrapper
      columns={["#", "Owner Name", "PG Name", "Email", "Mobile", "City", "State", "Status", "Joined"]}
      rows={adminsTable.data.map((a: any, i: number) => [
        <span key="n" className="text-gray-400 tabular-nums">{(adminsTable.meta.page - 1) * LIMIT + i + 1}</span>,
        <span key="o" className="font-medium">{a.ownerName}</span>,
        a.pgName,
        <span key="e" className="text-gray-500 text-xs">{a.email}</span>,
        a.mobile,
        a.address?.city  ?? "—",
        a.address?.state ?? "—",
        <Badge key="v" label={a.isVerified ? "Verified" : "Pending"} color={a.isVerified ? "green" : "yellow"} />,
        <span key="d" className="text-gray-400 text-xs">{fmtDate(a.createdAt)}</span>,
      ])}
      loading={adminsTable.loading}
      error={adminsTable.error}
      onRetry={adminsTable.retry}
      meta={adminsTable.meta}
      onPageChange={adminsTable.setPage}
      search={adminsTable.search}
      onSearch={adminsTable.setSearch}
      searchPlaceholder="Name, email, city…"
    />
  );

  /* USERS */
  const renderUsers = () => (
    <TableWrapper
      columns={["#", "Full Name", "Email", "Mobile", "Status", "Joined"]}
      rows={usersTable.data.map((u: any, i: number) => [
        <span key="n" className="text-gray-400 tabular-nums">{(usersTable.meta.page - 1) * LIMIT + i + 1}</span>,
        <span key="nm" className="font-medium">{u.firstName} {u.lastName}</span>,
        <span key="e" className="text-gray-500 text-xs">{u.email}</span>,
        u.mobile,
        <Badge key="v" label={u.isVerified ? "Verified" : "Pending"} color={u.isVerified ? "green" : "yellow"} />,
        <span key="d" className="text-gray-400 text-xs">{fmtDate(u.createdAt)}</span>,
      ])}
      loading={usersTable.loading}
      error={usersTable.error}
      onRetry={usersTable.retry}
      meta={usersTable.meta}
      onPageChange={usersTable.setPage}
      search={usersTable.search}
      onSearch={usersTable.setSearch}
      searchPlaceholder="Name, email, mobile…"
    />
  );

  /* PGs */
  const renderPGs = () => (
    <TableWrapper
      columns={["#", "PG Name", "Owner", "City", "State", "Rooms", "Beds", "Free", "Occ%", "Online Pay", "Status"]}
      rows={pgsTable.data.map((p: any, i: number) => [
        <span key="n" className="text-gray-400 tabular-nums">{(pgsTable.meta.page - 1) * LIMIT + i + 1}</span>,
        <span key="nm" className="font-medium">{p.name}</span>,
        p.admin?.ownerName ?? "—",
        p.location?.city   ?? "—",
        p.location?.state  ?? "—",
        <span key="r"  className="tabular-nums">{fmt(p.totalRooms)}</span>,
        <span key="tb" className="tabular-nums">{fmt(p.totalBeds)}</span>,
        <span key="ab" className="tabular-nums text-green-600 font-medium">{fmt(p.availableBeds)}</span>,
        <span key="oc" className="tabular-nums">{p.occupancyRate ?? 0}%</span>,
        <Badge key="op" label={p.onlinePayment ? "Yes" : "No"} color={p.onlinePayment ? "green" : "gray"} />,
        <Badge key="st" label={p.status ?? "active"} color={p.status === "active" ? "green" : "red"} />,
      ])}
      loading={pgsTable.loading}
      error={pgsTable.error}
      onRetry={pgsTable.retry}
      meta={pgsTable.meta}
      onPageChange={pgsTable.setPage}
      search={pgsTable.search}
      onSearch={pgsTable.setSearch}
      searchPlaceholder="PG name, owner, city…"
    />
  );

  /* LOCATIONS */
  const renderLocations = () => {
    // Flatten state→cities
    const flat: { state: string; city: string; pgCount: number; totalRooms: number; totalBeds: number; availableBeds: number; allocatedBeds: number }[] = [];
    (locData as any[]).forEach((s) =>
      (s.cities ?? []).forEach((c: any) =>
        flat.push({ state: s._id, city: c.city, pgCount: c.pgCount, totalRooms: c.totalRooms, totalBeds: c.totalBeds, availableBeds: c.availableBeds, allocatedBeds: c.allocatedBeds })
      )
    );

    return (
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={locSearch}
              onChange={(e) => setLocSearch(e.target.value)}
              placeholder="State or city…"
              className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {locLoading && <span className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-3 h-3 border border-gray-300 border-t-primary rounded-full animate-spin" />Searching…</span>}
        </div>

        {locError ? <ErrorState message={locError} onRetry={() => fetchLocations(debouncedLocSearch)} /> : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["#", "State", "City", "PGs", "Rooms", "Total Beds", "Available", "Occupied"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {locLoading ? (
                  <tr><td colSpan={8}><Spinner /></td></tr>
                ) : flat.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">{locSearch ? `No results for "${locSearch}"` : "No location data."}</td></tr>
                ) : (
                  flat.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-400 tabular-nums text-sm">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-sm">{r.state}</td>
                      <td className="px-4 py-3 text-sm">{r.city}</td>
                      <td className="px-4 py-3 tabular-nums font-medium text-sm">{fmt(r.pgCount)}</td>
                      <td className="px-4 py-3 tabular-nums text-sm">{fmt(r.totalRooms)}</td>
                      <td className="px-4 py-3 tabular-nums text-sm">{fmt(r.totalBeds)}</td>
                      <td className="px-4 py-3 tabular-nums text-green-600 font-medium text-sm">{fmt(r.availableBeds)}</td>
                      <td className="px-4 py-3 tabular-nums text-red-500 text-sm">{fmt(r.allocatedBeds)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  /* BOOKINGS */
  const renderBookings = () => {
    const bkStats = bookingsTable.extra;

    return (
      <div className="space-y-5">
        {/* Summary cards */}
        {bkStats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard label="Pending"   value={fmt(bkStats.pending)}   accent="text-yellow-600" />
            <KpiCard label="Approved"  value={fmt(bkStats.approved)}  accent="text-green-600" />
            <KpiCard label="Rejected"  value={fmt(bkStats.rejected)}  accent="text-red-500" />
            <KpiCard label="Cancelled" value={fmt(bkStats.cancelled)} />
            <KpiCard label="Revenue"   value={fmtRs(bkStats.totalRevenue)} accent="text-primary" sub="approved only" />
          </div>
        )}

        <TableWrapper
          columns={["#", "Tenant", "Email", "PG", "City", "Amount", "Method", "Status", "Date"]}
          rows={bookingsTable.data.map((b: any, i: number) => [
            <span key="n" className="text-gray-400 tabular-nums">{(bookingsTable.meta.page - 1) * LIMIT + i + 1}</span>,
            <span key="t" className="font-medium">{`${b.userId?.firstName ?? ""} ${b.userId?.lastName ?? ""}`.trim() || "—"}</span>,
            <span key="e" className="text-gray-500 text-xs">{b.userId?.email ?? "—"}</span>,
            b.pgId?.name ?? "—",
            b.pgId?.location?.city ?? "—",
            <span key="a" className="tabular-nums font-medium">{fmtRs(b.totalPrice)}</span>,
            <Badge key="m" label={b.paymentMethod ?? "cash"} color={b.paymentMethod === "online" ? "blue" : "gray"} />,
            <Badge key="s" label={b.status} color={statusColor(b.status)} />,
            <span key="d" className="text-gray-400 text-xs">{fmtDate(b.createdAt)}</span>,
          ])}
          loading={bookingsTable.loading}
          error={bookingsTable.error}
          onRetry={bookingsTable.retry}
          meta={bookingsTable.meta}
          onPageChange={bookingsTable.setPage}
          search={bookingsTable.search}
          onSearch={bookingsTable.setSearch}
          searchPlaceholder="Tenant name, email, PG…"
          extraControls={
            <select
              value={bookStatus}
              onChange={(e) => setBookStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-gray-600"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>{s === "" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          }
        />
      </div>
    );
  };

  /* ─────────────────────── SHELL ─────────────────────── */
  const activeMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top header */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900 leading-none">Super Admin</p>
              <p className="text-[10px] text-gray-400">Bedwale.in</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-xs font-semibold text-gray-700">{(currentAdmin as any).ownerName ?? "Super Admin"}</span>
            <span className="text-[10px] text-gray-400">{(currentAdmin as any).email ?? ""}</span>
          </div>
          <button
            onClick={() => { logout(); router.push("/admin/login"); }}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-14 bottom-0 left-0 z-20 w-56 bg-white border-r border-gray-200
          flex flex-col overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:top-0 lg:translate-x-0 lg:flex lg:w-56 lg:shrink-0
        `}>
          <nav className="flex flex-col gap-0.5 p-3 flex-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                    isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={tab.icon} />
                  </svg>
                  {tab.label}
                  {/* Live totals in sidebar */}
                  {tab.id === "pg-owners" && adminsTable.meta.total > 0 && (
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{fmt(adminsTable.meta.total)}</span>
                  )}
                  {tab.id === "users" && usersTable.meta.total > 0 && (
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{fmt(usersTable.meta.total)}</span>
                  )}
                  {tab.id === "pgs" && pgsTable.meta.total > 0 && (
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{fmt(pgsTable.meta.total)}</span>
                  )}
                  {tab.id === "bookings" && bookingsTable.meta.total > 0 && (
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{fmt(bookingsTable.meta.total)}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center">Bedwale.in · Super Admin</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
            {/* Page title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-0.5">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={activeMeta.icon} />
                </svg>
                <h1 className="text-xl font-bold text-gray-900">{activeMeta.label}</h1>
              </div>
              <p className="text-xs text-gray-400 ml-7">
                {activeTab === "overview"  && "Live platform statistics"}
                {activeTab === "pg-owners" && "All registered PG owners · server-paginated · live search"}
                {activeTab === "users"     && "All registered tenants · server-paginated · live search"}
                {activeTab === "pgs"       && "All listed PGs with occupancy · server-paginated · live search"}
                {activeTab === "locations" && "City & state distribution · live search"}
                {activeTab === "bookings"  && "All bookings · server-paginated · live search + status filter"}
              </p>
            </div>

            {activeTab === "overview"  && renderOverview()}
            {activeTab === "pg-owners" && renderPGOwners()}
            {activeTab === "users"     && renderUsers()}
            {activeTab === "pgs"       && renderPGs()}
            {activeTab === "locations" && renderLocations()}
            {activeTab === "bookings"  && renderBookings()}
          </div>
        </main>
      </div>
    </div>
  );
}
