"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminAPI } from "@/services/api";

interface PG {
  _id: string;
  name: string;
  photos: string[];
  status: string;
  onlinePayment: boolean;
  location: {
    subcity: string;
    city: string;
    state: string;
    country: string;
    pin: string;
  };
  totalRooms: number;
  totalBeds: number;
  allocatedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  admin: {
    _id: string;
    pgName: string;
    ownerName: string;
    email: string;
    mobile: string;
    role: string;
  };
  createdAt: string;
}

export default function PGsList() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();
  const [pgs, setPGs] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      router.push("/admin/login");
    } else {
      fetchPGsList();
    }
  }, [currentAdmin, router]);

  const fetchPGsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI?.getPGList();

      if (!response) {
        throw new Error("Failed to fetch PGs list");
      }

      setPGs(response);
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
          <p>Error loading PGs: {error}</p>
          <button
            onClick={fetchPGsList}
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
        <h1 className="text-3xl font-bold">PGs List</h1>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All Registered PGs ({pgs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pgs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No PGs found</div>
          ) : (
            <div className="space-y-4">
              {pgs?.map((pg: any) => (
                <Card
                  key={pg?._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* PG Info */}
                      <div>
                        <h3 className="font-bold text-lg">{pg?.name}</h3>
                        <p className="text-sm text-gray-600">{pg?.name}</p>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              pg.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {true ? "Active" : "Inactive"}
                          </span>
                          {pg?.onlinePayment && (
                            <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">
                              ONLINE PAYMENT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <h4 className="font-semibold">Location</h4>
                        <p className="text-sm text-gray-600">
                          {pg?.location?.subcity}, {pg?.location?.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pg?.location.state}, {pg?.location?.country} -{" "}
                          {pg?.location?.pin}
                        </p>
                      </div>

                      {/* Statistics */}
                      <div>
                        <h4 className="font-semibold">Statistics</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Rooms:</span>
                            <span className="ml-2 font-bold">
                              {pg?.totalRooms}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Beds:</span>
                            <span className="ml-2 font-bold">
                              {pg?.totalBeds}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Allocated:</span>
                            <span className="ml-2 font-bold text-red-600">
                              {pg?.allocatedBeds}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Available:</span>
                            <span className="ml-2 font-bold text-green-600">
                              {pg?.availableBeds}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-600">Occupancy:</span>
                          <span className="ml-2 font-bold">
                            {pg?.occupancyRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Info */}
                    {/* <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold">Admin Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Owner:</span>
                          <span className="ml-2 font-bold">
                            {pg?.admin?.ownerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2">{pg?.admin?.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mobile:</span>
                          <span className="ml-2">{pg?.admin?.mobile}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Role:</span>
                          <span className="ml-2 font-bold">
                            {pg?.admin?.role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div> */}

                    {/* Created Date */}
                    <div className="mt-4 text-sm text-gray-600">
                      Created: {new Date(pg?.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
