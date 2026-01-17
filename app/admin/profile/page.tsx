'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { useAuth } from '../../context/AuthContext';

const profileSchema = z.object({
  pgName: z.string().min(1, 'PG Name is required'),
  ownerName: z.string().min(1, 'Owner Name is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function AdminProfile() {
  const router = useRouter();
  const { currentAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Address
                </label>
                <textarea
                  {...register('address')}
                  id="address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
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
                <p>{currentAdmin.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}