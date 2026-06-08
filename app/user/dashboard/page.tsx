"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { getAuthData, useAuth } from "../../context/AuthContext";
import { pgAPI } from "../../../services/api";
import { useTranslation } from "react-i18next";

interface PG {
  _id: string;
  id?: string;
  name: string;
  photos: string[];
  structure: Array<{
    _id: string;
    id?: string;
    name: string;
    beds: Array<{
      _id: string;
      id?: string;
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
  adminId?: {
    _id: string;
    pgName: string;
    ownerName: string;
    email: string;
  };
}

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    city: "",
    subcity: "",
  });

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pgAPI.getAllPGsPublic();
      if (response.success) {
        setPgs(response.data);
      } else {
        setError("Failed to load PGs");
      }
    } catch (err: any) {
      console.error("Error fetching PGs:", err);
      setError(err.message || "Failed to load PGs");
    } finally {
      setLoading(false);
    }
  };

  const filteredPGs = pgs.filter(
    (pg) =>
      (!filters.city ||
        pg?.location?.city
          .toLowerCase()
          .includes(filters.city.toLowerCase())) &&
      (!filters.subcity ||
        pg?.location?.subcity
          .toLowerCase()
          .includes(filters.subcity.toLowerCase())),
  );

  const handleBook = (pgId: string) => {
    router.push(`/user/booking?pgId=${pgId}`);
  };

  const getAvailableBeds = (pg: PG) => {
    return pg.structure.reduce(
      (acc, room) => acc + room.beds.filter((bed) => !bed.allocated).length,
      0,
    );
  };

  if (!currentUser) {
    const authData = getAuthData();
    if (authData?.userType === "user") {
      router.push("/user/dashboard");
      return;
    }
    router.push("/user/login");
    return <div>Loading...</div>;
  }

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
        <div>
          <h1 className="text-3xl font-bold">
            {t("userDashboard.welcome")}, {currentUser.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            {t("userDashboard.findYourPerfectPG")}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
          <button
            onClick={fetchPGs}
            className="mt-2 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {t("userDashboard.availablePGs")} ({filteredPGs.length})
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder={t("userDashboard.filterByCity")}
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
          />
          <input
            type="text"
            placeholder={t("userDashboard.filterByArea")}
            value={filters.subcity}
            onChange={(e) =>
              setFilters({ ...filters, subcity: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
          />
          <Button
            onClick={() => setFilters({ city: "", subcity: "" })}
            variant="outline"
          >
            {t("common.clear")}
          </Button>
        </div>
      </div>

      {filteredPGs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {filters.city || filters.subcity
              ? t("userDashboard.noPGsFound")
              : t("userDashboard.noPGsAvailable")}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPGs.map((pg) => (
            <Card
              key={pg._id || pg.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div
                className="relative cursor-pointer"
                onClick={() => router.push(`/pg/${pg._id || pg.id}`)}
              >
                {pg.photos && pg.photos.length > 0 ? (
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pg.photos[0]}
                      alt={pg.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="text-white text-xl font-bold drop-shadow-lg ">
                        {pg.name}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-gray-500 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span className="text-gray-600 font-medium">
                        No Image
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h3 className="text-white text-xl font-bold drop-shadow-lg">
                        {pg.name}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
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
                  <p className="text-sm text-gray-600 flex-1">
                    {pg?.location?.subcity}, {pg?.location?.city},{" "}
                    {pg?.location?.state}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getAvailableBeds(pg) > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getAvailableBeds(pg) > 0
                      ? `${getAvailableBeds(pg)} beds available`
                      : "Fully Occupied"}
                  </span>
                  {pg.onlinePayment && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Online Payment
                    </span>
                  )}
                </div>

                <div className="border-t pt-3 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Starting from</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹
                      {Math.min(
                        ...pg.structure.map((r) => r.price),
                      ).toLocaleString()}
                      <span className="text-xs text-gray-500 font-normal">
                        /
                        {pg.structure[0]?.pricingPeriod === "day"
                          ? "day"
                          : "month"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBook(pg._id || pg.id!)}
                    className="flex-1"
                    disabled={getAvailableBeds(pg) === 0}
                  >
                    {pg.onlinePayment ? "Book Now" : "Send Request"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/pg/${pg._id || pg.id}`)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
