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
- **React Native App** — Mobile version connecting to the same backend (bonus)

## 🛠 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend
```bash
cd server
npm install
# Add your MongoDB URI to .env (see .env.example)
npm run seed    # Seeds 12 experts + 504 slots
npm run dev     # Starts on http://localhost:5000
```

### Frontend (Web)
```bash
cd client
npm install
npm run dev     # Starts on http://localhost:5173
```

### Frontend (Mobile)
```bash
cd mobile
npm install
npx expo start
```

## 🔑 Environment Variables

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
| GET | `/api/experts` | Get all experts (pagination + search + filter) |
| GET | `/api/experts/:id` | Get expert by ID with available slots |
| POST | `/api/bookings` | Create a new booking |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/api/bookings?email=` | Get bookings by email |

## ⚡ Real-Time Architecture

Socket.io room-based updates:
1. User opens Expert Detail → joins room `expert-{id}`
2. Another user books a slot → server emits `slot-booked` to that room
3. All users viewing that expert see the slot turn red instantly

## 🔒 Double Booking Prevention

Uses MongoDB atomic operation:
```js
Slot.findOneAndUpdate(
  { _id: slotId, isBooked: false },  // only succeeds if still available
  { $set: { isBooked: true } },
  { new: true }
)
// Returns null if already booked → 409 Conflict
```

## 📁 Project Structure

```
/
├── client/          # React + Vite web frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── socket.js
├── server/          # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── seed.js
└── mobile/          # React Native Expo app (bonus)
```
