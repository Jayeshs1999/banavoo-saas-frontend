"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components";
import { useAuth } from "../context/AuthContext";
import { pgAPI } from "@/services/api";
import Link from "next/link";

// interface Student {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   roomAssignments: Array<{
//     room: {
//       roomNumber: string;
//       building: string;
//     };
//   }>;
// }

// interface Room {
//   id: string;
//   roomNumber: string;
//   building: string;
//   capacity: number;
//   assignments: Array<{
//     student: {
//       name: string;
//     };
//   }>;
// }

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { currentAdmin, logout } = useAuth();
  const [pgs, setPGs] = useState<any[]>([]);

  useEffect(() => {
    if (currentAdmin) {
      fetchAdminPGs();
    }
  }, [currentAdmin]);

  const fetchAdminPGs = async () => {
    setLoading(true);
    try {
      const response = await pgAPI.getAdminPGs();
      if (response.success) {
        setPGs(response.data);
      }
    } catch (err) {
      console.error("Error fetching PGs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-3 sm:m-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your PGs ({pgs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : pgs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't created any PGs yet. <br />
              <Link
                href="/admin/create-pg"
                className="text-blue-500 hover:underline"
              >
                Create your first PG
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pgs.map((pg) => {
                const totalRooms = pg.structure.length;
                const totalBeds = pg.structure.reduce(
                  (sum: number, room: any) => sum + room.beds.length,
                  0,
                );
                const allocatedBeds = pg.structure.reduce(
                  (sum: number, room: any) =>
                    sum + room.beds.filter((bed: any) => bed.allocated).length,
                  0,
                );
                const availableBeds = totalBeds - allocatedBeds;
                const occupancyRate =
                  totalBeds > 0
                    ? ((allocatedBeds / totalBeds) * 100).toFixed(0)
                    : "0";

                return (
                  <Card
                    key={pg._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-lg">{pg.name}</h3>
                          <p className="text-sm text-gray-600">
                            {pg.location?.subcity}, {pg.location?.city}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-blue-600 font-semibold">
                              {totalRooms}
                            </span>
                            <span className="text-gray-600 ml-1">Rooms</span>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-green-600 font-semibold">
                              {totalBeds}
                            </span>
                            <span className="text-gray-600 ml-1">Beds</span>
                          </div>
                          <div className="bg-red-50 p-2 rounded">
                            <span className="text-red-600 font-semibold">
                              {allocatedBeds}
                            </span>
                            <span className="text-gray-600 ml-1">
                              Allocated
                            </span>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <span className="text-yellow-600 font-semibold">
                              {availableBeds}
                            </span>
                            <span className="text-gray-600 ml-1">
                              Available
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">
                            Occupancy: {occupancyRate}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2 ml-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${occupancyRate}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/admin/pgs/${pg._id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/edit-pg/${pg._id}`}>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-700"
                            >
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // const [students, setStudents] = useState<Student[]>([]);
  // const [rooms, setRooms] = useState<Room[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [studentsRes, roomsRes] = await Promise.all([
  //         fetch('/api/students'),
  //         fetch('/api/rooms'),
  //       ]);

  //       if (studentsRes.ok) {
  //         const studentsData = await studentsRes.json();
  //         setStudents(studentsData);
  //       }

  //       if (roomsRes.ok) {
  //         const roomsData = await roomsRes.json();
  //         setRooms(roomsData);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // if (loading) {
  //   return <div className="container mx-auto px-4 py-8">Loading...</div>;
  // }

  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

  //       <div className="grid md:grid-cols-2 gap-8">
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Students ({students.length})</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="space-y-2">
  //               {students.map((student) => (
  //                 <div key={student.id} className="flex justify-between items-center p-2 border rounded">
  //                   <div>
  //                     <p className="font-medium">{student.name}</p>
  //                     <p className="text-sm text-muted-foreground">{student.email}</p>
  //                   </div>
  //                   <div className="text-sm">
  //                     {student.roomAssignments.length > 0 ? (
  //                       <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
  //                         Room {student.roomAssignments[0].room.roomNumber}
  //                       </span>
  //                     ) : (
  //                       <span className="text-muted-foreground">No room</span>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </CardContent>
  //         </Card>

  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Rooms ({rooms.length})</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="space-y-2">
  //               {rooms.map((room) => (
  //                 <div key={room.id} className="flex justify-between items-center p-2 border rounded">
  //                   <div>
  //                     <p className="font-medium">Room {room.roomNumber} - {room.building}</p>
  //                     <p className="text-sm text-muted-foreground">
  //                       {room.assignments.length}/{room.capacity} occupied
  //                     </p>
  //                   </div>
  //                   <div className="text-sm">
  //                     {room.assignments.length > 0 ? (
  //                       <div>
  //                         {room.assignments.map((assignment, index) => (
  //                           <span key={index} className="block">{assignment.student.name}</span>
  //                         ))}
  //                       </div>
  //                     ) : (
  //                       <span className="text-muted-foreground">Empty</span>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
}
