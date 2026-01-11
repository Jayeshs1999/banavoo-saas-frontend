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
    if (currentRoom.trim()) {
      const newRoom: Room = {
        id: generateId(),
        name: currentRoom,
        beds: [],
      };
      setRooms([...rooms, newRoom]);
      setCurrentRoom('');
    }
  };

  const addBed = (roomId: string) => {
    setRooms(rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            beds: [...room.beds, { id: generateId(), allocated: false, price: 5000 }]
          }
        : room
    ));
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

  const onSubmit = (data: PGForm) => {    
    // In real app, save to backend
    const newPG: PG = {
      id: generateId(),
      adminId: currentAdmin?.id || '',
      name: data.name,
      photos: [], // Add photo upload later
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
              <div className="flex gap-2">
                <input
                  type="text"
                  id="roomName"
                  value={currentRoom}
                  onChange={(e) => setCurrentRoom(e.target.value)}
                  placeholder="Room name (e.g., Room 101)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={addRoom}>
                  Add Room
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{room.name}</h3>
                    <Button type="button" onClick={() => addBed(room.id)} size="sm">
                      Add Bed
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {room.beds.map((bed) => (
                      <div
                        key={bed.id}
                        className={`p-2 border rounded cursor-pointer text-center ${
                          bed.allocated ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'
                        }`}
                        onClick={() => toggleBedAllocation(room.id, bed.id)}
                      >
                        Bed {bed.id.slice(-2)}
                        <br />
                        {bed.allocated ? 'Allocated' : 'Available'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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