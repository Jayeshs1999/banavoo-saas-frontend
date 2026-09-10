"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/Button";

const passwordReqs = [
  { label: "8+ characters",       test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",           test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register, loading, error, clearError, currentUser, initializing } = useAuth();
  const router = useRouter();

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!initializing && currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, initializing, router]);

  const [form, setForm] = useState({
    fullName:        "",
    email:           "",
    phone:           "",
    password:        "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the per-field error as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      errs.fullName = "Full name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email address.";
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password))
      errs.password = "Password must meet all requirements below.";
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    const result = await register({
      fullName:        form.fullName.trim(),
      email:           form.email.trim(),
      phone:           form.phone.trim() || undefined,
      password:        form.password,
      confirmPassword: form.confirmPassword,
    });

    if (result.success && result.email) {
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
    }
  };

  const fields: Array<{
    label: string;
    name: keyof typeof form;
    type: string;
    placeholder: string;
    required?: boolean;
  }> = [
    { label: "Full Name",          name: "fullName",        type: "text",     placeholder: "Priya Sharma",    required: true },
    { label: "Email",              name: "email",           type: "email",    placeholder: "you@example.com", required: true },
    { label: "Phone (optional)",   name: "phone",           type: "tel",      placeholder: "+91 9876543210"                  },
    { label: "Password",           name: "password",        type: "password", placeholder: "••••••••",         required: true },
    { label: "Confirm Password",   name: "confirmPassword", type: "password", placeholder: "••••••••",         required: true },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create your Banavoo account</h1>
        <p className="text-muted-foreground text-sm mb-6">Start selling your handmade products today.</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {fields.map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input
                type={type}
                name={name}
                required={required}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  fieldErrors[name]
                    ? "border-red-400 focus:ring-red-300"
                    : "border-border"
                }`}
              />
              {fieldErrors[name] && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors[name]}</p>
              )}

              {/* Password requirements checker */}
              {name === "password" && form.password.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {passwordReqs.map((req) => (
                    <li key={req.label} className={`text-xs flex items-center gap-1 ${
                      req.test(form.password) ? "text-green-600" : "text-muted-foreground"
                    }`}>
                      <span>{req.test(form.password) ? "✓" : "○"}</span>
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
