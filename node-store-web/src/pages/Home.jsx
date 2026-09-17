import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES, PRODUCTS, getProductsByCategory } from '../data/catalog.js';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import './Home.css';

const TABS = [
  { key: 'nuevos', label: 'Nuevos' },
  { key: 'vendidos', label: 'Más vendidos' },
  { key: 'destacados', label: 'Destacados' },
];

const PROMO_BANNERS = [
  {
    title: 'Audio y sonido',
    text: 'Audífonos y parlantes con cancelación de ruido y batería de larga duración.',
    to: '/categoria/tecnologia',
    tone: 'light',
  },
  {
    title: 'Todo para tu hogar',
    text: 'Electrodomésticos y organización pensados para hacer tu día a día más fácil.',
    to: '/categoria/hogar',
    tone: 'muted',
    cta: true,
  },
  {
    title: 'Moda de temporada',
    text: 'Ropa y accesorios cómodos, versátiles y con envío rápido.',
    to: '/categoria/moda',
    tone: 'light',
  },
  {
    title: 'Vida activa',
    text: 'Equipo deportivo y de entrenamiento para cada nivel.',
    to: '/categoria/deportes',
    tone: 'dark',
  },
];

const POPULAR = [
  { title: 'Tecnología', text: 'Los últimos gadgets con la mejor relación precio-calidad, elegidos para ti.', slug: 'tecnologia', tone: 'dark' },
  { title: 'Hogar y Cocina', text: 'Todo lo que necesitas para equipar tu casa desde cero o renovarla.', slug: 'hogar', tone: 'light' },
  { title: 'Belleza', text: 'Cuidado personal y rutinas completas a un clic de distancia.', slug: 'belleza', tone: 'light' },
  { title: 'Herramientas', text: 'Equipo profesional para tus proyectos y reparaciones en casa.', slug: 'herramientas', tone: 'dark' },
];

export default function Home() {
  const [tab, setTab] = useState('nuevos');
  // Se suscribe al catálogo: cuando GET /products responde, PRODUCTS se
  // reemplaza y `ready` cambia, forzando este render a leer los datos reales.
  const { ready } = useProducts();

  const tabProducts = useMemo(() => {
    const list = [...PRODUCTS];
    if (tab === 'vendidos') return list.sort((a, b) => b.reviews - a.reviews).slice(0, 8);
    if (tab === 'destacados') return list.sort((a, b) => b.rating - a.rating).slice(0, 8);
    return list.slice(0, 8);
  }, [tab, ready]);

  const discounted = PRODUCTS.filter((p) => p.oldPrice).slice(0, 4);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Tienda online</span>
            <h1>Todo lo que buscas, en un solo lugar</h1>
            <p>
              Miles de productos en tecnología, hogar, moda y más — con envío rápido y
              pagos seguros.
            </p>
            <Link to="/categoria/tecnologia" className="btn btn-outline-light">Comprar ahora</Link>
          </div>
          <div className="hero-media">
            <img src={getProductsByCategory('tecnologia')[0]?.image} alt="Producto destacado" />
          </div>
        </div>
      </section>

      <section className="container promo-row">
        {PROMO_BANNERS.map((b, i) => (
          <Reveal key={b.title} delay={i * 70} as="div">
            <Link to={b.to} className={`promo-card tone-${b.tone}`}>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
              {b.cta && (
                <span className="promo-cta">
                  Comprar ahora <ArrowRight size={14} />
                </span>
              )}
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="container cats-section">
        <Reveal>
          <div className="section-head">
            <h2>Explora por categoría</h2>
          </div>
        </Reveal>
        <div className="cats-row">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 40} as="div">
              <Link to={`/categoria/${c.slug}`} className="cat-tile">
                <span className="cat-tile-icon">{c.emoji}</span>
                <span>{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container products-section">
        <div className="tabs-row">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid-4">
          {tabProducts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container popular-section">
        <Reveal>
          <div className="section-head">
            <h2>Productos populares</h2>
          </div>
        </Reveal>
        <div className="popular-row">
          {POPULAR.map((b, i) => (
            <Reveal key={b.slug} delay={i * 70} as="div">
              <Link to={`/categoria/${b.slug}`} className={`popular-card tone-${b.tone}`}>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                <span className="promo-cta">
                  Comprar ahora <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {discounted.length > 0 && (
        <section className="container discounts-section">
          <Reveal>
            <div className="section-head">
              <h2>Descuentos hasta -50%</h2>
              <Link to="/categoria/tecnologia" className="see-all">Ver todo →</Link>
            </div>
          </Reveal>
          <div className="grid-4">
            {discounted.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Reveal as="section" className="container sale-banner">
        <div className="sale-banner-inner">
          <span className="hero-eyebrow">Oferta de temporada</span>
          <h2>Gran Venta de Verano</h2>
          <p>Hasta 50% de descuento en cientos de productos seleccionados, por tiempo limitado.</p>
          <Link to="/categoria/tecnologia" className="btn btn-outline-light">Comprar ahora</Link>
        </div>
      </Reveal>
    </div>
  );
}
