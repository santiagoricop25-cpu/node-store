import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [wished, setWished] = useState(false);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="product-card">
      <div className="product-card-media">
        {discount && <span className="discount-badge">-{discount}%</span>}
        <button
          type="button"
          className={`wish-btn ${wished ? 'active' : ''}`}
          onClick={() => setWished((w) => !w)}
          aria-label="Agregar a favoritos"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
            <path d="M12.1 21s-7.1-4.35-9.6-9.05C.86 8.9 2.14 5.4 5.5 4.6c2-.48 3.9.4 5.1 2.1a5.6 5.6 0 0 1 1.5-1.6c1.55-1.1 3.8-1.15 5.4.05 2.4 1.8 2.9 5.2 1.1 8.35C16.1 17.4 12.1 21 12.1 21z" />
          </svg>
        </button>
        <Link to={`/producto/${product.id}`}>
          <img src={product.image} alt={product.title} loading="lazy" />
        </Link>
      </div>
      <div className="product-card-body">
        <Link to={`/producto/${product.id}`} className="product-card-title">
          {product.title}
        </Link>
        <div className="product-card-price">
          <span className="price-now">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
        </div>
        <button className="btn btn-buy btn-block buy-btn" onClick={() => addItem(product, 1)}>
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
