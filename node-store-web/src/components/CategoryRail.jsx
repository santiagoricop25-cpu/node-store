import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import './CategoryRail.css';

export default function CategoryRail({ category, products }) {
  return (
    <section className="category-rail">
      <div className="rail-head">
        <h2>
          {category.emoji} {category.name}
        </h2>
        <Link to={`/categoria/${category.slug}`} className="rail-see-all">
          Ver todo →
        </Link>
      </div>
      <div className="rail-scroll">
        {products.map((p) => (
          <div className="rail-item" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
