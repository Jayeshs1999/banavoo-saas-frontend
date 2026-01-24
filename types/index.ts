// Types for PGWala project

export interface Address {
  area: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
}

export interface PGAdmin {
  id: string;
  pgName: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: Address;
  password: string;
  role: string;
}

export interface User {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  password: string;
  role: string;
}

export interface PG {
  id: string;
  adminId: string;
  name: string;
  photos: string[];
  structure: Room[];
  onlinePayment: boolean;
  location: {
    subcity: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface Room {
  id: string;
  name: string;
  beds: Bed[];
  price: number;
  pricingPeriod: 'day' | 'month';
}

export interface Bed {
  id: string;
  allocated: boolean;
  price: number;
}

export interface BookingRequest {
  id: string;
  userId: string;
  pgId: string;
  bedId: string;
  joinDate: Date;
  stayDays: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}