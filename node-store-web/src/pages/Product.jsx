import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Truck, PackageCheck, ShieldCheck } from 'lucide-react';
import { getProduct, getProductsByCategory, getCategory } from '../data/catalog.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { formatPrice, formatRating } from '../lib/format.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './Product.css';

const SAMPLE_REVIEWS = [
  { name: 'María Gómez', date: '24 enero, 2026', rating: 5, text: 'Excelente calidad, llegó antes de lo esperado y tal cual la descripción.' },
  { name: 'Carlos Pérez', date: '11 enero, 2026', rating: 4, text: 'Muy buen producto, cumple con lo prometido. El empaque podría mejorar.' },
];

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  useProducts(); // se suscribe para re-renderizar cuando llegue el catálogo real
  const product = getProduct(id);
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const wished = product ? isWished(product.id) : false;

  if (!product) {
    return (
      <div className="container not-found">
        <h1>Producto no encontrado</h1>
        <Link to="/" className="btn">Volver al inicio</Link>
      </div>
    );
  }

  const category = getCategory(product.category);
  const related = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  const dist = [
    { label: 'Excelente', pct: 78 },
    { label: 'Bueno', pct: 14 },
    { label: 'Regular', pct: 5 },
    { label: 'Malo', pct: 2 },
    { label: 'Pésimo', pct: 1 },
  ];

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
        <Link to="/">Inicio</Link> / <Link to={`/categoria/${product.category}`}>{category?.name}</Link> /{' '}
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

        <aside className="buy-box">
          <span className="brand-tag">{product.brand}</span>
          <h1>{product.title}</h1>

          <div className="rating-row">
            <span className="stars-inline">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span className="rating-num">{formatRating(product.rating)}</span>
            <span className="reviews-count">({product.reviews.toLocaleString('es-CO')} reseñas)</span>
          </div>

          <div className="buy-price">
            <span className="price-now">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
          </div>

          <div className="spec-facts">
            {product.bullets.slice(0, 3).map((b) => (
              <div className="spec-fact" key={b}>
                <span className="spec-fact-icon">✓</span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="qty-row">
            <span>Cantidad</span>
            <div className="qty-control">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">−</button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
              />
              <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Más">+</button>
            </div>
            {product.stock > 0 ? (
              <span className="pill accent">{product.stock} disponibles</span>
            ) : (
              <span className="pill">agotado</span>
            )}
          </div>

          <div className="buy-actions">
            <button className={`btn wish-toggle icon-anim ${wished ? 'active' : ''}`} onClick={() => toggle(product)}>
              <Heart size={15} fill={wished ? 'currentColor' : 'none'} /> {wished ? 'En favoritos' : 'Agregar a favoritos'}
            </button>
            <button className="btn btn-buy" onClick={handleAdd} disabled={product.stock === 0}>
              {added ? '✓ Agregado' : 'Agregar al carrito'}
            </button>
          </div>
          <button className="btn btn-accent btn-block" onClick={handleBuyNow} disabled={product.stock === 0}>
            Comprar ahora
          </button>

          <div className="trust-row">
            <div><Truck size={15} /> Entrega en 1-2 días</div>
            <div><PackageCheck size={15} /> En stock hoy</div>
            <div><ShieldCheck size={15} /> Garantía de 1 año</div>
          </div>
        </aside>
      </div>

      <section className="description-section">
        <h2>Descripción</h2>
        <p className={showFullDesc ? 'expanded' : ''}>{product.description}</p>
        <button className="more-link" onClick={() => setShowFullDesc((v) => !v)}>
          {showFullDesc ? 'ver menos' : 'ver más...'}
        </button>
        <ul className="bullets-list">
          {product.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="reviews-section">
        <h2>Reseñas</h2>
        <div className="reviews-summary">
          <div className="reviews-score">
            <span className="score-num">{formatRating(product.rating)}</span>
            <span className="stars-inline">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span>de {product.reviews.toLocaleString('es-CO')} reseñas</span>
          </div>
          <div className="reviews-bars">
            {dist.map((d) => (
              <div className="bar-row" key={d.label}>
                <span>{d.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="bar-pct mono">{d.pct}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="reviews-list">
          {SAMPLE_REVIEWS.map((r) => (
            <div className="review-item" key={r.name}>
              <div className="review-avatar">{r.name[0]}</div>
              <div className="review-body">
                <div className="review-head">
                  <strong>{r.name}</strong>
                  <span>{r.date}</span>
                </div>
                <span className="stars-inline sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <p>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <div className="section-head">
            <h2>Productos relacionados</h2>
          </div>
          <div className="related-grid">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
