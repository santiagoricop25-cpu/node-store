import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/catalog.js';
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
    <div className="site-header">
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>
            <span className="dot" /> corriendo en mi propio servidor — proxmox + coolify
          </span>
          <span className="top-links">
            <Link to="/">tienda.ricops.com</Link>
          </span>
        </div>
      </div>

      <header className="container main-bar">
        <Link to="/" className="brand">
          tienda<span className="brand-muted">.ricops.com</span>
        </Link>

        <form className="search-bar" onSubmit={onSubmit} role="search">
          <input
            type="search"
            placeholder="Buscar productos, marcas y más…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar productos"
          />
          <button type="submit" aria-label="Buscar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <nav className="header-actions">
          <Link to={isAuthed ? '/cuenta' : '/ingresar'} className="account-link">
            <span className="eyebrow-sm">{isAuthed ? 'Hola,' : 'Bienvenido,'}</span>
            <span className="account-main">{isAuthed ? user?.full_name?.split(' ')[0] || 'cuenta' : 'ingresa o regístrate'}</span>
          </Link>
          <Link to="/carrito" className="cart-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1.4" />
              <circle cx="19" cy="21" r="1.4" />
              <path d="M2.5 3h2.4l2.2 12.2a2 2 0 0 0 2 1.65h8.4a2 2 0 0 0 2-1.6L21 8H6.2" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
            <span className="cart-label">Carrito</span>
          </Link>
        </nav>
      </header>

      <nav className="category-bar container">
        <Link to="/" className="cat-chip cat-chip-all">
          Todas las categorías
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/categoria/${c.slug}`} className="cat-chip">
            {c.emoji} {c.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
