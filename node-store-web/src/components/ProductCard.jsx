import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatPrice } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const [pop, setPop] = useState(false);
  const wished = isWished(product.id);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  function handleWish() {
    toggle(product);
    setPop(true);
    setTimeout(() => setPop(false), 400);
  }

  function handleAdd() {
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="product-card">
      <div className="product-card-media">
        {discount && <span className="discount-badge">-{discount}%</span>}
        <button
          type="button"
          className={`wish-btn icon-anim ${wished ? 'active' : ''} ${pop ? 'heart-pop' : ''}`}
          onClick={handleWish}
          aria-label="Agregar a favoritos"
        >
          <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
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
        <button className="btn btn-buy btn-block buy-btn" onClick={handleAdd}>
          {justAdded ? '✓ Agregado' : 'Comprar ahora'}
        </button>
      </div>
    </div>
  );
}
