import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Check, Plus, X, Banknote, Landmark } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../lib/format.js';
import { api, ApiError } from '../lib/api.js';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'contra_entrega', label: 'Pago contra entrega', Icon: Banknote, note: 'Pagas en efectivo o datáfono cuando recibes el pedido.' },
  { id: 'transferencia', label: 'Transferencia bancaria', Icon: Landmark, note: 'Te enviamos los datos de la cuenta por correo para transferir.' },
  { id: 'tarjeta', label: 'Tarjeta de crédito', Icon: CreditCard, note: 'Cobro en línea con Wompi — disponible próximamente.', disabled: true },
];

const STEPS = [
  { n: 1, key: 'address', label: 'Dirección', Icon: MapPin },
  { n: 2, key: 'shipping', label: 'Envío', Icon: Truck },
  { n: 3, key: 'payment', label: 'Pago', Icon: CreditCard },
];

const DEFAULT_ADDRESSES = [
  { id: 'a1', label: 'Casa', tag: 'HOME', line: 'Carrera 45 #12-34, Medellín, Antioquia', phone: '(300) 555-0104' },
  { id: 'a2', label: 'Oficina', tag: 'OFICINA', line: 'Calle 10 #5-20, Bogotá, Cundinamarca', phone: '(310) 555-0127' },
];

const ADDR_KEY = 'node-store-addresses';

function loadAddresses() {
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ADDRESSES;
  } catch {
    return DEFAULT_ADDRESSES;
  }
}

const SHIPPING_METHODS = [
  { id: 'free', label: 'Envío regular', price: 0, note: 'Llega en 5-7 días' },
  { id: 'express', label: 'Envío express', price: 12900, note: 'Llega en 1-2 días' },
  { id: 'schedule', label: 'Programar entrega', price: 5900, note: 'Elige una fecha' },
];

