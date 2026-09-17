import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import './Favorites.css';

export default function Favorites() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container favorites-empty">
        <Heart size={48} strokeWidth={1.5} className="icon-float" />
        <h1>Aún no tienes favoritos</h1>
        <p>Toca el corazón en cualquier producto para guardarlo aquí.</p>
        <Link to="/" className="btn btn-buy">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="container favorites-page">
      <h1>Mis favoritos ({items.length})</h1>
      <div className="grid-4">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 40}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
