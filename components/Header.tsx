"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { getAuthData, useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { logout } = useAuth();

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
          STHALS.IN
        </Link>
        {/* </div> */}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          {data?.user?.role === "admin" && (
            <Link href="/admin/create-pg" className="hover:text-accent">
              Create PGs
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link href="/dashboard" className="hover:text-accent">
              Manage PGs
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link href="/admin/requests" className="hover:text-accent">
              View Requests
            </Link>
          )}
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/contact" className="hover:text-accent">
            Contact
          </Link>
          {data?.user?.role === "admin" && (
            <Link href="/admin/profile" className="hover:text-accent">
              View Profile
            </Link>
          )}
          {data?.user?.role && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              <LogOut size={18} />
              Logout
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
            Home
          </Link>
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/create-pg"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              Create PGs
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link
              href="/dashboard"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              Manage PGs
            </Link>
          )}
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/requests"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              View Requests
            </Link>
          )}
          <Link
            href="/about"
            className="hover:text-accent block py-2"
            onClick={toggleMenu}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-accent block py-2"
            onClick={toggleMenu}
          >
            Contact
          </Link>
          {data?.user?.role === "admin" && (
            <Link
              href="/admin/profile"
              className="hover:text-accent block py-2"
              onClick={toggleMenu}
            >
              View Profile
            </Link>
          )}
          {data?.user?.role && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition w-full justify-center"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
