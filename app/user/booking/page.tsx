"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import Spinner from "@/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
import { pgAPI, bookingAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";
import { calculatePrice } from "../../../utils";

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

/** A single selected bed entry */
interface SelectedBed {
  roomId: string;
  bedId: string;
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

  /** Multi-bed selection: array of { roomId, bedId } */
  const [selectedBeds, setSelectedBeds] = useState<SelectedBed[]>([]);

  const [joinDate, setJoinDate] = useState<string>("");
  // stayDays is always stored in DAYS (what the API expects)
  const [stayDays, setStayDays] = useState<string>("30");
  // stayInput is what the user types — in months when pricingPeriod==="month", else days
  const [stayInput, setStayInput] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("cash");

  useEffect(() => {
    if (pgId) {
      fetchPG();
    } else {
      router.push("/user/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pgId]);

  const fetchPG = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pgAPI.getPGPublic(pgId!);
      if (response.success) {
        setPG(response.data);
        // Pre-select bed if provided in query params
        if (preselectedRoomId && preselectedBedId) {
          const pgData = response.data as PG;
          const room = pgData.structure.find((r) => r._id === preselectedRoomId);
          if (room) {
            const bed = room.beds.find(
              (b) => b._id === preselectedBedId && !b.allocated,
            );
            if (bed) {
              setSelectedBeds([{ roomId: preselectedRoomId, bedId: preselectedBedId }]);
            }
          }
        }
      } else {
        setError("Failed to load PG details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load PG details");
    } finally {
      setLoading(false);
    }
  };

  /** Toggle a bed in/out of the selection */
  const toggleBed = (roomId: string, bedId: string) => {
    setSelectedBeds((prev) => {
      const exists = prev.some((b) => b.roomId === roomId && b.bedId === bedId);
      if (exists) return prev.filter((b) => !(b.roomId === roomId && b.bedId === bedId));
      return [...prev, { roomId, bedId }];
    });
  };

  const isBedSelected = (roomId: string, bedId: string) =>
    selectedBeds.some((b) => b.roomId === roomId && b.bedId === bedId);

  /** Derive the pricing period from the first selected bed's room (or first room) */
  const getPricingPeriod = (): "day" | "month" => {
    if (!pg) return "month";
    if (selectedBeds.length > 0) {
      const room = pg.structure.find((r) => r._id === selectedBeds[0].roomId);
      return room?.pricingPeriod || "month";
    }
    return pg.structure[0]?.pricingPeriod || "month";
  };

  const inputToDays = (value: string, period: "day" | "month"): number => {
    const n = parseInt(value) || 1;
    return period === "month" ? n * 30 : n;
  };

  const pricingPeriod = getPricingPeriod();
  const isMonthly = pricingPeriod === "month";
  const inputMin = 1;
  const inputMax = isMonthly ? 12 : 365;
  const inputUnit = isMonthly ? "months" : "days";

  /** Calculate total price across ALL selected beds */
  const calculateTotal = (): number => {
    if (!joinDate || selectedBeds.length === 0 || !pg) return 0;
    let total = 0;
    const checkInDate = new Date(joinDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + Number(stayDays));

    for (const sb of selectedBeds) {
      const room = pg.structure.find((r) => r._id === sb.roomId);
      const bed = room?.beds.find((b) => b._id === sb.bedId);
      if (room && bed) {
        const { totalPrice } = calculatePrice({
          checkIn: checkInDate,
          checkOut: checkOutDate,
          price: bed.price,
          pricingPeriod: room.pricingPeriod || "month",
        });
        total += totalPrice;
      }
    }
    return total;
  };

  /** Build human-readable price breakdown per bed */
  const getBreakdown = (): string | null => {
    if (!joinDate || selectedBeds.length === 0 || !pg) return null;
    const checkInDate = new Date(joinDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + Number(stayDays));

    const lines: string[] = [];
    for (const sb of selectedBeds) {
      const room = pg.structure.find((r) => r._id === sb.roomId);
      const bed = room?.beds.find((b) => b._id === sb.bedId);
      const bedIdx = room ? room.beds.findIndex((b) => b._id === sb.bedId) + 1 : "?";
      if (room && bed) {
        const { totalPrice, days, months } = calculatePrice({
          checkIn: checkInDate,
          checkOut: checkOutDate,
          price: bed.price,
          pricingPeriod: room.pricingPeriod || "month",
        });
        const unit =
          room.pricingPeriod === "day"
            ? `${days} ${days === 1 ? "day" : "days"}`
            : `${months} ${months === 1 ? "month" : "months"}`;
        lines.push(`${room.name} – Bed ${bedIdx}: ₹${bed.price} × ${unit} = ₹${totalPrice.toLocaleString()}`);
      }
    }
    return lines.join(" | ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBeds.length === 0 || !joinDate || !Number(stayDays)) {
      setError("Please select at least one bed, a join date, and stay duration");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const bookingRes = await bookingAPI.createBooking({
        pgId: pgId!,
        beds: selectedBeds,
        joinDate: new Date(joinDate).toISOString(),
        stayDays: Number(stayDays),
        notes,
        paymentMethod,
      });

      if (!bookingRes.success) {
        setError(bookingRes.message || "Failed to create booking");
        setSubmitting(false);
        return;
      }

      if (paymentMethod === "cash") {
        setSuccess(true);
        setTimeout(() => router.push("/user/requests"), 2000);
        return;
      }

      // Online payment — load Razorpay and open checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        setSubmitting(false);
        return;
      }

      const orderRes = await bookingAPI.createPaymentOrder(bookingRes.data._id);
      if (!orderRes.success) {
        setError(orderRes.message || "Failed to initiate payment");
        setSubmitting(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: pg!.name,
        description: `Booking for ${pg!.name} (${selectedBeds.length} bed${selectedBeds.length > 1 ? "s" : ""})`,
        order_id: orderId,
        prefill: {
          name: currentUser
            ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
            : "",
          email: currentUser?.email || "",
          contact: currentUser?.mobile || "",
        },
        theme: { color: "#94007b" },
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
              setSubmitting(false);
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError(
              "Payment was cancelled. Your booking request is saved. You can pay later from My Requests.",
            );
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      return;
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  /* ── PG not found ── */
  if (!pg) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-5 py-4 rounded-xl text-sm">
          PG not found or no longer available.
        </div>
        <Link href="/user/dashboard">
          <Button className="mt-4">← Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  /* ── Success ── */
  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="max-w-md w-full" hoverEffect={false}>
          <CardContent className="text-center py-12 px-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {paymentSuccess ? "Payment Successful!" : t("booking.requestSubmitted")}
            </h2>
            <p className="text-gray-500 mb-5 leading-relaxed">
              {paymentSuccess
                ? "Your payment is confirmed and booking is approved. You're all set!"
                : t("booking.waitingForApproval")}
            </p>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
              <Spinner size="md" />
              {t("booking.redirecting")}…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Main Form ── */
  const total = calculateTotal();
  const breakdown = getBreakdown();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back + Heading */}
      <div className="mb-6">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("common.back")}
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-3 text-gray-900">
          {t("booking.bookPG")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          You can select <strong>one or more beds</strong> across any room in a single booking.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Left: PG Info + Price Summary ── */}
        <div className="md:col-span-1 space-y-4">
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle>{t("booking.pgDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {pg.photos && pg.photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pg.photos[0]}
                  alt={pg.name}
                  className="w-full h-44 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-44 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
                  </svg>
                </div>
              )}
              <h2 className="text-lg font-bold text-gray-900 mb-1">{pg.name}</h2>
              <p className="text-sm text-gray-500 mb-3">
                {pg.location.subcity}, {pg.location.city}, {pg.location.state}
              </p>
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  pg.onlinePayment ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pg.onlinePayment ? "bg-green-500" : "bg-gray-400"}`} />
                {pg.onlinePayment ? t("booking.onlinePaymentAvailable") : t("booking.cashPaymentOnly")}
              </div>
            </CardContent>
          </Card>

          {/* Selected beds summary */}
          {selectedBeds.length > 0 && (
            <Card hoverEffect={false} className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-2">
                  Selected Beds ({selectedBeds.length})
                </p>
                <ul className="space-y-1 mb-3">
                  {selectedBeds.map((sb) => {
                    const room = pg.structure.find((r) => r._id === sb.roomId);
                    const bedIdx = room
                      ? room.beds.findIndex((b) => b._id === sb.bedId) + 1
                      : "?";
                    const bed = room?.beds.find((b) => b._id === sb.bedId);
                    return (
                      <li
                        key={`${sb.roomId}-${sb.bedId}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">
                          {room?.name} – Bed {bedIdx}
                        </span>
                        <span className="text-primary font-medium">
                          ₹{bed?.price.toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {joinDate && (
                  <>
                    <div className="border-t border-primary/20 pt-2">
                      <p className="text-xs text-gray-500 mb-0.5">{t("booking.totalPrice")}</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{total.toLocaleString()}
                      </p>
                      {breakdown && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{breakdown}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Booking Form ── */}
        <div className="md:col-span-2">
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle>Select Beds, Dates &amp; Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">

                {/* Step 1 — Bed Selection (multi-select across all rooms) */}
                <section>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    1. Select Beds
                    <span className="text-primary ml-1">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Tap any available bed to add or remove it from your booking.
                    You can mix beds from different rooms.
                  </p>

                  <div className="space-y-4">
                    {pg.structure.map((room) => {
                      const availableBeds = room.beds.filter((b) => !b.allocated).length;
                      return (
                        <div key={room._id} className="border border-gray-200 rounded-xl overflow-hidden">
                          {/* Room header */}
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                            <div>
                              <span className="font-semibold text-gray-800 text-sm">{room.name}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                {availableBeds === 0
                                  ? "No beds available"
                                  : `${availableBeds} available`}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              ₹{room.price.toLocaleString()} / {room.pricingPeriod === "day" ? "day" : "month"}
                            </span>
                          </div>

                          {/* Beds grid */}
                          <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {room.beds.map((bed, index) => {
                              const isAllocated = bed.allocated;
                              const isSelected = isBedSelected(room._id, bed._id);

                              return (
                                <button
                                  key={bed._id}
                                  type="button"
                                  disabled={isAllocated}
                                  onClick={() => !isAllocated && toggleBed(room._id, bed._id)}
                                  className={`relative p-2.5 border-2 rounded-xl text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                    isAllocated
                                      ? "bg-red-50 border-red-200 cursor-not-allowed opacity-60"
                                      : isSelected
                                      ? "border-primary bg-primary/10 cursor-pointer shadow-sm"
                                      : "border-gray-200 hover:border-primary/40 bg-white cursor-pointer"
                                  }`}
                                  aria-pressed={isSelected}
                                  aria-label={`${room.name} Bed ${index + 1} ${isAllocated ? "(allocated)" : isSelected ? "(selected)" : "(available)"}`}
                                >
                                  {/* Checkmark overlay */}
                                  {isSelected && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </span>
                                  )}
                                  <p className="font-semibold text-xs text-gray-700">
                                    {t("booking.bed")} {index + 1}
                                  </p>
                                  <p className="text-xs font-medium text-gray-900 mt-0.5">
                                    ₹{bed.price.toLocaleString()}
                                  </p>
                                  <span
                                    className={`inline-block text-xs mt-0.5 font-medium ${
                                      isAllocated
                                        ? "text-red-500"
                                        : isSelected
                                        ? "text-primary"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {isAllocated
                                      ? t("booking.allocated")
                                      : isSelected
                                      ? "Selected"
                                      : t("booking.available")}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Step 2 — Dates */}
                <section>
                  <p className="block text-sm font-semibold text-gray-700 mb-3">
                    2. {t("booking.joinDate")} &amp; Duration
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">
                        {t("booking.joinDate")} <span className="text-primary">*</span>
                      </label>
                      <input
                        type="date"
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">
                        Stay Duration
                        <span className="ml-1 text-primary font-semibold">({inputUnit})</span>
                        <span className="text-primary ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={stayInput}
                        onChange={(e) => {
                          setStayInput(e.target.value);
                          const days = inputToDays(e.target.value, pricingPeriod as "day" | "month");
                          setStayDays(String(days));
                        }}
                        onBlur={(e) => {
                          const n = parseInt(e.target.value);
                          const clamped = !n || n < inputMin ? inputMin : n > inputMax ? inputMax : n;
                          setStayInput(String(clamped));
                          setStayDays(String(inputToDays(String(clamped), pricingPeriod as "day" | "month")));
                        }}
                        min={inputMin}
                        max={inputMax}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {isMonthly ? `= ${Number(stayDays).toLocaleString()} days total` : `Max 365 days`}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Step 3 — Payment Method */}
                <section>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    3. {t("booking.paymentMethod")}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {/* Cash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex items-center gap-2.5 px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                        paymentMethod === "cash"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 9V7a5 5 0 00-10 0v2M3 9h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      {t("booking.cash")}
                      {paymentMethod === "cash" && (
                        <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Online */}
                    {pg.onlinePayment && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`flex items-center gap-2.5 px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                          paymentMethod === "online"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {t("booking.online")}
                        {paymentMethod === "online" && (
                          <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t("booking.notes")}
                    <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                    placeholder={t("booking.notesPlaceholder")}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {notes.length}/500 {t("booking.characters")}
                  </p>
                </section>

                {/* Inline Price Summary (shown inside form on mobile) */}
                {selectedBeds.length > 0 && joinDate && (
                  <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">
                        {selectedBeds.length} bed{selectedBeds.length > 1 ? "s" : ""} · {t("booking.totalPrice")}
                      </p>
                      {breakdown && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{breakdown}</p>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={submitting || selectedBeds.length === 0 || !joinDate}
                    className="flex-1 h-11"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="md" />
                        {paymentMethod === "online" ? "Opening Payment…" : t("booking.submitting")}
                      </span>
                    ) : paymentMethod === "online" ? (
                      `Pay Now ₹${total.toLocaleString()}`
                    ) : (
                      t("booking.submitRequest")
                    )}
                  </Button>
                  <Link href="/user/dashboard">
                    <Button variant="outline" className="h-11 px-5">
                      {t("common.cancel")}
                    </Button>
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
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[400px]">
          <Spinner size="xl" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
