"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { userAPI } from "../../../services/api";
import Spinner from "@/components/Spinner";

const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors placeholder:text-gray-400";

/* ── 6-box OTP input ── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    const key = e.key;
    if (key === "Backspace") {
      e.preventDefault();
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next.padEnd(Math.max(0, value.length - 1), ""));
      const prev = document.getElementById(`urp-otp-${idx - 1}`) as HTMLInputElement | null;
      if (idx > 0 && prev) prev.focus();
    } else if (/^\d$/.test(key)) {
      e.preventDefault();
      const arr = value.padEnd(6, " ").split("");
      arr[idx] = key;
      onChange(arr.join("").replace(/ /g, "").slice(0, 6));
      if (idx < 5) {
        const next = document.getElementById(`urp-otp-${idx + 1}`) as HTMLInputElement | null;
        if (next) next.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const el = document.getElementById(`urp-otp-${Math.min(pasted.length, 5)}`) as HTMLInputElement | null;
    if (el) el.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`urp-otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          readOnly
          onKeyDown={(e) => handleKey(e, i)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl transition-colors outline-none
            ${d.trim() ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300 bg-white"}
            focus:border-green-500 focus:ring-2 focus:ring-green-200`}
        />
      ))}
    </div>
  );
}

/* ── Password strength indicator ── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  const textColors = ["", "text-red-600", "text-yellow-600", "text-blue-600", "text-green-600"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score]}`}>{levels[score]}</p>
    </div>
  );
}

/* ── Steps: 0 = enter OTP, 1 = new password, 2 = done ── */
function ResetPasswordForm() {
  const router    = useRouter();
  const params    = useSearchParams();
  const emailParam = params.get("email") || "";

  const [step,       setStep]       = useState(0);
  const [email,      setEmail]      = useState(emailParam);
  const [otp,        setOtp]        = useState("");
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [resendCool, setResendCool] = useState(0);

  const startCooldown = () => {
    setResendCool(60);
    const id = setInterval(() => {
      setResendCool(p => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      await userAPI.forgotPassword(email);
      startCooldown();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  /* Step 0 → verify OTP */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError("Please enter the 6-digit code"); return; }
    setError("");
    // We validate OTP implicitly when we reset — move to password step
    setStep(1);
  };

  /* Step 1 → reset password */
  const handleReset = async () => {
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setError("");
    setLoading(true);
    try {
      await userAPI.resetPassword(email, otp, password);
      setStep(2);
    } catch (err: unknown) {
      setError((err as Error).message || "Reset failed. Please try again.");
      setStep(0); // send them back to re-enter OTP
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-center bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-10 text-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">🏠</div>
          <span className="text-xl font-bold tracking-tight">BedWale.in</span>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight mb-4">Create a new<br />password</h1>
        <p className="text-green-100 text-base leading-relaxed max-w-sm">
          Enter the code from your email and choose a strong new password for your account.
        </p>
        {/* step bubbles */}
        <div className="mt-10 flex items-center gap-3">
          {["Code", "Password", "Done"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors
                ${i < step ? "bg-white text-green-700" : i === step ? "bg-white/30 text-white border-2 border-white" : "bg-white/10 text-white/50"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "text-white font-semibold" : "text-white/60"}`}>{label}</span>
              {i < 2 && <span className="text-white/30 mx-1">›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-lg">🏠</div>
            <span className="text-lg font-bold text-gray-800">BedWale.in</span>
          </div>

          {/* ── Step 0: Enter OTP ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter reset code</h2>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to <strong className="text-gray-700">{email || "your email"}</strong>
                </p>
              </div>

              {/* Email field if not pre-filled */}
              {!emailParam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={INPUT}
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 text-center mb-4">6-digit verification code</p>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  <span className="flex-shrink-0">⚠️</span><span>{error}</span>
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 6}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Continue →
              </button>

              <div className="text-center text-sm">
                {resendCool > 0 ? (
                  <p className="text-gray-400">Resend code in {resendCool}s</p>
                ) : (
                  <button onClick={handleResend} disabled={loading}
                    className="text-green-600 hover:underline font-medium disabled:opacity-50">
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 1: New password ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Set new password</h2>
                <p className="text-sm text-gray-500">Choose a strong password for your account.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Min. 6 characters"
                    className={`${INPUT} pr-14`}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    placeholder="Re-enter your password"
                    className={`${INPUT} pr-14`}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                    {showConf ? "Hide" : "Show"}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-500 text-xs mt-1">Passwords don&apos;t match</p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  <span className="flex-shrink-0">⚠️</span><span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  ← Back
                </button>
                <button onClick={handleReset} disabled={loading || password.length < 6 || password !== confirm}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" variant="white" />
                      Resetting…
                    </span>
                  ) : "Reset Password →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Success ── */}
          {step === 2 && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Password reset!</h2>
              <p className="text-gray-500 text-sm">Your password has been updated successfully. You can now sign in with your new password.</p>
              <button
                onClick={() => router.push("/user/login")}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Go to Sign In →
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            Remembered it?{" "}
            <Link href="/user/login" className="text-green-600 font-medium hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
