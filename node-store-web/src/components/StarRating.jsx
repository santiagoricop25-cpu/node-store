import { formatRating } from '../lib/format.js';
import './StarRating.css';

export default function StarRating({ rating, reviews, size = 'md' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return 'full';
    if (i === full && half) return 'half';
    return 'empty';
  });

  return (
    <span className={`star-rating star-rating-${size}`} aria-label={`${formatRating(rating)} de 5 estrellas`}>
      <span className="stars" aria-hidden="true">
        {stars.map((s, i) => (
          <span key={i} className={`star star-${s}`}>
            ★
          </span>
        ))}
      </span>
      {reviews != null && <span className="reviews">({reviews.toLocaleString('es-CO')})</span>}
    </span>
  );
}
