"use client";

import Link from "next/link";
import { useAuth } from "../app/context/AuthContext";

/**
 * Header — minimal navigation bar.
 * Customise with your own brand/links.
 */
export default function Header() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-16 flex items-center px-6">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-primary">
          MyApp {/* TODO: Replace with your brand name */}
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          {/* TODO: Add your navigation links here */}

          {currentUser ? (
            <>
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
