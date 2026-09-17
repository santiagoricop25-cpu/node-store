import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, isAuthed } = useAuth();

  function onSubmit(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="site-header">
      <div className="container main-bar">
        <Link to="/" className="brand">
          tienda
        </Link>

        <form className="search-bar" onSubmit={onSubmit} role="search">
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar productos"
          />
          <button type="submit" aria-label="Buscar">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <nav className="main-nav">
          <Link to="/">Inicio</Link>
          <Link to="/categoria/tecnologia">Categorías</Link>
          <Link to="/categoria/tecnologia?q=oferta">Ofertas</Link>
          <a href="https://api.ricops.com" target="_blank" rel="noreferrer">Blog</a>
        </nav>

        <div className="header-icons">
          <button type="button" className="icon-btn" title="Favoritos (próximamente)" aria-label="Favoritos">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.1 21s-7.1-4.35-9.6-9.05C.86 8.9 2.14 5.4 5.5 4.6c2-.48 3.9.4 5.1 2.1a5.6 5.6 0 0 1 1.5-1.6c1.55-1.1 3.8-1.15 5.4.05 2.4 1.8 2.9 5.2 1.1 8.35C16.1 17.4 12.1 21 12.1 21z" />
            </svg>
          </button>
          <Link to="/carrito" className="icon-btn cart-icon" aria-label="Carrito">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="19" cy="21" r="1.4" />
              <path d="M2.5 3h2.4l2.2 12.2a2 2 0 0 0 2 1.65h8.4a2 2 0 0 0 2-1.6L21 8H6.2" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          <Link to={isAuthed ? '/cuenta' : '/ingresar'} className="icon-btn account-icon" aria-label="Cuenta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M4.5 20c1.4-3.4 4.4-5.2 7.5-5.2s6.1 1.8 7.5 5.2" />
            </svg>
          </Link>
        </div>
      </div>

      {isAuthed && (
        <div className="container mini-greeting">
          Hola, {user?.full_name?.split(' ')[0] || 'cuenta'} — corriendo en mi propio servidor (Proxmox + Coolify)
        </div>
      )}
    </header>
  );
}
