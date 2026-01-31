"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();

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
      </div>
    </ProtectedRoute>
  );
}
