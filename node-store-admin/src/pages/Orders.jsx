import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Mail } from 'lucide-react';
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

const SHIPPING_LABELS = {
  free: 'Envío regular (gratis)',
  express: 'Envío express',
  schedule: 'Entrega programada',
};

function StatusBadge({ value }) {
  const tone = { pendiente: 'wip', confirmado: 'next', enviado: 'next', entregado: 'done', cancelado: 'bad' }[value] || 'wip';
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

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // La API entrega los pedidos de 20 en 20: sin paginar solo se verían los más recientes.
  function load(pageNumber = page) {
    api
      .orders(accessToken, {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(paymentFilter ? { paymentStatus: paymentFilter } : {}),
        ...(search ? { search } : {}),
        page: pageNumber,
      })
      .then(({ orders: rows, total: count, pageSize: size }) => {
        setOrders(rows);
        setTotal(count ?? rows.length);
        setPageSize(size || 20);
        setError(null);
      })
      .catch(() => setError('No pudimos cargar los pedidos.'));
  }

  useEffect(() => load(page), [accessToken, statusFilter, paymentFilter, page]);

  function runSearch() {
    if (page === 1) load(1);
    else setPage(1);
  }

  async function handleUpdate(order, patch) {
    // Marcar como enviado sin guía: el correo al cliente saldría sin número de seguimiento.
    if (patch.status === 'enviado' && !order.trackingNumber) {
      const ok = window.confirm(
        'Este pedido todavía no tiene guía de envío. El cliente recibirá el aviso de envío sin número de guía (cuando la agregues le llegará otro correo). ¿Marcarlo como enviado?'
      );
      if (!ok) return;
    }
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
      <p className="admin-subtitle">A dónde enviar, si ya pagaron y en qué va cada pedido, todo desde aquí.</p>

      <div className="admin-toolbar">
        <input
          placeholder="Buscar por # de pedido, correo o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}>
          <option value="">Todos los pagos</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={runSearch}>Buscar</button>
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
                    <strong>{o.orderNumber}</strong>
                    <span>{o.customer?.name || o.customer?.email || 'Cliente'}</span>
                    <span className="muted">{formatDate(o.createdAt)}</span>
                  </div>
                  <div className="order-summary-tags">
                    <StatusBadge value={o.status} />
                    <span className={`admin-status ${o.paymentStatus === 'pagado' ? 'done' : o.paymentStatus === 'fallido' ? 'bad' : o.paymentStatus === 'reembolsado' ? 'next' : 'wip'}`}>
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
                        <p>{o.shippingAddress?.label ? `${o.shippingAddress.label} · ` : ''}{o.shippingAddress?.line}</p>
                        <p>{o.shippingAddress?.phone}</p>
                        {SHIPPING_LABELS[o.shippingAddress?.method] && <p>{SHIPPING_LABELS[o.shippingAddress.method]}</p>}
                      </div>
                      <div>
                        <h4>Contacto</h4>
                        <p>{o.customer?.name || '—'}</p>
                        <p>{o.customer?.email || '—'}</p>
                        {!o.customer?.email && <p className="order-nomail">Sin correo: no recibirá avisos</p>}
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
                          <span>{formatPrice(it.price * it.quantity)}</span>
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
                        Guía de envío
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
                    <p className="order-mail-note">
                      <Mail size={14} aria-hidden="true" /> Cada cambio de estado, de pago o de guía le llega al cliente por correo.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {orders && total > pageSize && (
        <nav className="pager" aria-label="Páginas">
          <span className="muted">{total} pedidos</span>
          <div className="pager-buttons">
            <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))}>
              <ChevronLeft size={16} aria-hidden="true" /> Anterior
            </button>
            <span className="pager-count">Página {page} de {Math.ceil(total / pageSize)}</span>
            <button type="button" className="btn btn-sm" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((n) => n + 1)}>
              Siguiente <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
