import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand-col">
          <div className="footer-brand">tienda</div>
          <p className="footer-lead">
            Todo lo que buscas, en un solo lugar — miles de productos en tecnología,
            hogar, moda y más, con envío rápido y pagos seguros.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter" onClick={(e) => e.preventDefault()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 0 1-1.9.1c.5 1.6 2 2.8 3.8 2.9A8.3 8.3 0 0 1 2 18.6a11.6 11.6 0 0 0 6.3 1.9c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z"/></svg>
            </a>
            <a href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7C16.7 3.65 15.7 3.55 14.5 3.55c-2.4 0-4 1.5-4 4.2V10H7.8v3.1h2.7V21h3z"/></svg>
            </a>
            <a href="#" aria-label="TikTok" onClick={(e) => e.preventDefault()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.9 3.7 4.1 3.9v2.9c-1.4 0-2.8-.4-4-1.2v6.1c0 3.1-2.5 5.3-5.4 5.3-3 0-5.4-2.4-5.4-5.4s2.5-5.4 5.4-5.4c.3 0 .6 0 .9.1v3c-.3-.1-.6-.2-.9-.2-1.3 0-2.4 1.1-2.4 2.5s1.1 2.4 2.4 2.4c1.4 0 2.6-1.1 2.6-2.6V3h2.7z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Servicios</h4>
          <ul>
            <li>Programa de puntos</li>
            <li>Tarjetas de regalo</li>
            <li>Crédito y pago</li>
            <li>Contratos de servicio</li>
            <li>Cuenta sin efectivo</li>
            <li><Link to="/carrito">Formas de pago</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Ayuda al comprador</h4>
          <ul>
            <li><Link to="/cuenta">Buscar un pedido</Link></li>
            <li>Términos de entrega</li>
            <li>Cambios y devoluciones</li>
            <li>Garantía</li>
            <li>Preguntas frecuentes</li>
            <li>Términos de uso del sitio</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} tienda.ricops.com</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>
  );
}
