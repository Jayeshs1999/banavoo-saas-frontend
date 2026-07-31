"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../../services/api";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  mobile:    z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address:   z.string().min(1, "Address is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

export default function UserProfile() {
  const router = useRouter();
  const { currentUser, updateCurrentUser } = useAuth();
  const [isEditing,     setIsEditing]     = useState(false);
  const [isUpdating,    setIsUpdating]    = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  /* Populate form whenever currentUser loads or editing starts */
  useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.firstName || "",
        lastName:  currentUser.lastName  || "",
        mobile:    currentUser.mobile    || "",
        address:   currentUser.address   || "",
      });
    }
  }, [currentUser, reset]);

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateMessage(null);
    if (currentUser) {
      reset({
        firstName: currentUser.firstName || "",
        lastName:  currentUser.lastName  || "",
        mobile:    currentUser.mobile    || "",
        address:   currentUser.address   || "",
      });
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      await userAPI.updateUserProfile({
        firstName: data.firstName,
        lastName:  data.lastName,
        mobile:    data.mobile,
        address:   data.address,
      });

      updateCurrentUser({
        firstName: data.firstName,
        lastName:  data.lastName,
        mobile:    data.mobile,
        address:   data.address,
      });

      setUpdateMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error: any) {
      setUpdateMessage({ type: "error", text: error.message || "Failed to update profile. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={() => router.back()}>← Back</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal Information</CardTitle>
            <Button onClick={isEditing ? handleCancel : () => setIsEditing(true)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>

        {updateMessage && (
          <div className={`mx-6 mb-2 px-4 py-3 rounded-md text-sm ${
            updateMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            {updateMessage.text}
          </div>
        )}

        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                <input {...register("firstName")} type="text" id="firstName" className={INPUT} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                <input {...register("lastName")} type="text" id="lastName" className={INPUT} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>

              {/* Email — read-only */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-xs text-gray-400 font-normal ml-1">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className={INPUT}
                />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile Number</label>
                <input {...register("mobile")} type="tel" id="mobile" maxLength={10} className={INPUT} />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  {...register("address")}
                  id="address"
                  rows={3}
                  className={INPUT}
                  placeholder="Your current address"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              {[
                { label: "First Name", value: currentUser.firstName },
                { label: "Last Name",  value: currentUser.lastName  },
                { label: "Email",      value: currentUser.email     },
                { label: "Mobile",     value: currentUser.mobile    },
                { label: "Address",    value: currentUser.address   },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-gray-900">{value || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
