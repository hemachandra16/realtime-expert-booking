export default function StarRating({ rating }) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i === full && hasHalf) {
      stars.push(<span key={i} className="star filled" style={{ opacity: 0.5 }}>★</span>);
    } else {
      stars.push(<span key={i} className="star">★</span>);
    }
  }

  return (
    <div className="star-rating">
      {stars}
      <span className="rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}
