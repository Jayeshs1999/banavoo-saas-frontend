"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/Button";

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await login(email, password);
    if (ok) router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Welcome back! Enter your credentials to continue.
        </p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
