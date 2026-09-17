import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/format.js';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, setQty, subtotal, clear } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container cart-empty">
        <span className="empty-emoji">🛒</span>
        <h1>Tu carrito está vacío</h1>
        <p>Explora el catálogo y agrega productos para verlos aquí.</p>
        <Link to="/" className="btn btn-buy">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Tu carrito ({items.length})</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((it) => (
            <div className="cart-item card" key={it.id}>
              <Link to={`/producto/${it.id}`} className="cart-item-img">
                <img src={it.image} alt={it.title} />
              </Link>
              <div className="cart-item-body">
                <Link to={`/producto/${it.id}`} className="cart-item-title">{it.title}</Link>
                <span className="cart-item-price mono">{formatPrice(it.price)}</span>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Menos">−</button>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => setQty(it.id, Number(e.target.value) || 1)}
                    />
                    <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Más">+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(it.id)}>Eliminar</button>
                </div>
              </div>
              <div className="cart-item-total mono">{formatPrice(it.price * it.qty)}</div>
            </div>
          ))}
          <button className="btn clear-btn" onClick={clear}>Vaciar carrito</button>
        </div>

        <aside className="cart-summary card">
          <h3>Resumen de compra</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span className="mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span className="mono">{subtotal >= 100000 ? 'Gratis' : formatPrice(12900)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span className="mono">{formatPrice(subtotal >= 100000 ? subtotal : subtotal + 12900)}</span>
          </div>
          <button className="btn btn-buy btn-block" onClick={() => navigate('/checkout')}>
            Continuar compra
          </button>
        </aside>
      </div>
    </div>
  );
}
