"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, ShareButton } from "@/components";
import { PageSpinner } from "@/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import ImageViewer from "@/components/ImageViewer";
import { pgAPI } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Amenities {
  smokingAllowed?: boolean; drinkingAllowed?: boolean; cookingAllowed?: boolean;
  nonVegAllowed?: boolean; guestsAllowed?: boolean; petsAllowed?: boolean;
  acAvailable?: boolean; fanAvailable?: boolean; fridgeAvailable?: boolean;
  washingMachineAvailable?: boolean; tvAvailable?: boolean; wifiAvailable?: boolean;
  inverterAvailable?: boolean;
  attachedBathroom?: boolean; attachedToilet?: boolean;
  sharedBathrooms?: number; sharedToilets?: number; geyserAvailable?: boolean;
  lockerAvailable?: boolean; cctvAvailable?: boolean; securityGuard?: boolean; mainGateLock?: boolean;
  twoWheelerParking?: boolean; fourWheelerParking?: boolean;
  breakfastAvailable?: boolean; lunchAvailable?: boolean; dinnerAvailable?: boolean; messAvailable?: boolean;
  gallaryAvailable?: boolean; gymAvailable?: boolean; studyRoomAvailable?: boolean;
  powerBackup?: boolean; housekeepingAvailable?: boolean; bikeRental?: boolean;
}

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
  amenities?: Amenities;
  location: {
    subcity: string;
    city: string;
    state: string;
    country: string;
    pin: string;
    lat?: number;
    lng?: number;
  };
  adminId?: {
    _id: string;
    pgName: string;
    ownerName: string;
    email: string;
    mobile: string;
  };
  createdAt?: string;
}

