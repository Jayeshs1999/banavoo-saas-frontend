// API Service for Dormitory Management System

// const API_BASE =  'https://dormitory-backend-5rda.onrender.com/api';
// const API_BASE =  'https://doormitory-backend.store/api'
const API_BASE =  'http://localhost:5000/api';
// Hrllo

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};

// Helper function to get user type
const getUserType = () => {
  if (typeof window !== 'undefined') {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.userType || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
        
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Admin Authentication
  adminLogin: async (email: string, password: string) => {
    return apiRequest('/admins/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  adminRegister: async (data: {
    pgName: string;
    ownerName: string;
    email: string;
    mobile: string;
    password: string;
    address: {
      area: string;
      landmark: string;
      city: string;
      pincode: string;
      state: string;
    };
  }) => {
    return apiRequest('/admins/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // OTP Verification
  sendMobileOtp: async (mobile: string) => {
    return apiRequest('/admins/send-mobile-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  verifyMobileOtp: async (mobile: string, otp: string) => {
    return apiRequest('/admins/verify-mobile-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  },

  sendEmailOtp: async (email: string) => {
    return apiRequest('/admins/send-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    return apiRequest('/admins/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  // Profile Management
  getAdminProfile: async () => {
    return apiRequest('/admins/profile');
  },

  updateAdminProfile: async (data: {
    pgName?: string;
    ownerName?: string;
    email?: string;
    mobile?: string;
    address?: {
      area: string;
      landmark: string;
      city: string;
      pincode: string;
      state: string;
    };
    password?: string;
  }) => {
    return apiRequest('/admins/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.resolve({ message: 'Logged out successfully' });
  },
};

// User API
export const userAPI = {
  // User Authentication
  userLogin: async (email: string, password: string) => {
    return apiRequest('/users/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  userRegister: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    password: string;
    address: string;
  }) => {
    return apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUserProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateUserProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    address?: string;
    password?: string;
  }) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.resolve({ message: 'Logged out successfully' });
  },
};

// PG API
export const pgAPI = {
  // Get all PGs for admin
  getAdminPGs: async () => {
    return apiRequest('/pgs/admin');
  },

  // Get single PG
  getPG: async (pgId: string) => {
    return apiRequest(`/pgs/${pgId}`);
  },

  // Create new PG
  createPG: async (data: {
    name: string;
    photos?: string[];
    structure: Array<{
      id: string;
      name: string;
      beds: Array<{
        id: string;
        allocated: boolean;
        price: number;
      }>;
      price: number;
      pricingPeriod: 'day' | 'month';
    }>;
    onlinePayment: boolean;
    location: {
      subcity: string;
      city: string;
      state: string;
      country: string;
      pin: string;
    };
  }) => {
    return apiRequest('/pgs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update PG
  updatePG: async (pgId: string, data: any) => {
    return apiRequest(`/pgs/${pgId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Toggle PG private/public visibility
  togglePrivacy: async (pgId: string, isPrivate: boolean) => {
    return apiRequest(`/pgs/${pgId}`, {
      method: 'PUT',
      body: JSON.stringify({ isPrivate }),
    });
  },

  // Delete PG
  deletePG: async (pgId: string) => {
    return apiRequest(`/pgs/${pgId}`, {
      method: 'DELETE',
    });
  },

  // Search PGs
  searchPGs: async (filters: {
    city?: string;
    subcity?: string;
    state?: string;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    return apiRequest(`/pgs/search?${searchParams.toString()}`);
  },

  // Public endpoints (no auth required)
  /**
   * Fetch public PGs with server-side filtering + pagination.
   * Returns { success, data, pagination: { page, limit, total, totalPages, hasMore } }
   */
  getAllPGsPublic: async (params: {
    page?:          number;
    limit?:         number;
    search?:        string;
    city?:          string;
    subcity?:       string;
    state?:         string;
    minPrice?:      string;
    maxPrice?:      string;
    onlinePayment?: boolean;
    availableOnly?: boolean;
    amenities?:     string;   // comma-separated amenity keys
    sortBy?:        string;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== false) qs.append(k, String(v));
    });
    const url = `${API_BASE}/pgs/public${qs.toString() ? `?${qs}` : ""}`;
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  getPGPublic: async (pgId: string) => {
    const url = `${API_BASE}/pgs/public/${pgId}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
};

// Booking API
export const bookingAPI = {
  // Get all bookings for admin
  getAdminBookings: async () => {
    return apiRequest('/bookings/admin');
  },

  // Get bookings for specific PG
  getPGBookings: async (pgId: string) => {
    return apiRequest(`/bookings/pg/${pgId}`);
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: 'approved' | 'rejected' | 'cancelled') => {
    return apiRequest(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get booking by ID
  getBooking: async (bookingId: string) => {
    return apiRequest(`/bookings/${bookingId}`);
  },

  // User bookings
  getMyBookings: async () => {
    return apiRequest('/bookings/my-bookings');
  },

  createBooking: async (data: {
    pgId: string;
    roomId: string;
    bedId: string;
    joinDate: string;
    stayDays: number;
    notes?: string;
    paymentMethod?: 'online' | 'cash';
  }) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancelBooking: async (bookingId: string) => {
    return apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },

  createPaymentOrder: async (bookingId: string) => {
    return apiRequest(`/bookings/${bookingId}/create-payment-order`, {
      method: 'POST',
    });
  },

  verifyPayment: async (bookingId: string, data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return apiRequest(`/bookings/${bookingId}/verify-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// File Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    return await response.json();
  },
};


export const superAdminAPI = {
  // Get dashboard data
  getSUperAdminDashboardInfo: async () => {
    return apiRequest('/super-admin/dashboard');
  },

  // Get admin list
  getAdminList: async () => {
    return apiRequest(`/super-admin/admins`);
  },

  // Get PG list
  getPGList: async () => {
    return apiRequest(`/super-admin/pgs`);
  },

  // Get PG list
  getLocationList: async () => {
    return apiRequest(`/super-admin/location-stats`);
  },
};

// Contact API
export const contactAPI = {
  // Send contact message
  sendContactMessage: async (data: {
    name: string;
    email: string;
    message: string;
  }) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
