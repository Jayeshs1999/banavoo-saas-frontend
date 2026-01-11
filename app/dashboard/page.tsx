'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roomAssignments: Array<{
    room: {
      roomNumber: string;
      building: string;
    };
  }>;
}

interface Room {
  id: string;
  roomNumber: string;
  building: string;
  capacity: number;
  assignments: Array<{
    student: {
      name: string;
    };
  }>;
}

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, roomsRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/rooms'),
        ]);

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="text-sm">
                    {student.roomAssignments.length > 0 ? (
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
                        Room {student.roomAssignments[0].room.roomNumber}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No room</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rooms ({rooms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">Room {room.roomNumber} - {room.building}</p>
                    <p className="text-sm text-muted-foreground">
                      {room.assignments.length}/{room.capacity} occupied
                    </p>
                  </div>
                  <div className="text-sm">
                    {room.assignments.length > 0 ? (
                      <div>
                        {room.assignments.map((assignment, index) => (
                          <span key={index} className="block">{assignment.student.name}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Empty</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}