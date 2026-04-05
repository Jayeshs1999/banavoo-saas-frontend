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

/**
 * Calculate the number of days between two dates
 */
export const calculateDays = (checkIn: Date | string, checkOut: Date | string): number => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

/**
 * Calculate the number of months between two dates (30 days = 1 month)
 */
export const calculateMonths = (checkIn: Date | string, checkOut: Date | string): number => {
  const days = calculateDays(checkIn, checkOut);
  return Math.max(1, Math.ceil(days / 30));
};

/**
 * Calculate the total price for a booking based on pricing period
 */
export const calculatePrice = (params: {
  checkIn: Date | string;
  checkOut: Date | string;
  price: number;
  pricingPeriod: 'day' | 'month';
}): { totalPrice: number; days: number; months: number } => {
  const days = calculateDays(params.checkIn, params.checkOut);
  const months = calculateMonths(params.checkIn, params.checkOut);

  let totalPrice: number;
  if (params.pricingPeriod === 'day') {
    totalPrice = days * params.price;
  } else {
    totalPrice = months * params.price;
  }

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    days,
    months,
  };
};

/**
 * Validate booking dates
 */
export const validateBookingDates = (
  checkIn: Date | string,
  checkOut: Date | string
): { valid: boolean; error?: string } => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime())) {
    return { valid: false, error: 'Invalid check-in date' };
  }

  if (isNaN(checkOutDate.getTime())) {
    return { valid: false, error: 'Invalid check-out date' };
  }

  if (checkOutDate < checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  return { valid: true };
};


export const getToken = (): string | null => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Dummy data
import { PGAdmin, User, PG, BookingRequest } from '../types';

export const dummyPGAdmins: PGAdmin[] = [
  {
    id: 'admin1',
    pgName: 'Green Valley PG',
    ownerName: 'Jayesh Sevatkar',
    mobile: '9876543210',
    email: 'jayesh@gmail.com',
    address: {
      area: 'Andheri West',
      landmark: 'Near XYZ Mall',
      city: 'Mumbai',
      pincode: '400058',
      state: 'Maharashtra',
    },
    password: 'password123',
    role: 'admin',
  },
];

export const dummyUsers: User[] = [
  {
    id: 'user1',
    firstName: 'Amit',
    lastName: 'Sharma',
    email: 'jayesh@gmail.com',
    mobile: '9876543211',
    address: '456 Elm St, Mumbai, Maharashtra',
    password: 'password123',
    role: 'user',
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
        price: 10000,
        pricingPeriod: 'day',

      },
      {
        id: 'room2',
        name: 'Room 102',
        beds: [
          { id: 'bed3', allocated: false, price: 4500 },
          { id: 'bed4', allocated: false, price: 4500 },
        ],
        price: 10000,
        pricingPeriod: 'month',
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