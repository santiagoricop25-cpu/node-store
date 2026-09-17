import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Check, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../lib/format.js';
import './Checkout.css';

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
  const { user, isAuthed } = useAuth();

  const [addresses, setAddresses] = useState(loadAddresses);
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState(() => loadAddresses()[0]?.id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_FORM);
  const [shipMethod, setShipMethod] = useState('free');
  const [payTab, setPayTab] = useState('card');
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvv: '' });
  const [placed, setPlaced] = useState(false);

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

  const shippingPrice = SHIPPING_METHODS.find((m) => m.id === shipMethod)?.price || 0;
  const tax = Math.round(subtotal * 0.02);
  const total = subtotal + shippingPrice + tax;
  const address = addresses.find((a) => a.id === addressId);

  function handlePay(e) {
    e.preventDefault();
    setPlaced(true);
    clear();
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
              <h3>Pago</h3>
              <div className="pay-tabs">
                <button type="button" className={payTab === 'card' ? 'active' : ''} onClick={() => setPayTab('card')}>Tarjeta de crédito</button>
                <button type="button" className={payTab === 'paypal' ? 'active' : ''} onClick={() => setPayTab('paypal')} disabled>PayPal</button>
                <button type="button" className={payTab === 'other' ? 'active' : ''} onClick={() => setPayTab('other')} disabled>Otro</button>
              </div>

              <div className="card-mock">
                <div className="card-mock-top">
                  <span className="chip" />
                </div>
                <div className="card-mock-number mono">{card.number || '•••• •••• •••• ••••'}</div>
                <div className="card-mock-bottom">
                  <span>{card.name || 'NOMBRE DEL TITULAR'}</span>
                  <span className="card-mock-brand">VISA</span>
                </div>
              </div>

              <label>
                Nombre del titular
                <input value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} required />
              </label>
              <label>
                Número de tarjeta
                <input value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} required placeholder="0000 0000 0000 0000" />
              </label>
              <div className="form-row">
                <label>
                  Fecha de expiración
                  <input value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))} required placeholder="MM/AA" />
                </label>
                <label>
                  CVV
                  <input value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} required placeholder="123" />
                </label>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                Usar la misma dirección de facturación
              </label>

              <div className="step-actions">
                <button type="button" className="btn" onClick={() => setStep(2)}>Volver</button>
                <button type="submit" className="btn btn-accent">Pagar {formatPrice(total)}</button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
