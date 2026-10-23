import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import './Favorites.css';

export default function Favorites() {
  const { items, clear } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container empty-page">
        <h1>Aún no tienes favoritos</h1>
        <p>Toca el corazón de cualquier producto y lo guardamos aquí para después.</p>
        <Link to="/" className="btn btn-accent">Ver el catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container page favorites-page">
      <div className="section-head">
        <h1 className="favorites-title">
          Tus favoritos <span className="muted">· {items.length}</span>
        </h1>
        <button type="button" className="btn btn-ghost" onClick={clear}>Vaciar la lista</button>
      </div>
      <div className="product-grid">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
