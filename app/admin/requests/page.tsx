"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/Card";
import { dummyRequests } from "../../../utils";
import { formatDate } from "../../../utils";
import { useTranslation } from "react-i18next";

export default function AdminRequests() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="sm:text-2xl md:text-3xl font-bold">
          {t("requests.title")}
        </h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← {t("common.back")}
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-full mb-6">
          <div className="text-6xl mb-4">🏗️</div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {t("requests.comingSoon")}
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-md">
          {t("requests.description")}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>{t("requests.note")}:</strong>{" "}
            {t("requests.featureWillAllow")}
          </p>
          <ul className="mt-2 text-sm text-blue-700 text-left list-disc list-inside">
            <li>{t("requests.viewPending")}</li>
            <li>{t("requests.approveReject")}</li>
            <li>{t("requests.manageStatus")}</li>
            <li>{t("requests.communicateUsers")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
