"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocationStatsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/superadmin-portal"); }, [router]);
  return null;
}
