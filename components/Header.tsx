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

  const handleUserLogout = () => {
    logout();
    router.push("/user/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background text-foreground shadow-md">
      <div className="container mx-auto px-4 py-[17px] flex justify-between items-center">
        <div className="flex gap-2 justify-center items-center">
          <Image
            src={"/logo3.png"}
            alt="Bedwale.in Logo"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
          {/* <Link href="/" className="uncial-antiqua-regular text-[25px] font-bold">
          {t("header.title")}
        </Link> */}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/" className="hover:text-primary">
            {t("header.home")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link href="/admin/create-pg" className="hover:text-primary">
              {t("header.createPGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link href="/dashboard" className="hover:text-primary">
              {t("header.managePGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link href="/admin/requests" className="hover:text-primary">
              {t("header.viewRequests")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link href="/user/requests" className="hover:text-primary">
              {t("userDashboard.myRequests")}
            </Link>
          )}

          <Link href="/about" className="hover:text-primary">
            {t("header.about")}
          </Link>
          <Link href="/contact" className="hover:text-primary">
            {t("header.contact")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link href="/admin/profile" className="hover:text-primary">
              {t("header.viewProfile")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link href="/user/profile" className="hover:text-primary">
              {t("userDashboard.profile")}
            </Link>
          )}

          <LanguageSwitcher />
          {data?.user?.role && (
            <button
              onClick={() =>
                data?.user?.role === "user"
                  ? handleUserLogout()
                  : handleLogout()
              }
              className="flex items-center gap-2 bg-primary text-primary-foreground cursor-pointer px-4 py-2 rounded transition"
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
            className="hover:text-primary block py-2"
            onClick={toggleMenu}
          >
            {t("header.home")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/create-pg"
              className="hover:text-primary block py-2"
              onClick={toggleMenu}
            >
              {t("header.createPGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link
              href="/dashboard"
              className="hover:text-primary block py-2"
              onClick={toggleMenu}
            >
              {t("header.managePGs")}
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/requests"
              className="hover:text-primary block py-2"
              onClick={toggleMenu}
            >
              {t("header.viewRequests")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link
              href="/user/requests"
              className="hover:text-primary block py-2"
              onClick={toggleMenu}
            >
              {t("userDashboard.myRequests")}
            </Link>
          )}

          <Link
            href="/about"
            className="hover:text-primary block py-2"
            onClick={toggleMenu}
          >
            {t("header.about")}
          </Link>
          <Link
            href="/contact"
            className="hover:text-primary block py-2"
            onClick={toggleMenu}
          >
            {t("header.contact")}
          </Link>
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/profile"
              className="hover:text-primary block py-2"
              onClick={toggleMenu}
            >
              {t("header.viewProfile")}
            </Link>
          )}

          {data?.user?.role === "user" && (
            <Link
              href="/user/profile"
              className="hover:text-primary block py-2"
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
              onClick={() =>
                data?.user?.role === "user"
                  ? handleUserLogout()
                  : handleLogout()
              }
              className="flex items-center gap-2 bg-primary text-primary-foreground cursor-pointer px-4 py-2 rounded transition w-full justify-center"
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
