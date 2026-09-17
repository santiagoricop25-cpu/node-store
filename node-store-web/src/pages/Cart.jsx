import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/format.js';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, setQty, subtotal } = useCart();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [cardNumber, setCardNumber] = useState('');

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

  const shipping = subtotal >= 100000 ? 0 : 12900;
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + shipping + tax;

  return (
    <div className="container cart-page">
      <h1>Carrito de compras</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((it) => (
            <div className="cart-item" key={it.id}>
              <Link to={`/producto/${it.id}`} className="cart-item-img">
                <img src={it.image} alt={it.title} />
              </Link>
              <div className="cart-item-body">
                <Link to={`/producto/${it.id}`} className="cart-item-title">{it.title}</Link>
                <span className="cart-item-sku mono">#{it.id.padStart(12, '0')}</span>
              </div>
              <div className="qty-control">
                <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Menos">−</button>
                <span>{it.qty}</span>
                <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Más">+</button>
              </div>
              <div className="cart-item-price">{formatPrice(it.price * it.qty)}</div>
              <button className="remove-btn" onClick={() => removeItem(it.id)} aria-label="Eliminar">✕</button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Resumen del pedido</h3>

          <label className="summary-field">
            Código de descuento
            <input placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <label className="summary-field">
            Número de tarjeta de bonos
            <div className="summary-field-row">
              <input placeholder="Ingresa el número" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              <button className="btn btn-sm">Aplicar</button>
            </div>
          </label>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Impuesto estimado</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-row">
            <span>Envío estimado</span>
            <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button className="btn btn-accent btn-block" onClick={() => navigate('/checkout')}>
            Finalizar compra
          </button>
        </aside>
      </div>
    </div>
  );
}
