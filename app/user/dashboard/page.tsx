'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { useAuth } from '../../context/AuthContext';
import { dummyPGs } from '../../../utils';
import { PG } from '../../../types';

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [pgs] = useState<PG[]>(dummyPGs);
  const [filters, setFilters] = useState({
    city: '',
    subcity: '',
  });

  const filteredPGs = pgs.filter(pg =>
    (!filters.city || pg.location.city.toLowerCase().includes(filters.city.toLowerCase())) &&
    (!filters.subcity || pg.location.subcity.toLowerCase().includes(filters.subcity.toLowerCase()))
  );

  const handleBook = (pgId: string) => {
    // In real app, navigate to booking page
    alert('Booking functionality to be implemented');
  };

  if (!currentUser) {
    router.push('/user/login');
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {currentUser.firstName}</h1>
        <div className="flex gap-4">
          <Link href="/user/requests">
            <Button variant="outline">My Requests</Button>
          </Link>
          <Link href="/user/profile">
            <Button variant="outline">Profile</Button>
          </Link>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Find PGs</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Filter by city"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Filter by subcity"
            value={filters.subcity}
            onChange={(e) => setFilters({ ...filters, subcity: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPGs.map((pg) => (
          <Card key={pg.id}>
            <CardHeader>
              <CardTitle>{pg.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {pg.location.subcity}, {pg.location.city}, {pg.location.state}
                </p>
                <p className="text-sm text-gray-600">
                  Available Beds: {pg.structure.reduce((acc, room) => acc + room.beds.filter(bed => !bed.allocated).length, 0)}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Rooms:</h4>
                {pg.structure.map((room) => (
                  <div key={room.id} className="text-sm mb-1">
                    {room.name}: {room.beds.filter(bed => !bed.allocated).length} available
                  </div>
                ))}
              </div>

              <Button onClick={() => handleBook(pg.id)} className="w-full">
                {pg.onlinePayment ? 'Book Online' : 'Send Request'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}