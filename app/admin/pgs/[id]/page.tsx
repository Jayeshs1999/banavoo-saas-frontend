"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Button, ShareButton } from "@/components";
import ImageViewer from "@/components/ImageViewer";
import { useAuth } from "@/app/context/AuthContext";
import { pgAPI } from "@/services/api";
import { useTranslation } from "react-i18next";

interface PG {
  _id: string;
  name: string;
  photos: string[];
  structure: Array<{
    id: string;
    name: string;
    beds: Array<{
      id: string;
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
  adminId: {
    _id: string;
    pgName: string;
    ownerName: string;
    email: string;
  };
  createdAt: string;
}

export default function PGDetails() {
  const router = useRouter();
  const params = useParams();
  const pgId = params.id as string;
  const { currentAdmin } = useAuth();
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
      const response = await pgAPI.getPG(pgId);

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

  const handleEdit = () => {
    router.push(`/admin/edit-pg/${pgId}`);
  };

  const handleBack = () => {
    router.push("/admin/dashboard");
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading PG: {error}</p>
          <button
            onClick={fetchPG}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
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
  const occupancyRate =
    totalBeds > 0 ? ((allocatedBeds / totalBeds) * 100).toFixed(1) : "0";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{pg.name}</h1>
          <p className="text-gray-600 mt-2">
            {t("pgDetails.created")}:{" "}
            {new Date(pg.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          <ShareButton
            pgId={pgId}
            pgName={pg.name}
            pgLocation={pg.location}
            price={pg.structure[0]?.price}
            size="sm"
          />
          <Button
            onClick={handleEdit}
            className="bg-blue-500 hover:bg-blue-700"
          >
            {t("pgDetails.editPG")}
          </Button>
          <Button onClick={handleBack} variant="outline">
            ← {t("pgDetails.backToDashboard")}
          </Button>
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
                {/* Main photo display */}
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

                {/* Thumbnail strip */}
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

                <p className="text-xs text-gray-500 text-center">
                  {pg.photos.length > 1
                    ? t("pgDetails.clickToView")
                    : t("pgDetails.clickToViewFull")}
                </p>
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
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="text-lg font-semibold">
                {t("pgDetails.occupancyRate")}: {occupancyRate}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>
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
                <div key={room.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{room.name}</h3>
                    <div className="text-sm text-gray-600">
                      ₹{room.price} per {room.pricingPeriod}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {room.beds.map((bed, index) => (
                      <div
                        key={bed.id}
                        className={`p-2 border rounded text-center ${
                          bed.allocated
                            ? "bg-red-100 border-red-300"
                            : "bg-green-100 border-green-300"
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

      {/* Full-screen Image Viewer */}
      <ImageViewer
        images={pg.photos}
        currentIndex={currentImageIndex}
        isOpen={viewerOpen}
        onClose={closeImageViewer}
        onPrevious={previousImage}
        onNext={nextImage}
      />

      {/* Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pgDetails.adminInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">{t("pgDetails.admin")}:</span>
              <p className="text-gray-600 mt-1">
                {typeof pg.adminId === "object"
                  ? pg.adminId?.ownerName ||
                    pg.adminId?.pgName ||
                    pg.adminId?.email ||
                    t("pgDetails.unknownAdmin")
                  : pg.adminId || t("pgDetails.unknownAdmin")}
              </p>
            </div>
            <div>
              <span className="font-semibold">{t("pgDetails.created")}:</span>
              <p className="text-gray-600 mt-1">
                {new Date(pg.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
