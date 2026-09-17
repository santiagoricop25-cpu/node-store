import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatPrice, formatDate } from '../lib/format.js';

const STATUSES = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
const PAYMENT_STATUSES = ['pendiente', 'pagado', 'fallido', 'reembolsado'];
const PAYMENT_METHOD_LABELS = {
  contra_entrega: 'Contra entrega',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  wompi: 'Wompi',
};

function StatusBadge({ value }) {
  const tone = { pendiente: 'wip', confirmado: 'done', enviado: 'done', entregado: 'done', cancelado: 'next' }[value] || 'wip';
  return <span className={`admin-status ${tone}`}>{value}</span>;
}

export default function Orders() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  function load() {
    api
      .orders(accessToken, {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(paymentFilter ? { paymentStatus: paymentFilter } : {}),
        ...(search ? { search } : {}),
      })
      .then(({ orders: rows }) => setOrders(rows))
      .catch(() => setError('No pudimos cargar los pedidos.'));
  }

  useEffect(load, [accessToken, statusFilter, paymentFilter]);

  async function handleUpdate(order, patch) {
    setSavingId(order.id);
    try {
      const { order: updated } = await api.updateOrder(accessToken, order.id, patch);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch {
      setError('No se pudo actualizar el pedido.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-page">
      <h1>Pedidos</h1>
      <p className="admin-subtitle">A dónde enviar, si ya pagaron y en qué va cada pedido — todo desde aquí.</p>

      <div className="admin-toolbar">
        <input
          placeholder="Buscar por # de pedido, correo o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">Todos los pagos</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={load}>Buscar</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!orders ? (
        <div className="admin-empty">Cargando…</div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">No hay pedidos con estos filtros todavía.</div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => {
            const open = openId === o.id;
            return (
              <div className="order-card" key={o.id}>
                <button className="order-summary" onClick={() => setOpenId(open ? null : o.id)}>
                  <div className="order-summary-main">
                    <strong className="mono">{o.orderNumber}</strong>
                    <span>{o.customer?.name || o.customer?.email || 'Cliente'}</span>
                    <span className="muted">{formatDate(o.createdAt)}</span>
                  </div>
                  <div className="order-summary-tags">
                    <StatusBadge value={o.status} />
                    <span className={`admin-status ${o.paymentStatus === 'pagado' ? 'done' : o.paymentStatus === 'fallido' ? 'next' : 'wip'}`}>
                      pago: {o.paymentStatus}
                    </span>
                    <strong>{formatPrice(o.total)}</strong>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {open && (
                  <div className="order-detail">
                    <div className="order-detail-grid">
                      <div>
                        <h4>Dirección de envío</h4>
                        <p>{o.shippingAddress?.label ? `${o.shippingAddress.label} — ` : ''}{o.shippingAddress?.line}</p>
                        <p className="mono">{o.shippingAddress?.phone}</p>
                      </div>
                      <div>
                        <h4>Contacto</h4>
                        <p>{o.customer?.name || '—'}</p>
                        <p>{o.customer?.email || '—'}</p>
                      </div>
                      <div>
                        <h4>Pago</h4>
                        <p>{PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod}</p>
                        <p>Total: <strong>{formatPrice(o.total)}</strong></p>
                      </div>
                    </div>

                    <h4>Productos</h4>
                    <ul className="order-items">
                      {o.items.map((it, i) => (
                        <li key={i}>
                          <span>{it.title} × {it.quantity}</span>
                          <span className="mono">{formatPrice(it.price * it.quantity)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="order-controls">
                      <label>
                        Estado del pedido
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) => handleUpdate(o, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label>
                        Estado del pago
                        <select
                          value={o.paymentStatus}
                          disabled={savingId === o.id}
                          onChange={(e) => handleUpdate(o, { paymentStatus: e.target.value })}
                        >
                          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label className="tracking-input">
                        <Truck size={14} /> Guía de envío
                        <input
                          defaultValue={o.trackingNumber || ''}
                          placeholder="Número de guía"
                          onBlur={(e) => {
                            if (e.target.value !== (o.trackingNumber || '')) {
                              handleUpdate(o, { trackingNumber: e.target.value });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
