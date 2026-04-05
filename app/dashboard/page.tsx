"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBadge,
  CardContent,
  CardHeader,
  CardTitle,
  ShareButton,
} from "../../components";
import { useAuth } from "../context/AuthContext";
import { pgAPI } from "@/services/api";
import Link from "next/link";
import { Building } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    <div className="m-0 sm:m-8">
      <Card variant="glass" className="p-5 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t("dashboard.yourPGs")}
          </h2>
          <div className="flex gap-2">
            <CardBadge variant="success">
              {pgs.length} {t("dashboard.total")}
            </CardBadge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pgs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">{t("dashboard.noPGs")}</p>
            <p className="text-sm">{t("dashboard.createFirstPG")}</p>
            <Link href="/admin/create-pg">
              <Button
                size="lg"
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {t("dashboard.createFirstPGButton")}
              </Button>
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
                  variant="elevated"
                  className="hover:shadow-2xl transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {pg.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pg.location?.subcity}, {pg.location?.city}
                          </p>
                        </div>
                        {/* <div className="flex items-center gap-2">
                          <ShareButton
                            pgId={pg._id}
                            pgName={pg.name}
                            pgLocation={pg.location}
                            price={pg.structure[0]?.price}
                            size="sm"
                          /> */}
                        <div className="w-12 h-12 bg-gradient-to-br bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Building className="w-6 h-6 text-white" />
                          {/* </div> */}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="text-blue-600 font-semibold">
                            {totalRooms}
                          </span>
                          <span className="text-gray-600 ml-1">
                            {t("dashboard.rooms")}
                          </span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <span className="text-green-600 font-semibold">
                            {totalBeds}
                          </span>
                          <span className="text-gray-600 ml-1">
                            {t("dashboard.beds")}
                          </span>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="text-red-600 font-semibold">
                            {allocatedBeds}
                          </span>
                          <span className="text-gray-600 ml-1">
                            {t("dashboard.allocated")}
                          </span>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <span className="text-yellow-600 font-semibold">
                            {availableBeds}
                          </span>
                          <span className="text-gray-600 ml-1">
                            {t("dashboard.available")}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {t("dashboard.occupancy")}: {occupancyRate}%
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-3 ml-2">
                          <div
                            className="bg-gradient-to-r  bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${occupancyRate}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link className="w-full" href={`/admin/pgs/${pg._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 w-full border-2 border-primary text-primary hover:bg-background hover:text-primary transition-all duration-300"
                          >
                            {t("dashboard.viewDetails")}
                          </Button>
                        </Link>
                        <Link
                          className="w-full"
                          href={`/admin/edit-pg/${pg._id}`}
                        >
                          <Button
                            size="sm"
                            className="flex-1 w-full bg-gradient-to-r   text-white"
                          >
                            {t("common.edit")}
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
