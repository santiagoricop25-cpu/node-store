import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../lib/format.js';
import './Checkout.css';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    address: '',
    city: '',
    phone: '',
  });
  const [placed, setPlaced] = useState(false);
  const shipping = subtotal >= 100000 ? 0 : 12900;
  const total = subtotal + shipping;

  if (items.length === 0 && !placed) {
    return (
      <div className="container checkout-empty">
        <h1>No tienes productos en el carrito</h1>
        <Link to="/" className="btn btn-buy">Ir a la tienda</Link>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="container checkout-empty">
        <h1>Ingresa a tu cuenta para continuar</h1>
        <p>Necesitas iniciar sesión para finalizar tu compra.</p>
        <div className="checkout-empty-ctas">
          <Link to="/ingresar" className="btn btn-buy">Ingresar</Link>
          <Link to="/registro" className="btn">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setPlaced(true);
    clear();
  }

  if (placed) {
    return (
      <div className="container checkout-empty">
        <span className="empty-emoji">✅</span>
        <h1>¡Pedido registrado!</h1>
        <p>
          Esto es una vista previa del flujo de compra — la pasarela de pago (Wompi) y el
          sistema de pedidos todavía están en construcción, así que este pedido no se procesó
          de verdad. Te avisaremos apenas los pagos en línea estén activos.
        </p>
        <Link to="/" className="btn btn-buy">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1>Finalizar compra</h1>
      <div className="checkout-layout">
        <form className="checkout-form card" onSubmit={handleSubmit}>
          <h3>Datos de envío</h3>
          <label>
            Nombre completo
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
          <label>
            Dirección
            <input name="address" value={form.address} onChange={handleChange} required placeholder="Calle, número, barrio" />
          </label>
          <div className="form-row">
            <label>
              Ciudad
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label>
              Teléfono
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
          </div>

          <h3>Pago</h3>
          <div className="payment-placeholder">
            <span>💳</span>
            <div>
              <strong>Pagos en línea próximamente</strong>
              <p>Estamos integrando Wompi como pasarela de pago segura.</p>
            </div>
          </div>

          <button type="submit" className="btn btn-buy btn-block">
            Confirmar pedido (vista previa)
          </button>
        </form>

        <aside className="checkout-summary card">
          <h3>Tu pedido</h3>
          <ul className="summary-items">
            {items.map((it) => (
              <li key={it.id}>
                <span>{it.title} × {it.qty}</span>
                <span className="mono">{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span className="mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span className="mono">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span className="mono">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
