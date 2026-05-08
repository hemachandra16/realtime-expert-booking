import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import StarRating from '../components/StarRating';
import SlotPicker from '../components/SlotPicker';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [slots, setSlots] = useState({});
  const [slotDetails, setSlotDetails] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API}/api/experts/${id}`);
        setExpert(data.expert);
        setSlots(data.slots);
        setSlotDetails(data.slotDetails);
        setBookedSlots(data.bookedSlots);
        const dateKeys = Object.keys(data.slots).sort();
        if (dateKeys.length > 0) setSelectedDate(dateKeys[0]);

        const { data: sim } = await axios.get(`${API}/api/experts/${id}/similar`);
        setSimilar(sim);
      } catch (err) {
        console.error('Failed to fetch expert:', err);
        setError('Failed to load expert details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Socket.io room join + slot-booked listener
  useEffect(() => {
    socket.emit('join-expert-room', id);

    const handleSlotBooked = (data) => {
      setBookedSlots((prev) => [...prev, data.slotId]);
      // Also update slotDetails to mark as booked
      setSlotDetails((prev) => {
        const updated = { ...prev };
        if (updated[data.date]) {
          updated[data.date] = updated[data.date].map((s) =>
            s._id === data.slotId ? { ...s, isBooked: true } : s
          );
        }
        return updated;
      });
      // If the booked slot was selected, deselect it
      if (selectedSlot === data.slotId) {
        setSelectedSlot(null);
        setSelectedTime('');
      }
    };

    socket.on('slot-booked', handleSlotBooked);

    return () => {
      socket.emit('leave-expert-room', id);
      socket.off('slot-booked', handleSlotBooked);
    };
  }, [id, selectedSlot]);

  const handleSlotSelect = (slotId, time) => {
    setSelectedSlot(slotId);
    setSelectedTime(time);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Experts</button>
      <div className="empty-state">
        <div className="icon">⚠️</div>
        <h3>Error Loading Expert</h3>
        <p>{error}</p>
      </div>
    </div>
  );
  if (!expert) return <div className="empty-state"><h3>Expert not found</h3></div>;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=5b0fa8&color=fff&size=120`;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Experts</button>
      <div className="detail-layout">
        {/* Left Panel */}
        <div className="detail-main">
          <div className="detail-header">
            <img className="detail-avatar" src={avatarUrl} alt={expert.name} />
            <div className="detail-info">
              <div className="name">{expert.name}</div>
              <div className="tags">
                <span className="tag">{expert.category}</span>
                {expert.languages?.map((l) => (
                  <span key={l} className="tag" style={{ background: 'var(--primary-light)' }}>{l}</span>
                ))}
              </div>
              <div className="detail-meta">
                <span><StarRating rating={expert.rating} /></span>
                <span><strong>{expert.experience}</strong> Yrs Exp</span>
                <span><strong>{expert.totalSessions}</strong> Sessions</span>
                <span><strong>₹{expert.pricePerSession}</strong> / session</span>
              </div>
            </div>
          </div>

          <div className="detail-bio">
            <h3>About</h3>
            <p>{expert.bio}</p>
          </div>

          <SlotPicker
            dates={slots}
            slotDetails={slotDetails}
            bookedSlots={bookedSlots}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={(d) => { setSelectedDate(d); setSelectedSlot(null); setSelectedTime(''); }}
            onSlotSelect={handleSlotSelect}
          />

          {selectedSlot && (
            <div className="slot-action">
              <button
                className="book-now-btn"
                style={{ maxWidth: '300px' }}
                onClick={() => navigate(`/book/${expert._id}/${selectedSlot}?date=${selectedDate}&time=${encodeURIComponent(selectedTime)}`)}
              >
                Book This Slot →
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="detail-sidebar">
          <h3>Similar Experts</h3>
          {similar.map((s) => (
            <div key={s._id} className="similar-card" onClick={() => navigate(`/expert/${s._id}`)}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=5b0fa8&color=fff&size=48`}
                alt={s.name}
              />
              <div className="info">
                <div className="name">{s.name}</div>
                <div className="cat">{s.category} · {s.experience} Yrs · ★ {s.rating}</div>
              </div>
            </div>
          ))}
          {similar.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No similar experts found</p>
          )}
        </div>
      </div>
    </div>
  );
}
