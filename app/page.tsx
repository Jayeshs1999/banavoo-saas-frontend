"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardBadge,
} from "@/components";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Building,
  Users,
  Shield,
  Calendar,
  Bed,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { currentAdmin, currentUser } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const redirectToHome = () => {
    router.push("/admin/dashboard");
  };

  // If user is logged in (either as admin or user), only show their dashboard
  if (currentAdmin) {
    redirectToHome();
    return;
  }

  if (currentUser) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center relative z-10">
          <Card variant="elevated" className="max-w-2xl text-center">
            <CardHeader>
              <CardTitle icon={<Users className="w-8 h-8" />}>
                {t("home.welcomeBack")} {currentUser.name}!
              </CardTitle>
              <CardBadge variant="success">
                {t("home.userAccountActive")}
              </CardBadge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 text-lg">
                {t("home.loggedUser")}
              </p>
              <div className="space-y-4">
                <Link href="/user/dashboard">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    {t("home.goToDashboard")}
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">
                  {t("home.manageBookings")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Only show login options if NOT logged in
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-gradient-x"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-float-slow animate-pulse-slow"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-float-fast animate-pulse-fast"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl animate-float-medium animate-pulse-medium"></div>

      {/* Floating Color Particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-300 rounded-full opacity-60 animate-bounce-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-purple-300 rounded-full opacity-40 animate-bounce-medium"></div>
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-pink-300 rounded-full opacity-50 animate-bounce-fast"></div>
        <div className="absolute top-1/6 right-1/6 w-5 h-5 bg-green-300 rounded-full opacity-30 animate-bounce-slow"></div>
        <div className="absolute bottom-1/4 left-1/6 w-4 h-4 bg-yellow-300 rounded-full opacity-40 animate-bounce-medium"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-grid-move"></div>

      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl secondary-foreground mb-4 bungee-spice-regular">
            {t("home.welcomeTitle")}
          </h1>
          <p className="secondary-foreground text-lg mb-6 poiret-one-regular font-bold">
            {t("home.welcomeSubtitle")}
          </p>
          <CardBadge variant="primary" className="mt-4">
            {t("home.trustedBy")}
          </CardBadge>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card
            variant="bordered"
            className="group hover:shadow-2xl transition-all duration-300 border-2"
          >
            <CardHeader>
              <CardTitle icon={<Building className="w-8 h-8 text-blue-500" />}>
                {t("home.adminPortal.title")}
              </CardTitle>
              <CardBadge variant="primary">
                {t("home.adminPortal.subtitle")}
              </CardBadge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 text-lg">
                {t("home.adminPortal.description")}
              </p>
              <div className="space-y-4">
                <Link href="/admin/login">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r  bg-primary hover:bg-primary text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    {t("home.adminPortal.loginButton")}
                  </Button>
                </Link>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>• {t("home.adminPortal.feature1")}</span>
                  <span>• {t("home.adminPortal.feature2")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Portal - Coming Soon */}
          <Card
            variant="elevated"
            className="group hover:shadow-2xl transition-all duration-300 opacity-75"
          >
            <CardHeader>
              <CardTitle icon={<Users className="w-8 h-8 text-purple-500" />}>
                {t("home.userPortal.title")}
              </CardTitle>
              <CardBadge variant="warning">
                {t("home.userPortal.subtitle")}
              </CardBadge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 text-lg">
                {t("home.userPortal.description")}
              </p>
              <div className="space-y-4">
                <div className="w-full">
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed font-medium"
                  >
                    {t("home.userPortal.loginButton")}
                  </button>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>• {t("home.userPortal.feature1")}</span>
                  <span>• {t("home.userPortal.feature2")}</span>
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 text-center font-medium">
                    🚧 {t("home.userPortal.underDevelopment")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <Card variant="glass" className="p-8 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">1000+</div>
                <div className="text-gray-600">{t("home.stats.pgOwners")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">5000+</div>
                <div className="text-gray-600">
                  {t("home.stats.managedRooms")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">99.9%</div>
                <div className="text-gray-600">{t("home.stats.uptime")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">{t("home.stats.support")}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">{t("home.footerMessage")}</p>
        </div>
      </div>
    </div>
  );
}
