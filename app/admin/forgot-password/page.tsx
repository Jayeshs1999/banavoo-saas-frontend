"use client";

import { useState } from "react";
import Link from "next/link";
import { authAPI } from "../../../services/api";

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-gray-400";

export default function AdminForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address"); return; }
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">PG</div>
          <span className="text-xl font-bold tracking-tight">BedWale.in Admin</span>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight mb-4">
          Forgot your<br />password?
        </h1>
        <p className="text-blue-200 text-base leading-relaxed max-w-sm">
          Enter your registered email and we&apos;ll send a 6-digit code to reset your password securely.
        </p>
        <div className="mt-10 space-y-3">
          {[
            { icon: "📧", t: "Enter your registered email" },
            { icon: "🔢", t: "Get a 6-digit code in your inbox" },
            { icon: "🔒", t: "Set a brand-new password" },
          ].map(({ icon, t }) => (
            <div key={t} className="flex items-center gap-3 text-sm text-blue-100">
              <span className="text-lg">{icon}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">PG</div>
            <span className="text-lg font-bold text-gray-800">BedWale.in Admin</span>
          </div>

          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h2>
              <p className="text-sm text-gray-500 mb-8">
                Enter the email address associated with your admin account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="admin@yourpg.com"
                    autoComplete="email"
                    className={INPUT}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending code…
                    </span>
                  ) : "Send Reset Code →"}
                </button>
              </form>
            </>
          ) : (
            /* ── Sent state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-2">We sent a 6-digit reset code to</p>
              <p className="font-semibold text-gray-800 mb-6">{email}</p>
              <Link
                href={`/admin/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Enter Reset Code →
              </Link>
              <p className="mt-4 text-xs text-gray-400">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => { setSent(false); }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/admin/login" className="text-blue-600 font-medium hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
