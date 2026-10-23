import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/format.js';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, setQty, subtotal, count } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container empty-page">
        <h1>Tu carrito está vacío</h1>
        <p>Cuando agregues algo, aparece aquí y se queda guardado aunque cierres la pestaña.</p>
        <Link to="/" className="btn btn-accent">Ver el catálogo</Link>
      </div>
    );
  }

  // El envío se elige en el checkout (el regular es gratis), así que aquí solo
  // se suma el impuesto estimado, igual que en el paso de pago.
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + tax;

  return (
    <div className="container page cart-page">
      <h1 className="page-title">Tu carrito <span className="muted">· {count} {count === 1 ? 'producto' : 'productos'}</span></h1>
      <div className="cart-layout">
        <ul className="cart-items">
          {items.map((it) => (
            <li className="cart-item" key={it.id}>
              <Link to={`/producto/${it.id}`} className="cart-item-img" tabIndex={-1} aria-hidden="true">
                <img src={it.image} alt="" width="120" height="120" />
              </Link>
              <div className="cart-item-body">
                <Link to={`/producto/${it.id}`} className="cart-item-title">{it.title}</Link>
                <span className="muted">{formatPrice(it.price)} c/u</span>
              </div>
              <div className="cart-item-buy">
                <div className="qty-control" role="group" aria-label={`Cantidad de ${it.title}`}>
                  <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Quitar uno" disabled={it.qty <= 1}>
                    <Minus size={16} />
                  </button>
                  <span aria-live="polite">{it.qty}</span>
                  <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Agregar uno" disabled={it.stock != null && it.qty >= it.stock}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="cart-item-price">{formatPrice(it.price * it.qty)}</div>
              </div>
              <button type="button" className="remove-btn" onClick={() => removeItem(it.id)} aria-label={`Quitar ${it.title} del carrito`}>
                <X size={18} />
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Resumen</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Impuesto estimado</dt><dd>{formatPrice(tax)}</dd></div>
            <div><dt>Envío</dt><dd>Se elige al pagar</dd></div>
            <div className="summary-total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <button type="button" className="btn btn-accent btn-block" onClick={() => navigate('/checkout')}>
            Finalizar compra
          </button>
          <Link to="/" className="btn btn-ghost cart-continue">Seguir comprando</Link>
        </aside>
      </div>
    </div>
  );
}
