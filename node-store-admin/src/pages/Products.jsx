import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, ApiError } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';
import { CATEGORIES } from '../lib/catalog.js';

const EMPTY_FORM = {
  title: '',
  brand: '',
  category: CATEGORIES[0].slug,
  price: '',
  compareAtPrice: '',
  stock: '',
  description: '',
  image: '',
  active: true,
};

function toFormState(p) {
  return {
    title: p.title || '',
    brand: p.brand || '',
    category: p.category || CATEGORIES[0].slug,
    price: p.price ?? '',
    compareAtPrice: p.oldPrice ?? '',
    stock: p.stock ?? '',
    description: p.description || '',
    image: p.image || '',
    active: p.active,
  };
}

export default function Products() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  function load() {
    api
      .products(accessToken, search ? { search } : {})
      .then(({ products: rows }) => setProducts(rows))
      .catch(() => setError('No pudimos cargar los productos.'));
  }

  useEffect(load, [accessToken]);

  function openNew() {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setEditing('new');
  }

  function openEdit(p) {
    setForm(toFormState(p));
    setSaveError(null);
    setEditing(p);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim() || undefined,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock) || 0,
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      active: form.active,
    };
    try {
      if (editing === 'new') {
        await api.createProduct(accessToken, payload);
      } else {
        await api.updateProduct(accessToken, editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err instanceof ApiError ? 'Revisa los datos del formulario.' : 'Error de conexión.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(p) {
    if (!confirm(`¿Desactivar "${p.title}"? Dejará de verse en la tienda, pero su historial de pedidos se conserva.`)) return;
    await api.deleteProduct(accessToken, p.id);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Productos</h1>
          <p className="admin-subtitle">Catálogo real conectado a la tienda — lo que agregues aquí aparece de inmediato en tienda.ricops.com.</p>
        </div>
        <button className="btn btn-accent" onClick={openNew}><Plus size={16} /> Nuevo producto</button>
      </div>

      <div className="admin-toolbar">
        <input
          placeholder="Buscar por nombre, marca o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button className="btn" onClick={load}>Buscar</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!products ? (
        <div className="admin-empty">Cargando…</div>
      ) : products.length === 0 ? (
        <div className="admin-empty">No hay productos todavía. Crea el primero con "Nuevo producto".</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="num">Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={!p.active ? 'row-inactive' : ''}>
                  <td>
                    <div className="prod-cell">
                      {p.image && <img src={p.image} alt="" />}
                      <div>
                        <strong>{p.title}</strong>
                        <span>{p.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td>{CATEGORIES.find((c) => c.slug === p.category)?.name || p.category}</td>
                  <td className="num">
                    <div className="price-cell" style={{ alignItems: 'flex-end' }}>
                      <strong>{formatPrice(p.price)}</strong>
                      {p.oldPrice && (
                        <span className="offer-pill"><Tag size={11} aria-hidden="true" /> {formatPrice(p.oldPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <div className={`stock-bar ${Number(p.stock) <= 5 ? 'low' : ''}`} aria-hidden="true">
                        <span style={{ width: `${Math.min(100, (Number(p.stock) / 120) * 100)}%` }} />
                      </div>
                      {p.stock}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-status ${p.active ? 'done' : 'next'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(p)} aria-label={`Editar ${p.title}`}><Pencil size={16} /></button>
                    {p.active && (
                      <button className="icon-btn danger" onClick={() => handleDeactivate(p)} aria-label={`Desactivar ${p.title}`}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-head">
              <h2>{editing === 'new' ? 'Nuevo producto' : 'Editar producto'}</h2>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Cerrar"><X size={18} /></button>
            </div>

            {form.image && (
              <div className="modal-preview">
                <img src={form.image} alt="" />
                <span>Así se verá la foto principal en la tienda.</span>
              </div>
            )}

            <label>
              Nombre
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </label>
            <div className="form-row">
              <label>
                Marca
                <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
              </label>
              <label>
                Categoría
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Precio (COP)
                <input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
              </label>
              <label>
                Precio antes de oferta (opcional)
                <input type="number" min="0" value={form.compareAtPrice} onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))} placeholder="Déjalo vacío si no hay descuento" />
              </label>
            </div>
            <label>
              Stock disponible
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
            </label>
            <label>
              URL de la imagen principal
              <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://…" />
            </label>
            <label>
              Descripción
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Visible en la tienda
            </label>

            {saveError && <div className="admin-error">{saveError}</div>}

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setEditing(null)}>Cancelar</button>
              <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
