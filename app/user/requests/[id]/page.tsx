"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { PageSpinner } from "@/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../../context/AuthContext";
import { bookingAPI, pgAPI } from "../../../../services/api";
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
      country: string;
      pin: string;
    };
    photos: string[];
    structure: Array<{
      _id: string;
      name: string;
      beds: Array<{
        _id: string;
        allocated: boolean;
        price: number;
      }>;
      price: number;
      pricingPeriod: "day" | "month";
    }>;
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
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetails() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingAPI.getBooking(bookingId);
      if (response.success) {
        setBooking(response.data);
      } else {
        setError("Failed to load booking details");
      }
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(err.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getRoomName = () => {
    if (!booking) return "N/A";
    const room = booking.pgId.structure.find((r) => r._id === booking.roomId);
    return room ? room.name : "N/A";
  };

  const getBedNumber = () => {
    if (!booking) return "N/A";
    const room = booking.pgId.structure.find((r) => r._id === booking.roomId);
    if (!room) return "N/A";
    const bedIndex = room.beds.findIndex((b) => b._id === booking.bedId);
    return bedIndex >= 0 ? `Bed ${bedIndex + 1}` : "N/A";
  };

  const getBedPrice = () => {
    if (!booking) return 0;
    const room = booking.pgId.structure.find((r) => r._id === booking.roomId);
    if (!room) return 0;
    const bed = room.beds.find((b) => b._id === booking.bedId);
    return bed ? bed.price : 0;
  };

  const handleCancelBooking = async () => {
    if (!confirm(t("userRequests.confirmCancel"))) {
      return;
    }

    try {
      const response = await bookingAPI.cancelBooking(bookingId);
      if (response.success) {
        setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      } else {
        setError(response.message || "Failed to cancel booking");
      }
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      setError(err.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <PageSpinner />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/user/requests" className="text-blue-500 hover:underline">
          ← Back to Requests
        </Link>
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>{error || "Booking not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/user/requests" className="text-blue-500 hover:underline">
          ← {t("common.back")} to Requests
        </Link>
        <h1 className="text-3xl font-bold mt-4">
          {t("userRequests.bookingDetails")}
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Booking Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Booking Status</span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}
                >
                  {booking.status.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-mono font-semibold">
                    #{booking._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested On</p>
                  <p className="font-semibold">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-semibold">
                      {formatDate(booking.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PG Details */}
          <Card>
            <CardHeader>
              <CardTitle>PG Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {booking.pgId.photos && booking.pgId.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={booking.pgId.photos[0]}
                    alt={booking.pgId.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {booking.pgId.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.pgId.location.subcity},{" "}
                    {booking.pgId.location.city}, {booking.pgId.location.state}{" "}
                    - {booking.pgId.location.pin}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room & Bed Details */}
          <Card>
            <CardHeader>
              <CardTitle>Room & Bed Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-semibold">{getRoomName()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bed</p>
                  <p className="font-semibold">{getBedNumber()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price per night</p>
                  <p className="font-semibold">₹{getBedPrice()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pricing Period</p>
                  <p className="font-semibold">
                    {booking.pgId.structure.find(
                      (r) => r._id === booking.roomId,
                    )?.pricingPeriod || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-semibold">
                    {formatDate(booking.joinDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stay Duration</p>
                  <p className="font-semibold">{booking.stayDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(booking.notes || booking.adminNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1">Your Notes:</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {booking.notes}
                    </p>
                  </div>
                )}
                {booking.adminNotes && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Admin Notes:</p>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded">
                      {booking.adminNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment & Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold">
                  ₹{booking.totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold capitalize">
                  {booking.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    booking.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : booking.paymentStatus === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/pg/${booking.pgId._id}`} className="block">
                <Button variant="outline" className="w-full">
                  View PG Details
                </Button>
              </Link>
              {booking.status === "pending" && (
                <Button
                  variant="outline"
                  className="w-full text-red-600"
                  onClick={handleCancelBooking}
                >
                  Cancel Booking
                </Button>
              )}
              {booking.status === "approved" && (
                <Button
                  className="w-full"
                  onClick={() => (window.location.href = "tel:9876543210")}
                >
                  Call PG Admin
                </Button>
              )}
              <Link href="/user/requests" className="block">
                <Button variant="outline" className="w-full">
                  Back to Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
