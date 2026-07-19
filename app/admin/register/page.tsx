"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import StateDropdown from "@/components/StateDropdown";
import { useAuth } from "../../context/AuthContext";

/* ── Schema ─────────────────────────────────────────────────────────────── */
const registerSchema = z
  .object({
    pgName:    z.string().min(1, "PG name is required"),
    ownerName: z.string().min(1, "Owner name is required"),
    mobile:    z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    email:     z.string().email("Enter a valid email address"),
    address: z.object({
      area:     z.string().min(1, "Area / locality is required"),
      landmark: z.string().min(1, "Landmark is required"),
      city:     z.string().min(1, "City is required"),
      pincode:  z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
      state:    z.string().min(1, "State is required"),
    }),
    password:        z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

/* ── Step definitions ───────────────────────────────────────────────────── */
const STEPS = ["PG Details", "Your Address", "Set Password"];

/* ── Shared input style ─────────────────────────────────────────────────── */
const INPUT =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-gray-400";

/* ── Small field wrapper ─────────────────────────────────────────────────── */
function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ── Step indicator ──────────────────────────────────────────────────────── */
function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < step  ? "bg-blue-600 border-blue-600 text-white"
            : i === step ? "bg-white border-blue-600 text-blue-600"
            :              "bg-white border-gray-300 text-gray-400"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? "text-blue-600" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-10 sm:w-16 mx-1 mb-5 transition-colors ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function AdminRegister() {
  const router = useRouter();
  const { registerAdmin, loading, error: authError, clearError } = useAuth();

  const [step,         setStep]         = useState(0);
  const [selectedState,setSelectedState]= useState("");
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [submitError,  setSubmitError]  = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  /* ── Step navigation ── */
  const STEP_FIELDS = [
    ["pgName", "ownerName", "mobile", "email"] as const,
    ["address"] as const,
    ["password", "confirmPassword"] as const,
  ];

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step] as Parameters<typeof trigger>[0]);
    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  /* ── Submit ── */
  const onSubmit = async (data: RegisterForm) => {
    clearError();
    setSubmitError("");
    try {
      const success = await registerAdmin({
        pgName:    data.pgName,
        ownerName: data.ownerName,
        mobile:    data.mobile,
        email:     data.email,
        address:   data.address,
        password:  data.password,
        role: "admin",
      });
      if (success) {
        router.push("/admin/dashboard");
      } else {
        setSubmitError("Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      setSubmitError((err as Error).message || "Registration failed");
    }
  };

  const displayError = submitError || authError || "";

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">PG</div>
            <span className="text-xl font-bold tracking-tight">BedWale.in Admin</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            List your PG.<br />Reach more tenants.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Join hundreds of PG owners who manage their properties, bookings and payments from a single dashboard.
          </p>
        </div>

        {/* Steps summary */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide">How it works</p>
          {[
            { n: "1", t: "Fill your PG & contact details" },
            { n: "2", t: "Enter your PG's address" },
            { n: "3", t: "Set a secure password" },
          ].map(({ n, t }) => (
            <div key={n} className="flex items-center gap-3 text-sm text-blue-100">
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
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">PG</div>
            <span className="text-lg font-bold text-gray-800">BedWale.in Admin</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your admin account</h2>
          <p className="text-sm text-gray-500 mb-6">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

          <Stepper step={step} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── Step 0: PG + Contact ── */}
            {step === 0 && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-2">
                  Tell us about your PG and how to contact you.
                </div>

                <F label="PG Name" error={errors.pgName?.message}>
                  <input {...register("pgName")} type="text" placeholder="e.g. Sunshine PG" className={INPUT} />
                </F>

                <F label="Owner / Manager Name" error={errors.ownerName?.message}>
                  <input {...register("ownerName")} type="text" placeholder="Your full name" className={INPUT} />
                </F>

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

                <F label="Email Address" error={errors.email?.message}>
                  <input {...register("email")} type="email" placeholder="you@yourpg.com" className={INPUT} />
                </F>
              </>
            )}

            {/* ── Step 1: Address ── */}
            {step === 1 && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-2">
                  Where is your PG located? Tenants use this to find you.
                </div>

                <F label="Area / Locality" error={errors.address?.area?.message}>
                  <input
                    {...register("address.area")}
                    type="text"
                    placeholder="e.g. Koregaon Park"
                    className={INPUT}
                  />
                </F>

                <F label="Landmark" error={errors.address?.landmark?.message}>
                  <input
                    {...register("address.landmark")}
                    type="text"
                    placeholder="e.g. Near D-Mart"
                    className={INPUT}
                  />
                </F>

                <div className="grid grid-cols-2 gap-3">
                  <F label="City" error={errors.address?.city?.message}>
                    <input {...register("address.city")} type="text" placeholder="Pune" className={INPUT} />
                  </F>
                  <F label="Pincode" error={errors.address?.pincode?.message}>
                    <input
                      {...register("address.pincode")}
                      type="text"
                      maxLength={6}
                      placeholder="411001"
                      className={INPUT}
                    />
                  </F>
                </div>

                <F label="State" error={errors.address?.state?.message}>
                  <StateDropdown
                    value={selectedState}
                    onChange={(val) => {
                      setSelectedState(val);
                      setValue("address.state", val, { shouldValidate: true });
                    }}
                    placeholder="Select your state"
                    required
                  />
                </F>
              </>
            )}

            {/* ── Step 2: Password ── */}
            {step === 2 && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-2">
                  Choose a strong password to keep your account safe.
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
                      placeholder="Re-enter password"
                      className={`${INPUT} pr-14`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </F>

                {/* Terms note */}
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By creating an account you agree to our{" "}
                  <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>.
                </p>
              </>
            )}

            {/* ── Error ── */}
            {displayError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* ── Navigation buttons ── */}
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : "Create Account"}
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already registered?{" "}
            <Link href="/admin/login" className="text-blue-600 font-medium hover:underline">
              Sign in →
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Looking for a PG?{" "}
            <Link href="/user/register" className="text-blue-500 hover:underline">Register as tenant</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
