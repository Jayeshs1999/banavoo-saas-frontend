'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { useAuth } from '../../context/AuthContext';

const addressSchema = z.object({
  area: z.string().min(1, 'Area is required'),
  landmark: z.string().min(1, 'Landmark / Set location is required'),
  city: z.string().min(1, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  state: z.string().min(1, 'State is required'),
});

const profileSchema = z.object({
  pgName: z.string().min(1, 'PG Name is required'),
  ownerName: z.string().min(1, 'Owner Name is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  address: addressSchema,
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function AdminProfile() {
  const router = useRouter();
  const { currentAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentAdmin ? {
      pgName: currentAdmin.pgName,
      ownerName: currentAdmin.ownerName,
      mobile: currentAdmin.mobile,
      email: currentAdmin.email,
      address: currentAdmin.address,
    } : {},
  });

  const onSubmit = (data: ProfileForm) => {
    // In real app, update profile
    console.log('Updated profile:', data);
    setIsEditing(false);
  };

  if (!currentAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>PG Information</CardTitle>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="pgName" className="block text-sm font-medium mb-1">
                  PG Name
                </label>
                <input
                  {...register('pgName')}
                  type="text"
                  id="pgName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.pgName && (
                  <p className="text-red-500 text-sm mt-1">{errors.pgName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium mb-1">
                  Owner Name
                </label>
                <input
                  {...register('ownerName')}
                  type="text"
                  id="ownerName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.ownerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-1">
                  Mobile Number
                </label>
                <input
                  {...register('mobile')}
                  type="tel"
                  id="mobile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Address</label>
                <div>
                  <input
                    {...register('address.area')}
                    type="text"
                    placeholder="Area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address?.area && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.area.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('address.landmark')}
                    type="text"
                    placeholder="Landmark / Set location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address?.landmark && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.landmark.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      {...register('address.city')}
                      type="text"
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register('address.pincode')}
                      type="text"
                      placeholder="Pincode (6 digits)"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address?.pincode && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.pincode.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    {...register('address.state')}
                    type="text"
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address?.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">PG Name</label>
                <p>{currentAdmin.pgName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Owner Name</label>
                <p>{currentAdmin.ownerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                <p>{currentAdmin.mobile}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p>{currentAdmin.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p>
                  {currentAdmin.address.area}, {currentAdmin.address.landmark}, {currentAdmin.address.city} - {currentAdmin.address.pincode}, {currentAdmin.address.state}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}