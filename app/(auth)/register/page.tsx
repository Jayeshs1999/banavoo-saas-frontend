"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/Button";

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await register(form);
    if (ok) router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Create account</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Join today. It&apos;s free.
        </p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { label: "First name", name: "firstName", type: "text", placeholder: "John" },
              { label: "Last name", name: "lastName", type: "text", placeholder: "Doe" },
              { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
              { label: "Mobile (optional)", name: "mobile", type: "tel", placeholder: "+91 XXXXXXXXXX" },
              { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
            ] as const
          ).map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input
                type={type}
                name={name}
                required={name !== "mobile"}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            Create account
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
