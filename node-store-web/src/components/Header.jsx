import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { CATEGORIES } from '../data/catalog.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

// Marca el contador con un pequeño salto cada vez que cambia.
function usePop(value) {
  const [pop, setPop] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return undefined;
    prev.current = value;
    setPop(true);
    const t = setTimeout(() => setPop(false), 350);
    return () => clearTimeout(t);
  }, [value]);
  return pop;
}

export default function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAuthed } = useAuth();
  const cartPop = usePop(count);
  const wishPop = usePop(wishCount);

  useEffect(() => setMenuOpen(false), [pathname]);

  function onSubmit(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
  }

  const firstName = user?.full_name?.split(' ')[0];

  return (
    <>
    <p className="utility-bar">
      Envío regular gratis y pago contra entrega en todos los pedidos.{' '}
      <Link to="/#rebajas" className="link">Ver rebajas ›</Link>
    </p>
    <header className="site-header">
      <div className="container header-bar">
        <Link to="/" className="brand">tienda</Link>

        <form className="header-search" onSubmit={onSubmit} role="search">
          <label htmlFor="header-q" className="visually-hidden">Buscar productos</label>
          <input
            id="header-q"
            type="search"
            placeholder="Buscar productos, marcas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Buscar">
            <Search size={18} />
          </button>
        </form>

        <nav className="header-links" aria-label="Principal">
          <NavLink to="/favoritos">
            Favoritos {wishCount > 0 && <span className={`count ${wishPop ? 'badge-pop' : ''}`}>{wishCount}</span>}
          </NavLink>
          <NavLink to={isAuthed ? '/cuenta' : '/ingresar'}>
            {isAuthed ? firstName || 'Mi cuenta' : 'Ingresar'}
          </NavLink>
          <Link to="/carrito" className="header-cart">
            Carrito <span className={`count ${cartPop ? 'badge-pop' : ''}`}>{count}</span>
          </Link>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className="container header-cats" aria-label="Categorías">
        {CATEGORIES.map((c) => (
          <NavLink key={c.slug} to={`/categoria/${c.slug}`}>{c.name}</NavLink>
        ))}
      </nav>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <form className="mobile-search" onSubmit={onSubmit} role="search">
          <label htmlFor="mobile-q" className="visually-hidden">Buscar productos</label>
          <input
            id="mobile-q"
            className="input"
            type="search"
            placeholder="Buscar productos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-accent" aria-label="Buscar"><Search size={18} /></button>
        </form>
        <div className="mobile-links">
          <Link to="/carrito">Carrito ({count})</Link>
          <Link to="/favoritos">Favoritos ({wishCount})</Link>
          <Link to={isAuthed ? '/cuenta' : '/ingresar'}>{isAuthed ? 'Mi cuenta' : 'Ingresar'}</Link>
        </div>
        <div className="mobile-cats">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/categoria/${c.slug}`}>{c.name}</Link>
          ))}
        </div>
      </div>
    </header>
    </>
  );
}
