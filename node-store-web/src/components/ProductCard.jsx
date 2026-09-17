import { Link } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import { formatPrice } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="product-card card">
      <Link to={`/producto/${product.id}`} className="product-card-media">
        {discount && <span className="discount-badge">-{discount}%</span>}
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-card-body">
        <Link to={`/producto/${product.id}`} className="product-card-title">
          {product.title}
        </Link>
        <StarRating rating={product.rating} reviews={product.reviews} size="sm" />
        <div className="product-card-price">
          <span className="price-now mono">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="price-old mono">{formatPrice(product.oldPrice)}</span>}
        </div>
        {product.freeShipping && <span className="pill good">envío gratis</span>}
        <button className="btn btn-buy btn-block btn-sm add-btn" onClick={() => addItem(product, 1)}>
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
