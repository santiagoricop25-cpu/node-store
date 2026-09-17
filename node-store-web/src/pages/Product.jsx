import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getProductsByCategory } from '../data/catalog.js';
import { formatPrice } from '../lib/format.js';
import StarRating from '../components/StarRating.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProduct(id);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container not-found">
        <h1>Producto no encontrado</h1>
        <Link to="/" className="btn">Volver al inicio</Link>
      </div>
    );
  }

  const related = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 6);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem(product, qty);
    navigate('/carrito');
  }

  return (
    <div className="container product-page">
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link> / <Link to={`/categoria/${product.category}`}>{product.category}</Link> /{' '}
        <span>{product.title}</span>
      </nav>

      <div className="product-layout">
        <div className="gallery">
          <div className="gallery-main">
            {discount && <span className="discount-badge">-{discount}%</span>}
            <img src={product.gallery[activeImage]} alt={product.title} />
          </div>
          <div className="gallery-thumbs">
            {product.gallery.map((src, i) => (
              <button
                key={src}
                className={`thumb ${i === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(i)}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <span className="brand-tag">{product.brand}</span>
          <h1>{product.title}</h1>
          <StarRating rating={product.rating} reviews={product.reviews} size="lg" />

          <div className="info-description">
            <p>{product.description}</p>
            <ul>
              {product.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="buy-box card">
          <div className="buy-price">
            <span className="price-now mono">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="price-old mono">{formatPrice(product.oldPrice)}</span>}
          </div>
          {product.freeShipping && <span className="pill good">🚚 envío gratis</span>}

          <div className="buy-stock">
            {product.stock > 0 ? (
              <span className="pill accent">{product.stock} disponibles</span>
            ) : (
              <span className="pill">agotado</span>
            )}
          </div>

          <div className="qty-row">
            <label htmlFor="qty">Cantidad</label>
            <div className="qty-control">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">−</button>
              <input
                id="qty"
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
              />
              <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Más">+</button>
            </div>
          </div>

          <button className="btn btn-buy btn-block" onClick={handleBuyNow} disabled={product.stock === 0}>
            Comprar ahora
          </button>
          <button className="btn btn-block" onClick={handleAdd} disabled={product.stock === 0}>
            {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
          </button>

          <div className="buy-meta">
            <div>🔒 Pago seguro — próximamente con Wompi</div>
            <div>↩️ 30 días para devoluciones</div>
            <div>🏠 Vendido y enviado por ricops.com</div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2>Productos relacionados</h2>
          <div className="related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
