// Common types for the dormitory project

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  occupants: number;
  floor: number;
  building: string;
}

export interface Student {
  id: string;
  userId: string;
  roomId?: string;
  enrollmentDate: Date;
  graduationDate?: Date;
}

export interface MaintenanceRequest {
  id: string;
  studentId: string;
  roomId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}