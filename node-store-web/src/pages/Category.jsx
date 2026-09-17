import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, getCategory, getProductsByCategory, searchProducts } from '../data/catalog.js';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { formatPrice } from '../lib/format.js';
import './Category.css';

const SORTS = [
  { value: 'relevance', label: 'Más relevantes' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor calificados' },
];

export default function Category() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  useProducts(); // se suscribe para re-renderizar cuando llegue el catálogo real

  const category = slug ? getCategory(slug) : null;
  const baseProducts = slug ? getProductsByCategory(slug) : searchProducts(query);

  const [sort, setSort] = useState('relevance');
  const [maxPrice, setMaxPrice] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);

  const priceCeiling = useMemo(
    () => Math.max(...baseProducts.map((p) => p.price), 100000),
    [baseProducts]
  );

  const filtered = useMemo(() => {
    let list = baseProducts.filter((p) => p.rating >= minRating);
    if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);
    if (freeShippingOnly) list = list.filter((p) => p.freeShipping);

    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [baseProducts, sort, maxPrice, minRating, freeShippingOnly]);

  const title = category ? category.name : `Resultados para "${query}"`;
  const breadcrumbTail = category ? category.name : 'Búsqueda';

  return (
    <div className="container category-page">
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link> / <span>Catálogo</span> / <span>{breadcrumbTail}</span>
      </nav>

      <div className="category-layout">
        <aside className="filters-sidebar">
          <div className="filter-block">
            <h4>Categoría</h4>
            <ul className="filter-cats">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/categoria/${c.slug}`} className={c.slug === slug ? 'active' : ''}>
                    <span>{c.emoji} {c.name}</span>
                    <span className="cat-count mono">{getProductsByCategory(c.slug).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <details className="filter-block accordion" open>
            <summary>Precio máximo</summary>
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={10000}
              value={maxPrice ?? priceCeiling}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="filter-price-value mono">hasta {formatPrice(maxPrice ?? priceCeiling)}</div>
          </details>

          <details className="filter-block accordion" open>
            <summary>Calificación mínima</summary>
            {[4.5, 4, 3.5, 0].map((r) => (
              <label key={r} className="filter-radio">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => setMinRating(r)}
                />
                {r > 0 ? `${r}+ estrellas` : 'Todas'}
              </label>
            ))}
          </details>

          <details className="filter-block accordion">
            <summary>Envío</summary>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={freeShippingOnly}
                onChange={(e) => setFreeShippingOnly(e.target.checked)}
              />
              Solo envío gratis
            </label>
          </details>
        </aside>

        <section className="results">
          <div className="results-head">
            <h1>{title}</h1>
            <div className="results-controls">
              <span className="results-count">Productos seleccionados: {filtered.length}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No encontramos productos con esos filtros.</p>
            </div>
          ) : (
            <div className="results-grid">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 6) * 40}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
