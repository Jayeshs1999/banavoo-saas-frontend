"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
import { bookingAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";

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
}

export default function UserRequests() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <Button onClick={logout} variant="outline">
            {t("common.logout")}
          </Button>
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
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">
                        {t("userRequests.payment")}:
                      </span>{" "}
                      {booking.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {t("userRequests.requestedOn")}:{" "}
                    {formatDate(booking.createdAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBooking(booking._id)}
                    >
                      {t("common.view")}
                    </Button>
                    {booking.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        {t("userRequests.cancel")}
                      </Button>
                    )}
                    {booking.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleCall("9876543210")}
                      >
                        {t("userRequests.callAdmin")}
                      </Button>
                    )}
                    {booking.status === "approved" && (
                      <p className="text-sm text-gray-500 self-center">
                        {t("userRequests.validity")}: 2 hours
                      </p>
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
