import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Check, Plus, X, Banknote, Landmark } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../lib/format.js';
import { api, ApiError } from '../lib/api.js';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'contra_entrega', label: 'Pago contra entrega', Icon: Banknote, note: 'Pagas en efectivo o datáfono cuando recibes el pedido.' },
  { id: 'transferencia', label: 'Transferencia bancaria', Icon: Landmark, note: 'Te enviamos los datos de la cuenta por correo para transferir.' },
  { id: 'tarjeta', label: 'Tarjeta de crédito', Icon: CreditCard, note: 'Cobro en línea con Wompi, disponible muy pronto.', disabled: true },
];

const STEPS = [
  { n: 1, key: 'address', label: 'Dirección' },
  { n: 2, key: 'shipping', label: 'Envío' },
  { n: 3, key: 'payment', label: 'Pago' },
];

const ADDR_KEY = 'node-store-addresses';

// Antes se precargaban dos direcciones de ejemplo; ahora cada cliente empieza
// sin direcciones y escribe la suya, para que nadie pida a una dirección ajena.
function loadAddresses() {
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const SHIPPING_METHODS = [
  { id: 'free', label: 'Envío regular', price: 0, note: 'Llega en 5 a 7 días' },
  { id: 'express', label: 'Envío express', price: 12900, note: 'Llega en 1 a 2 días' },
  { id: 'schedule', label: 'Programar entrega', price: 5900, note: 'Tú eliges la fecha' },
];

const TAGS = { HOME: 'Casa', OFICINA: 'Oficina' };
const EMPTY_FORM = { label: '', tag: 'HOME', line: '', phone: '' };

// Las mismas reglas que exige la API; si no se cumplen, el pedido se rechaza.
function addressProblem(a) {
  if (!a) return 'Elige o agrega una dirección de envío.';
  if ((a.line || '').trim().length < 5) return 'La dirección está incompleta: escribe calle, número, barrio y ciudad.';
  if ((a.phone || '').replace(/\D/g, '').length < 7) return 'El teléfono debe tener al menos 7 números.';
  return null;
}

const ORDER_ERRORS = {
  insufficient_stock: 'Uno de los productos ya no tiene unidades suficientes. Revisa tu carrito.',
  product_unavailable: 'Uno de los productos ya no está disponible. Revisa tu carrito.',
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user, isAuthed, status, accessToken } = useAuth();

  const [addresses, setAddresses] = useState(loadAddresses);
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState(() => loadAddresses()[0]?.id);
  const [showAddForm, setShowAddForm] = useState(() => loadAddresses().length === 0);
  const [addrForm, setAddrForm] = useState(EMPTY_FORM);
  const [addrError, setAddrError] = useState(null);
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

  // Cada paso empieza arriba, con su título a la vista.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, placed]);

  if (items.length === 0 && !placed) {
    return (
      <div className="container empty-page">
        <h1>No tienes productos en el carrito</h1>
        <p>Agrega algo del catálogo y vuelve aquí para pagarlo.</p>
        <Link to="/" className="btn btn-accent">Ver el catálogo</Link>
      </div>
    );
  }

  if (status === 'checking') {
    return (
      <div className="container empty-page">
        <h1>Un momento</h1>
        <p>Estamos revisando tu sesión.</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="container empty-page">
        <h1>Ingresa para terminar tu compra</h1>
        <p>Tu carrito se queda guardado mientras ingresas o creas tu cuenta.</p>
        <div className="actions">
          <Link to="/ingresar" state={{ from: '/checkout' }} className="btn btn-accent">Ingresar</Link>
          <Link to="/registro" state={{ from: '/checkout' }} className="btn">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  if (placed) {
    const methodLabel = PAYMENT_METHODS.find((m) => m.id === placedOrder.paymentMethod)?.label;
    return (
      <div className="container empty-page order-done">
        <span className="order-done-mark" aria-hidden="true"><Check size={36} strokeWidth={3} /></span>
        <h1>¡Pedido confirmado!</h1>
        <p className="order-number">Pedido {placedOrder.orderNumber}</p>
        <p>
          Tu pedido quedó registrado por <strong>{formatPrice(placedOrder.total)}</strong> con{' '}
          {methodLabel?.toLowerCase()}. Te enviamos el resumen a <strong>{user?.email}</strong> y te avisaremos por
          correo cuando confirmemos el pedido, el pago y el envío con su guía.
        </p>
        <div className="actions">
          <Link to="/cuenta" className="btn btn-accent">Ver mis pedidos</Link>
          <Link to="/" className="btn">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const shipping = SHIPPING_METHODS.find((m) => m.id === shipMethod);
  const shippingPrice = shipping?.price || 0;
  // Por ahora no se cobran impuestos aparte: total = productos + envío elegido.
  const total = subtotal + shippingPrice;
  const address = addresses.find((a) => a.id === addressId);

  async function handlePay(e) {
    e.preventDefault();
    const problem = addressProblem(address);
    if (problem) {
      setPlaceError(`${problem} Vuelve al paso de dirección para corregirla.`);
      return;
    }
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
          shippingMethod: shipMethod,
          paymentMethod,
          customer: { name: user?.full_name, email: user?.email, phone: address.phone },
        },
        accessToken
      );
      setPlacedOrder(order);
      clear();
    } catch (err) {
      const code = err instanceof ApiError ? err.data?.error : null;
      const badAddress = code === 'validation_error' && err.data?.details?.fieldErrors?.shippingAddress;
      setPlaceError(
        badAddress
          ? 'Revisa la dirección de envío: debe estar completa y el teléfono tener al menos 7 números.'
          : ORDER_ERRORS[code] ||
            (err instanceof ApiError
              ? 'No pudimos registrar tu pedido. Intenta de nuevo en un momento.'
              : 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.')
      );
    } finally {
      setPlacing(false);
    }
  }

  function handleSaveAddress(e) {
    e.preventDefault();
    if (!addrForm.label || !addrForm.line || !addrForm.phone) return;
    const problem = addressProblem(addrForm);
    if (problem) {
      setAddrError(problem);
      return;
    }
    setAddrError(null);
    const newAddr = { ...addrForm, id: `a${Date.now()}` };
    setAddresses((prev) => [...prev, newAddr]);
    setAddressId(newAddr.id);
    setAddrForm(EMPTY_FORM);
    setShowAddForm(false);
  }

  function handleRemoveAddress(id) {
    const remaining = addresses.filter((a) => a.id !== id);
    setAddresses(remaining);
    if (addressId === id) setAddressId(remaining[0]?.id);
    if (remaining.length === 0) setShowAddForm(true);
  }

  return (
    <div className="container page checkout-page">
      <div className="checkout-layout">
        <div className="checkout-main">
          <ol className="steps-bar" aria-label="Pasos de la compra">
            {STEPS.map((s) => (
              <li
                key={s.key}
                className={`step-node ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}
                aria-current={step === s.n ? 'step' : undefined}
              >
                {step > s.n ? (
                  <button type="button" onClick={() => setStep(s.n)}>
                    <Check size={16} strokeWidth={3} aria-hidden="true" /> {s.label}
                  </button>
                ) : (
                  <span>{s.label}</span>
                )}
              </li>
            ))}
          </ol>

          {step === 1 && (
            <section className="checkout-step" aria-labelledby="step-title">
              <h1 id="step-title">¿A dónde lo enviamos?</h1>
              {addresses.length > 0 && (
                <div className="choice-list" role="radiogroup" aria-label="Direcciones guardadas">
                  {addresses.map((a) => (
                    <label key={a.id} className={`choice ${addressId === a.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                      />
                      <span className="choice-body">
                        <strong>
                          {a.label}
                          {(TAGS[a.tag] || a.tag) !== a.label && <span className="muted"> · {TAGS[a.tag] || a.tag}</span>}
                        </strong>
                        <span>{a.line}</span>
                        <span className="muted">{a.phone}</span>
                      </span>
                      <button
                        type="button"
                        className="choice-remove"
                        onClick={(e) => { e.preventDefault(); handleRemoveAddress(a.id); }}
                        aria-label={`Eliminar la dirección ${a.label}`}
                      >
                        <X size={18} />
                      </button>
                    </label>
                  ))}
                </div>
              )}

              {showAddForm ? (
                <form className="address-form" onSubmit={handleSaveAddress}>
                  <h2>Nueva dirección</h2>
                  <div className="form-row">
                    <label className="field">
                      Nombre para reconocerla
                      <input
                        value={addrForm.label}
                        onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
                        required
                        placeholder="Casa, oficina, donde mi mamá…"
                      />
                    </label>
                    <label className="field">
                      Tipo
                      <select value={addrForm.tag} onChange={(e) => setAddrForm((f) => ({ ...f, tag: e.target.value }))}>
                        <option value="HOME">Casa</option>
                        <option value="OFICINA">Oficina</option>
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    Dirección completa
                    <input
                      value={addrForm.line}
                      onChange={(e) => setAddrForm((f) => ({ ...f, line: e.target.value }))}
                      required
                      autoComplete="street-address"
                      placeholder="Calle, número, barrio, ciudad y departamento"
                    />
                  </label>
                  <label className="field">
                    Teléfono de contacto
                    <input
                      type="tel"
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="300 123 4567"
                    />
                  </label>
                  {addrError && <div className="notice notice-error" role="alert">{addrError}</div>}
                  <div className="step-actions">
                    {addresses.length > 0 && (
                      <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancelar</button>
                    )}
                    <button type="submit" className="btn btn-light">Guardar dirección</button>
                  </div>
                </form>
              ) : (
                <button type="button" className="btn add-address" onClick={() => setShowAddForm(true)}>
                  <Plus size={18} /> Agregar otra dirección
                </button>
              )}

              {!showAddForm && address && addressProblem(address) && (
                <div className="notice notice-error" role="alert">
                  {addressProblem(address)} Elimina esta dirección con la X y agrégala de nuevo.
                </div>
              )}

              <div className="step-actions">
                <Link to="/carrito" className="btn">Volver al carrito</Link>
                <button
                  className="btn btn-accent"
                  onClick={() => { setPlaceError(null); setStep(2); }}
                  disabled={!address || Boolean(addressProblem(address))}
                >
                  Continuar
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="checkout-step" aria-labelledby="step-title">
              <h1 id="step-title">¿Cuándo lo quieres?</h1>
              <div className="choice-list" role="radiogroup" aria-label="Método de envío">
                {SHIPPING_METHODS.map((m) => (
                  <label key={m.id} className={`choice ${shipMethod === m.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipMethod === m.id}
                      onChange={() => setShipMethod(m.id)}
                    />
                    <span className="choice-body">
                      <strong>{m.label}</strong>
                      <span className="muted">{m.note}</span>
                    </span>
                    <span className="choice-price">{m.price === 0 ? 'Gratis' : formatPrice(m.price)}</span>
                  </label>
                ))}
              </div>

              <div className="step-actions">
                <button className="btn" onClick={() => setStep(1)}>Volver</button>
                <button className="btn btn-accent" onClick={() => setStep(3)}>Continuar</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <form className="checkout-step" onSubmit={handlePay} aria-labelledby="step-title">
              <h1 id="step-title">¿Cómo pagas?</h1>
              <div className="choice-list" role="radiogroup" aria-label="Método de pago">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`choice ${paymentMethod === m.id ? 'selected' : ''} ${m.disabled ? 'disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m.id}
                      disabled={m.disabled}
                      onChange={() => setPaymentMethod(m.id)}
                    />
                    <m.Icon size={22} className="choice-icon" aria-hidden="true" />
                    <span className="choice-body">
                      <strong>{m.label}</strong>
                      <span className="muted">{m.note}</span>
                    </span>
                  </label>
                ))}
              </div>

              {placeError && <div className="notice notice-error" role="alert">{placeError}</div>}

              <div className="step-actions">
                <button type="button" className="btn" onClick={() => setStep(2)}>Volver</button>
                <button type="submit" className="btn btn-accent" disabled={placing}>
                  {placing ? 'Confirmando…' : `Confirmar pedido · ${formatPrice(total)}`}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="order-summary" aria-labelledby="order-summary-title">
          <h2 id="order-summary-title">Tu pedido</h2>
          <ul className="summary-items">
            {items.map((it) => (
              <li key={it.id}>
                <img src={it.image} alt="" width="48" height="48" />
                <span className="summary-item-title">{it.title} <span className="muted">× {it.qty}</span></span>
                <span>{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl>
            {address && <div><dt>Envío a</dt><dd>{address.line}</dd></div>}
            {step > 1 && <div><dt>Método</dt><dd>{shipping?.label}</dd></div>}
            <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div><dt>Envío</dt><dd>{shippingPrice === 0 ? 'Gratis' : formatPrice(shippingPrice)}</dd></div>
            <div className="summary-total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
