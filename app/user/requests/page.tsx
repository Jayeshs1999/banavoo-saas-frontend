"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
import { bookingAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";

interface Booking {
  _id: string;
  pgId: {
    _id: string;
    name: string;
    location: {
      subcity: string;
      city: string;
      state: string;
    };
    photos: string[];
  };
  roomId: string;
  bedId: string;
  joinDate: string;
  stayDays: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "online" | "cash";
  notes: string;
  createdAt: string;
  updatedAt: string;
  adminContact?: {
    name: string;
    phone: string;
    email: string;
    pgName: string;
  } | null;
  bedPrice?: number;
  pricingPeriod?: "day" | "month";
  priceBreakdown?: {
    unitCount: number;
    unitLabel: string;
  };
}

export default function UserRequests() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newJoinDate, setNewJoinDate] = useState<string>("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      } else {
        setError("Failed to load bookings");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isJoinDateExpired = (joinDate: string) => {
    return new Date(joinDate) < new Date();
  };

  const todayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // min selectable date is tomorrow
    return d.toISOString().split("T")[0];
  };

  const handleReschedule = async (bookingId: string) => {
    if (!newJoinDate) {
      setRescheduleError("Please select a new join date.");
      return;
    }
    setRescheduleError(null);
    try {
      const response = await bookingAPI.rescheduleBooking(bookingId, newJoinDate);
      if (response.success) {
        setBookings(
          bookings.map((b) =>
            b._id === bookingId
              ? { ...b, joinDate: response.data.joinDate, totalPrice: response.data.totalPrice }
              : b,
          ),
        );
        setReschedulingId(null);
        setNewJoinDate("");
      } else {
        setRescheduleError(response.message || "Failed to reschedule booking");
      }
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t("userRequests.confirmCancel"))) {
      return;
    }

    try {
      const response = await bookingAPI.cancelBooking(bookingId);
      if (response.success) {
        // Update the local state to reflect the cancellation
        setBookings(
          bookings.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled" as const } : b,
          ),
        );
      } else {
        setError(response.message || "Failed to cancel booking");
      }
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      setError(err.message || "Failed to cancel booking");
    }
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/user/requests/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("userRequests.myRequests")}</h1>
        <div className="flex gap-4">
          <Link href="/user/dashboard">
            <Button variant="outline">{t("common.back")}</Button>
          </Link>
          {/* <Button onClick={logout} variant="outline">
            {t("common.logout")}
          </Button> */}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {t("userRequests.noRequestsFound")}
              </p>
              <Link href="/user/dashboard">
                <Button className="mt-4">{t("userRequests.browsePGs")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {t("userRequests.request")} #
                    {booking._id.slice(-6).toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-semibold">
                        {booking.pgId?.name || "PG"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 pl-7">
                      {booking.pgId?.location?.subcity},{" "}
                      {booking.pgId?.location?.city},{" "}
                      {booking.pgId?.location?.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">
                        {t("userRequests.joinDate")}:
                      </span>{" "}
                      {formatDate(booking.joinDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">
                        {t("userRequests.stayDuration")}:
                      </span>{" "}
                      {booking.stayDays}{" "}
                      {booking.stayDays === 1
                        ? t("common.day")
                        : t("common.days")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">
                        {t("userRequests.totalPrice")}:
                      </span>{" "}
                      <span className="font-bold text-lg">
                        ₹{booking.totalPrice.toLocaleString()}
                      </span>
                    </p>
                    {booking.priceBreakdown && (
                      <p className="text-xs text-gray-500 mt-1">
                        (
                        {booking.bedPrice
                          ? `₹${booking.bedPrice} × ${booking.priceBreakdown.unitCount} ${booking.priceBreakdown.unitLabel}`
                          : `${booking.priceBreakdown.unitCount} ${booking.priceBreakdown.unitLabel}`}
                        )
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">
                        {t("userRequests.payment")}:
                      </span>{" "}
                      {booking.paymentMethod}
                      {booking.paymentMethod === "online" && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            booking.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : booking.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.paymentStatus === "paid"
                            ? "✓ Paid"
                            : booking.paymentStatus === "failed"
                            ? "✗ Failed"
                            : "⏳ Pending"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {booking.adminContact && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">
                        {t("userRequests.adminContact")}:
                      </span>{" "}
                      {booking.adminContact.name} - {booking.adminContact.phone}
                    </p>
                  </div>
                )}

                {/* Expired join date warning banner */}
                {booking.status === "pending" &&
                  isJoinDateExpired(booking.joinDate) && (
                    <div className="mb-3 rounded-md border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                      <span className="font-semibold">⚠ Join date has passed.</span>{" "}
                      Your requested join date is in the past and the admin cannot
                      approve this booking. Please reschedule it to a future date or
                      cancel it.
                    </div>
                  )}

                {/* Reschedule inline form */}
                {reschedulingId === booking._id && (
                  <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-blue-800">
                      Select a new join date:
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="date"
                        min={todayStr()}
                        value={newJoinDate}
                        onChange={(e) => setNewJoinDate(e.target.value)}
                        className="rounded border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReschedule(booking._id)}
                      >
                        Confirm Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReschedulingId(null);
                          setNewJoinDate("");
                          setRescheduleError(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {rescheduleError && (
                      <p className="mt-2 text-xs text-red-600">{rescheduleError}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row sm:justify-between sm:items-center">
                   <p className="text-sm text-gray-500">
                     {t("userRequests.requestedOn")}:{" "}
                     {formatDate(booking.createdAt)}
                   </p>
                   <div className="flex flex-wrap gap-2 items-center">
                     <Button
                       variant="outline"
                       size="sm"
                       className="w-full sm:w-auto"
                       onClick={() => handleViewBooking(booking._id)}
                     >
                       {t("common.view")}
                     </Button>
                     {booking.status === "pending" &&
                       isJoinDateExpired(booking.joinDate) &&
                       reschedulingId !== booking._id && (
                         <Button
                           size="sm"
                           className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                           onClick={() => {
                             setReschedulingId(booking._id);
                             setNewJoinDate("");
                             setRescheduleError(null);
                           }}
                         >
                           📅 Reschedule
                         </Button>
                       )}
                     {booking.status === "pending" && (
                       <Button
                         variant="outline"
                         size="sm"
                         className="text-red-600 w-full sm:w-auto"
                         onClick={() => handleCancelBooking(booking._id)}
                       >
                         {t("userRequests.cancel")}
                       </Button>
                     )}
                     {/* Call Admin — hide when pending booking's join date has expired */}
                     {(booking.status === "approved" ||
                       (booking.status === "pending" &&
                         !isJoinDateExpired(booking.joinDate))) && (
                       <Button
                         size="sm"
                         className="w-full sm:w-auto"
                         onClick={() =>
                           handleCall(
                             booking.adminContact?.phone || "9876543210",
                           )
                         }
                       >
                         {t("userRequests.callAdmin")}
                       </Button>
                     )}
                     {/* Chat with Owner — hide when pending booking's join date has expired */}
                     {!(
                       booking.status === "pending" &&
                       isJoinDateExpired(booking.joinDate)
                     ) && (
                       <Link href={`/user/chat?bookingId=${booking._id}`} className="w-full sm:w-auto">
                         <Button
                           size="sm"
                           variant="outline"
                           className="w-full flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                         >
                           <MessageSquare size={14} />
                           Chat with Owner
                         </Button>
                       </Link>
                     )}
                   </div>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
