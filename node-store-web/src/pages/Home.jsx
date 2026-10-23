import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { CATEGORIES, PRODUCTS, getProductsByCategory } from '../data/catalog.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/format.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import './Home.css';

const SHOWCASE_SIZE = 6;
const SHOWCASE_MS = 5000;

function discountOf(p) {
  return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
}

const HOW_TO_BUY = [
  {
    group: 'Envío',
    items: [
      ['Envío regular gratis', 'Llega en 5 a 7 días hábiles a la dirección que elijas, sin costo.'],
      ['Express por $12.900', 'Llega en 1 o 2 días hábiles.'],
      ['Entrega programada por $5.900', 'Tú eliges la fecha en que lo recibes.'],
      ['Varias direcciones', 'Guarda la de la casa y la de la oficina y escoge en cada compra.'],
    ],
  },
  {
    group: 'Pago',
    items: [
      ['Contra entrega', 'Pagas en efectivo o con datáfono cuando el pedido llega a tu puerta.'],
      ['Transferencia bancaria', 'Te enviamos los datos de la cuenta por correo al confirmar.'],
      ['Tarjeta con Wompi', 'El pago en línea con tarjeta llega muy pronto.'],
      ['Precios en pesos', 'Lo que ves es lo que pagas, sin conversión de moneda.'],
    ],
  },
  {
    group: 'Tu cuenta',
    items: [
      ['Carrito guardado', 'Cierra la pestaña y tu carrito sigue ahí cuando vuelvas.'],
      ['Favoritos', 'Toca el corazón de un producto para guardarlo para después.'],
      ['Direcciones guardadas', 'No vuelves a escribir tu dirección en cada compra.'],
      ['Recuperar contraseña', 'Te enviamos un enlace al correo para crear una nueva.'],
    ],
  },
];

