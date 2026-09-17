import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/catalog.js';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="brand">
            tienda<span className="brand-muted">.ricops.com</span>
          </div>
          <p className="lead">
            Construida desde cero, a la medida — corriendo en mi propio servidor con
            Proxmox, Coolify y Cloudflare.
          </p>
        </div>
        <div className="footer-col">
          <h4>Categorías</h4>
          <ul>
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link to={`/categoria/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Mi cuenta</h4>
          <ul>
            <li><Link to="/ingresar">Ingresar</Link></li>
            <li><Link to="/registro">Crear cuenta</Link></li>
            <li><Link to="/carrito">Carrito</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Estado del proyecto</h4>
          <div className="progress">
            <div className="row"><span>Backend + autenticación</span><span className="tag done">Listo</span></div>
            <div className="row"><span>Catálogo y tienda</span><span className="tag wip">En progreso</span></div>
            <div className="row"><span>Pagos (Wompi)</span><span className="tag next">Próximo</span></div>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>&copy; {year} ricops.com</span>
        <span className="mono">proxmox + coolify + cloudflare</span>
      </div>
    </footer>
  );
}
