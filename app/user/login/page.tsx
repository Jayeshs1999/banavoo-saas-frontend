"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/components/Spinner";

/* ── Schema ── */
const loginSchema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors placeholder:text-gray-400";

export default function UserLogin() {
  const router = useRouter();
  const { loginUser, currentUser, currentAdmin, logout, error: authError, loading, clearError } = useAuth();
  const [showPw, setShowPw] = useState(false);

  // Auto-logout conflicting session
  useEffect(() => { if (currentAdmin) logout(); }, [currentAdmin, logout]);
  // Redirect if already logged in
  useEffect(() => { if (currentUser) router.push("/user/dashboard"); }, [currentUser, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    const ok = await loginUser(data.email, data.password);
    if (ok) router.push("/user/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-10 text-white">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
              🏠
            </div>
            <span className="text-xl font-bold tracking-tight">BedWale.in</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Find your perfect<br />PG today
          </h1>
          <p className="text-green-100 text-base leading-relaxed max-w-sm">
            Browse verified PGs with real photos, accurate pricing and instant booking — no broker fees.
          </p>
        </div>

        {/* Benefit list */}
        <ul className="space-y-3 text-sm text-green-100">
          {[
            "🔍  Search PGs by city, area & budget",
            "📸  View real photos before visiting",
            "💳  Book instantly with online payment",
            "📍  See exact location on map",
          ].map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-lg">🏠</div>
            <span className="text-lg font-bold text-gray-800">User Login</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back!</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to browse and book PGs near you</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={INPUT}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/user/forgot-password" className="text-xs text-green-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={`${INPUT} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Server error */}
            {authError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" variant="white" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Footer links */}
          <p className="mt-6 text-center text-sm text-gray-500">
            New here?{" "}
            <Link href="/user/register" className="text-green-600 font-medium hover:underline">
              Create a free account →
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Are you a PG owner?{" "}
            <Link href="/admin/login" className="text-blue-500 hover:underline">Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
