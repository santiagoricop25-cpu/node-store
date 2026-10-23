import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Check } from 'lucide-react';
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
  const soldOut = product.stock === 0;

  function handleWish() {
    toggle(product);
    setPop(true);
    setTimeout(() => setPop(false), 400);
  }

  function handleAdd() {
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={`/producto/${product.id}`} tabIndex={-1} aria-hidden="true">
          <img src={product.image} alt="" loading="lazy" width="600" height="600" />
        </Link>
        {discount && <span className="product-card-off">-{discount}%</span>}
        <button
          type="button"
          className={`wish-btn ${wished ? 'active' : ''} ${pop ? 'heart-pop' : ''}`}
          onClick={handleWish}
          aria-pressed={wished}
          aria-label={wished ? `Quitar ${product.title} de favoritos` : `Guardar ${product.title} en favoritos`}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-card-body">
        {product.brand && <p className="product-card-brand">{product.brand}</p>}
        <Link to={`/producto/${product.id}`} className="product-card-title">
          {product.title}
        </Link>
        <div className="product-card-buy">
          <div className="product-card-price">
            <span className="price-now">{formatPrice(product.price)}</span>
            {product.oldPrice && <s className="price-old">{formatPrice(product.oldPrice)}</s>}
          </div>
          <button
            type="button"
            className={`add-btn ${justAdded ? 'done' : ''}`}
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`Agregar ${product.title} al carrito`}
          >
            {justAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
            <span>{soldOut ? 'Agotado' : justAdded ? 'Listo' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
