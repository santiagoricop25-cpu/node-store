import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/catalog.js';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div className="container">
        <h2 id="footer-title" className="footer-title">tienda</h2>
        <p className="footer-note">
          Precios en pesos colombianos. Envío regular gratis en 5 a 7 días
          hábiles; express en 1 a 2 días por $12.900. El pago en línea con tarjeta llega pronto: por ahora
          pagas contra entrega o por transferencia.
        </p>

        <div className="footer-cols">
          <nav aria-label="Categorías">
            <h3>Categorías</h3>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.slug}><Link to={`/categoria/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Comprar">
            <h3>Comprar</h3>
            <ul>
              <li><Link to="/#rebajas">Rebajas de la semana</Link></li>
              <li><Link to="/#catalogo">Todo el catálogo</Link></li>
              <li><Link to="/carrito">Carrito</Link></li>
              <li><Link to="/favoritos">Favoritos</Link></li>
            </ul>
          </nav>
          <nav aria-label="Tu cuenta">
            <h3>Tu cuenta</h3>
            <ul>
              <li><Link to="/cuenta">Mi cuenta</Link></li>
              <li><Link to="/ingresar">Ingresar</Link></li>
              <li><Link to="/registro">Crear cuenta</Link></li>
              <li><Link to="/olvide-password">Recuperar contraseña</Link></li>
            </ul>
          </nav>
        </div>

        <div className="footer-legal">
          <span>&copy; {new Date().getFullYear()} tienda.ricops.com. Todos los derechos reservados.</span>
          <span>Colombia</span>
        </div>
      </div>
    </footer>
  );
}
