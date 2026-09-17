import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartPop, setCartPop] = useState(false);
  const [wishPop, setWishPop] = useState(false);
  const navigate = useNavigate();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAuthed } = useAuth();
  const prevCount = useRef(count);
  const prevWishCount = useRef(wishCount);

  useEffect(() => {
    if (count !== prevCount.current) {
      setCartPop(true);
      prevCount.current = count;
      const t = setTimeout(() => setCartPop(false), 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [count]);

  useEffect(() => {
    if (wishCount !== prevWishCount.current) {
      setWishPop(true);
      prevWishCount.current = wishCount;
      const t = setTimeout(() => setWishPop(false), 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [wishCount]);

  function onSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
    }
  }

  return (
    <header className="site-header">
      <div className="container main-bar">
        <button
          type="button"
          className="menu-toggle icon-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

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
          <button type="submit" aria-label="Buscar" className="icon-anim">
            <Search size={16} />
          </button>
        </form>

        <nav className="main-nav">
          <Link to="/">Inicio</Link>
          <Link to="/categoria/tecnologia">Categorías</Link>
          <Link to="/favoritos">Ofertas</Link>
        </nav>

        <div className="header-icons">
          <Link to="/favoritos" className="icon-btn icon-anim" aria-label="Favoritos">
            <Heart size={21} className={wishPop ? 'heart-pop' : ''} fill={wishCount > 0 ? 'currentColor' : 'none'} />
            {wishCount > 0 && <span className={`cart-badge ${wishPop ? 'badge-pop' : ''}`}>{wishCount}</span>}
          </Link>
          <Link to="/carrito" className="icon-btn icon-anim cart-icon" aria-label="Carrito">
            <ShoppingCart size={21} className={cartPop ? 'icon-wiggle' : ''} />
            {count > 0 && <span className={`cart-badge ${cartPop ? 'badge-pop' : ''}`}>{count}</span>}
          </Link>
          <Link to={isAuthed ? '/cuenta' : '/ingresar'} className="icon-btn icon-anim account-icon" aria-label="Cuenta" title={isAuthed ? user?.full_name : 'Ingresar'}>
            <User size={21} />
          </Link>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <form className="mobile-search" onSubmit={onSubmit} role="search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar productos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link to="/categoria/tecnologia" onClick={() => setMenuOpen(false)}>Categorías</Link>
        <Link to="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</Link>
        <Link to="/carrito" onClick={() => setMenuOpen(false)}>Carrito</Link>
        <Link to={isAuthed ? '/cuenta' : '/ingresar'} onClick={() => setMenuOpen(false)}>
          {isAuthed ? 'Mi cuenta' : 'Ingresar'}
        </Link>
      </div>
    </header>
  );
}
