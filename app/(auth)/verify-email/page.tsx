"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/Button";
import { authAPI } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";

const RESEND_COOLDOWN = 30;

function VerifyEmailForm() {
  const { setCurrentUser } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") || "";

  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState<string | null>(null);
  const [cooldown,    setCooldown]    = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.verifyEmail(email, otp);
      if (res.success && res.data) {
        setCurrentUser(res.data);
        router.push("/dashboard");
      } else {
        setError(res.message || "Verification failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setResending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authAPI.resendOtp(email);
      if (res.success) {
        setSuccess("A new verification code has been sent.");
        setCooldown(RESEND_COOLDOWN);
      } else {
        setError(res.message || "Could not resend code.");
      }
    } catch (err: unknown) {
      const apiErr = err as Error & { code?: string };
      if (apiErr.code === "RESEND_COOLDOWN") {
        setError(apiErr.message);
      } else {
        setError(apiErr.message || "Could not resend code.");
      }
    } finally {
      setResending(false);
    }
  }, [email]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">No email address provided.</p>
          <Link href="/register" className="text-primary font-medium hover:underline text-sm">
            Go to registration
          </Link>
        </div>
      </div>
    );
  }

  // OTP input — one digit per box visual
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Verify your email</h1>
        <p className="text-muted-foreground text-sm mb-6">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4">
            {success}
          </p>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Verification Code
            </label>
            {/* Single wide input styled as a code field */}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              className="w-full border border-border rounded-lg px-4 py-3 text-2xl font-bold text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Verify Email
          </Button>
        </form>

        <div className="mt-6 text-center space-y-1">
          <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={resending}
            disabled={cooldown > 0 || resending}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Wrong email?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
