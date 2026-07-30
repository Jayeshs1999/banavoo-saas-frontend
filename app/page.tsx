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
        {/* animated blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float-fast" />

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
