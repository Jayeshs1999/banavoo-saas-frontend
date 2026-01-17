'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { useAuth } from '../../context/AuthContext';
import { PG, Room, Bed } from '../../../types';
import { generateId } from '../../../utils';

const pgSchema = z.object({
  name: z.string().min(1, 'PG Name is required'),
  onlinePayment: z.boolean(),
});

type PGForm = z.infer<typeof pgSchema>;

export default function CreatePG() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState('');
  const [currentRoomPrice, setCurrentRoomPrice] = useState('');
  const [pricingPeriod, setPricingPeriod] = useState<'day' | 'month'>('month');
  const [photos, setPhotos] = useState<string[]>([]);
  const [roomError, setRoomError] = useState('');
  const router = useRouter();
  const { currentAdmin } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PGForm>({
    resolver: zodResolver(pgSchema),
    defaultValues: {
      onlinePayment: false,
    },
  });

  const onlinePayment = watch('onlinePayment');

  const addRoom = () => {
    if (currentRoom.trim() && currentRoomPrice.trim()) {
      const newRoom: Room = {
        id: generateId(),
        name: currentRoom,
        price: parseInt(currentRoomPrice),
        pricingPeriod: pricingPeriod,
        beds: [],
      };
      setRooms([...rooms, newRoom]);
      setCurrentRoom('');
      setCurrentRoomPrice('');
    }
  };

  const addBed = (roomId: string) => {
    setRooms(rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            beds: [...room.beds, { id: generateId(), allocated: false, price: room.price }]
          }
        : room
    ));
  };

  const deleteBed = (roomId: string, bedId: string) => {
    setRooms(rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            beds: room.beds.filter(bed => bed.id !== bedId)
          }
        : room
    ));
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
    setRoomError('');
  };

  const toggleBedAllocation = (roomId: string, bedId: string) => {
    setRooms(rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            beds: room.beds.map(bed =>
              bed.id === bedId ? { ...bed, allocated: !bed.allocated } : bed
            )
          }
        : room
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setPhotos([...photos, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PGForm) => {    
    // Validate at least one room exists
    if (rooms.length === 0) {
      setRoomError('Please add at least one room');
      return;
    }

    // Validate all rooms have at least one bed
    const roomsWithoutBeds = rooms.filter(room => room.beds.length === 0);
    if (roomsWithoutBeds.length > 0) {
      setRoomError(`Please add at least one bed to each room. Rooms without beds: ${roomsWithoutBeds.map(r => r.name).join(', ')}`);
      return;
    }

    // In real app, save to backend
    const newPG: PG = {
      id: generateId(),
      adminId: currentAdmin?.id || '',
      name: data.name,
      photos: photos, // Save uploaded photos
      structure: rooms,
      onlinePayment: data.onlinePayment,
      location: {
        subcity: '',
        city: '',
        state: '',
        country: '',
      }, // Add location later
    };
    console.log('Created PG:', newPG);
    router.push('/admin/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create New PG</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                PG Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  {...register('onlinePayment')}
                  type="checkbox"
                  className="mr-2"
                />
                Enable online payment for bookings
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PG Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="roomName" className="block text-sm font-medium mb-1">
                Add Room
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  id="roomName"
                  value={currentRoom}
                  onChange={(e) => setCurrentRoom(e.target.value)}
                  placeholder="Room name (e.g., Room 101)"
                  className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={currentRoomPrice}
                  onChange={(e) => setCurrentRoomPrice(e.target.value)}
                  placeholder="Price per bed"
                  className="min-w-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={pricingPeriod}
                  onChange={(e) => setPricingPeriod(e.target.value as 'day' | 'month')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Per Day</option>
                  <option value="month">Per Month</option>
                </select>
                <Button type="button" disabled={!currentRoom || !currentRoomPrice} onClick={addRoom}>
                  Add Room
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {roomError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
                  {roomError}
                </div>
              )}
              {rooms.map((room) => (
                <div key={room.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-gray-600">Price per bed: ₹{room.price} per {room.pricingPeriod === 'day' ? 'day' : 'month'}</p>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Button type="button" onClick={() => addBed(room.id)} size="sm">
                        Add Bed
                      </Button>
                      <Button
                        type="button"
                        onClick={() => deleteRoom(room.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete Room
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {room.beds.map((bed, index) => (
                      <div
                        key={bed.id}
                        className={`p-2 border rounded cursor-pointer text-center relative group ${
                          bed.allocated ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'
                        }`}
                        onClick={() => toggleBedAllocation(room.id, bed.id)}
                      >
                        Bed {index + 1}
                        <br />
                        {bed.allocated ? 'Allocated' : 'Available'}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBed(room.id, bed.id);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="photos" className="block text-sm font-medium mb-2">
                Upload PG Photos
              </label>
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">You can upload multiple images</p>
            </div>

            {photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Uploaded Images ({photos.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`PG photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit">Save PG</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}