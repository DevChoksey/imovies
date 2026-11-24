# IMovies — Full-Stack Cinema & Ticket Booking System 🎬🎟️

A production-grade, full-stack cinema and movie ticket reservation system built with the **MERN (MongoDB, Express.js, React.js, Node.js)** architecture and **Socket.io** for real-time seat tracking.

---

## 🏛️ System Architecture

- **Frontend**: React 18, Vite, React Router DOM, Axios, Context API, Lucide Icons, Custom Cinema Dark Theme.
- **Backend**: Node.js, Express.js, Socket.io, Mongoose, JWT, bcryptjs, Rate Limiting, QR Code generation.
- **Database**: MongoDB with 8 collections (`Users`, `Movies`, `Theatres`, `Shows`, `Seats`, `Bookings`, `Payments`, `Notifications`).

---

## 🌟 Key Features

1. **Role-Based Security & Authentication**:
   - Secure sign-in and sign-up with JSON Web Tokens (JWT) and bcrypt password hashing.
   - Separate access control layers for Customers and System Administrators.
   - One-click demo login buttons on the sign-in screen for seamless testing.
2. **Movie Catalog, Search & Filters**:
   - Search by title and synopsis with compound text indexes.
   - Filter by Genre (*Sci-Fi, Action, Adventure, Drama, Fantasy, Animation*), Language, and Status (*Now Showing* vs *Coming Soon*).
3. **Live Cinema Hall & Real-Time Seat Synchronization**:
   - Interactive tiered seat layout: VIP (Rows A-B), Premium (Rows C-E), and Normal (Rows F-H).
   - Real-time seat locking with Socket.io: When a user selects a seat, other viewers see it lock in real time.
   - 5-minute reservation timer before unconfirmed seats automatically return to available inventory.
4. **Checkout, Payments & Digital QR Passes**:
   - Simulated payment flow supporting Credit/Debit Cards, UPI, and Net Banking.
   - Automated price calculations (Base fare + 18% GST).
   - Instant ticket receipt with unique booking ID and scannable QR Code pass.
5. **Self-Service Cancellations & Refunds**:
   - Tabbed view for upcoming and past bookings.
   - 1-click booking cancellation with automated 90% refund computation and seat release.
6. **Automated Gmail M-Ticket & PDF Passes**:
   - Direct integration with Google SMTP (Nodemailer) for automated ticket dispatch.
   - Includes full booking summary, cinema screen details, seat labels, timing, and pricing breakdown.
7. **Indore Multiplex Showtimes & Authentic BookMyShow UX**:
   - Authentic seat layout with ₹800 Prime & ₹720 Classic tiered seating, screen indicators, and format selector modals (IMAX, 4DX, 3D).
8. **Admin Command Center**:
   - Real-time KPI metrics: Total Revenue, Total Bookings, Active Movies, Registered Users.
   - Full CRUD management for movie listings.
   - Show scheduler: Assign movies to theatres, select screen formats (*IMAX, 4DX, Dolby Atmos*), and configure showtimes.
   - Complete audit trail of all transactions.

---

## 🔌 API Summary

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Movies**: `GET /api/movies`, `GET /api/movies/:id`, `POST /api/movies`, `PUT /api/movies/:id`, `DELETE /api/movies/:id`
- **Theatres**: `GET /api/theatres`, `GET /api/theatres/:id`, `POST /api/theatres`
- **Shows**: `GET /api/shows`, `GET /api/shows/:id`, `POST /api/shows`, `DELETE /api/shows/:id`
- **Bookings**: `POST /api/bookings`, `GET /api/bookings/my-bookings`, `GET /api/bookings/:id`, `POST /api/bookings/:id/cancel`, `GET /api/bookings/admin/all`
- **Payments**: `POST /api/payments/process`, `GET /api/payments/my-payments`
- **Admin**: `GET /api/admin/stats`

---

## ⚡ Socket.io Real-Time Events

- `join_show`: Joins room for show `show_{showId}`
- `select_seats`: Emits temporary seat hold to other viewers
- `seats_locked_by_other`: Receives live seat hold status
- `release_seats`: Releases seats on deselect or timeout
- `seats_booked`: Broadcasts permanent reservation upon completed payment

---

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
npm run install:all
```
*(Or install separately: `cd backend && npm install`, then `cd ../frontend && npm install`)*

### 2. Configure Environment Files
- `backend/.env` (defaults provided):
  ```env
  PORT=5000
  NODE_ENV=development
  MONGO_URI=mongodb://127.0.0.1:27017/imovies_db
  JWT_SECRET=imovies_super_secret_jwt_key_2026_xyz987
  JWT_EXPIRE=30d
  CLIENT_URL=http://localhost:5173
  # Gmail Confirmation Service (Optional)
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_16_character_app_password
  ```
- `frontend/.env` (defaults provided):
  ```env
  VITE_API_URL=http://localhost:5000/api
  VITE_SOCKET_URL=http://localhost:5000
  ```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Servers
```bash
npm run dev
```
- Frontend: **http://localhost:5173**
- Backend: **http://localhost:5000**

---

## 🔑 Demo Credentials

- **Admin Account**: `admin@imovies.com` / `admin123`
- **Standard User**: `user@imovies.com` / `user123`

---

## 🐳 Docker Setup
```bash
docker-compose up --build
```
Starts MongoDB, Express Backend, and React Frontend in isolated containers.
