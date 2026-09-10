"use client";

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <p className="text-muted-foreground mb-2 text-sm">Logged in as</p>
          <p className="font-semibold text-foreground text-lg">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
        </div>

        {/* TODO: Add your dashboard widgets / content here */}
      </div>
    </ProtectedRoute>
  );
}
