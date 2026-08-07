"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageSpinner } from "@/components/Spinner";
import { bookingAPI, reviewAPI } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { MessageSquare, Calendar, BedDouble, User, CreditCard, Clock, ChevronDown, ChevronUp, AlertTriangle, Star } from "lucide-react";

interface BedItem {
  roomId: string;
  bedId: string;
  roomName?: string;
  bedNumber?: number | string;
  bedPrice?: number;
  pricingPeriod?: "day" | "month";
  totalPrice?: number;
}

interface Booking {
  _id: string;
  pgId: {
    _id: string;
    name: string;
    location: { subcity: string; city: string; state: string };
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  /** Multi-bed array (new). Populated for all bookings by the API. */
  beds?: BedItem[];
  /** Legacy scalar fields — kept for backward compat */
  roomId?: string;
  bedId?: string;
  joinDate: string;
  stayDays: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  totalPrice: number;
  paymentMethod: "online" | "cash";
  notes: string;
  createdAt: string;
  updatedAt: string;
  roomName?: string;
  bedNumber?: number | string;
  bedPrice?: number;
  pricingPeriod?: "day" | "month";
  priceBreakdown?: { unitCount: number; unitLabel: string };
}

const STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  approved:  { label: "Approved",  bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  rejected:  { label: "Rejected",  bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500"    },
  cancelled: { label: "Cancelled", bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",   dot: "bg-gray-400"   },
} as const;

export default function AdminRequests() {
  const router = useRouter();
  const { t } = useTranslation();
  useAuth();

  const [bookings, setBookings]             = useState<Booking[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [filter, setFilter]                 = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [inviteSending, setInviteSending]   = useState<string | null>(null);
  const [inviteSent, setInviteSent]         = useState<Record<string, boolean>>({});

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingAPI.getAdminBookings();
      if (response.success) setBookings(response.data);
      else setError("Failed to load booking requests");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;
    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, status);
      if (response.success) {
        setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status } : b)));
        setSelectedBooking(null);
      } else {
        setError(response.message || `Failed to ${status} booking`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${status} booking`);
    }
  };

  const handleSendReviewInvite = async (bookingId: string) => {
    if (!confirm("Send a review invite email to this tenant?")) return;
    setInviteSending(bookingId);
    try {
      const res = await reviewAPI.sendInvite(bookingId);
      if (res.success) {
        setInviteSent((prev) => ({ ...prev, [bookingId]: true }));
      } else {
        alert(res.message || "Failed to send review invite");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send review invite");
    } finally {
      setInviteSending(null);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter);

  const stats = {
    total:    bookings.length,
    pending:  bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("requests.title")}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage booking requests for your PGs</p>
          </div>
          <button
            onClick={() => router.back()}
            className="shrink-0 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    value: stats.total,    color: "text-primary",      bg: "bg-purple-50",  border: "border-purple-100" },
            { label: "Pending",  value: stats.pending,  color: "text-amber-600",    bg: "bg-amber-50",   border: "border-amber-100"  },
            { label: "Approved", value: stats.approved, color: "text-green-600",    bg: "bg-green-50",   border: "border-green-100"  },
            { label: "Rejected", value: stats.rejected, color: "text-red-600",      bg: "bg-red-50",     border: "border-red-100"    },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex flex-col gap-1`}>
              <span className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p>{error}</p>
              <button onClick={fetchBookings} className="mt-1 underline font-medium hover:text-red-900">Retry</button>
            </div>
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                filter === s
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
              {s !== "all" && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === s ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"
                }`}>
                  {s === "pending" ? stats.pending : s === "approved" ? stats.approved : stats.rejected}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Booking Cards ── */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-16 flex flex-col items-center gap-3 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">📭</div>
            <h3 className="font-semibold text-gray-800">No bookings found</h3>
            <p className="text-sm text-gray-500">
              {filter === "pending" ? "No pending requests at the moment" : `No ${filter} bookings`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const sc = STATUS_CONFIG[booking.status];
              const isExpired = booking.status === "pending" && new Date(booking.joinDate) < new Date();
              const isExpanded = expandedId === booking._id;

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* ── Card Top ── */}
                  <div className="p-4 sm:p-5">

                    {/* Row 1: PG name + status + date */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-semibold text-gray-900 text-base truncate">
                          {booking.pgId?.name || "Unknown PG"}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{fmt(booking.createdAt)}</span>
                    </div>

                    {/* Row 2: key info chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <InfoChip icon={<User size={12} />}
                        text={`${booking.userId?.firstName} ${booking.userId?.lastName}`} />
                      {/* Beds: show all if multi-bed, else legacy single */}
                      {booking.beds && booking.beds.length > 0 ? (
                        booking.beds.map((b, i) => (
                          <InfoChip
                            key={i}
                            icon={<BedDouble size={12} />}
                            text={`${b.roomName || "Room"} · Bed #${b.bedNumber || b.bedId}`}
                          />
                        ))
                      ) : (
                        <InfoChip icon={<BedDouble size={12} />}
                          text={`${booking.roomName || "Room"} · Bed #${booking.bedNumber || booking.bedId}`} />
                      )}
                      <InfoChip icon={<Calendar size={12} />}
                        text={`Join ${fmt(booking.joinDate)}`} />
                      <InfoChip icon={<Clock size={12} />}
                        text={`${booking.stayDays} ${booking.stayDays === 1 ? "day" : "days"}`} />
                      <InfoChip icon={<CreditCard size={12} />}
                        text={`₹${booking.totalPrice.toLocaleString()} · ${booking.paymentMethod}`}
                        highlight />
                    </div>

                    {/* Expired warning */}
                    {isExpired && (
                      <div className="mb-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 text-xs text-orange-800">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                        <span><strong>Join date expired.</strong> Ask the tenant to reschedule, or reject below.</span>
                      </div>
                    )}

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mb-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-600">
                        <span className="font-medium text-gray-700">Note: </span>{booking.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking._id, "approved")}
                            disabled={isExpired}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking._id, "rejected")}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/chat?bookingId=${booking._id}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 text-sm font-medium transition-colors"
                      >
                        <MessageSquare size={14} />
                        Chat
                      </Link>
                      {booking.status === "approved" && (
                        <button
                          onClick={() => handleSendReviewInvite(booking._id)}
                          disabled={inviteSending === booking._id || inviteSent[booking._id]}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Star size={13} />
                          {inviteSent[booking._id]
                            ? "Invite Sent ✓"
                            : inviteSending === booking._id
                            ? "Sending…"
                            : "Review Invite"}
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        Details
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded Details ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                          <DetailRow label="PG Name"       value={booking.pgId?.name} />
                          <DetailRow label="Location"      value={[booking.pgId?.location?.subcity, booking.pgId?.location?.city].filter(Boolean).join(", ") || "—"} />
                          <DetailRow label="Tenant"        value={`${booking.userId?.firstName} ${booking.userId?.lastName}`} />
                          <DetailRow label="Email"         value={booking.userId?.email} small />
                          <DetailRow label="Mobile"        value={booking.userId?.mobile} />
                          {/* Multi-bed display */}
                          {booking.beds && booking.beds.length > 0 ? (
                            booking.beds.map((b, i) => (
                              <DetailRow
                                key={i}
                                label={booking.beds!.length > 1 ? `Bed ${i + 1}` : "Bed"}
                                value={`${b.roomName || b.roomId} · #${b.bedNumber || b.bedId}`}
                              />
                            ))
                          ) : (
                            <>
                              <DetailRow label="Room" value={booking.roomName || booking.roomId} />
                              <DetailRow label="Bed"  value={`#${booking.bedNumber || booking.bedId}`} />
                            </>
                          )}
                          <DetailRow label="Join Date"     value={fmt(booking.joinDate)} />
                          <DetailRow label="Stay"          value={`${booking.stayDays} days`} />
                          <DetailRow label="Payment"       value={booking.paymentMethod} capitalize />
                          <DetailRow label="Requested on"  value={fmt(booking.createdAt)} />
                          <DetailRow
                            label="Total"
                            value={`₹${booking.totalPrice.toLocaleString()}`}
                            sub={booking.priceBreakdown
                              ? booking.bedPrice
                                ? `₹${booking.bedPrice} × ${booking.priceBreakdown.unitCount} ${booking.priceBreakdown.unitLabel}`
                                : `${booking.priceBreakdown.unitCount} ${booking.priceBreakdown.unitLabel}`
                              : undefined}
                            highlight
                          />
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail Modal (kept for backward compat, triggered from selectedBooking) ── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* modal handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                 <DetailRow label="PG Name"      value={selectedBooking.pgId?.name} />
                 <DetailRow label="Status"       value={STATUS_CONFIG[selectedBooking.status].label} />
                 {/* Multi-bed display */}
                 {selectedBooking.beds && selectedBooking.beds.length > 0 ? (
                   selectedBooking.beds.map((b, i) => (
                     <DetailRow
                       key={i}
                       label={selectedBooking.beds!.length > 1 ? `Bed ${i + 1}` : "Bed"}
                       value={`${b.roomName || b.roomId} · #${b.bedNumber || b.bedId}`}
                     />
                   ))
                 ) : (
                   <>
                     <DetailRow label="Room" value={selectedBooking.roomName || selectedBooking.roomId} />
                     <DetailRow label="Bed"  value={`#${selectedBooking.bedNumber || selectedBooking.bedId}`} />
                   </>
                 )}
                 <DetailRow label="Tenant"       value={`${selectedBooking.userId?.firstName} ${selectedBooking.userId?.lastName}`} />
                 <DetailRow label="Email"        value={selectedBooking.userId?.email} small />
                 <DetailRow label="Mobile"       value={selectedBooking.userId?.mobile} />
                 <DetailRow label="Join Date"    value={fmt(selectedBooking.joinDate)} />
                 <DetailRow label="Stay"         value={`${selectedBooking.stayDays} days`} />
                 <DetailRow label="Payment"      value={selectedBooking.paymentMethod} capitalize />
                 <DetailRow label="Requested on" value={fmt(selectedBooking.createdAt)} />
                 <DetailRow
                   label="Total"
                   value={`₹${selectedBooking.totalPrice.toLocaleString()}`}
                   sub={selectedBooking.priceBreakdown
                     ? selectedBooking.bedPrice
                       ? `₹${selectedBooking.bedPrice} × ${selectedBooking.priceBreakdown.unitCount} ${selectedBooking.priceBreakdown.unitLabel}`
                       : `${selectedBooking.priceBreakdown.unitCount} ${selectedBooking.priceBreakdown.unitLabel}`
                     : undefined}
                   highlight
                 />
               </div>

              {selectedBooking.notes && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Notes: </span>{selectedBooking.notes}
                </div>
              )}

              {selectedBooking.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking._id, "approved")}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking._id, "rejected")}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small reusable sub-components ─────────────────────── */

function InfoChip({ icon, text, highlight = false }: { icon: React.ReactNode; text: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
      highlight
        ? "bg-primary/8 text-primary border border-primary/15"
        : "bg-gray-100 text-gray-600"
    }`}>
      {icon}
      {text}
    </span>
  );
}

function DetailRow({
  label, value, sub, highlight = false, small = false, capitalize = false,
}: {
  label: string;
  value?: string;
  sub?: string;
  highlight?: boolean;
  small?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-medium leading-snug ${highlight ? "text-primary" : "text-gray-800"} ${small ? "text-xs" : "text-sm"} ${capitalize ? "capitalize" : ""}`}>
        {value || "—"}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
