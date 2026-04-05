"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/Card";
import { bookingAPI } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
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
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  roomId: string;
  bedId: string;
  joinDate: string;
  stayDays: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  totalPrice: number;
  paymentMethod: "online" | "cash";
  notes: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields from backend
  roomName?: string;
  bedNumber?: number | string;
  bedPrice?: number;
  pricingPeriod?: "day" | "month";
  priceBreakdown?: {
    unitCount: number;
    unitLabel: string;
  };
}

export default function AdminRequests() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentAdmin } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingAPI.getAdminBookings();
      if (response.success) {
        setBookings(response.data);
      } else {
        setError("Failed to load booking requests");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load booking requests");
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

  const handleUpdateStatus = async (
    bookingId: string,
    status: "approved" | "rejected",
  ) => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) {
      return;
    }

    try {
      const response = await bookingAPI.updateBookingStatus(bookingId, status);
      if (response.success) {
        // Update local state
        setBookings(
          bookings.map((b) => (b._id === bookingId ? { ...b, status } : b)),
        );
        setSelectedBooking(null);
      } else {
        setError(response.message || `Failed to ${status} booking`);
      }
    } catch (err: any) {
      console.error("Error updating booking:", err);
      setError(err.message || `Failed to ${status} booking`);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

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

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="sm:text-2xl md:text-3xl font-bold">
            {t("requests.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage booking requests for your PGs
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          ← {t("common.back")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${
              filter === status
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filter === "pending"
                ? "No pending booking requests at the moment"
                : `No ${filter} bookings`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <span className="text-lg font-semibold">
                      {booking.pgId?.name || "Unknown PG"}
                    </span>
                    <span
                      className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(booking.createdAt)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Tenant</p>
                    <p className="font-medium">
                      {booking.userId?.firstName} {booking.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.userId?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.userId?.mobile}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Details</p>
                    <p className="font-medium">
                      Room: {booking.roomName || booking.roomId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Bed: #{booking.bedNumber || booking.bedId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Join: {formatDate(booking.joinDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Stay: {booking.stayDays}{" "}
                      {booking.stayDays === 1 ? "day" : "days"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Payment: {booking.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{booking.totalPrice.toLocaleString()}
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
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>{" "}
                      {booking.notes}
                    </p>
                  </div>
                )}

                {booking.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        handleUpdateStatus(booking._id, "approved")
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(booking._id, "rejected")
                      }
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      ✗ Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details
                    </Button>
                  </div>
                )}

                {booking.status !== "pending" && (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Booking Details</span>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">PG Name</p>
                  <p className="font-medium">{selectedBooking.pgId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedBooking.status)}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-medium">
                    {selectedBooking.roomName || selectedBooking.roomId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bed</p>
                  <p className="font-medium">
                    #{selectedBooking.bedNumber || selectedBooking.bedId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tenant Name</p>
                  <p className="font-medium">
                    {selectedBooking.userId?.firstName}{" "}
                    {selectedBooking.userId?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedBooking.userId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">
                    {selectedBooking.userId?.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">
                    {formatDate(selectedBooking.joinDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stay Duration</p>
                  <p className="font-medium">{selectedBooking.stayDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-lg text-blue-600">
                    ₹{selectedBooking.totalPrice.toLocaleString()}
                  </p>
                  {selectedBooking.priceBreakdown && (
                    <p className="text-xs text-gray-500 mt-1">
                      (
                      {selectedBooking.bedPrice
                        ? `₹${selectedBooking.bedPrice} × ${selectedBooking.priceBreakdown.unitCount} ${selectedBooking.priceBreakdown.unitLabel}`
                        : `${selectedBooking.priceBreakdown.unitCount} ${selectedBooking.priceBreakdown.unitLabel}`}
                      )
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {selectedBooking.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested On</p>
                  <p className="font-medium">
                    {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span>{" "}
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {selectedBooking.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, "approved");
                    }}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    Approve Booking
                  </Button>
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, "rejected");
                    }}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
                  >
                    Reject Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
