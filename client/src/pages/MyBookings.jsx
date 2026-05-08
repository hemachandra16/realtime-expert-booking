import { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchBookings = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/api/bookings`, { params: { email } });
      setBookings(data);
      setSearched(true);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') fetchBookings(); };

  return (
    <div className="mybookings-page">
      <h2>My Bookings</h2>
      <div className="email-search">
        <input
          className="form-input"
          type="email"
          placeholder="Enter your email to view bookings..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={fetchBookings}>Search</button>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && searched && bookings.length === 0 && (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No Bookings Found</h3>
          <p>No bookings found for this email address</p>
        </div>
      )}

      <div className="booking-list">
        {bookings.map((b) => (
          <div key={b._id} className="booking-item">
            <div className="left">
              <h4>{b.expertId?.name || 'Expert'}</h4>
              <p>{b.expertId?.category} · 📅 {b.date} · 🕐 {b.timeSlot}</p>
              <p>Booked: {new Date(b.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`status-badge ${b.status.toLowerCase()}`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
