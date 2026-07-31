"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../../services/api";

const profileSchema = z.object({
  pgName:    z.string().min(1, "PG Name is required"),
  ownerName: z.string().min(1, "Owner Name is required"),
  mobile:    z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.object({
    area:     z.string().min(1, "Area is required"),
    landmark: z.string().min(1, "Landmark is required"),
    city:     z.string().min(1, "City is required"),
    pincode:  z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    state:    z.string().min(1, "State is required"),
  }),
});

type ProfileForm = z.infer<typeof profileSchema>;

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

export default function AdminProfile() {
  const router = useRouter();
  const { currentAdmin, updateCurrentAdmin } = useAuth();
  const [isEditing,     setIsEditing]     = useState(false);
  const [isUpdating,    setIsUpdating]    = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  /* Populate form whenever currentAdmin loads or editing starts */
  useEffect(() => {
    if (currentAdmin) {
      reset({
        pgName:    currentAdmin.pgName    || "",
        ownerName: currentAdmin.ownerName || "",
        mobile:    currentAdmin.mobile    || "",
        address: {
          area:     currentAdmin.address?.area     || "",
          landmark: currentAdmin.address?.landmark || "",
          city:     currentAdmin.address?.city     || "",
          pincode:  currentAdmin.address?.pincode  || "",
          state:    currentAdmin.address?.state    || "",
        },
      });
    }
  }, [currentAdmin, reset]);

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateMessage(null);
    // Reset form back to stored values
    if (currentAdmin) {
      reset({
        pgName:    currentAdmin.pgName    || "",
        ownerName: currentAdmin.ownerName || "",
        mobile:    currentAdmin.mobile    || "",
        address: {
          area:     currentAdmin.address?.area     || "",
          landmark: currentAdmin.address?.landmark || "",
          city:     currentAdmin.address?.city     || "",
          pincode:  currentAdmin.address?.pincode  || "",
          state:    currentAdmin.address?.state    || "",
        },
      });
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      await authAPI.updateAdminProfile({
        pgName:    data.pgName,
        ownerName: data.ownerName,
        mobile:    data.mobile,
        address:   data.address,
      });

      updateCurrentAdmin({
        pgName:    data.pgName,
        ownerName: data.ownerName,
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

  if (!currentAdmin) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  const addr = currentAdmin.address;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={() => router.back()}>← Back</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>PG Information</CardTitle>
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

              {/* PG Name */}
              <div>
                <label htmlFor="pgName" className="block text-sm font-medium mb-1">PG Name</label>
                <input {...register("pgName")} type="text" id="pgName" className={INPUT} />
                {errors.pgName && <p className="text-red-500 text-xs mt-1">{errors.pgName.message}</p>}
              </div>

              {/* Owner Name */}
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium mb-1">Owner Name</label>
                <input {...register("ownerName")} type="text" id="ownerName" className={INPUT} />
                {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile Number</label>
                <input {...register("mobile")} type="tel" id="mobile" maxLength={10} className={INPUT} />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>

              {/* Email — read-only */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-xs text-gray-400 font-normal ml-1">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={currentAdmin.email}
                  disabled
                  className={INPUT}
                />
              </div>

              {/* Address */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Address</label>
                <div>
                  <input {...register("address.area")} type="text" placeholder="Area / Locality" className={INPUT} />
                  {errors.address?.area && <p className="text-red-500 text-xs mt-1">{errors.address.area.message}</p>}
                </div>
                <div>
                  <input {...register("address.landmark")} type="text" placeholder="Landmark" className={INPUT} />
                  {errors.address?.landmark && <p className="text-red-500 text-xs mt-1">{errors.address.landmark.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input {...register("address.city")} type="text" placeholder="City" className={INPUT} />
                    {errors.address?.city && <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>}
                  </div>
                  <div>
                    <input {...register("address.pincode")} type="text" placeholder="Pincode" maxLength={6} className={INPUT} />
                    {errors.address?.pincode && <p className="text-red-500 text-xs mt-1">{errors.address.pincode.message}</p>}
                  </div>
                </div>
                <div>
                  <input {...register("address.state")} type="text" placeholder="State" className={INPUT} />
                  {errors.address?.state && <p className="text-red-500 text-xs mt-1">{errors.address.state.message}</p>}
                </div>
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              {[
                { label: "PG Name",      value: currentAdmin.pgName },
                { label: "Owner Name",   value: currentAdmin.ownerName },
                { label: "Mobile",       value: currentAdmin.mobile },
                { label: "Email",        value: currentAdmin.email },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-gray-900">{value || "—"}</p>
                </div>
              ))}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Address</p>
                <p className="text-gray-900">
                  {addr
                    ? `${addr.area || ""}, ${addr.landmark || ""}, ${addr.city || ""} - ${addr.pincode || ""}, ${addr.state || ""}`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
