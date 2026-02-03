"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { pgAPI } from "@/services/api";

export default function AdminDashboard() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();
  const [pgs, setPGs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentAdmin) {
      fetchAdminPGs();
    }
  }, [currentAdmin]);

  const fetchAdminPGs = async () => {
    setLoading(true);
    try {
      const response = await pgAPI.getAdminPGs();
      if (response.success) {
        setPGs(response.data);
      }
    } catch (err) {
      console.error("Error fetching PGs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {currentAdmin?.ownerName}
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New PG</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add a new PG with structure and settings.
              </p>
              <Link href="/admin/create-pg">
                <Button>Create PG</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and manage booking requests.
              </p>
              <Link href="/admin/requests">
                <Button>View Requests</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and edit your profile information.
              </p>
              <Link href="/admin/profile">
                <Button>View Profile</Button>
              </Link>
            </CardContent>
          </Card>

          {currentAdmin?.role === "super_admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Super Admin Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access super admin features and manage all PGs.
                </p>
                <Link href="/admin/superadmin-portal">
                  <Button variant="secondary">Super Admin Portal</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin's PGs Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your PGs ({pgs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : pgs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't created any PGs yet. <br />
                  <Link
                    href="/admin/create-pg"
                    className="text-blue-500 hover:underline"
                  >
                    Create your first PG
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pgs.map((pg) => {
                    const totalRooms = pg.structure.length;
                    const totalBeds = pg.structure.reduce(
                      (sum: number, room: any) => sum + room.beds.length,
                      0,
                    );
                    const allocatedBeds = pg.structure.reduce(
                      (sum: number, room: any) =>
                        sum +
                        room.beds.filter((bed: any) => bed.allocated).length,
                      0,
                    );
                    const availableBeds = totalBeds - allocatedBeds;
                    const occupancyRate =
                      totalBeds > 0
                        ? ((allocatedBeds / totalBeds) * 100).toFixed(0)
                        : "0";

                    return (
                      <Card
                        key={pg._id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-lg">{pg.name}</h3>
                              <p className="text-sm text-gray-600">
                                {pg.location?.subcity}, {pg.location?.city}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-blue-50 p-2 rounded">
                                <span className="text-blue-600 font-semibold">
                                  {totalRooms}
                                </span>
                                <span className="text-gray-600 ml-1">
                                  Rooms
                                </span>
                              </div>
                              <div className="bg-green-50 p-2 rounded">
                                <span className="text-green-600 font-semibold">
                                  {totalBeds}
                                </span>
                                <span className="text-gray-600 ml-1">Beds</span>
                              </div>
                              <div className="bg-red-50 p-2 rounded">
                                <span className="text-red-600 font-semibold">
                                  {allocatedBeds}
                                </span>
                                <span className="text-gray-600 ml-1">
                                  Allocated
                                </span>
                              </div>
                              <div className="bg-yellow-50 p-2 rounded">
                                <span className="text-yellow-600 font-semibold">
                                  {availableBeds}
                                </span>
                                <span className="text-gray-600 ml-1">
                                  Available
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold">
                                Occupancy: {occupancyRate}%
                              </span>
                              <div className="w-full bg-gray-200 rounded-full h-2 ml-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${occupancyRate}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link href={`/admin/pgs/${pg._id}`}>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/admin/edit-pg/${pg._id}`}>
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-700"
                                >
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
