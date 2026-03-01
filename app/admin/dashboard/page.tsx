"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardBadge,
} from "@/components";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { pgAPI } from "@/services/api";
import {
  Building,
  Users,
  Calendar,
  Shield,
  Settings,
  Plus,
  MessageSquare,
  User,
} from "lucide-react";

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
      {/* Animated Dashboard Background */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/15 via-purple-400/15 to-pink-400/15 animate-gradient-x"></div>

        {/* Floating Dashboard Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-2xl animate-float-medium"></div>
        <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-pink-400/10 rounded-full blur-2xl animate-float-fast"></div>

        {/* Dashboard Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-grid-move"></div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Welcome Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, {currentAdmin?.ownerName}
            </h1>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Create New PG */}
            <Card
              variant="elevated"
              className="group hover:shadow-2xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle icon={<Plus className="w-8 h-8 text-green-500" />}>
                    Create New PG
                  </CardTitle>
                  {/* <CardBadge variant="success">
                    Quick Setup
                  </CardBadge> */}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Add a new PG with structure and settings. Start managing your
                  properties today.
                </p>
                <Link href="/admin/create-pg">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    Create PG
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Requests Received */}
            <Card
              variant="elevated"
              className="group hover:shadow-2xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle
                    icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
                  >
                    Requests Received
                  </CardTitle>
                  <CardBadge variant="primary">Active</CardBadge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  View and manage booking requests from potential tenants.
                </p>
                <Link href="/admin/requests">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    View Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Management */}
            <Card
              variant="elevated"
              className="group hover:shadow-2xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle
                    icon={<User className="w-8 h-8 text-purple-500" />}
                  >
                    Profile
                  </CardTitle>
                  <CardBadge variant="secondary">Settings</CardBadge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  View and edit your profile information and account settings.
                </p>
                <Link href="/admin/profile">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Super Admin Portal */}
            {currentAdmin?.role === "super_admin" && (
              <Card
                variant="bordered"
                className="group hover:shadow-2xl transition-all duration-300 border-2 col-span-full"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle
                      icon={<Settings className="w-8 h-8 text-orange-500" />}
                    >
                      Super Admin Portal
                    </CardTitle>
                    <CardBadge variant="error">Admin Only</CardBadge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Access super admin features and manage all PGs across the
                    platform.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/admin/superadmin-portal/admins">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300"
                      >
                        Manage Admins
                      </Button>
                    </Link>
                    <Link href="/admin/superadmin-portal/pgs">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300"
                      >
                        All PGs
                      </Button>
                    </Link>
                    <Link href="/admin/superadmin-portal/location-stats">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300"
                      >
                        Location Stats
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card variant="glass" className="p-6 backdrop-blur-xl text-center">
              <div className="text-3xl font-bold text-blue-600">
                {pgs.length}
              </div>
              <div className="text-gray-600">Total PGs</div>
            </Card>
            <Card variant="glass" className="p-6 backdrop-blur-xl text-center">
              <div className="text-3xl font-bold text-green-600">
                {pgs.reduce(
                  (sum, pg) =>
                    sum +
                    pg.structure.reduce(
                      (roomSum: number, room: any) =>
                        roomSum + room.beds.length,
                      0,
                    ),
                  0,
                )}
              </div>
              <div className="text-gray-600">Total Beds</div>
            </Card>
            <Card variant="glass" className="p-6 backdrop-blur-xl text-center">
              <div className="text-3xl font-bold text-purple-600">
                {pgs.reduce(
                  (sum, pg) =>
                    sum +
                    pg.structure.reduce(
                      (roomSum: number, room: any) =>
                        roomSum +
                        room.beds.filter((bed: any) => bed.allocated).length,
                      0,
                    ),
                  0,
                )}
              </div>
              <div className="text-gray-600">Occupied</div>
            </Card>
            <Card variant="glass" className="p-6 backdrop-blur-xl text-center">
              <div className="text-3xl font-bold text-orange-600">
                {pgs.reduce(
                  (sum, pg) =>
                    sum +
                    pg.structure.reduce(
                      (roomSum: number, room: any) =>
                        roomSum +
                        (room.beds.length -
                          room.beds.filter((bed: any) => bed.allocated).length),
                      0,
                    ),
                  0,
                )}
              </div>
              <div className="text-gray-600">Available</div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
