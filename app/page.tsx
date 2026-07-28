"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

/* ── tiny inline SVG icons (no extra dep) ─────────────────────────────────── */
function IconBuilding() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14M9 21v-6h6v6M9 9h2m4 0h-2m-4 4h2m4 0h-2" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a4 4 0 00-5.196-3.796M9 20H4v-2a4 4 0 015.196-3.796M15 8a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0zM3 12a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  );
}
function IconBed() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12h18M3 8h1a4 4 0 014 4v4H3V8zm18 4v4h-5v-4a4 4 0 014-4h1z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4M12 3l7 4v5c0 5-7 8-7 8S5 17 5 12V7l7-4z" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

/* ── feature pill ─────────────────────────────────────────────────────────── */
function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-sm px-3.5 py-1.5 rounded-full backdrop-blur-sm">
      <span className="opacity-80">{icon}</span>
      {text}
    </span>
  );
}

/* ── stat card ────────────────────────────────────────────────────────────── */
function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-3xl md:text-4xl font-extrabold ${color} tabular-nums`}>{value}</div>
      <div className="text-sm text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

/* ── portal card ──────────────────────────────────────────────────────────── */
function PortalCard({
  icon,
  badge,
  title,
  description,
  features,
  href,
  cta,
  accent,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  features: string[];
  href: string;
  cta: string;
  accent: "primary" | "purple";
}) {
  const isPrimary = accent === "primary";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group
        ${isPrimary
          ? "bg-gradient-to-br from-[#94007b] to-[#c0006a] border-[#94007b]/30 text-white"
          : "bg-white border-gray-200 text-gray-900"
        }`}
    >
      {/* top-right glow blob */}
      <div
        className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-30
          ${isPrimary ? "bg-white" : "bg-[#94007b]"}`}
      />

      <div className="relative p-8">
        {/* badge */}
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full mb-5
            ${isPrimary
              ? "bg-white/20 text-white"
              : "bg-[#94007b]/10 text-[#94007b]"
            }`}
        >
          {badge}
        </span>

        {/* icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2.5 rounded-xl
              ${isPrimary ? "bg-white/20" : "bg-[#94007b]/10 text-[#94007b]"}`}
          >
            {icon}
          </div>
          <h2 className={`text-xl font-bold ${isPrimary ? "text-white" : "text-gray-900"}`}>
            {title}
          </h2>
        </div>

        <p className={`text-sm leading-relaxed mb-6 ${isPrimary ? "text-white/80" : "text-gray-500"}`}>
          {description}
        </p>

        {/* features */}
        <ul className="space-y-2 mb-8">
          {features.map((f) => (
            <li key={f} className={`flex items-center gap-2 text-sm ${isPrimary ? "text-white/90" : "text-gray-600"}`}>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0
                  ${isPrimary ? "bg-white/25" : "bg-[#94007b]/10"}`}
              >
                <svg className={`w-2.5 h-2.5 ${isPrimary ? "text-white" : "text-[#94007b]"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href={href}>
          <button
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center transition-all duration-200 cursor-pointer
              ${isPrimary
                ? "bg-white text-[#94007b] hover:bg-white/90 active:scale-[0.98]"
                : "bg-[#94007b] text-white hover:bg-[#7a0067] active:scale-[0.98]"
              }`}
          >
            {cta}
            <IconArrow />
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ── how it works step ────────────────────────────────────────────────────── */
function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-12 h-12 rounded-full bg-[#94007b]/10 text-[#94007b] text-lg font-extrabold flex items-center justify-center mb-4 border-2 border-[#94007b]/20">
        {num}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────────────────────── */
export default function Home() {
  const { currentAdmin, currentUser } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  if (currentAdmin) { router.push("/admin/dashboard"); return null; }
  if (currentUser) { router.push("/user/dashboard"); return null; }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6b0059] via-[#94007b] to-[#b5006e] pt-16 pb-24 px-4">

        {/* ── Soft radial glow blobs (depth layer) ── */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-icon" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 animate-pulse-icon" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#ff80d0]/8 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-icon" style={{ animationDelay: "4s" }} />

        {/* ── Floating themed icon cards ──────────────────────────────────
            Layout strategy:
            • Mobile  (< sm): 4 corner icons only, smaller size, no labels
            • Desktop (≥ sm): all 12 icons visible, full size + labels
        ── */}

        {/* 🛏 Bed — top-left corner */}
        <div className="absolute top-[6%] left-[3%] animate-float-a" style={{ animationDelay: "0s" }}>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[-8deg]">
            <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18M3 8h1a4 4 0 014 4v4H3V8zm18 4v4h-5v-4a4 4 0 014-4h1z" />
            </svg>
          </div>
          <p className="hidden sm:block text-white/40 text-[9px] font-semibold text-center mt-1.5 tracking-wide uppercase">Bed</p>
        </div>

        {/* 💳 Online Booking — top-right corner */}
        <div className="absolute top-[6%] right-[3%] animate-float-b" style={{ animationDelay: "1.5s" }}>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[6deg]">
            <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="hidden sm:block text-white/40 text-[9px] font-semibold text-center mt-1.5 tracking-wide uppercase">Book</p>
        </div>

        {/* 📞 Phone Call — bottom-left corner */}
        <div className="absolute bottom-[12%] left-[3%] animate-float-b" style={{ animationDelay: "3.1s" }}>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[-12deg]">
            <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <p className="hidden sm:block text-white/40 text-[9px] font-semibold text-center mt-1.5 tracking-wide uppercase">Support</p>
        </div>

        {/* 🤝 Meeting — bottom-right corner */}
        <div className="absolute bottom-[12%] right-[3%] animate-float-a" style={{ animationDelay: "1.2s" }}>
          <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[7deg]">
            <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-5.196-3.796M9 20H4v-2a4 4 0 015.196-3.796M15 8a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0zM3 12a3 3 0 116 0 3 3 0 01-6 0z" />
            </svg>
          </div>
          <p className="hidden sm:block text-white/40 text-[9px] font-semibold text-center mt-1.5 tracking-wide uppercase">Connect</p>
        </div>

        {/* ── Desktop-only icons (hidden on mobile) ── */}

        {/* 😴 Sleeping Person — left-middle */}
        <div className="hidden sm:block absolute top-[40%] left-[2%] animate-float-c" style={{ animationDelay: "0.8s" }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[-5deg]">
            <svg className="w-8 h-8 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12a1 1 0 000 2h12a1 1 0 000-2H4zm0 4a1 1 0 000 2h8a1 1 0 000-2H4zM4 8a1 1 0 000 2h6a1 1 0 000-2H4z" />
              <circle cx="18" cy="7" r="3" strokeWidth={1.5} />
            </svg>
          </div>
          <p className="text-white/40 text-[9px] font-semibold text-center mt-1.5 tracking-wide uppercase">Sleep</p>
        </div>

        {/* 💰 Money — right-middle */}
        <div className="hidden sm:block absolute top-[38%] right-[3%] animate-float-d" style={{ animationDelay: "2.2s" }}>
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[10deg]">
            <svg className="w-7 h-7 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/40 text-[9px] font-semibold text-center mt-1.5 tracking-wide uppercase">Rent</p>
        </div>

        {/* 🔑 Key — top-center-left */}
        <div className="hidden sm:block absolute top-[14%] left-[22%] animate-float-d" style={{ animationDelay: "0.4s" }}>
          <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center shadow-md rotate-[15deg] opacity-70">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        {/* 📍 Map Pin — top-center-right */}
        <div className="hidden sm:block absolute top-[12%] right-[22%] animate-float-c" style={{ animationDelay: "2.7s" }}>
          <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center shadow-md rotate-[-10deg] opacity-70">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* 📅 Calendar — bottom-center-left */}
        <div className="hidden sm:block absolute bottom-[22%] left-[28%] animate-float-a" style={{ animationDelay: "4.5s" }}>
          <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center shadow-md rotate-[-6deg] opacity-65">
            <svg className="w-5 h-5 text-white/65" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* ⭐ Star Rating — bottom-center-right */}
        <div className="hidden sm:block absolute bottom-[20%] right-[26%] animate-float-b" style={{ animationDelay: "3.8s" }}>
          <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center shadow-md rotate-[8deg] opacity-65">
            <svg className="w-5 h-5 text-white/65" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>

        {/* 🏠 Home / Building — left-lower */}
        <div className="hidden sm:block absolute top-[62%] left-[12%] animate-float-c" style={{ animationDelay: "1.9s" }}>
          <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center shadow-md rotate-[-4deg] opacity-60">
            <svg className="w-6 h-6 text-white/65" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
            </svg>
          </div>
        </div>

        {/* 📶 WiFi — right-lower */}
        <div className="hidden sm:block absolute top-[60%] right-[12%] animate-float-d" style={{ animationDelay: "0.6s" }}>
          <div className="w-12 h-12 rounded-xl bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center shadow-md rotate-[5deg] opacity-60">
            <svg className="w-6 h-6 text-white/65" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* eyebrow */}
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            {t("home.trustedBy")}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight uncial-antiqua-regular">
            {t("home.welcomeTitle")}
          </h1>

          <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed poiret-one-regular font-bold">
            {t("home.welcomeSubtitle")}
          </p>

          {/* feature pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            <FeaturePill icon={<IconSearch />} text="Free PG Search" />
            <FeaturePill icon={<IconBed />}    text="Book Beds Online" />
            <FeaturePill icon={<IconChart />}  text="PG Analytics" />
            <FeaturePill icon={<IconShield />} text="Secure Payments" />
          </div>

          {/* hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/user/login">
              <button className="inline-flex items-center gap-2 bg-white text-[#94007b] font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg hover:bg-white/95 hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer">
                Find a PG
                <IconArrow />
              </button>
            </Link>
            <Link href="/admin/login">
              <button className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/25 active:scale-[0.98] transition-all duration-200 cursor-pointer backdrop-blur-sm">
                List Your PG
              </button>
            </Link>
          </div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 48" className="w-full h-12 fill-white" preserveAspectRatio="none">
            <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="1,000+" label={t("home.stats.pgOwners")}     color="text-[#c45aff]" />
          <StatCard value="5,000+" label={t("home.stats.managedRooms")} color="text-green-400"  />
          <StatCard value="99.9%"  label={t("home.stats.uptime")}       color="text-sky-400"   />
          <StatCard value="24/7"   label={t("home.stats.support")}      color="text-orange-400"/>
        </div>
      </section>

      {/* ── PORTAL CARDS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Choose your portal</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Whether you&apos;re looking for the perfect stay or managing a property — we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            <PortalCard
              accent="primary"
              icon={<IconBuilding />}
              badge={t("home.adminPortal.subtitle")}
              title={t("home.adminPortal.title")}
              description={t("home.adminPortal.description")}
              features={[
                t("home.adminPortal.feature1"),
                t("home.adminPortal.feature2"),
                "Booking request management",
                "Tenant messaging & notifications",
              ]}
              href="/admin/login"
              cta={t("home.adminPortal.loginButton")}
            />
            <PortalCard
              accent="purple"
              icon={<IconUsers />}
              badge="For Tenants & Students"
              title={t("home.userPortal.title")}
              description="Find the perfect PG that fits your lifestyle and budget. Smart living starts with the right PG."
              features={[
                t("home.userPortal.feature1"),
                t("home.userPortal.feature2"),
                "Online booking & payments",
                "Chat directly with owners",
              ]}
              href="/user/login"
              cta="Login as User"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#94007b] mb-3 block">Simple process</span>
            <h2 className="text-3xl font-extrabold text-gray-900">How it works</h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* connector line (desktop only) */}
            <div className="hidden sm:block absolute top-6 left-[20%] right-[20%] h-0.5 bg-gray-100" />
            <StepCard num="1" title="Search & Browse"   desc="Find available PGs near your college or workplace. Filter by price, location, and amenities." />
            <StepCard num="2" title="Pick a Bed"        desc="Select your preferred room and bed slot. Check real-time availability before booking." />
            <StepCard num="3" title="Move In"           desc="Your booking request goes to the owner. Once approved, you&apos;re all set to move in." />
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#6b0059] to-[#94007b] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-yellow-300"><IconStar /></span>
            <span className="text-yellow-300"><IconStar /></span>
            <span className="text-yellow-300"><IconStar /></span>
            <span className="text-yellow-300"><IconStar /></span>
            <span className="text-yellow-300"><IconStar /></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to find your perfect stay?
          </h2>
          <p className="text-white/75 mb-8 text-base">
            Join thousands of happy tenants and PG owners on Bedwale.in
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/user/login">
              <button className="inline-flex items-center gap-2 bg-white text-[#94007b] font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg hover:bg-white/95 active:scale-[0.98] transition-all duration-200 cursor-pointer">
                Get Started Free
                <IconArrow />
              </button>
            </Link>
            <Link href="/admin/login">
              <button className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer">
                I&apos;m a PG Owner
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── footer note ──────────────────────────────────────────────────── */}
      <div className="bg-white py-5 px-4 text-center">
        <p className="text-xs text-gray-400 max-w-2xl mx-auto">
          {t("home.footerMessage")}
        </p>
      </div>
    </div>
  );
}
