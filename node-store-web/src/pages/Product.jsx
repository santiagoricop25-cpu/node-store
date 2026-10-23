import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Minus, Plus, Star } from 'lucide-react';
import { getProduct, getProductsByCategory, getCategory } from '../data/catalog.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { formatPrice, formatRating } from '../lib/format.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './Product.css';

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
  const wished = product ? isWished(product.id) : false;

  if (!product) {
    return (
      <div className="container product-missing">
        <h1>No encontramos este producto</h1>
        <p>Puede que ya no esté en el catálogo o que el enlace esté incompleto.</p>
        <Link to="/" className="btn btn-accent">Volver al inicio</Link>
      </div>
    );
  }

  const category = getCategory(product.category);
  const related = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const soldOut = product.stock === 0;

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
    <div className="container page product-page">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/">Inicio</Link> / <Link to={`/categoria/${product.category}`}>{category?.name}</Link> /{' '}
        <span>{product.title}</span>
      </nav>

      <div className="product-layout">
        <div className="gallery">
          <div className="gallery-main">
            <img key={gallery[activeImage]} src={gallery[activeImage]} alt={product.title} width="600" height="600" />
            {discount && <span className="gallery-off">-{discount}%</span>}
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`thumb ${i === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ver imagen ${i + 1} de ${gallery.length}`}
                  aria-pressed={i === activeImage}
                >
                  <img src={src} alt="" width="120" height="120" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="buy-box">
          <p className="buy-brand">{product.brand}</p>
          <h1>{product.title}</h1>

          <p className="buy-rating">
            <Star size={16} fill="currentColor" aria-hidden="true" />
            <strong>{formatRating(product.rating)}</strong>
            <span>· {product.reviews.toLocaleString('es-CO')} calificaciones</span>
          </p>

          <div className="buy-price">
            <span className="buy-price-now">{formatPrice(product.price)}</span>
            {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
          </div>

          <ul className="buy-bullets">
            {product.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <div className="buy-qty">
            <span id="qty-label">Cantidad</span>
            <div className="qty-control" role="group" aria-labelledby="qty-label">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Quitar uno" disabled={qty <= 1}>
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                aria-label="Cantidad"
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
              />
              <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Agregar uno" disabled={qty >= product.stock}>
                <Plus size={16} />
              </button>
            </div>
            <span className="buy-stock">{soldOut ? 'Agotado' : `${product.stock} disponibles`}</span>
          </div>

          <div className="buy-actions">
            <button className="btn btn-accent" onClick={handleBuyNow} disabled={soldOut}>
              Comprar ahora
            </button>
            <button className="btn btn-light" onClick={handleAdd} disabled={soldOut}>
              {added ? 'Agregado al carrito' : 'Agregar al carrito'}
            </button>
            <button
              className={`btn wish-toggle ${wished ? 'active' : ''}`}
              onClick={() => toggle(product)}
              aria-pressed={wished}
              aria-label={wished ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>

          <dl className="buy-terms">
            <div><dt>Envío</dt><dd>Regular gratis en 5 a 7 días, o express en 1 a 2 días por $12.900.</dd></div>
            <div><dt>Pago</dt><dd>Contra entrega o por transferencia bancaria.</dd></div>
          </dl>
        </div>
      </div>

      <section className="product-about" aria-labelledby="about-title">
        <h2 id="about-title">Sobre este producto</h2>
        <p>{product.description}</p>
      </section>

      {related.length > 0 && (
        <section className="related" aria-labelledby="related-title">
          <div className="section-head">
            <h2 id="related-title">Más de {category?.name}</h2>
            <Link to={`/categoria/${product.category}`} className="section-link">Ver todo</Link>
          </div>
          <div className="related-grid">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