export default function Home() {
  // Se suscribe al catálogo: cuando GET /products responde, PRODUCTS se
  // reemplaza y `ready` cambia, forzando este render a leer los datos reales.
  const { ready } = useProducts();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [shown, setShown] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dealActive, setDealActive] = useState(0);
  const [dealAdded, setDealAdded] = useState(false);
  const [query, setQuery] = useState('');

  // Vitrina de la portada: el mejor calificado de cada categoría.
  const showcase = useMemo(
    () =>
      CATEGORIES.map((c) => [...getProductsByCategory(c.slug)].sort((a, b) => b.rating - a.rating)[0])
        .filter(Boolean)
        .slice(0, SHOWCASE_SIZE),
    [ready]
  );
  const featured = showcase[shown % Math.max(showcase.length, 1)];

  useEffect(() => {
    if (paused || showcase.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setTimeout(() => setShown((i) => (i + 1) % showcase.length), SHOWCASE_MS);
    return () => clearTimeout(t);
  }, [shown, paused, showcase.length]);

  const minPrice = useMemo(() => Math.min(...PRODUCTS.map((p) => p.price)), [ready]);

  const deals = useMemo(
    () => PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => discountOf(b) - discountOf(a)).slice(0, 8),
    [ready]
  );
  const deal = deals[dealActive] || deals[0];

  const sheet = useMemo(
    () => CATEGORIES.map((c) => ({ ...c, products: getProductsByCategory(c.slug) })).filter((c) => c.products.length),
    [ready]
  );

  function addDeal() {
    if (!deal) return;
    addItem(deal, 1);
    setDealAdded(true);
    setTimeout(() => setDealAdded(false), 1400);
  }

  function onSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="home">
      <section className="hero band band-white" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="kicker">Tienda en línea · Colombia</p>
            <h1 id="hero-title" className="hero-title">
              <span className="line"><span><span className="tint-green">Pídelo</span> hoy.</span></span>
              <span className="line"><span><span className="tint-blue">Págalo</span> en casa.</span></span>
            </h1>
            <p className="hero-lead">
              Tecnología, hogar, moda y más: {PRODUCTS.length} productos con envío regular gratis
              y pago contra entrega.
            </p>
            <div className="price-stack">
              <span>Desde {formatPrice(minPrice)}</span>
              <a href="#catalogo" className="btn btn-accent">Comprar</a>
              <a href="#rebajas" className="btn">Ver rebajas</a>
            </div>
          </div>

          {featured && (
            <div
              className="showcase"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <Link to={`/producto/${featured.id}`} className="showcase-media" aria-label={featured.title}>
                <img key={featured.id} src={featured.image} alt="" width="600" height="600" />
              </Link>
              <div className="showcase-caption" aria-live="polite">
                <div>
                  <p className="showcase-title">{featured.title}</p>
                  <p className="muted">{formatPrice(featured.price)}</p>
                </div>
                <Link to={`/producto/${featured.id}`} className="section-link">Ver producto</Link>
              </div>
              <div className="showcase-dots" role="tablist" aria-label="Productos destacados">
                {showcase.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === shown}
                    aria-label={p.title}
                    className={i === shown ? 'active' : ''}
                    onClick={() => setShown(i)}
                  >
                    {i === shown && !paused && <span className="dot-progress" style={{ animationDuration: `${SHOWCASE_MS}ms` }} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="band band-canvas cats" aria-labelledby="cats-title">
        <div className="container">
          <Reveal as="h2" id="cats-title" className="band-title">Compra por categoría.</Reveal>
          <div className="cats-grid">
            {sheet.map((c, i) => (
              <Reveal key={c.slug} delay={i * 50}>
                <Link to={`/categoria/${c.slug}`} className="cat-card">
                  <img src={c.products[0].image} alt="" width="200" height="200" loading="lazy" />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-count">{c.products.length} productos</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {deal && (
        <section className="band band-white" id="rebajas" aria-labelledby="deals-title">
          <div className="container">
            <Reveal className="section-head">
              <h2 id="deals-title" className="band-title"><span className="tint-orange">Rebajas</span> de la semana.</h2>
            </Reveal>
            <Reveal className="deals-card">
              <ul className="deals-list">
                {deals.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      to={`/producto/${p.id}`}
                      className={`deal-row ${i === dealActive ? 'active' : ''}`}
                      onMouseEnter={() => setDealActive(i)}
                      onFocus={() => setDealActive(i)}
                    >
                      <span className="deal-name">{p.title}</span>
                      <span className="deal-value">
                        <span className="deal-off">-{discountOf(p)}%</span>
                        {formatPrice(p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="deal-feature">
                <Link to={`/producto/${deal.id}`} className="deal-feature-media" tabIndex={-1} aria-hidden="true">
                  <img key={deal.id} src={deal.image} alt="" width="600" height="600" />
                </Link>
                <div className="deal-feature-body">
                  <p className="deal-feature-title">{deal.title}</p>
                  <div className="price-stack">
                    <span>
                      {formatPrice(deal.price)} <s className="muted">{formatPrice(deal.oldPrice)}</s>
                    </span>
                    <button type="button" className="btn btn-accent" onClick={addDeal}>
                      {dealAdded ? 'Agregado' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="band band-canvas" id="catalogo" aria-labelledby="sheet-title">
        <div className="container">
          <Reveal className="section-head">
            <h2 id="sheet-title" className="band-title">Todo el catálogo.</h2>
            <span className="muted">{PRODUCTS.length} productos en {sheet.length} categorías</span>
          </Reveal>
          {sheet.map((c) => (
            <div className="sheet-run" key={c.slug}>
              <Reveal className="sheet-run-head">
                <h3>{c.name}</h3>
                <Link to={`/categoria/${c.slug}`} className="section-link">Ver los {c.products.length}</Link>
              </Reveal>
              <div className="sheet-row">
                {c.products.slice(0, 4).map((p, i) => (
                  <Reveal key={p.id} delay={i * 70}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band band-white" aria-labelledby="how-title">
        <div className="container">
          <Reveal as="h2" id="how-title" className="band-title how-title">
            Así de <span className="tint-teal">fácil</span> es comprar.
          </Reveal>
          <div className="how-grid">
            {HOW_TO_BUY.map((g, gi) => (
              <Reveal className="how-col" key={g.group} delay={gi * 80}>
                <h3>{g.group}</h3>
                {g.items.map(([label, detail]) => (
                  <details className="pill-disclosure" key={label}>
                    <summary>
                      <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                      {label}
                    </summary>
                    <p>{detail}</p>
                  </details>
                ))}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-canvas" aria-labelledby="closing-title">
        <div className="container">
          <Reveal className="closing-card">
            <h2 id="closing-title" className="band-title">
              ¿Ya sabes lo que <span className="tint-blue">buscas</span>?
            </h2>
            <p className="closing-lead">Escríbelo y te mostramos lo que tenemos.</p>
            <form className="closing-form" onSubmit={onSearch} role="search">
              <label htmlFor="closing-q" className="visually-hidden">Buscar productos</label>
              <input
                id="closing-q"
                className="input"
                type="search"
                placeholder="Audífonos, licuadora, carpa…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-accent">
                <Search size={18} /> Buscar
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
