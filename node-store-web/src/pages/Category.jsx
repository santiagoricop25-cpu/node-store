import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
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

const RATINGS = [
  { value: 0, label: 'Todas' },
  { value: 4, label: '4 o más' },
  { value: 4.5, label: '4,5 o más' },
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const title = category ? category.name : query ? `Resultados para «${query}»` : 'Buscar';
  const hasFilters = maxPrice != null || minRating > 0 || freeShippingOnly;

  function resetFilters() {
    setMaxPrice(null);
    setMinRating(0);
    setFreeShippingOnly(false);
  }

  return (
    <div className="container page category-page">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/">Inicio</Link> / <span>{category ? category.name : 'Búsqueda'}</span>
      </nav>

      <div className="results-head">
        <h1>{title}</h1>
        <div className="results-controls">
          <p className="results-count">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
            {hasFilters && ` de ${baseProducts.length}`}
          </p>
          <button
            type="button"
            className="btn btn-sm filters-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={16} /> {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
          </button>
          <label className="sort">
            <span>Ordenar por</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="category-layout">
        <aside className={`filters ${filtersOpen ? 'open' : ''}`} aria-label="Filtros">
          <div className="filter-block">
            <h2>Categorías</h2>
            <ul className="filter-cats">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/categoria/${c.slug}`} className={c.slug === slug ? 'active' : ''} aria-current={c.slug === slug ? 'page' : undefined}>
                    <span>{c.name}</span>
                    <span className="cat-count">{getProductsByCategory(c.slug).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-block">
            <h2 id="price-label">Precio máximo</h2>
            <p className="filter-price-value">hasta {formatPrice(maxPrice ?? priceCeiling)}</p>
            <input
              type="range"
              aria-labelledby="price-label"
              min={0}
              max={priceCeiling}
              step={10000}
              value={maxPrice ?? priceCeiling}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>

          <fieldset className="filter-block">
            <legend>Calificación</legend>
            <div className="segmented">
              {RATINGS.map((r) => (
                <label key={r.value} className={minRating === r.value ? 'active' : ''}>
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r.value}
                    onChange={() => setMinRating(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="filter-block">
            <label className="filter-check">
              <input
                type="checkbox"
                checked={freeShippingOnly}
                onChange={(e) => setFreeShippingOnly(e.target.checked)}
              />
              Solo con envío gratis
            </label>
          </div>

          {hasFilters && (
            <button type="button" className="btn btn-ghost" onClick={resetFilters}>Quitar filtros</button>
          )}
        </aside>

        <section className="results" aria-label="Productos">

          {filtered.length === 0 ? (
            <div className="empty-state">
              <h2>{baseProducts.length === 0 ? 'No encontramos nada con esa búsqueda' : 'Ningún producto cumple esos filtros'}</h2>
              <p>
                {baseProducts.length === 0
                  ? 'Prueba con otra palabra, o recorre las categorías de la izquierda.'
                  : 'Sube el precio máximo o quita algún filtro para ver más.'}
              </p>
              {hasFilters ? (
                <button type="button" className="btn btn-accent" onClick={resetFilters}>Quitar filtros</button>
              ) : (
                <Link to="/" className="btn btn-accent">Volver al inicio</Link>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 60}>
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
