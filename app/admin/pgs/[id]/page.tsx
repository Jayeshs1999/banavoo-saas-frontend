"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Button } from "@/components";
import { useAuth } from "@/app/context/AuthContext";
import { pgAPI } from "@/services/api";

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

  const [pg, setPG] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{pg.name}</h1>
          <p className="text-gray-600 mt-2">
            Created: {new Date(pg.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleEdit}
            className="bg-blue-500 hover:bg-blue-700"
          >
            Edit PG
          </Button>
          <Button onClick={handleBack} variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* PG Photos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {pg.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {pg.photos.map((photo, index) => (
                  <div key={index} className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`PG photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No photos available
              </div>
            )}
          </CardContent>
        </Card>

        {/* PG Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>PG Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {totalRooms}
                </div>
                <div className="text-sm text-gray-600">Total Rooms</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {totalBeds}
                </div>
                <div className="text-sm text-gray-600">Total Beds</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {allocatedBeds}
                </div>
                <div className="text-sm text-gray-600">Allocated Beds</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {availableBeds}
                </div>
                <div className="text-sm text-gray-600">Available Beds</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="text-lg font-semibold">
                Occupancy Rate: {occupancyRate}%
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
            <CardTitle>Location Information</CardTitle>
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
                <span className="font-semibold">Online Payment:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    pg.onlinePayment
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {pg.onlinePayment ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Room Structure</CardTitle>
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
                        <div className="font-semibold">Bed {index + 1}</div>
                        <div className="text-sm">
                          {bed.allocated ? "Allocated" : "Available"}
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

      {/* Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Admin:</span>
              <p className="text-gray-600 mt-1">
                {typeof pg.adminId === "object"
                  ? pg.adminId?.ownerName ||
                    pg.adminId?.pgName ||
                    pg.adminId?.email ||
                    "Unknown Admin"
                  : pg.adminId || "Unknown Admin"}
              </p>
            </div>
            <div>
              <span className="font-semibold">Created:</span>
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
