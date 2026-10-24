import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';
import './Auth.css';

// Pasos que ve el cliente; "cancelado" se muestra aparte.
const STEPS = [
  { key: 'pendiente', label: 'Recibido' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
];

const PAYMENT_LABELS = {
  pendiente: 'Pago pendiente',
  pagado: 'Pago confirmado',
  fallido: 'No pudimos confirmar el pago',
  reembolsado: 'Pago reembolsado',
};

const dateFormat = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

function OrderCard({ order }) {
  const cancelled = order.status === 'cancelado';
  const current = STEPS.findIndex((s) => s.key === order.status);
  return (
    <li className="order-card-store">
      <div className="order-head">
        <div>
          <strong>{order.orderNumber}</strong>
          <span className="muted">{dateFormat.format(new Date(order.createdAt))}</span>
        </div>
        <strong>{formatPrice(order.total)}</strong>
      </div>

      {cancelled ? (
        <p className="order-cancelled">Este pedido fue cancelado.</p>
      ) : (
        <ol className="order-steps" aria-label={`Estado del pedido: ${STEPS[Math.max(current, 0)].label}`}>
          {STEPS.map((s, i) => (
            <li key={s.key} className={i < current ? 'done' : i === current ? 'now' : ''} aria-current={i === current ? 'step' : undefined}>
              <span className="step-dot" aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ol>
      )}

      <p className="order-meta">
        {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
        {order.trackingNumber && (
          <>
            {' · '}Guía de envío: <strong>{order.trackingNumber}</strong>
          </>
        )}
      </p>
      <p className="order-items-line">
        {order.items.map((it) => `${it.title} × ${it.quantity}`).join(', ')}
      </p>
    </li>
  );
}

export default function Account() {
  const { user, status, logout, accessToken } = useAuth();
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState(false);

  useEffect(() => {
    if (status !== 'authed' || !accessToken) return undefined;
    let cancelled = false;
    api
      .myOrders(accessToken)
      .then(({ orders: rows }) => !cancelled && setOrders(rows))
      .catch(() => !cancelled && setOrdersError(true));
    return () => {
      cancelled = true;
    };
  }, [status, accessToken]);

  if (status === 'checking') return null;
  if (status === 'anon') return <Navigate to="/ingresar" replace state={{ from: '/cuenta' }} />;

  const firstName = user?.full_name?.split(' ')[0];

  return (
    <div className="container page account-page">
      <div className="account-layout">
        <div>
          <h1 className="account-hello">Hola{firstName ? `, ${firstName}` : ''}</h1>
          <p>Estos son los datos con los que te reconocemos en la tienda.</p>
        </div>
        <div>
          <dl className="account-data">
            <div><dt>Nombre</dt><dd>{user?.full_name}</dd></div>
            <div><dt>Correo</dt><dd>{user?.email}</dd></div>
            <div><dt>Correo verificado</dt><dd>{user?.email_verified_at ? 'Sí' : 'Pendiente: revisa tu bandeja de entrada'}</dd></div>
            <div><dt>Tipo de cuenta</dt><dd>{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</dd></div>
          </dl>
          <div className="account-actions">
            <Link to="/favoritos" className="btn">Mis favoritos</Link>
            <Link to="/carrito" className="btn">Mi carrito</Link>
            <button type="button" className="btn btn-light" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </div>

      <section className="account-orders" aria-labelledby="orders-title">
        <h2 id="orders-title">Mis pedidos</h2>
        <p className="muted">Cada cambio de tu pedido también te llega por correo a {user?.email}.</p>
        {ordersError ? (
          <p className="muted">No pudimos cargar tus pedidos. Intenta de nuevo en un momento.</p>
        ) : !orders ? (
          <p className="muted">Cargando…</p>
        ) : orders.length === 0 ? (
          <p className="muted">
            Todavía no tienes pedidos. <Link to="/" className="link">Ver el catálogo</Link>
          </p>
        ) : (
          <ul className="order-list-store">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
