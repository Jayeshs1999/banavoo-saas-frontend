"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "@/app/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function UserLogin() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { loginUser, currentUser, currentAdmin, logout } = useAuth();

  // Auto-logout if admin is logged in (not user)
  useEffect(() => {
    if (currentAdmin) {
      logout();
    }
  }, [currentAdmin, logout]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    if (loginUser(data.email, data.password)) {
      router.push("/user/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleSwitchAccount = () => {
    logout();
    setError("");
  };

  return (
    <div className="relative min-h-screen bg-[url('../public/bg-pg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>User Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    Password
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    id="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <Link
                  href="/user/register"
                  className="text-blue-500 hover:underline"
                >
                  Register as User
                </Link>
                <br />
                <Link
                  href="/user/forgot-password"
                  className="text-blue-500 hover:underline"
                >
                  Forgot Password?
                </Link>
                <br />
                <button className="text-blue-500 hover:underline">
                  Login with Google
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
