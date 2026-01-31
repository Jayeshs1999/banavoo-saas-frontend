"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminAPI } from "@/services/api";

export default function SuperAdminDashboard() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("stats:", stats);

  useEffect(() => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      router.push("/admin/login");
    } else {
      fetchDashboardStats();
    }
  }, [currentAdmin, router]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI.getSUperAdminDashboardInfo();

      console.log("response", response);

      if (!response.success) {
        throw new Error("Failed to fetch dashboard stats");
      }

      setStats(response);
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
          <p>Error loading dashboard: {error}</p>
          <button
            onClick={fetchDashboardStats}
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
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/admin/superadmin-portal/admins">
            <Button className="bg-blue-500 hover:bg-blue-700">
              View Admins
            </Button>
          </Link>
          <Link href="/admin/superadmin-portal/pgs">
            <Button className="bg-green-500 hover:bg-green-700">
              View PGs
            </Button>
          </Link>
          <Link href="/admin/superadmin-portal/location-stats">
            <Button className="bg-purple-500 hover:bg-purple-700">
              Location Stats
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Admin Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Admins:</span>
                <span className="font-bold">
                  {stats?.data?.totalAdmins || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Regular Admins:</span>
                <span className="font-bold text-blue-600">
                  {stats?.data?.totalRegularAdmins || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Super Admins:</span>
                <span className="font-bold text-red-600">
                  {stats?.data?.totalSuperAdmins || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PG Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">PG Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total PGs:</span>
                <span className="font-bold">{stats?.data?.totalPGs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active PGs:</span>
                <span className="font-bold text-green-600">
                  {stats?.data?.activePGs || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inactive PGs:</span>
                <span className="font-bold text-gray-600">
                  {stats?.data?.inactivePGs || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Rooms:</span>
                <span className="font-bold">
                  {stats?.data?.totalRooms || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Beds:</span>
                <span className="font-bold">{stats?.data?.totalBeds || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Beds:</span>
                <span className="font-bold text-green-600">
                  {stats?.data?.totalAvailableBeds || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {stats?.data?.occupancyRate || 0}%
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Overall occupancy across all PGs
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/superadmin-portal/admins" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="font-bold">Manage Admins</div>
                  <div className="text-sm text-gray-600 mt-1">
                    View and manage all admin users
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/superadmin-portal/pgs" className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="font-bold">Manage PGs</div>
                  <div className="text-sm text-gray-600 mt-1">
                    View all PGs with detailed statistics
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/admin/superadmin-portal/location-stats"
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="text-center py-6">
                  <div className="text-3xl mb-2">📍</div>
                  <div className="font-bold">Location Analytics</div>
                  <div className="text-sm text-gray-600 mt-1">
                    View location-based statistics
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
