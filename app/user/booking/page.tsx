"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
import { pgAPI, bookingAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";
import { calculatePrice, calculateDays } from "../../../utils";

interface PG {
  _id: string;
  name: string;
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
  onlinePayment: boolean;
  location: {
    subcity: string;
    city: string;
    state: string;
    country: string;
    pin: string;
  };
}

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BookingForm() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const pgId = searchParams.get("pgId");
  const preselectedRoomId = searchParams.get("roomId") || "";
  const preselectedBedId = searchParams.get("bedId") || "";

  const [pg, setPG] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<string>(preselectedRoomId);
  const [selectedBed, setSelectedBed] = useState<string>(preselectedBedId);
  const [joinDate, setJoinDate] = useState<string>("");
  const [stayDays, setStayDays] = useState<string>("30");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("cash");

  useEffect(() => {
    if (pgId) {
      fetchPG();
    } else {
      router.push("/user/dashboard");
    }
  }, [pgId]);

  const fetchPG = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pgAPI.getPGPublic(pgId!);
      if (response.success) {
        setPG(response.data);
        // Apply URL-preselected room/bed only if they are valid and available
        if (preselectedRoomId && preselectedBedId) {
          const pgData = response.data;
          const room = pgData.structure.find(
            (r: any) => r._id === preselectedRoomId
          );
          if (room) {
            const bed = room.beds.find(
              (b: any) => b._id === preselectedBedId && !b.allocated
            );
            if (bed) {
              setSelectedRoom(preselectedRoomId);
              setSelectedBed(preselectedBedId);
            }
          }
        }
      } else {
        setError("Failed to load PG details");
      }
    } catch (err: any) {
      console.error("Error fetching PG:", err);
      setError(err.message || "Failed to load PG details");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedBedPrice = () => {
    if (!pg || !selectedRoom || !selectedBed) return 0;
    const room = pg.structure.find((r) => r._id === selectedRoom);
    if (!room) return 0;
    const bed = room.beds.find((b) => b._id === selectedBed);
    if (!bed) return 0;
    return bed.price;
  };

  const getSelectedRoomPricingPeriod = () => {
    if (!pg || !selectedRoom) return "month";
    const room = pg.structure.find((r) => r._id === selectedRoom);
    return room?.pricingPeriod || "month";
  };

  const calculateTotal = () => {
    if (!joinDate || !selectedBed) return 0;
    const price = getSelectedBedPrice();
    const pricingPeriod = getSelectedRoomPricingPeriod();
    const checkInDate = new Date(joinDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + Number(stayDays));

    const { totalPrice } = calculatePrice({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      price,
      pricingPeriod,
    });
    return totalPrice;
  };

  const getBookingBreakdown = () => {
    if (!joinDate || !selectedBed) return null;
    const pricingPeriod = getSelectedRoomPricingPeriod();
    const checkInDate = new Date(joinDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + Number(stayDays));

    const { days, months } = calculatePrice({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      price: getSelectedBedPrice(),
      pricingPeriod,
    });

    if (pricingPeriod === "day") {
      return `${getSelectedBedPrice()} × ${days} ${days === 1 ? t("common.day") : t("common.days")}`;
    } else {
      return `${getSelectedBedPrice()} × ${months} ${months === 1 ? t("common.month") : t("common.months")}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !selectedBed || !joinDate || !Number(stayDays)) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Step 1: Create the booking record (always)
      const bookingRes = await bookingAPI.createBooking({
        pgId: pgId!,
        roomId: selectedRoom,
        bedId: selectedBed,
        joinDate: new Date(joinDate).toISOString(),
        stayDays: Number(stayDays),
        notes,
        paymentMethod,
      });

      if (!bookingRes.success) {
        setError(bookingRes.message || "Failed to create booking");
        return;
      }

      // Step 2: If cash payment, done
      if (paymentMethod === "cash") {
        setSuccess(true);
        setTimeout(() => router.push("/user/requests"), 2000);
        return;
      }

      // Step 3: Online payment — load Razorpay and open checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        return;
      }

      const orderRes = await bookingAPI.createPaymentOrder(bookingRes.data._id);
      if (!orderRes.success) {
        setError(orderRes.message || "Failed to initiate payment");
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: pg!.name,
        description: `Booking for ${pg!.name}`,
        order_id: orderId,
        prefill: {
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
            : "",
          email: currentUser?.email || "",
          contact: currentUser?.mobile || "",
        },
        theme: { color: "#3b82f6" },
        handler: async (response: any) => {
          try {
            const verifyRes = await bookingAPI.verifyPayment(bookingRes.data._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              setPaymentSuccess(true);
              setSuccess(true);
              setTimeout(() => router.push("/user/requests"), 3000);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError("Payment was cancelled. Your booking request is saved. You can pay later from My Requests.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      // Don't setSubmitting(false) here — wait for handler/ondismiss
      return;

    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to create booking");
    } finally {
      // Only clear submitting for cash or errors; online waits for Razorpay callbacks
      if (paymentMethod === "cash") setSubmitting(false);
    }
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

  if (!pg) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          PG not found
        </div>
        <Link href="/user/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">
              {paymentSuccess ? "Payment Successful!" : t("booking.requestSubmitted")}
            </h2>
            <p className="text-gray-600 mb-4">
              {paymentSuccess
                ? "Your payment is confirmed and booking is approved. You're all set!"
                : t("booking.waitingForApproval")}
            </p>
            <p className="text-sm text-gray-500">
              {t("booking.redirecting")}...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/user/dashboard" className="text-blue-500 hover:underline">
          ← {t("common.back")}
        </Link>
        <h1 className="text-3xl font-bold mt-4">{t("booking.bookPG")}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("booking.pgDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              {pg.photos && pg.photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pg.photos[0]}
                  alt={pg.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{pg.name}</h2>
              <p className="text-sm text-gray-600 mb-2">
                {pg.location.subcity}, {pg.location.city}, {pg.location.state}
              </p>
              <p className="text-sm text-gray-600">
                {pg.onlinePayment
                  ? t("booking.onlinePaymentAvailable")
                  : t("booking.cashPaymentOnly")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("booking.selectRoomAndBed")}</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("booking.selectRoom")} *
                  </label>
                  <div className="space-y-3">
                    {pg.structure.map((room) => {
                      const availableBeds = room.beds.filter(
                        (bed) => !bed.allocated,
                      ).length;
                      return (
                        <div
                          key={room._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedRoom === room._id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${availableBeds === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => {
                            if (availableBeds > 0) {
                              setSelectedRoom(room._id);
                              setSelectedBed("");
                            }
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{room.name}</h3>
                              <p className="text-sm text-gray-600">
                                {availableBeds} {t("booking.bedsAvailable")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                ₹{room.price}/
                                {room.pricingPeriod === "day"
                                  ? t("common.day")
                                  : t("common.month")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedRoom && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("booking.selectBed")} *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pg.structure
                        .find((r) => r._id === selectedRoom)
                        ?.beds.map((bed, index) => (
                          <div
                            key={bed._id}
                            className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${
                              bed.allocated
                                ? "bg-red-100 border-red-300 cursor-not-allowed opacity-50"
                                : selectedBed === bed._id
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              if (!bed.allocated) {
                                setSelectedBed(bed._id);
                              }
                            }}
                          >
                            <p className="font-semibold">
                              {t("booking.bed")} {index + 1}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{bed.price}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                bed.allocated
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {bed.allocated
                                ? t("booking.allocated")
                                : t("booking.available")}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("booking.joinDate")} *
                    </label>
                    <input
                      type="date"
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("booking.stayDays")} *
                    </label>
                    <input
                      type="number"
                      value={stayDays}
                      onChange={(e) => setStayDays(e.target.value)}
                      onBlur={(e) => {
                        const n = parseInt(e.target.value);
                        if (!n || n < 1) setStayDays("1");
                        else if (n > 365) setStayDays("365");
                        else setStayDays(String(n));
                      }}
                      min={1}
                      max={365}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("booking.paymentMethod")}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="mr-2"
                      />
                      {t("booking.cash")}
                    </label>
                    {pg.onlinePayment && (
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={() => setPaymentMethod("online")}
                          className="mr-2"
                        />
                        {t("booking.online")}
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("booking.notes")} (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("booking.notesPlaceholder")}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {notes.length}/500 {t("booking.characters")}
                  </p>
                </div>

                {selectedBed && joinDate && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {t("booking.totalPrice")}:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getBookingBreakdown()}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={
                      submitting || !selectedRoom || !selectedBed || !joinDate
                    }
                    className="flex-1"
                  >
                    {submitting
                      ? (paymentMethod === "online" ? "Opening Payment..." : t("booking.submitting"))
                      : (paymentMethod === "online" ? "Pay Now ₹" + calculateTotal().toLocaleString() : t("booking.submitRequest"))}
                  </Button>
                  <Link href="/user/dashboard">
                    <Button variant="outline">{t("common.cancel")}</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UserBooking() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
