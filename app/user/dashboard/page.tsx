"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
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
              className="hover:shadow-lg transition-shadow"
            >
              <div
                className="cursor-pointer"
                onClick={() => router.push(`/pg/${pg._id || pg.id}`)}
              >
                {pg.photos && pg.photos.length > 0 ? (
                  <div className="h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pg.photos[0]}
                      alt={pg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 -mx-6 -mt-6 mb-4 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{pg.name}</CardTitle>
                </CardHeader>
              </div>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
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
                    {pg?.location?.subcity}, {pg?.location?.city},{" "}
                    {pg?.location?.state}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      getAvailableBeds(pg) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {getAvailableBeds(pg) > 0
                      ? `${getAvailableBeds(pg)} ${t("userDashboard.bedsAvailable")}`
                      : t("userDashboard.fullyOccupied")}
                  </p>
                </div>

                <div className="mb-4 space-y-1">
                  <h4 className="font-semibold text-sm mb-2">
                    {t("userDashboard.rooms")}:
                  </h4>
                  {pg.structure.slice(0, 2).map((room) => (
                    <div
                      key={room._id || room.id}
                      className="text-sm text-gray-600 flex justify-between"
                    >
                      <span>{room.name}</span>
                      <span>
                        ₹{room.price}/
                        {room.pricingPeriod === "day"
                          ? t("common.day")
                          : t("common.month")}
                      </span>
                    </div>
                  ))}
                  {pg.structure.length > 2 && (
                    <p className="text-sm text-blue-500">
                      +{pg.structure.length - 2} more rooms
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBook(pg._id || pg.id!)}
                    className="flex-1"
                    disabled={getAvailableBeds(pg) === 0}
                  >
                    {pg.onlinePayment
                      ? t("userDashboard.bookOnline")
                      : t("userDashboard.sendRequest")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/pg/${pg._id || pg.id}`)}
                  >
                    {t("common.view")}
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
