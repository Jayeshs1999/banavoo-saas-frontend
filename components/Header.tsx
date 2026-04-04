"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { getAuthData, useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { logout } = useAuth();
  const { t } = useTranslation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const data = getAuthData();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* <div className="flex gap-2 justify-center items-center">
          <Image
            src="/logo1.png"
            alt="STHALS Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          /> */}
        <Link href="/" className="uncial-antiqua-regular text-[25px] font-bold">
          {t("header.title")}
        </Link>
        {/* </div> */}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/" className="hover:text-accent">
            {t("header.home")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link href="/admin/create-pg" className="hover:text-accent">
              {t("header.createPGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link href="/dashboard" className="hover:text-accent">
              {t("header.managePGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link href="/admin/requests" className="hover:text-accent">
              {t("header.viewRequests")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link href="/user/requests" className="hover:text-accent">
              {t("userDashboard.myRequests")}
            </Link>
          )}

          <Link href="/about" className="hover:text-accent">
            {t("header.about")}
          </Link>
          <Link href="/contact" className="hover:text-accent">
            {t("header.contact")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link href="/admin/profile" className="hover:text-accent">
              {t("header.viewProfile")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link href="/user/profile" className="hover:text-accent">
              {t("userDashboard.profile")}
            </Link>
          )}

          <LanguageSwitcher />
          {data?.user?.role && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              <LogOut size={18} />
              {t("header.logout")}
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden flex items-center">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-primary-dark bg-opacity-95 px-4 py-4 space-y-3 flex flex-col">
          <Link
            href="/"
            className="hover:text-accent block py-2"
            onClick={toggleMenu}
          >
            {t("header.home")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/create-pg"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              {t("header.createPGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link
              href="/dashboard"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              {t("header.managePGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/requests"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              {t("header.viewRequests")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link
              href="/user/requests"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              {t("userDashboard.myRequests")}
            </Link>
          )}

          <Link
            href="/about"
            className="hover:text-accent block py-2"
            onClick={toggleMenu}
          >
            {t("header.about")}
          </Link>
          <Link
            href="/contact"
            className="hover:text-accent block py-2"
            onClick={toggleMenu}
          >
            {t("header.contact")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/profile"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              {t("header.viewProfile")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link
              href="/user/profile"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              {t("userDashboard.profile")}
            </Link>
          )}

          <div className="py-2">
            <LanguageSwitcher />
          </div>
          {data?.user?.role && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition w-full justify-center"
            >
              <LogOut size={18} />
              {t("header.logout")}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
