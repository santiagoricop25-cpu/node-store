import { Link } from 'react-router-dom';
import { CATEGORIES, getProductsByCategory } from '../data/catalog.js';
import CategoryRail from '../components/CategoryRail.jsx';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero container">
        <div className="hero-panel">
          <div className="eyebrow">// e-commerce · hecho a la medida</div>
          <h1>
            Todo lo que buscas, en un solo lugar<span className="cursor" />
          </h1>
          <p className="lead">
            Miles de productos en tecnología, hogar, moda y más — con envío rápido y
            pagos seguros. Construida y operada en mi propio servidor.
          </p>
          <div className="hero-ctas">
            <Link to="/categoria/tecnologia" className="btn btn-buy">
              Ver ofertas de tecnología
            </Link>
            <Link to="/categoria/hogar" className="btn">
              Explorar hogar
            </Link>
          </div>
        </div>
        <div className="hero-badges">
          <div className="badge-card card">
            <span className="badge-icon">🚚</span>
            <div>
              <strong>Envío gratis</strong>
              <span>en compras desde $100.000</span>
            </div>
          </div>
          <div className="badge-card card">
            <span className="badge-icon">🔒</span>
            <div>
              <strong>Compra protegida</strong>
              <span>tus datos viajan cifrados</span>
            </div>
          </div>
          <div className="badge-card card">
            <span className="badge-icon">↩️</span>
            <div>
              <strong>Devoluciones fáciles</strong>
              <span>30 días para cambios</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container category-shortcuts">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/categoria/${c.slug}`} className="shortcut card">
            <span className="shortcut-emoji">{c.emoji}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </div>

      <div className="container">
        {CATEGORIES.map((c) => (
          <CategoryRail key={c.slug} category={c} products={getProductsByCategory(c.slug).slice(0, 8)} />
        ))}
      </div>
    </div>
  );
}
