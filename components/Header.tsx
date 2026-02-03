"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsOpen(false);
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex gap-2 justify-center items-center">
          <Image
            src="/logo1.png"
            alt="STHALS Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <Link href="/" className="text-xl font-bold">
            STHALS.IN
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-accent">
            Dashboard
          </Link>
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/contact" className="hover:text-accent">
            Contact
          </Link>
          {isLoggedIn && (
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
          <Link
            href="/dashboard"
            className="hover:text-accent block py-2"
            onClick={toggleMenu}
          >
            Dashboard
          </Link>
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
          {isLoggedIn && (
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
