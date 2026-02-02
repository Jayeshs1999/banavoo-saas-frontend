"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminAPI } from "@/services/api";

interface Admin {
  _id: string;
  pgName: string;
  ownerName: string;
  email: string;
  mobile: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminsList() {
  const { currentAdmin, logout } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      router.push("/admin/login");
    } else {
      fetchAdminsList();
    }
  }, [currentAdmin, router]);

  const fetchAdminsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await superAdminAPI?.getAdminList();

      if (!response) {
        throw new Error("Failed to fetch admins list");
      }

      setAdmins(response);
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
          <p>Error loading admins: {error}</p>
          <button
            onClick={fetchAdminsList}
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
        <h1 className="text-3xl font-bold">Admins List</h1>
        <div className="flex gap-4">
          <Link href="/admin/superadmin-portal">
            <Button className="bg-blue-500 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/admin/superadmin-portal/pgs">
            <Button className="bg-green-500 hover:bg-green-700">
              View PGs
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
            All Registered Admins ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No admins found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3">Name</th>
                    <th className="text-left p-2 sm:p-3">Email</th>
                    <th className="text-left p-2 sm:p-3">Mobile</th>
                    <th className="text-left p-2 sm:p-3">Role</th>
                    <th className="text-left p-2 sm:p-3">Verified</th>
                    <th className="text-left p-2 sm:p-3">PG Name</th>
                    <th className="text-left p-2 sm:p-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 sm:p-3">
                        <div>
                          <div className="font-bold">{admin.ownerName}</div>
                          <div className="text-sm text-gray-600">
                            {admin.pgName}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">{admin.email}</td>
                      <td className="p-2 sm:p-3">{admin.mobile}</td>
                      <td className="p-2 sm:p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            admin.role === "super_admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {admin.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            admin.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {admin.isVerified ? "VERIFIED" : "NOT VERIFIED"}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3">{admin.pgName}</td>
                      <td className="p-2 sm:p-3 text-sm text-gray-600">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
