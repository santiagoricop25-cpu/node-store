import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatPrice, formatDate } from '../lib/format.js';
import { BarChart, Donut, HBars, Sparkline } from '../components/Charts.jsx';
import { CATEGORIES } from '../lib/catalog.js';
import './Dashboard.css';

const ONLINE_POLL_MS = 15000;
const DATA_POLL_MS = 60000;
const RANGES = [7, 14, 30];
const LOW_STOCK = 5;

const STATUS_ORDER = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
const STATUS_COLORS = {
  pendiente: 'var(--series-4)',
  confirmado: 'var(--series-1)',
  enviado: 'var(--series-3)',
  entregado: 'var(--series-5)',
  cancelado: 'var(--series-2)',
};
const PAYMENT_LABELS = {
  contra_entrega: 'Contra entrega',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  wompi: 'Wompi',
};
const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--series-5)'];

// Día calendario en Bogotá (YYYY-MM-DD), para agrupar pedidos por fecha local.
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
const dayLabel = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' });
const compactCop = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });
const countsTowardSales = (o) => o.status !== 'cancelado';

function Delta({ now, before }) {
  if (!before) return <span className="delta flat">Sin periodo anterior</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`delta ${up ? 'up' : 'down'}`}>
      <Icon size={14} aria-hidden="true" /> {up ? '+' : ''}{pct}% <em>vs periodo anterior</em>
    </span>
  );
}

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(14);
  const [metric, setMetric] = useState('ventas');
  const [updatedAt, setUpdatedAt] = useState(null);

  // Estadísticas, pedidos y productos; se refrescan solos cada minuto.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      Promise.allSettled([api.stats(accessToken), api.orders(accessToken), api.products(accessToken)]).then(
        ([s, o, p]) => {
          if (cancelled) return;
          if (s.status === 'fulfilled') setStats(s.value);
          if (o.status === 'fulfilled') setOrders(o.value.orders || []);
          if (p.status === 'fulfilled') setProducts(p.value.products || []);
          setError(s.status === 'rejected' && o.status === 'rejected' ? 'No pudimos cargar las estadísticas.' : null);
          setUpdatedAt(new Date());
        }
      );
    load();
    const id = setInterval(load, DATA_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [accessToken]);

  // El contador "en línea ahora" se refresca solo, aparte del resto de las
  // estadísticas — así se siente vivo sin tener que recargar todo el panel.
  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      api
        .onlineCount(accessToken)
        .then(({ onlineNow }) => !cancelled && setStats((s) => (s ? { ...s, onlineNow } : s)))
        .catch(() => {});
    };
    const id = setInterval(poll, ONLINE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [accessToken]);

  const view = useMemo(() => {
    if (!orders) return null;
    const today = new Date();
    const days = [];
    for (let i = range - 1; i >= 0; i -= 1) {
      const d = new Date(today.getTime() - i * 86400000);
      days.push({ key: dayKey(d), date: d });
    }
    const inRange = new Set(days.map((d) => d.key));
    const prevStart = new Date(today.getTime() - (2 * range - 1) * 86400000);
    const prevKeys = new Set();
    for (let i = 0; i < range; i += 1) prevKeys.add(dayKey(new Date(prevStart.getTime() + i * 86400000)));

    const current = orders.filter((o) => inRange.has(dayKey(o.createdAt)));
    const previous = orders.filter((o) => prevKeys.has(dayKey(o.createdAt)));
    const sales = (list) => list.filter(countsTowardSales).reduce((s, o) => s + Number(o.total || 0), 0);
    const count = (list) => list.filter(countsTowardSales).length;

    const byDay = days.map(({ key, date }) => {
      const list = current.filter((o) => dayKey(o.createdAt) === key && countsTowardSales(o));
      return {
        key,
        label: dayLabel.format(date),
        ventas: list.reduce((s, o) => s + Number(o.total || 0), 0),
        pedidos: list.length,
      };
    });

    const statusCounts = STATUS_ORDER.map((s) => ({
      label: s,
      value: current.filter((o) => o.status === s).length,
      color: STATUS_COLORS[s],
    }));

    const methods = {};
    current.filter(countsTowardSales).forEach((o) => {
      methods[o.paymentMethod] = (methods[o.paymentMethod] || 0) + 1;
    });
    const paymentMix = Object.entries(methods)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v], i) => ({ label: PAYMENT_LABELS[k] || k, value: v, color: SERIES[i % SERIES.length] }));

    const units = {};
    current.filter(countsTowardSales).forEach((o) =>
      (o.items || []).forEach((it) => {
        const k = it.productId || it.title;
        units[k] = units[k] || { label: it.title, value: 0, revenue: 0 };
        units[k].value += Number(it.quantity || 0);
        units[k].revenue += Number(it.price || 0) * Number(it.quantity || 0);
      })
    );
    const topProducts = Object.entries(units)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const salesNow = sales(current);
    const ordersNow = count(current);
    const salesBefore = sales(previous);
    const ordersBefore = count(previous);

    return {
      byDay,
      statusCounts,
      paymentMix,
      topProducts,
      salesNow,
      salesBefore,
      ordersNow,
      ordersBefore,
      ticketNow: ordersNow ? salesNow / ordersNow : 0,
      ticketBefore: ordersBefore ? salesBefore / ordersBefore : 0,
      totalInRange: current.length,
      latest: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    };
  }, [orders, range]);

  const stockView = useMemo(() => {
    if (!products) return null;
    const active = products.filter((p) => p.active !== false);
    const byCat = CATEGORIES.map((c, i) => ({
      key: c.slug,
      label: c.name,
      value: active.filter((p) => p.category === c.slug).reduce((s, p) => s + Number(p.stock || 0), 0),
      color: SERIES[i % SERIES.length],
    }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
    const low = active.filter((p) => Number(p.stock) <= LOW_STOCK).sort((a, b) => a.stock - b.stock).slice(0, 6);
    return { byCat, low, activeCount: active.length };
  }, [products]);

  const firstName = user?.full_name?.split(' ')[0] || 'admin';
  const loading = '···';

  return (
    <div className="admin-page dashboard">
      <div className="admin-page-head">
        <div>
          <h1>Hola, {firstName}.</h1>
          <p className="admin-subtitle">
            Así va tienda.ricops.com{updatedAt ? `, actualizado a las ${updatedAt.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}` : ''}
          </p>
        </div>
        <div className="segmented" role="group" aria-label="Periodo">
          {RANGES.map((r) => (
            <button key={r} type="button" className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
              {r} días
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <section className="kpi-grid" aria-label="Cifras principales">
        <div className="kpi kpi-hero">
          <span className="kpi-label">Ventas · últimos {range} días</span>
          <strong className="kpi-value">{view ? formatPrice(view.salesNow) : loading}</strong>
          {view && <Delta now={view.salesNow} before={view.salesBefore} />}
          {view && <Sparkline values={view.byDay.map((d) => d.ventas)} width={220} height={44} />}
        </div>
        <div className="kpi">
          <span className="kpi-label">Pedidos</span>
          <strong className="kpi-value">{view ? view.ordersNow : loading}</strong>
          {view && <Delta now={view.ordersNow} before={view.ordersBefore} />}
        </div>
        <div className="kpi">
          <span className="kpi-label">Ticket promedio</span>
          <strong className="kpi-value">{view ? formatPrice(Math.round(view.ticketNow)) : loading}</strong>
          {view && <Delta now={view.ticketNow} before={view.ticketBefore} />}
        </div>
        <div className="kpi">
          <span className="kpi-label">
            <span className="live-dot" aria-hidden="true" /> En línea ahora
          </span>
          <strong className="kpi-value">{stats?.onlineNow ?? (stats ? '—' : loading)}</strong>
          <span className="delta flat">Visitantes en los últimos 90 s</span>
        </div>
      </section>

      <section className="todo-row" aria-label="Pendientes">
        <Link to="/pedidos" className="todo">
          <strong>{stats ? stats.orders_pending : loading}</strong>
          <span>pedidos por confirmar</span>
        </Link>
        <Link to="/pedidos" className="todo">
          <strong>{stats ? stats.payments_pending : loading}</strong>
          <span>pagos por confirmar</span>
        </Link>
        <Link to="/productos" className="todo">
          <strong>{stockView ? stockView.low.length : loading}</strong>
          <span>productos con poco stock</span>
        </Link>
        <Link to="/usuarios" className="todo">
          <strong>{stats ? stats.total_users : loading}</strong>
          <span>usuarios registrados</span>
        </Link>
      </section>

      <section className="panel panel-wide" aria-labelledby="sales-title">
        <div className="panel-head">
          <div>
            <h2 id="sales-title">{metric === 'ventas' ? 'Ventas por día' : 'Pedidos por día'}</h2>
            <p className="muted">Pedidos no cancelados, en hora de Colombia.</p>
          </div>
          <div className="segmented" role="group" aria-label="Medida">
            <button type="button" className={metric === 'ventas' ? 'active' : ''} onClick={() => setMetric('ventas')}>Ventas</button>
            <button type="button" className={metric === 'pedidos' ? 'active' : ''} onClick={() => setMetric('pedidos')}>Pedidos</button>
          </div>
        </div>
        {view ? (
          <BarChart
            key={`${metric}-${range}`}
            label={metric === 'ventas' ? 'Ventas por día' : 'Pedidos por día'}
            data={view.byDay.map((d) => ({ key: d.key, label: d.label, value: d[metric] }))}
            format={metric === 'ventas' ? formatPrice : (v) => `${v} ${v === 1 ? 'pedido' : 'pedidos'}`}
            formatAxis={metric === 'ventas' ? (v) => `$${compactCop.format(v)}` : (v) => v}
          />
        ) : (
          <div className="chart-skeleton" />
        )}
      </section>

      <div className="panel-grid">
        <section className="panel" aria-labelledby="status-title">
          <div className="panel-head">
            <h2 id="status-title">Estado de los pedidos</h2>
          </div>
          {view ? (
            <Donut
              key={`st-${range}`}
              data={view.statusCounts}
              center={view.totalInRange}
              centerLabel={`pedidos en ${range} días`}
            />
          ) : (
            <div className="chart-skeleton round" />
          )}
        </section>

        <section className="panel" aria-labelledby="pay-title">
          <div className="panel-head">
            <h2 id="pay-title">Cómo pagan</h2>
          </div>
          {view && view.paymentMix.length ? (
            <Donut
              key={`pm-${range}`}
              data={view.paymentMix}
              center={view.ordersNow}
              centerLabel="pedidos no cancelados"
            />
          ) : view ? (
            <p className="chart-empty">Todavía no hay pedidos en este periodo.</p>
          ) : (
            <div className="chart-skeleton round" />
          )}
        </section>

        <section className="panel" aria-labelledby="top-title">
          <div className="panel-head">
            <h2 id="top-title">Lo más vendido</h2>
            <span className="muted">unidades</span>
          </div>
          {view ? (
            <HBars
              key={`top-${range}`}
              data={view.topProducts}
              format={(v) => `${v} u.`}
              empty="Todavía no hay ventas en este periodo."
            />
          ) : (
            <div className="chart-skeleton" />
          )}
        </section>

        <section className="panel" aria-labelledby="stock-title">
          <div className="panel-head">
            <h2 id="stock-title">Stock por categoría</h2>
            <span className="muted">{stockView ? `${stockView.activeCount} productos activos` : ''}</span>
          </div>
          {stockView ? (
            <HBars data={stockView.byCat} format={(v) => `${v.toLocaleString('es-CO')} u.`} />
          ) : (
            <div className="chart-skeleton" />
          )}
        </section>
      </div>

      <div className="panel-grid two">
        <section className="panel" aria-labelledby="latest-title">
          <div className="panel-head">
            <h2 id="latest-title">Últimos pedidos</h2>
            <Link to="/pedidos" className="panel-link">Ver todos</Link>
          </div>
          {view && view.latest.length ? (
            <ul className="mini-list">
              {view.latest.map((o) => (
                <li key={o.id}>
                  <div>
                    <strong>{o.orderNumber}</strong>
                    <span>{o.customer?.name || o.customer?.email || 'Cliente'} · {formatDate(o.createdAt)}</span>
                  </div>
                  <span className="admin-status" style={{ color: 'var(--ink-2)', background: 'var(--bg)' }}>
                    <i className="status-dot" style={{ background: STATUS_COLORS[o.status] }} />
                    {o.status}
                  </span>
                  <strong className="mini-amount">{formatPrice(o.total)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="chart-empty">{view ? 'Todavía no hay pedidos.' : 'Cargando…'}</p>
          )}
        </section>

        <section className="panel" aria-labelledby="low-title">
          <div className="panel-head">
            <h2 id="low-title">Poco stock</h2>
            <Link to="/productos" className="panel-link">Ir a productos</Link>
          </div>
          {stockView && stockView.low.length ? (
            <ul className="mini-list">
              {stockView.low.map((p) => (
                <li key={p.id}>
                  <div className="mini-prod">
                    {p.image && <img src={p.image} alt="" width="40" height="40" />}
                    <div>
                      <strong>{p.title}</strong>
                      <span>{p.brand}</span>
                    </div>
                  </div>
                  <span className={`admin-status ${Number(p.stock) === 0 ? 'bad' : 'wip'}`}>
                    {Number(p.stock) === 0 ? 'agotado' : `quedan ${p.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="chart-empty">{stockView ? `Ningún producto activo tiene ${LOW_STOCK} unidades o menos.` : 'Cargando…'}</p>
          )}
        </section>
      </div>

      <div className="admin-note">
        El pago en línea con Wompi todavía no está conectado: los pedidos se registran con el método que
        elige el cliente (contra entrega o transferencia) y tú marcas el pago como confirmado en{' '}
        <Link to="/pedidos" className="panel-link">Pedidos</Link> cuando lo recibas. Los gráficos cuentan todos
        los pedidos no cancelados. Histórico: <strong>{stats ? formatPrice(stats.revenue_total) : loading}</strong> en
        ventas ya pagadas y {stats ? stats.total_orders : loading} pedidos en total.
      </div>
    </div>
  );
}