export default function PGDetails() {
  const router = useRouter();
  const params = useParams();
  const pgId = params.id as string;
  const { currentUser, currentAdmin, logout } = useAuth();
  const { t } = useTranslation();

  const [pg, setPG] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (pgId) {
      fetchPG();
    }
  }, [pgId]);

  const fetchPG = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pgAPI.getPGPublic(pgId);
      if (response.success) {
        setPG(response.data);
      } else {
        setError("Failed to load PG data");
      }
    } catch (err: any) {
      console.error("Error fetching PG:", err);
      setError(err.message || "Failed to load PG data");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (currentUser) {
      router.push(`/user/booking?pgId=${pgId}`);
    } else {
      router.push("/user/login");
    }
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const closeImageViewer = () => {
    setViewerOpen(false);
  };

  const previousImage = () => {
    if (!pg) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? pg.photos.length - 1 : prev - 1,
    );
  };

  const nextImage = () => {
    if (!pg) return;
    setCurrentImageIndex((prev) =>
      prev === pg.photos.length - 1 ? 0 : prev + 1,
    );
  };

  const getAvailableBeds = () => {
    if (!pg) return 0;
    return pg.structure.reduce(
      (acc, room) => acc + room.beds.filter((bed) => !bed.allocated).length,
      0,
    );
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/user/dashboard" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>Error loading PG: {error}</p>
          <button
            onClick={fetchPG}
            className="mt-2 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/user/dashboard" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md mt-4">
          PG not found
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalRooms = pg.structure.length;
  const totalBeds = pg.structure.reduce(
    (sum, room) => sum + room.beds.length,
    0,
  );
  const allocatedBeds = pg.structure.reduce(
    (sum, room) => sum + room.beds.filter((bed) => bed.allocated).length,
    0,
  );
  const availableBeds = totalBeds - allocatedBeds;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={currentAdmin ? "/admin/dashboard" : "/user/dashboard"}
          className="text-blue-500 hover:underline"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
          <h1 className="text-3xl font-bold">{pg.name}</h1>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <ShareButton
              pgId={pgId}
              pgName={pg.name}
              pgLocation={pg.location}
              price={pg.structure[0]?.price}
              size="sm"
            />
            {currentAdmin && (
              <Link href={`/admin/edit-pg/${pgId}`}>
                <Button variant="outline">{t("pgDetails.editPG")}</Button>
              </Link>
            )}
            {!currentAdmin && (
              <Button onClick={handleBook} disabled={getAvailableBeds() === 0}>
                {getAvailableBeds() > 0
                  ? pg.onlinePayment
                    ? t("userDashboard.bookOnline")
                    : t("userDashboard.sendRequest")
                  : t("userDashboard.fullyOccupied")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* PG Photos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("pgDetails.photos")}</CardTitle>
          </CardHeader>
          <CardContent>
            {pg.photos.length > 0 ? (
              <div className="space-y-3">
                <div
                  className="aspect-video cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => openImageViewer(currentImageIndex)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pg.photos[currentImageIndex]}
                    alt={`PG photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {pg.photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      {currentImageIndex + 1} / {pg.photos.length}
                    </div>
                  )}
                </div>

                {pg.photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {pg.photos.map((photo, index) => (
                      <div
                        key={index}
                        className={`aspect-square cursor-pointer rounded border-2 transition-all ${
                          index === currentImageIndex
                            ? "border-blue-500 shadow-md"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          if (pg.photos.length > 1) {
                            openImageViewer(index);
                          }
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {t("pgDetails.noPhotos")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PG Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("pgDetails.pgStatistics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {totalRooms}
                </div>
                <div className="text-sm text-gray-600">
                  {t("pgDetails.totalRooms")}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {totalBeds}
                </div>
                <div className="text-sm text-gray-600">
                  {t("pgDetails.totalBeds")}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {allocatedBeds}
                </div>
                <div className="text-sm text-gray-600">
                  {t("pgDetails.allocatedBeds")}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {availableBeds}
                </div>
                <div className="text-sm text-gray-600">
                  {t("pgDetails.availableBeds")}
                </div>
              </div>
            </div>
            {totalBeds > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="text-lg font-semibold">
                  {t("pgDetails.occupancyRate")}:{" "}
                  {((allocatedBeds / totalBeds) * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{
                      width: `${(allocatedBeds / totalBeds) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pgDetails.locationInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-lg">{pg.name}</h3>
                <p className="text-sm text-gray-600">
                  {pg.location?.subcity}, {pg.location?.city} -{" "}
                  {pg.location?.pin}, {pg.location?.state},{" "}
                  {pg.location?.country}
                </p>
              </div>
              <div>
                <span className="font-semibold">
                  {t("pgDetails.onlinePayment")}:
                </span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    pg.onlinePayment
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {pg.onlinePayment ? t("common.yes") : t("common.no")}
                </span>
              </div>

              {/* Map — only shown if location coordinates are saved */}
              {pg.location?.lat && pg.location?.lng && (
                <div className="pt-2">
                  <MapView
                    lat={pg.location.lat}
                    lng={pg.location.lng}
                    label={`${pg.name} — ${pg.location.subcity}, ${pg.location.city}`}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Room Structure */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pgDetails.roomStructure")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pg.structure.map((room) => (
                <div key={room._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{room.name}</h3>
                    <div className="text-sm text-gray-600">
                      ₹{room.price} per{" "}
                      {room.pricingPeriod === "day"
                        ? t("common.day")
                        : t("common.month")}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {room.beds.map((bed, index) => (
                      <div
                        key={bed._id}
                          onClick={() => {
                            if (!bed.allocated) {
                              if (currentUser) {
                                router.push(
                                  `/user/booking?pgId=${pgId}&roomId=${room._id}&bedId=${bed._id}`
                                );
                              } else {
                                router.push("/user/login");
                              }
                            }
                          }}
                        className={`p-2 border rounded text-center ${
                          bed.allocated
                            ? "bg-red-100 border-red-300 cursor-not-allowed"
                            : currentUser
                            ? "bg-green-100 border-green-300 cursor-pointer hover:bg-green-200 hover:shadow-md transition-all"
                            : "bg-green-100 border-green-300 cursor-pointer"
                        }`}
                      >
                        <div className="font-semibold">
                          {t("pgDetails.bed")} {index + 1}
                        </div>
                        <div className="text-sm">
                          {bed.allocated
                            ? t("pgDetails.allocated")
                            : t("pgDetails.available")}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ₹{bed.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Amenities */}
      {(() => {
        const a = pg.amenities;
        if (!a) return null;

        const groups: { title: string; items: { label: string; value: boolean; icon: "yes" | "no" }[]; nums?: { label: string; value: number }[] }[] = [
          {
            title: "House Rules",
            items: [
              { label: "Smoking Allowed",  icon: a.smokingAllowed  ? "yes" : "no", value: !!a.smokingAllowed },
              { label: "Drinking Allowed", icon: a.drinkingAllowed ? "yes" : "no", value: !!a.drinkingAllowed },
              { label: "Cooking Allowed",  icon: a.cookingAllowed  ? "yes" : "no", value: !!a.cookingAllowed },
              { label: "Non-Veg Allowed",  icon: a.nonVegAllowed !== false ? "yes" : "no", value: a.nonVegAllowed !== false },
              { label: "Guests Allowed",   icon: a.guestsAllowed   ? "yes" : "no", value: !!a.guestsAllowed },
              { label: "Pets Allowed",     icon: a.petsAllowed     ? "yes" : "no", value: !!a.petsAllowed },
            ],
          },
          {
            title: "Appliances & Comfort",
            items: [
              { label: "AC",              icon: a.acAvailable             ? "yes" : "no", value: !!a.acAvailable },
              { label: "Fan",             icon: a.fanAvailable !== false  ? "yes" : "no", value: a.fanAvailable !== false },
              { label: "Refrigerator",    icon: a.fridgeAvailable         ? "yes" : "no", value: !!a.fridgeAvailable },
              { label: "Washing Machine", icon: a.washingMachineAvailable ? "yes" : "no", value: !!a.washingMachineAvailable },
              { label: "TV",              icon: a.tvAvailable             ? "yes" : "no", value: !!a.tvAvailable },
              { label: "Wi-Fi",           icon: a.wifiAvailable           ? "yes" : "no", value: !!a.wifiAvailable },
              { label: "Inverter",        icon: a.inverterAvailable       ? "yes" : "no", value: !!a.inverterAvailable },
            ],
          },
          {
            title: "Bathroom & Toilet",
            items: [
              { label: "Attached Bathroom", icon: a.attachedBathroom ? "yes" : "no", value: !!a.attachedBathroom },
              { label: "Attached Toilet",   icon: a.attachedToilet   ? "yes" : "no", value: !!a.attachedToilet },
              { label: "Geyser",            icon: a.geyserAvailable  ? "yes" : "no", value: !!a.geyserAvailable },
            ],
            nums: [
              { label: "Shared Bathrooms", value: a.sharedBathrooms ?? 0 },
              { label: "Shared Toilets",   value: a.sharedToilets   ?? 0 },
            ],
          },
          {
            title: "Security & Storage",
            items: [
              { label: "Locker",         icon: a.lockerAvailable ? "yes" : "no", value: !!a.lockerAvailable },
              { label: "CCTV",           icon: a.cctvAvailable   ? "yes" : "no", value: !!a.cctvAvailable },
              { label: "Security Guard", icon: a.securityGuard   ? "yes" : "no", value: !!a.securityGuard },
              { label: "Main Gate Lock", icon: a.mainGateLock    ? "yes" : "no", value: !!a.mainGateLock },
            ],
          },
          {
            title: "Parking",
            items: [
              { label: "Two-Wheeler Parking",  icon: a.twoWheelerParking  ? "yes" : "no", value: !!a.twoWheelerParking },
              { label: "Four-Wheeler Parking", icon: a.fourWheelerParking ? "yes" : "no", value: !!a.fourWheelerParking },
            ],
          },
          {
            title: "Food",
            items: [
              { label: "Breakfast",    icon: a.breakfastAvailable ? "yes" : "no", value: !!a.breakfastAvailable },
              { label: "Lunch",        icon: a.lunchAvailable     ? "yes" : "no", value: !!a.lunchAvailable },
              { label: "Dinner",       icon: a.dinnerAvailable    ? "yes" : "no", value: !!a.dinnerAvailable },
              { label: "Mess/Canteen", icon: a.messAvailable      ? "yes" : "no", value: !!a.messAvailable },
            ],
          },
          {
            title: "Other Facilities",
            items: [
              { label: "Gallery/Balcony", icon: a.gallaryAvailable      ? "yes" : "no", value: !!a.gallaryAvailable },
              { label: "Gym",             icon: a.gymAvailable           ? "yes" : "no", value: !!a.gymAvailable },
              { label: "Study Room",      icon: a.studyRoomAvailable     ? "yes" : "no", value: !!a.studyRoomAvailable },
              { label: "Power Backup",    icon: a.powerBackup            ? "yes" : "no", value: !!a.powerBackup },
              { label: "Housekeeping",    icon: a.housekeepingAvailable  ? "yes" : "no", value: !!a.housekeepingAvailable },
              { label: "Bike Rental",     icon: a.bikeRental             ? "yes" : "no", value: !!a.bikeRental },
            ],
          },
        ];

        // hide the card entirely for PGs that were created before amenities feature
        const hasAny = groups.some(
          (g) =>
            g.items.some((i) => i.value) ||
            g.nums?.some((n) => n.value > 0),
        );
        if (!hasAny) return null;

        return (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Amenities &amp; House Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {groups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {group.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item.label}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            item.value
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {item.value ? "✓" : "✗"} {item.label}
                        </span>
                      ))}
                      {(group.nums ?? []).map((item) => (
                        <span
                          key={item.label}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {item.label}: {item.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Admin Information */}
      {pg.adminId && (
        <Card>
          <CardHeader>
            <CardTitle>{t("pgDetails.adminInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">{t("pgDetails.admin")}:</span>
                <p className="text-gray-600 mt-1">
                  {pg.adminId.ownerName ||
                    pg.adminId.pgName ||
                    pg.adminId.email ||
                    t("pgDetails.unknownAdmin")}
                </p>
              </div>
              <div>
                <span className="font-semibold">Email:</span>
                <p className="text-gray-600 mt-1">{pg.adminId.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full-screen Image Viewer */}
      <ImageViewer
        images={pg.photos}
        currentIndex={currentImageIndex}
        isOpen={viewerOpen}
        onClose={closeImageViewer}
        onPrevious={previousImage}
        onNext={nextImage}
      />
    </div>
  );
}
