"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import StateDropdown from "@/components/StateDropdown";
import { useAuth } from "../../context/AuthContext";

const addressSchema = z.object({
  area: z.string().min(1, "Area is required"),
  landmark: z.string().min(1, "Landmark / Set location is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  state: z.string().min(1, "State is required"),
});

const registerSchema = z
  .object({
    pgName: z.string().min(1, "PG Name is required"),
    ownerName: z.string().min(1, "Owner Name is required"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    email: z.string().email("Invalid email address"),
    address: addressSchema,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function AdminRegister() {
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const router = useRouter();
  const {
    registerAdmin,
    sendMobileOtp,
    verifyMobileOtp,
    sendEmailOtp,
    verifyEmailOtp,
  } = useAuth();

  // OTP state
  // const [mobileOtp, setMobileOtp] = useState("");
  // const [emailOtp, setEmailOtp] = useState("");
  // const [mobileOtpSent, setMobileOtpSent] = useState(false);
  // const [emailOtpSent, setEmailOtpSent] = useState(false);
  // const [verifiedForMobile, setVerifiedForMobile] = useState<string | null>(
  //   null,
  // );
  // const [verifiedForEmail, setVerifiedForEmail] = useState<string | null>(null);
  // const [otpError, setOtpError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const mobileVal = watch("mobile");
  const emailVal = watch("email");

  // Reset OTP state when mobile/email changes after verification
  // useEffect(() => {
  //   if (verifiedForMobile != null && mobileVal !== verifiedForMobile) {
  //     setVerifiedForMobile(null);
  //     setMobileOtpSent(false);
  //     setMobileOtp("");
  //   }
  // }, [mobileVal, verifiedForMobile]);

  // useEffect(() => {
  //   if (verifiedForEmail != null && emailVal !== verifiedForEmail) {
  //     setVerifiedForEmail(null);
  //     setEmailOtpSent(false);
  //     setEmailOtp("");
  //   }
  // }, [emailVal, verifiedForEmail]);

  // const mobileVerified =
  //   verifiedForMobile != null && mobileVal === verifiedForMobile;
  // const emailVerified =
  //   verifiedForEmail != null && emailVal === verifiedForEmail;

  // const handleSendMobileOtp = async () => {
  //   setOtpError("");
  //   const mob = watch("mobile");
  //   if (!mob || mob.length < 10) {
  //     setOtpError("Enter a valid 10-digit mobile number first");
  //     return;
  //   }
  //   await sendMobileOtp(mob);
  //   setMobileOtpSent(true);
  // };

  // const handleVerifyMobileOtp = async () => {
  //   setOtpError("");
  //   const mob = watch("mobile");
  //   const ok = await verifyMobileOtp(mob, mobileOtp);
  //   if (ok) {
  //     setVerifiedForMobile(mob);
  //   } else {
  //     setOtpError("Invalid OTP for mobile");
  //   }
  // };

  // const handleSendEmailOtp = async () => {
  //   setOtpError("");
  //   const em = watch("email");
  //   if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
  //     setOtpError("Enter a valid email first");
  //     return;
  //   }
  //   await sendEmailOtp(em);
  //   setEmailOtpSent(true);
  // };

  // const handleVerifyEmailOtp = async () => {
  //   setOtpError("");
  //   const em = watch("email");
  //   const ok = await verifyEmailOtp(em, emailOtp);
  //   if (ok) {
  //     setVerifiedForEmail(em);
  //   } else {
  //     setOtpError("Invalid OTP for email");
  //   }
  // };

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      const success = await registerAdmin({
        pgName: data.pgName,
        ownerName: data.ownerName,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
        password: data.password,
        role: "admin",
      });
      if (success) {
        router.push("/admin/dashboard");
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-[url('../public/bg-pg.jpg')] bg-cover bg-center overflow-x-hidden">
      <div className="absolute inset-0 bg-black opacity-40" aria-hidden></div>
      <div className="w-full container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col justify-center items-center relative z-10 min-h-screen">
        <div className="w-full max-w-lg">
          <Card className="bg-background w-full min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Register PG</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="pgName"
                    className="block text-sm font-medium mb-1"
                  >
                    PG Name
                  </label>
                  <input
                    {...register("pgName")}
                    type="text"
                    id="pgName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.pgName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pgName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="ownerName"
                    className="block text-sm font-medium mb-1"
                  >
                    Owner Name
                  </label>
                  <input
                    {...register("ownerName")}
                    type="text"
                    id="ownerName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.ownerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ownerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium mb-1"
                  >
                    Mobile Number
                  </label>
                  <input
                    {...register("mobile")}
                    type="tel"
                    id="mobile"
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

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

                {/* Structured Address */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Address</label>
                  <div>
                    <input
                      {...register("address.area")}
                      type="text"
                      placeholder="Area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address?.area && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.area.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("address.landmark")}
                      type="text"
                      placeholder="Landmark / Set location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address?.landmark && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.landmark.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        {...register("address.city")}
                        type="text"
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.address?.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("address.pincode")}
                        type="text"
                        placeholder="Pincode (6 digits)"
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.address?.pincode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <StateDropdown
                      value={selectedState}
                      onChange={(value) => {
                        setSelectedState(value);
                        // Also update the form state using setValue
                        setValue("address.state", value);
                      }}
                      placeholder="Select a state"
                      required
                    />
                    {errors.address?.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.state.message}
                      </p>
                    )}
                  </div>
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Register
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/admin/login"
                  className="text-blue-500 hover:underline"
                >
                  Already have an account? Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
