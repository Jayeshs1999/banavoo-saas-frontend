# Dormitory Management System - Frontend Integration Guide

This guide explains how to integrate your Next.js frontend with the new Node.js backend API.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in your dormitory project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Start the Backend

From the `bookshop` directory:

```bash
cd bookshop
npm install
npm run dev
```

### 3. Start the Frontend

From the `dormitory` directory:

```bash
cd dormitory
npm install
npm run dev
```

## 📁 Project Structure

### Backend (bookshop/)

```
bookshop/
├── backend/
│   ├── controllers/     # API controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes with Swagger docs
│   ├── middleware/     # Authentication middleware
│   ├── utils/          # Utility functions
│   └── swagger.js      # API documentation
├── package.json
└── .env               # Environment variables
```

### Frontend (dormitory/)

```
dormitory/
├── app/
│   ├── context/        # AuthContext with API integration
│   ├── admin/
│   │   ├── login/      # Admin login page
│   │   ├── register/   # Admin registration page
│   │   ├── create-pg/  # PG creation page
│   │   └── dashboard/  # Admin dashboard
│   └── user/           # User pages
├── services/
│   └── api.ts          # API service layer
├── types/              # TypeScript type definitions
└── components/         # Reusable components
```

## 🔌 API Integration

### Auth API

The frontend now uses the real API instead of dummy data:

#### Admin Login

```typescript
// In AuthContext.tsx
const loginAdmin = async (
  email: string,
  password: string,
): Promise<boolean> => {
  const response = await authAPI.adminLogin(email, password);
  // Stores token and admin data
  localStorage.setItem("token", response.token);
  setCurrentAdmin(response);
  return true;
};
```

#### Admin Registration

```typescript
// In AuthContext.tsx
const registerAdmin = async (
  adminData: Omit<PGAdmin, "id">,
): Promise<boolean> => {
  const response = await authAPI.adminRegister({
    pgName: adminData.pgName,
    ownerName: adminData.ownerName,
    email: adminData.email,
    mobile: adminData.mobile,
    password: adminData.password,
    address: adminData.address,
  });
  // Stores token and admin data
  localStorage.setItem("token", response.token);
  setCurrentAdmin(response);
  return true;
};
```

### OTP Verification

The frontend integrates with the backend OTP system:

```typescript
// Send OTP
await authAPI.sendMobileOtp(mobile);

// Verify OTP
const success = await authAPI.verifyMobileOtp(mobile, otp);
```

### PG Management

The PG creation page now uses the real API:

```typescript
// Create PG
const newPG = {
  name: data.name,
  photos: photos,
  structure: rooms,
  onlinePayment: data.onlinePayment,
  location: {
    subcity: "",
    city: "",
    state: "",
    country: "",
  },
};

await pgAPI.createPG(newPG);
```

## 🛠️ API Endpoints

### Authentication

- `POST /api/admins/auth` - Admin login
- `POST /api/admins/register` - Admin registration
- `POST /api/admins/send-mobile-otp` - Send mobile OTP
- `POST /api/admins/verify-mobile-otp` - Verify mobile OTP
- `POST /api/admins/send-email-otp` - Send email OTP
- `POST /api/admins/verify-email-otp` - Verify email OTP
- `GET /api/admins/profile` - Get admin profile
- `PUT /api/admins/profile` - Update admin profile

### PG Management

- `GET /api/pgs/admin` - Get admin's PGs
- `POST /api/pgs` - Create new PG
- `PUT /api/pgs/:id` - Update PG
- `DELETE /api/pgs/:id` - Delete PG
- `GET /api/pgs/search` - Search PGs

### File Upload

- `POST /api/upload` - Upload images

## 🔒 Authentication

The frontend uses JWT tokens for authentication:

1. **Login**: Returns JWT token
2. **Storage**: Token stored in localStorage
3. **Headers**: Token automatically added to API requests
4. **Logout**: Clears token and redirects

## 📱 Frontend Pages

### Admin Login (`/admin/login`)

- ✅ Integrated with real API
- ✅ JWT token handling
- ✅ Error handling
- ✅ Loading states

### Admin Register (`/admin/register`)

- ✅ Integrated with real API
- ✅ OTP verification flow
- ✅ Form validation
- ✅ Error handling

### Create PG (`/admin/create-pg`)

- ✅ Integrated with real API
- ✅ Image upload functionality
- ✅ Room and bed management
- ✅ Form validation

## 🚨 Important Notes

### 1. CORS Configuration

The backend includes CORS middleware to allow frontend requests:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
```

### 2. Environment Variables

Make sure to set these in your `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

### 3. Database Models

The backend includes these models:

- `User` - User accounts
- `Admin` - Admin accounts with PG management
- `PG` - PG details and structure
- `Booking` - Booking requests and management

### 4. File Upload

Image uploads are handled via the `/api/upload` endpoint with multer middleware.

## 🧪 Testing the Integration

### 1. Test Admin Registration

1. Go to `/admin/register`
2. Fill in the form with valid data
3. Verify OTPs (check console for OTP values)
4. Submit and verify redirect to dashboard

### 2. Test Admin Login

1. Go to `/admin/login`
2. Use the registered email and password
3. Verify successful login and redirect

### 3. Test PG Creation

1. Go to `/admin/create-pg`
2. Add rooms and beds
3. Upload images
4. Submit and verify PG creation

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` in backend `.env`
2. **JWT Errors**: Verify `JWT_SECRET` is set
3. **Database Errors**: Check `MONGODB_URI` connection
4. **API Not Found**: Ensure backend is running on port 5000

### Debug Tips

1. Check browser console for API errors
2. Check backend terminal for server logs
3. Use Swagger docs at `http://localhost:5000/api-docs`
4. Verify environment variables are set correctly

## 📚 Next Steps

1. **User Authentication**: Implement user login/register API
2. **Booking System**: Create booking endpoints
3. **Admin Dashboard**: Display PGs and bookings
4. **User Dashboard**: Allow users to browse and book PGs
5. **Payment Integration**: Add payment processing

## 🤝 Support

If you encounter issues:

1. Check the Swagger documentation
2. Review the API service files
3. Verify environment configuration
4. Check browser and server logs

The integration is now complete! Your frontend should work seamlessly with the backend API. 🎉
