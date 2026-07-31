"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/components/Spinner";

const loginSchema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-gray-400";

export default function AdminLogin() {
  const router = useRouter();
  const { loginAdmin, currentUser, logout, error: authError, loading, clearError } = useAuth();
  const [showPw, setShowPw] = useState(false);

  useEffect(() => { if (currentUser) logout(); }, [currentUser, logout]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    const ok = await loginAdmin(data.email, data.password);
    if (ok) router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between bg-gradient-to-br bg-primary p-10 text-white">
        <div>
          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
              PG
            </div>
            <span className="text-xl font-bold tracking-tight">BedWale.in Admin</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Manage your PG<br />from one place
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            View bookings, manage rooms, track occupancy and communicate with tenants — all in your dashboard.
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-3 text-sm text-blue-100">
          {[
            "📋  Manage rooms & bed availability",
            "📩  Receive & approve booking requests",
            "💳  Accept online payments via Razorpay",
            "📍  Show PG location on map",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">{f}</li>
          ))}
        </ul>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">PG</div>
            <span className="text-lg font-bold text-gray-800">PG/Dormitory Owner Login</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-8">Enter your registered email and password below</p>

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
                placeholder="admin@yourpg.com"
                autoComplete="email"
                className={INPUT}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/admin/forgot-password" className="text-xs text-blue-600 hover:underline">
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
              className="w-full py-2.5 bg-primary disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" variant="white" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            New PG owner?{" "}
            <Link href="/admin/register" className="text-primary font-medium hover:underline">
              Register your PG →
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Looking for a PG?{" "}
            <Link href="/user/login" className="text-blue-500 hover:underline">User login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
