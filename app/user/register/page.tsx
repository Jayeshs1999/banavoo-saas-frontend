"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import StateDropdown from "@/components/StateDropdown";
import Spinner from "@/components/Spinner";
import { useAuth } from "../../context/AuthContext";
import { Mail, CheckCircle, ShieldCheck } from "lucide-react";

/* ── Schema ── */
const registerSchema = z
  .object({
    firstName:       z.string().min(1, "First name is required"),
    lastName:        z.string().min(1, "Last name is required"),
    email:           z.string().email("Enter a valid email address"),
    mobile:          z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    area:            z.string().min(1, "Area / flat no. is required"),
    landmark:        z.string().min(1, "Landmark is required"),
    city:            z.string().min(1, "City is required"),
    pincode:         z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
    state:           z.string().min(1, "State is required"),
    password:        z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

/* ── Steps ── */
const STEPS = ["Your Details", "Set Password"];

/* ── Shared styles ── */
const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors placeholder:text-gray-400";

/* ── Field wrapper ── */
function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ── Stepper ── */
function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < step    ? "bg-green-600 border-green-600 text-white"
            : i === step  ? "bg-white border-green-600 text-green-600"
            :               "bg-white border-gray-300 text-gray-400"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? "text-green-600" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-5 transition-colors ${i < step ? "bg-green-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── OTP input ── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        refs[i - 1].current?.focus();
        onChange(value.slice(0, i - 1) + value.slice(i));
      }
    }
  };

  const handleChange = (i: number, ch: string) => {
    const digit = ch.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = value.slice(0, i) + digit + value.slice(i + 1);
    onChange(next);
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); refs[Math.min(pasted.length, 5)].current?.focus(); }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-10 h-11 text-center text-lg font-bold border-2 rounded-xl focus:outline-none transition-colors bg-white text-gray-900 ${
            value[i] ? "border-green-500" : "border-gray-200"
          } focus:border-green-500`}
        />
      ))}
    </div>
  );
}

/* ── Main ── */
export default function UserRegister() {
  const router = useRouter();
  const {
    registerUser,
    sendUserPreRegOtp,
    verifyUserPreRegOtp,
    loading,
    error: authError,
    clearError,
  } = useAuth();

  const [step,          setStep]          = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [showPw,        setShowPw]        = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [submitError,   setSubmitError]   = useState("");

  // Email OTP state
  const [emailVerified,  setEmailVerified]  = useState(false);
  const [otpSent,        setOtpSent]        = useState(false);
  const [otpSending,     setOtpSending]     = useState(false);
  const [otp,            setOtp]            = useState("");
  const [otpError,       setOtpError]       = useState("");
  const [otpVerifying,   setOtpVerifying]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register, handleSubmit, setValue, trigger, watch,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const emailValue = watch("email") || "";

  /* ── Step field groups ── */
  const STEP_FIELDS = [
    ["firstName", "lastName", "email", "mobile", "area", "landmark", "city", "pincode", "state"] as const,
    ["password", "confirmPassword"] as const,
  ];

  /* ── Resend cooldown ── */
  const startCooldown = () => {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((c) => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; });
    }, 1000);
  };

  /* ── Send OTP ── */
  const handleSendOtp = async () => {
    const valid = await trigger("email");
    if (!valid) return;

    setOtpError("");
    setOtp("");
    setOtpSending(true);
    clearError();
    await sendUserPreRegOtp(emailValue);
    setOtpSending(false);

    if (!authError) {
      setOtpSent(true);
      startCooldown();
    } else {
      setOtpError(authError || "Failed to send OTP");
    }
  };

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError("Enter the 6-digit code"); return; }
    setOtpError("");
    setOtpVerifying(true);
    const ok = await verifyUserPreRegOtp(emailValue, otp);
    setOtpVerifying(false);
    if (ok) {
      setEmailVerified(true);
      setOtpSent(false);
    } else {
      setOtpError(authError || "Invalid or expired OTP. Try again.");
    }
  };

  /* ── Step navigation ── */
  const goNext = async () => {
    if (step === 0 && !emailVerified) {
      setOtpError("Please verify your email before continuing.");
      return;
    }
    const valid = await trigger(STEP_FIELDS[step] as Parameters<typeof trigger>[0]);
    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  /* ── Final submit ── */
  const onSubmit = async (data: RegisterForm) => {
    if (!emailVerified) { setSubmitError("Email verification required."); return; }
    clearError();
    setSubmitError("");
    try {
      const address = `${data.area}, ${data.landmark}, ${data.city} - ${data.pincode}, ${data.state}`;
      const success = await registerUser({
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        mobile:    data.mobile,
        address,
        password:  data.password,
        role:      "user",
      });
      if (success) {
        router.push("/user/dashboard");
      } else {
        setSubmitError("Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Registration failed");
    }
  };

  const displayError = submitError || "";

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-10 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">🏠</div>
            <span className="text-xl font-bold tracking-tight">BedWale.in</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Find a PG that<br />feels like home
          </h1>
          <p className="text-green-100 text-base leading-relaxed max-w-sm">
            Create your free account and start browsing hundreds of verified PGs in your city — with real photos, pricing and instant booking.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-green-200 uppercase tracking-wide">How it works</p>
          {[
            { n: "1", t: "Enter your details & verify your email" },
            { n: "2", t: "Set a secure password & you're in" },
          ].map(({ n, t }) => (
            <div key={n} className="flex items-center gap-3 text-sm text-green-100">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">{n}</div>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-lg">🏠</div>
            <span className="text-lg font-bold text-gray-800">BedWale.in</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

          <Stepper step={step} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── Step 0: Personal details + email verify ── */}
            {step === 0 && (
              <>
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-800 mb-2">
                  Tell us who you are. You must verify your email before proceeding.
                </div>

                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <F label="First Name" error={errors.firstName?.message}>
                    <input {...register("firstName")} type="text" placeholder="Rahul" className={INPUT} />
                  </F>
                  <F label="Last Name" error={errors.lastName?.message}>
                    <input {...register("lastName")} type="text" placeholder="Sharma" className={INPUT} />
                  </F>
                </div>

                <F label="Mobile Number" error={errors.mobile?.message}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">+91</span>
                    <input
                      {...register("mobile")}
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      className={`${INPUT} pl-12`}
                    />
                  </div>
                </F>

                {/* ── Email + inline OTP verify ── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>

                  {emailVerified ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 border border-green-300 bg-green-50 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-green-700 font-medium">{emailValue}</span>
                      <span className="ml-auto text-xs text-green-600 font-semibold">Verified ✓</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={otpSent}
                        className={`${INPUT} flex-1 disabled:bg-gray-50 disabled:text-gray-500`}
                      />
                      <button
                        type="button"
                        onClick={otpSent ? undefined : handleSendOtp}
                        disabled={otpSending || otpSent}
                        className="shrink-0 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        {otpSending ? <Spinner size="sm" variant="white" /> : "Send OTP"}
                      </button>
                    </div>
                  )}
                  {errors.email && !emailVerified && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}

                  {/* OTP entry panel */}
                  {otpSent && !emailVerified && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-100 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>Enter the 6-digit code sent to <strong>{emailValue}</strong></span>
                      </div>

                      <OtpInput value={otp} onChange={setOtp} />

                      {otpError && <p className="text-red-600 text-xs text-center">⚠️ {otpError}</p>}

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otp.length !== 6}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {otpVerifying
                          ? <><Spinner size="sm" variant="white" /> Verifying…</>
                          : <><CheckCircle size={14} /> Confirm Code</>
                        }
                      </button>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(""); setOtpError(""); }}
                          className="hover:underline text-gray-400"
                        >
                          ← Change email
                        </button>
                        {resendCooldown > 0 ? (
                          <span className="text-gray-400">Resend in {resendCooldown}s</span>
                        ) : (
                          <button type="button" onClick={handleSendOtp} disabled={otpSending}
                            className="text-green-600 font-medium hover:underline disabled:opacity-60">
                            {otpSending ? "Sending…" : "Resend code"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nudge if Next is clicked without verifying */}
                  {otpError === "Please verify your email before continuing." && (
                    <p className="text-red-600 text-xs mt-1">⚠️ {otpError}</p>
                  )}
                </div>

                {/* Address section */}
                <div className="pt-1">
                  <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                    <span>📍</span> Current Address
                  </p>
                  <div className="space-y-4">
                    <F label="Flat / House No. / Area" error={errors.area?.message}>
                      <input {...register("area")} type="text" placeholder="e.g. 3B, Sunrise Apartments" className={INPUT} />
                    </F>

                    <F label="Landmark" error={errors.landmark?.message}>
                      <input {...register("landmark")} type="text" placeholder="e.g. Near City Mall" className={INPUT} />
                    </F>

                    <div className="grid grid-cols-2 gap-3">
                      <F label="City" error={errors.city?.message}>
                        <input {...register("city")} type="text" placeholder="Pune" className={INPUT} />
                      </F>
                      <F label="Pincode" error={errors.pincode?.message}>
                        <input {...register("pincode")} type="text" maxLength={6} placeholder="411001" className={INPUT} />
                      </F>
                    </div>

                    <F label="State" error={errors.state?.message}>
                      <StateDropdown
                        value={selectedState}
                        onChange={(val) => {
                          setSelectedState(val);
                          setValue("state", val, { shouldValidate: true });
                        }}
                        placeholder="Select your state"
                        required
                      />
                    </F>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Password ── */}
            {step === 1 && (
              <>
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-800 mb-2">
                  Choose a strong password to keep your account secure.
                </div>

                <F label="Password" error={errors.password?.message}>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className={`${INPUT} pr-14`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </F>

                <F label="Confirm Password" error={errors.confirmPassword?.message}>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className={`${INPUT} pr-14`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </F>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By creating an account you agree to our{" "}
                  <span className="text-green-600 cursor-pointer hover:underline">Terms of Service</span>.
                </p>
              </>
            )}

            {/* Error banner */}
            {displayError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex gap-3 pt-1 ${step > 0 ? "justify-between" : "justify-end"}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  ← Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" variant="white" />
                      Creating account…
                    </span>
                  ) : "Create Account"}
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/user/login" className="text-green-600 font-medium hover:underline">
              Sign in →
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Are you a PG owner?{" "}
            <Link href="/admin/register" className="text-blue-500 hover:underline">Register as admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
