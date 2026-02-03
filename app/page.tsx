"use client";

import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { currentAdmin, currentUser } = useAuth();

  // If user is logged in (either as admin or user), only show their dashboard
  if (currentAdmin) {
    return (
      <div className="relative min-h-screen bg-[url('../public/bg-pg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-primary-foreground">
              Welcome back, Admin!
            </h1>
            <p className="text-muted-foreground text-lg mb-8 text-primary-foreground">
              You are logged in as Admin
            </p>
            <Link href="/admin/dashboard">
              <Button size="lg">Go to Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="relative min-h-screen bg-[url('../public/bg-pg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-primary-foreground">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-muted-foreground text-lg mb-8 text-primary-foreground">
              You are logged in as User
            </p>
            <Link href="/user/dashboard">
              <Button size="lg">Go to User Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only show login options if NOT logged in
  return (
    <div className="relative min-h-screen bg-[url('../public/bg-pg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary-foreground">
            Welcome to STHALS.IN
          </h1>
          <p className="text-muted-foreground text-lg mb-6 text-primary-foreground">
            Find your perfect PG accommodation or manage your PG business
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>PG Admin Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Register your PG, manage bookings, and handle requests from
                tenants.
              </p>
              <Link href="/admin/login">
                <Button>Go to Admin Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <CardTitle>User Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Find and book PG accommodations that suit your needs.
              </p>
              <Link href="/user/login">
                <Button>Go to User Portal</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
