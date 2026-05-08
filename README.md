# 🗓 Real-Time Expert Session Booking System

A full-stack web application for booking sessions with experts in real-time.
Built as part of the Vedaz Software Development Internship Assessment.

## 📱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Web) | React + Vite + React Router |
| Frontend (Mobile) | React Native + Expo |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Real-Time | Socket.io |
| Styling | CSS Variables + Inter Font |

## ✨ Features

- **Expert Listing** — Browse experts with search by name, filter by category, and pagination
- **Expert Detail** — View expert profile with available time slots grouped by date
- **Real-Time Slots** — Slots update live via Socket.io when booked by another user
- **Booking System** — Form with full validation (name, email, phone, date, time, notes)
- **Double Booking Prevention** — Atomic MongoDB `findOneAndUpdate` prevents race conditions
- **My Bookings** — View all bookings by email with status tracking (Pending/Confirmed/Completed)
- **React Native App** — Cross-platform mobile version connecting to the same backend (bonus)

## 🛠 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Backend
```bash
cd server
npm install
```

Create a `server/.env` file using the provided template:
```bash
cp .env.example .env
# Then edit .env and add your MongoDB Atlas connection string
```

Seed the database and start the server:
```bash
npm run seed    # Seeds 12 experts + 504 time slots
npm run dev     # Starts on http://localhost:5000
```

### 2. Frontend (Web)
```bash
cd client
npm install
```

Create a `client/.env` file using the provided template:
```bash
cp .env.example .env
```

Start the dev server:
```bash
npm run dev     # Starts on http://localhost:5173
```

### 3. Frontend (Mobile — Bonus)
```bash
cd mobile
npm install
npx expo start
```

## 🔑 Environment Variables

> **Note:** `.env` files are excluded from this repository via `.gitignore` for security best practices. Template files (`.env.example`) are provided in both `server/` and `client/` directories with the exact variable names and format needed. Simply copy them to `.env` and fill in your values.

### `server/.env`
```
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | Get all experts (pagination + search + category filter) |
| GET | `/api/experts/:id` | Get expert by ID with time slots grouped by date |
| POST | `/api/bookings` | Create a new booking (atomic slot lock) |
| PATCH | `/api/bookings/:id/status` | Update booking status (Pending → Confirmed → Completed) |
| GET | `/api/bookings?email=` | Get all bookings by user email |

## ⚡ Real-Time Architecture

Socket.io room-based updates ensure efficient real-time communication:

1. User opens Expert Detail → client joins room `expert-{id}`
2. Another user books a slot → server emits `slot-booked` to that room
3. All users viewing that expert see the slot disable in real-time
4. On leaving the page → client leaves the room (cleanup)

## 🔒 Double Booking Prevention

Uses MongoDB atomic operation to prevent race conditions:
```js
Slot.findOneAndUpdate(
  { _id: slotId, isBooked: false },  // only matches if still available
  { $set: { isBooked: true, bookedBy: email } },
  { returnDocument: 'after' }
)
// Returns null if already booked → responds with 409 Conflict
```

This guarantees that even if two users click "Book" at the exact same millisecond, only one will succeed — the other gets a clear "Slot Unavailable" message.

## 📁 Project Structure

```
├── client/                # React + Vite web frontend
│   ├── src/
│   │   ├── components/    # ExpertCard, SlotPicker, StarRating, Navbar, LoadingSpinner
│   │   ├── pages/         # ExpertListing, ExpertDetail, BookingForm, MyBookings
│   │   └── socket.js      # Socket.io client connection
│   └── .env.example
├── server/                # Node.js + Express backend
│   ├── controllers/       # expertController, bookingController
│   ├── models/            # Expert, Booking, Slot (Mongoose schemas)
│   ├── routes/            # /api/experts, /api/bookings
│   ├── middleware/        # Global error handler
│   ├── seed.js            # Database seeder (12 experts, 504 slots)
│   └── .env.example
├── mobile/                # React Native Expo app (bonus)
│   ├── screens/           # 4 screens matching web app
│   └── constants.js       # Platform-aware API URL config
└── README.md
```

## 🎥 Demo

A video walkthrough demonstrating all features including real-time slot updates across multiple browser tabs is included in the submission.
