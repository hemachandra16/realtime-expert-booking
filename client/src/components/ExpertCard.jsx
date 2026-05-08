import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

const badges = ['Top Choice', 'Featured', 'Popular', 'Rising Star'];

export default function ExpertCard({ expert, index }) {
  const navigate = useNavigate();
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=5b0fa8&color=fff&size=80`;
  const badge = index % 3 === 0 ? badges[index % badges.length] : null;

  return (
    <div className="expert-card">
      {badge && <div className="badge-top">{badge}</div>}
      <img className="avatar" src={avatarUrl} alt={expert.name} />
      <div className="name">{expert.name}</div>
      <span className="category-tag">{expert.category}</span>
      <div className="rating-row">
        <StarRating rating={expert.rating} />
        <span className="meta">({expert.totalSessions})</span>
      </div>
      <div className="meta">{expert.experience} Yrs Experience</div>
      <div className="price">₹{expert.pricePerSession} / session</div>
      <button className="book-now-btn" onClick={() => navigate(`/expert/${expert._id}`)}>
        Book Now
      </button>
    </div>
  );
}
