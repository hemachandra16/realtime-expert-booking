import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BookingForm() {
  const { expertId, slotId } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || '';
  const timeSlot = searchParams.get('time') || '';

  const [expert, setExpert] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    setFetchLoading(true);
    axios.get(`${API}/api/experts/${expertId}`)
      .then(({ data }) => setExpert(data.expert))
      .catch((err) => {
        console.error(err);
        setFetchError('Failed to load expert details.');
      })
      .finally(() => setFetchLoading(false));
  }, [expertId]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be exactly 10 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setConflict(false);
    try {
      const { data } = await axios.post(`${API}/api/bookings`, {
        expertId, slotId, date, timeSlot,
        name: form.name, email: form.email, phone: form.phone, notes: form.notes
      });
      setSuccess(data);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict(true);
      } else if (err.response?.data?.errors) {
        const fieldErrs = {};
        err.response.data.errors.forEach((e) => { fieldErrs[e.path] = e.msg; });
        setErrors(fieldErrs);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  if (fetchLoading) return <div className="booking-page"><LoadingSpinner /></div>;
  if (fetchError) return (
    <div className="booking-page">
      <div className="error-card">
        <h2>⚠️ Error</h2>
        <p>{fetchError}</p>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="booking-page">
        <div className="success-card">
          <div className="check">✅</div>
          <h2>Booking Confirmed!</h2>
          <p><strong>{expert?.name}</strong></p>
          <p>📅 {date} &nbsp; 🕐 {timeSlot}</p>
          <p>Booked by: {form.name} ({form.email})</p>
          <Link to="/my-bookings" className="view-btn">View My Bookings</Link>
        </div>
      </div>
    );
  }

  if (conflict) {
    return (
      <div className="booking-page">
        <div className="error-card">
          <h2>⚠️ Slot Unavailable</h2>
          <p>This slot was just booked by someone else. Please go back and choose another slot.</p>
          <Link to={`/expert/${expertId}`} className="view-btn" style={{ display: 'inline-block', marginTop: '16px', background: 'var(--primary)', color: '#fff', padding: '12px 28px', borderRadius: '999px', fontWeight: 600 }}>
            ← Choose Another Slot
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = expert ? `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=5b0fa8&color=fff&size=56` : '';

  return (
    <div className="booking-page">
      <div className="booking-card">
        <h2>Confirm Your Booking</h2>

        {expert && (
          <div className="booking-summary">
            <img src={avatarUrl} alt={expert.name} />
            <div className="info">
              <h4>{expert.name}</h4>
              <p>{expert.category} · ₹{expert.pricePerSession} / session</p>
              <p>📅 {date} &nbsp; 🕐 {timeSlot}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {errors.general && <div className="field-error" style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.95rem' }}>{errors.general}</div>}
          <div className="form-group">
            <label>Full Name <span className="req">*</span></label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} type="text" value={form.name} onChange={handleChange('name')} placeholder="Enter your full name" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email <span className="req">*</span></label>
            <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" value={form.email} onChange={handleChange('email')} placeholder="your@email.com" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Phone <span className="req">*</span></label>
            <input className={`form-input ${errors.phone ? 'error' : ''}`} type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="10-digit phone number" />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
          <div className="form-group">
            <label>Date</label>
            <input className="form-input" type="text" value={date} readOnly />
          </div>
          <div className="form-group">
            <label>Time Slot</label>
            <input className="form-input" type="text" value={timeSlot} readOnly />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea className="form-input form-textarea" value={form.notes} onChange={handleChange('notes')} placeholder="Any specific topics or questions..." />
          </div>
          <button className="submit-btn" type="submit" disabled={submitting}>
            {submitting ? <><LoadingSpinner small /> Confirming...</> : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