const EMPTY_FORM = { label: '', tag: 'HOME', line: '', phone: '' };

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user, isAuthed, accessToken } = useAuth();

  const [addresses, setAddresses] = useState(loadAddresses);
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState(() => loadAddresses()[0]?.id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_FORM);
  const [shipMethod, setShipMethod] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState('contra_entrega');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const placed = Boolean(placedOrder);

  useEffect(() => {
    try {
      localStorage.setItem(ADDR_KEY, JSON.stringify(addresses));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [addresses]);

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

  if (placed) {
    const methodLabel = PAYMENT_METHODS.find((m) => m.id === placedOrder.paymentMethod)?.label;
    return (
      <div className="container checkout-empty">
        <span className="empty-emoji">✅</span>
        <h1>¡Pedido confirmado!</h1>
        <p className="order-number mono">Pedido {placedOrder.orderNumber}</p>
        <p>
          Tu pedido quedó registrado por <strong>{formatPrice(placedOrder.total)}</strong> con{' '}
          {methodLabel?.toLowerCase()}. Te vamos a contactar al confirmar el envío. El pago en
          línea con Wompi todavía no está activo — por ahora el pago se coordina de forma manual.
        </p>
        <Link to="/" className="btn btn-buy">Volver a la tienda</Link>
      </div>
    );
  }

  const shippingPrice = SHIPPING_METHODS.find((m) => m.id === shipMethod)?.price || 0;
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + shippingPrice + tax;
  const address = addresses.find((a) => a.id === addressId);

  async function handlePay(e) {
    e.preventDefault();
    if (!address) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const { order } = await api.createOrder(
        {
          items: items.map((it) => ({
            productId: it.id,
            title: it.title,
            image: it.image,
            price: it.price,
            quantity: it.qty,
          })),
          shippingAddress: {
            label: address.label,
            line: address.line,
            phone: address.phone,
          },
          paymentMethod,
          customer: { name: user?.full_name, email: user?.email, phone: address.phone },
        },
        accessToken
      );
      setPlacedOrder(order);
      clear();
    } catch (err) {
      setPlaceError(
        err instanceof ApiError
          ? 'No pudimos registrar tu pedido. Intenta de nuevo en un momento.'
          : 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.'
      );
    } finally {
      setPlacing(false);
    }
  }

  function handleSaveAddress(e) {
    e.preventDefault();
    if (!addrForm.label || !addrForm.line || !addrForm.phone) return;
    const newAddr = { ...addrForm, id: `a${Date.now()}` };
    setAddresses((prev) => [...prev, newAddr]);
    setAddressId(newAddr.id);
    setAddrForm(EMPTY_FORM);
    setShowAddForm(false);
  }

  function handleRemoveAddress(id) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (addressId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      setAddressId(remaining[0]?.id);
    }
  }

  return (
    <div className="container checkout-page">
      <div className="steps-bar">
        {STEPS.map((s) => (
          <div key={s.key} className={`step-node ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}>
            <span className="step-circle">{step > s.n ? <Check size={15} /> : <s.Icon size={15} />}</span>
            <span className="step-label">Paso {s.n} · {s.label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="checkout-step">
          <h1>Selecciona una dirección</h1>
          <div className="address-list">
            {addresses.map((a) => (
              <label key={a.id} className={`address-card ${addressId === a.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="address"
                  checked={addressId === a.id}
                  onChange={() => setAddressId(a.id)}
                />
                <div className="address-body">
                  <div className="address-head">
                    <strong>{a.label}</strong>
                    <span className={`pill ${a.tag === 'HOME' ? 'dark' : 'outline'}`}>{a.tag}</span>
                  </div>
                  <span className="address-line">{a.line}</span>
                  <span className="address-phone mono">{a.phone}</span>
                </div>
                <button
                  type="button"
                  className="address-remove"
                  onClick={(e) => { e.preventDefault(); handleRemoveAddress(a.id); }}
                  aria-label="Eliminar dirección"
                >
                  <X size={15} />
                </button>
              </label>
            ))}
          </div>

          {showAddForm ? (
            <form className="add-address-form" onSubmit={handleSaveAddress}>
              <div className="form-row">
                <label>
                  Nombre (Casa, Oficina…)
                  <input value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} required />
                </label>
                <label>
                  Tipo
                  <select value={addrForm.tag} onChange={(e) => setAddrForm((f) => ({ ...f, tag: e.target.value }))}>
                    <option value="HOME">Casa</option>
                    <option value="OFICINA">Oficina</option>
                  </select>
                </label>
              </div>
              <label>
                Dirección completa
                <input value={addrForm.line} onChange={(e) => setAddrForm((f) => ({ ...f, line: e.target.value }))} required placeholder="Calle, número, ciudad, departamento" />
              </label>
              <label>
                Teléfono de contacto
                <input value={addrForm.phone} onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))} required />
              </label>
              <div className="step-actions">
                <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-accent">Guardar dirección</button>
              </div>
            </form>
          ) : (
            <button type="button" className="add-address-link" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Agregar nueva dirección
            </button>
          )}

          <div className="step-actions">
            <Link to="/carrito" className="btn">Volver</Link>
            <button className="btn btn-accent" onClick={() => setStep(2)} disabled={!addressId}>Siguiente</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="checkout-step">
          <h1>Método de envío</h1>
          <div className="ship-list">
            {SHIPPING_METHODS.map((m) => (
              <label key={m.id} className={`ship-card ${shipMethod === m.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={shipMethod === m.id}
                  onChange={() => setShipMethod(m.id)}
                />
                <div className="ship-body">
                  <strong>{m.price === 0 ? 'Gratis' : formatPrice(m.price)}</strong>
                  <span>{m.label}</span>
                </div>
                <span className="ship-note">{m.note}</span>
              </label>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn" onClick={() => setStep(1)}>Volver</button>
            <button className="btn btn-accent" onClick={() => setStep(3)}>Siguiente</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="checkout-step payment-step">
          <div className="payment-grid">
            <div className="order-summary-card">
              <h3>Resumen</h3>
              <ul className="summary-items">
                {items.map((it) => (
                  <li key={it.id}>
                    <span>{it.title} × {it.qty}</span>
                    <span className="mono">{formatPrice(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-meta">
                <div><span>Dirección</span><span>{address?.line}</span></div>
                <div><span>Método de envío</span><span>{SHIPPING_METHODS.find((m) => m.id === shipMethod)?.label}</span></div>
              </div>
              <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="summary-row"><span>Impuesto estimado</span><span>{formatPrice(tax)}</span></div>
              <div className="summary-row"><span>Envío</span><span>{shippingPrice === 0 ? 'Gratis' : formatPrice(shippingPrice)}</span></div>
              <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <form className="payment-card" onSubmit={handlePay}>
              <h3>Método de pago</h3>
              <div className="pay-methods">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`pay-method-card ${paymentMethod === m.id ? 'selected' : ''} ${m.disabled ? 'disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m.id}
                      disabled={m.disabled}
                      onChange={() => setPaymentMethod(m.id)}
                    />
                    <m.Icon size={20} className="icon-anim" />
                    <div className="pay-method-body">
                      <strong>{m.label}</strong>
                      <span>{m.note}</span>
                    </div>
                  </label>
                ))}
              </div>

              {placeError && <div className="pay-error">{placeError}</div>}

              <div className="step-actions">
                <button type="button" className="btn" onClick={() => setStep(2)}>Volver</button>
                <button type="submit" className="btn btn-accent" disabled={placing}>
                  {placing ? 'Confirmando…' : `Confirmar pedido · ${formatPrice(total)}`}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
