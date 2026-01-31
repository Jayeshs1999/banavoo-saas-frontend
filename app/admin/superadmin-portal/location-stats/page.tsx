"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminAPI } from "@/services/api";

interface CityStats {
  city: string;
  pgCount: number;
  totalRooms: number;
  totalBeds: number;
  allocatedBeds: number;
  availableBeds: number;
}

interface LocationStats {
  _id: string;
  cities: CityStats[];
  totalPGs: number;
  totalRooms: number;
  totalBeds: number;
  allocatedBeds: number;
  availableBeds: number;
}

export default function LocationStats() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      router.push("/admin/login");
    } else {
      fetchLocationStats();
    }
  }, [currentAdmin, router]);

  const fetchLocationStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI?.getLocationList();

      if (!response.success) {
        throw new Error("Failed to fetch location stats");
      }

      setLocationStats(response?.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
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
          <p>Error loading location stats: {error}</p>
          <button
            onClick={fetchLocationStats}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Location Statistics</h1>
        <div className="flex gap-4">
          <Link href="/admin/superadmin-portal">
            <Button className="bg-blue-500 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/admin/superadmin-portal/admins">
            <Button className="bg-green-500 hover:bg-green-700">
              View Admins
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {locationStats?.reduce(
                      (sum, state) => sum + state.totalPGs,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total PGs</div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {locationStats?.reduce(
                      (sum, state) => sum + state.totalRooms,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {locationStats?.reduce(
                      (sum, state) => sum + state.totalBeds,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Beds</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {locationStats?.reduce(
                      (sum, state) => sum + state.availableBeds,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Available Beds</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* State Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">State Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {locationStats.map((state) => (
                <div
                  key={state._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <div className="font-bold">{state._id}</div>
                    <div className="text-sm text-gray-600">
                      {state.cities.length} cities
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{state.totalPGs} PGs</div>
                    <div className="text-sm text-gray-600">
                      {state.totalBeds} beds
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Detailed Breakdown by State and City
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No location data found
            </div>
          ) : (
            <div className="space-y-6">
              {locationStats.map((state) => (
                <div key={state._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{state._id}</h3>
                    <div className="text-sm text-gray-600">
                      {state.totalPGs} PGs • {state.totalRooms} rooms •{" "}
                      {state.totalBeds} beds
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-2 sm:p-3">City</th>
                          <th className="text-left p-2 sm:p-3">PGs</th>
                          <th className="text-left p-2 sm:p-3">Rooms</th>
                          <th className="text-left p-2 sm:p-3">Beds</th>
                          <th className="text-left p-2 sm:p-3">Allocated</th>
                          <th className="text-left p-2 sm:p-3">Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.cities.map((city) => (
                          <tr
                            key={city.city}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2 sm:p-3 font-medium">
                              {city.city}
                            </td>
                            <td className="p-2 sm:p-3">{city.pgCount}</td>
                            <td className="p-2 sm:p-3">{city.totalRooms}</td>
                            <td className="p-2 sm:p-3">{city.totalBeds}</td>
                            <td className="p-2 sm:p-3 text-red-600">
                              {city.allocatedBeds}
                            </td>
                            <td className="p-2 sm:p-3 text-green-600">
                              {city.availableBeds}
                            </td>
                          </tr>
                        ))}
                        {/* Summary row for state */}
                        <tr className="border-t font-bold bg-gray-50">
                          <td className="p-2 sm:p-3">Total</td>
                          <td className="p-2 sm:p-3">{state.totalPGs}</td>
                          <td className="p-2 sm:p-3">{state.totalRooms}</td>
                          <td className="p-2 sm:p-3">{state.totalBeds}</td>
                          <td className="p-2 sm:p-3">{state.allocatedBeds}</td>
                          <td className="p-2 sm:p-3">{state.availableBeds}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
