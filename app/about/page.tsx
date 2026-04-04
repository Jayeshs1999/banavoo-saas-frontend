"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../components";
import { useTranslation } from "react-i18next";
import { Building, Users, Target, Eye, Code } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("about.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("about.description")}
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-2xl">{t("about.mission")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("about.missionDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-2xl">{t("about.vision")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("about.visionDesc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building className="w-8 h-8 text-green-600" />
                <CardTitle className="text-xl">
                  {t("about.forPGOwners")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 dark:text-gray-400 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {t("about.pgOwnersFeature1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {t("about.pgOwnersFeature2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {t("about.pgOwnersFeature3")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {t("about.pgOwnersFeature4")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {t("about.pgOwnersFeature5")}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-xl">
                  {t("about.forTenants")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 dark:text-gray-400 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  {t("about.tenantsFeature1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  {t("about.tenantsFeature2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  {t("about.tenantsFeature3")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  {t("about.tenantsFeature4")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  {t("about.tenantsFeature5")}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Commitment Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t("about.commitment")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-500 text-center leading-relaxed max-w-3xl mx-auto">
              {t("about.commitmentDesc")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
