"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { getAuthData, useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { chatAPI, bookingAPI } from "@/services/api";

/* ─── tiny red pill badge ─────────────────────────────────────────────────── */
function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ─── single nav link ─────────────────────────────────────────────────────── */
function NavLink({
  href,
  children,
  onClick,
  mobile = false,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center text-sm font-medium transition-colors pb-0.5 ${
        isActive
          ? "text-primary after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full"
          : "text-gray-600 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
}

/* ─── "More" dropdown (desktop, logged-in only) ───────────────────────────── */
const MORE_ITEMS = [
  { href: "/about",   label: "About",   icon: "ℹ️" },
  { href: "/contact", label: "Contact", icon: "✉️" },
  { href: "/gallery", label: "Gallery", icon: "📸" },
] as const;

function MoreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const anyActive = MORE_ITEMS.some(
    (item) => pathname === item.href || pathname?.startsWith(item.href),
  );

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1 text-sm font-medium transition-colors pb-0.5 select-none ${
          anyActive
            ? "text-primary after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full"
            : "text-gray-600 hover:text-primary"
        }`}
      >
        More
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-[calc(100%+18px)] right-0 w-44 bg-white rounded-2xl border border-gray-200 shadow-xl py-1.5 z-50">
          {/* arrow pointer */}
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
          {MORE_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN HEADER
═══════════════════════════════════════════════════════════════════════════ */
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs]           = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  const { logout } = useAuth();
  const { t } = useTranslation();
  const data = getAuthData();
  const router = useRouter();
  const role = data?.user?.role as string | undefined;

  const toggleMenu = () => setIsOpen((v) => !v);

  const handleLogout     = () => { logout(); router.push("/admin/login"); };
  const handleUserLogout = () => { logout(); router.push("/user/login"); };

  /* ── poll unread messages ── */
  useEffect(() => {
    if (role !== "admin" && role !== "user") return;
    let alive = true;
    const poll = () =>
      chatAPI.getUnreadCount()
        .then((r) => { if (alive) setUnreadMsgs(r?.unreadCount ?? 0); })
        .catch(() => {});
    poll();
    const id = setInterval(poll, 15_000);
    return () => { alive = false; clearInterval(id); };
  }, [role]);

  /* ── poll pending requests count ── */
  useEffect(() => {
    if (role !== "admin" && role !== "user") return;
    let alive = true;
    const poll = async () => {
      try {
        if (role === "admin") {
          const res = await bookingAPI.getAdminBookings();
          if (!alive) return;
          setPendingRequests((res.data ?? []).filter((b: { status: string }) => b.status === "pending").length);
        } else {
          const res = await bookingAPI.getMyBookings();
          if (!alive) return;
          setPendingRequests((res.data ?? []).filter((b: { status: string }) => b.status === "pending").length);
        }
      } catch { /* silent */ }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, [role]);

  /* ── avatar initials ── */
  const avatarLabel =
    role === "admin"
      ? (data?.user?.ownerName ?? data?.user?.pgName ?? "A")[0].toUpperCase()
      : role === "user"
      ? (data?.user?.firstName ?? "U")[0].toUpperCase()
      : null;

  const displayName =
    role === "admin"
      ? data?.user?.ownerName ?? "Admin"
      : role === "user"
      ? `${data?.user?.firstName ?? ""} ${data?.user?.lastName ?? ""}`.trim() || "User"
      : null;

  /* ── request / messages hrefs ── */
  const requestsHref = role === "admin" ? "/admin/requests" : "/user/requests";
  const messagesHref = role === "admin" ? "/admin/messages" : "/user/messages";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <div
            className="flex items-center shrink-0 cursor-pointer"
            onClick={() => { if (!role) router.push("/"); }}
          >
            <Image
              src="/logo3.png"
              alt="Bedwale.in"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-5">
            <NavLink href="/">{t("header.home")}</NavLink>

            {role === "admin" && <>
              <NavLink href="/admin/create-pg">{t("header.createPGs")}</NavLink>
              <NavLink href="/dashboard">{t("header.managePGs")}</NavLink>
              <NavLink href={requestsHref}>
                {t("header.viewRequests")}
                <Badge count={pendingRequests} />
              </NavLink>
              <NavLink href={messagesHref}>
                Messages
                <Badge count={unreadMsgs} />
              </NavLink>
            </>}

            {role === "user" && <>
              <NavLink href={requestsHref}>
                {t("userDashboard.myRequests")}
                <Badge count={pendingRequests} />
              </NavLink>
              <NavLink href={messagesHref}>
                Messages
                <Badge count={unreadMsgs} />
              </NavLink>
            </>}

            {/* When logged in → collapse About / Contact / Gallery into "More" dropdown.
                When not logged in → show them flat (only 3 items, no congestion). */}
            {role ? (
              <MoreDropdown />
            ) : (
              <>
                <NavLink href="/about">{t("header.about")}</NavLink>
                <NavLink href="/contact">{t("header.contact")}</NavLink>
                <NavLink href="/gallery">📸 Gallery</NavLink>
              </>
            )}

            {role === "admin" && (
              <NavLink href="/admin/profile">{t("header.viewProfile")}</NavLink>
            )}
            {role === "user" && (
              <NavLink href="/user/profile">{t("userDashboard.profile")}</NavLink>
            )}
          </nav>

          {/* ── Right slot: lang + avatar/logout OR hamburger ── */}
          <div className="flex items-center gap-2">
            {/* Language — desktop only */}
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>

            {/* Logged-in user chip (desktop) */}
            {role && avatarLabel && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {avatarLabel}
                  </span>
                  <span className="text-sm font-medium text-gray-700 max-w-[110px] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={role === "user" ? handleUserLogout : handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  {t("header.logout")}
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleMenu}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col
          transition-transform duration-250 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 shrink-0">
          <Image src="/logo3.png" alt="Bedwale.in" width={100} height={32} className="object-contain" />
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* User chip in drawer */}
        {role && avatarLabel && (
          <div className="mx-4 mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
            <span className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              {avatarLabel}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">{data?.user?.email ?? ""}</p>
            </div>
          </div>
        )}

        {/* Nav links — always flat in the drawer (plenty of room) */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          <NavLink href="/" onClick={() => setIsOpen(false)} mobile>
            {t("header.home")}
          </NavLink>

          {role === "admin" && <>
            <NavLink href="/admin/create-pg" onClick={() => setIsOpen(false)} mobile>
              {t("header.createPGs")}
            </NavLink>
            <NavLink href="/dashboard" onClick={() => setIsOpen(false)} mobile>
              {t("header.managePGs")}
            </NavLink>
            <NavLink href={requestsHref} onClick={() => setIsOpen(false)} mobile>
              <span className="flex-1">{t("header.viewRequests")}</span>
              <Badge count={pendingRequests} />
            </NavLink>
            <NavLink href={messagesHref} onClick={() => setIsOpen(false)} mobile>
              <span className="flex-1">Messages</span>
              <Badge count={unreadMsgs} />
            </NavLink>
          </>}

          {role === "user" && <>
            <NavLink href={requestsHref} onClick={() => setIsOpen(false)} mobile>
              <span className="flex-1">{t("userDashboard.myRequests")}</span>
              <Badge count={pendingRequests} />
            </NavLink>
            <NavLink href={messagesHref} onClick={() => setIsOpen(false)} mobile>
              <span className="flex-1">Messages</span>
              <Badge count={unreadMsgs} />
            </NavLink>
          </>}

          {/* Divider before secondary links */}
          {role && (
            <div className="pt-1 pb-0.5">
              <div className="h-px bg-gray-100" />
            </div>
          )}

          <NavLink href="/about" onClick={() => setIsOpen(false)} mobile>
            {t("header.about")}
          </NavLink>
          <NavLink href="/contact" onClick={() => setIsOpen(false)} mobile>
            {t("header.contact")}
          </NavLink>
          <NavLink href="/gallery" onClick={() => setIsOpen(false)} mobile>
            📸 Gallery
          </NavLink>

          {role === "admin" && (
            <NavLink href="/admin/profile" onClick={() => setIsOpen(false)} mobile>
              {t("header.viewProfile")}
            </NavLink>
          )}
          {role === "user" && (
            <NavLink href="/user/profile" onClick={() => setIsOpen(false)} mobile>
              {t("userDashboard.profile")}
            </NavLink>
          )}
        </nav>

        {/* Drawer footer: language + logout */}
        <div className="px-4 pb-6 pt-3 border-t border-gray-100 space-y-2 shrink-0">
          <div className="px-1">
            <LanguageSwitcher />
          </div>
          {role && (
            <button
              onClick={() => {
                setIsOpen(false);
                role === "user" ? handleUserLogout() : handleLogout();
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              {t("header.logout")}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
