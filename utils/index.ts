// Utility functions

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Dummy data
import { PGAdmin, User, PG, BookingRequest } from '../types';

export const dummyPGAdmins: PGAdmin[] = [
  {
    id: 'admin1',
    pgName: 'Green Valley PG',
    ownerName: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh@greenvalley.com',
    address: '123 Main St, Mumbai, Maharashtra',
    password: 'password123',
  },
];

export const dummyUsers: User[] = [
  {
    id: 'user1',
    firstName: 'Amit',
    lastName: 'Sharma',
    email: 'amit@gmail.com',
    mobile: '9876543211',
    address: '456 Elm St, Mumbai, Maharashtra',
    password: 'password123',
  },
];

export const dummyPGs: PG[] = [
  {
    id: 'pg1',
    adminId: 'admin1',
    name: 'Green Valley PG',
    photos: ['/pg1-1.jpg', '/pg1-2.jpg'],
    structure: [
      {
        id: 'room1',
        name: 'Room 101',
        beds: [
          { id: 'bed1', allocated: false, price: 5000 },
          { id: 'bed2', allocated: true, price: 5000 },
        ],
      },
      {
        id: 'room2',
        name: 'Room 102',
        beds: [
          { id: 'bed3', allocated: false, price: 4500 },
          { id: 'bed4', allocated: false, price: 4500 },
        ],
      },
    ],
    onlinePayment: true,
    location: {
      subcity: 'Andheri',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
  },
];

export const dummyRequests: BookingRequest[] = [
  {
    id: 'req1',
    userId: 'user1',
    pgId: 'pg1',
    bedId: 'bed1',
    joinDate: new Date('2026-01-15'),
    stayDays: 30,
    status: 'pending',
    createdAt: new Date(),
  },
];