import { useEffect, useState } from 'react';
import { Users, ShoppingBag, Wallet, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';

const ONLINE_POLL_MS = 15000;

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .stats(accessToken)
      .then((s) => !cancelled && setStats(s))
      .catch(() => !cancelled && setError('No pudimos cargar las estadísticas.'));
    return () => {
      cancelled = true;
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

  return (
    <div className="admin-page">
      <h1>Resumen</h1>
      <p className="admin-subtitle">
        Hola, {user?.full_name?.split(' ')[0] || 'admin'} — este es el panel de administración de
        tienda.ricops.com.
      </p>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-cards">
        <div className="admin-card stat-card">
          <div className="stat-icon online"><Radio size={18} /></div>
          <div>
            <span className="stat-value">{stats?.onlineNow ?? (stats ? '—' : '···')}</span>
            <span className="stat-label">En línea ahora</span>
          </div>
        </div>
        <div className="admin-card stat-card">
          <div className="stat-icon"><ShoppingBag size={18} /></div>
          <div>
            <span className="stat-value">{stats ? stats.orders_today : '···'}</span>
            <span className="stat-label">Pedidos hoy</span>
          </div>
        </div>
        <div className="admin-card stat-card">
          <div className="stat-icon"><Wallet size={18} /></div>
          <div>
            <span className="stat-value">{stats ? formatPrice(stats.revenue_today) : '···'}</span>
            <span className="stat-label">Ventas pagadas hoy</span>
          </div>
        </div>
        <div className="admin-card stat-card">
          <div className="stat-icon"><Users size={18} /></div>
          <div>
            <span className="stat-value">{stats ? stats.total_users : '···'}</span>
            <span className="stat-label">Usuarios registrados</span>
          </div>
        </div>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <span className="admin-card-label">Pedidos pendientes por confirmar</span>
          <span className="admin-status wip">{stats ? stats.orders_pending : '···'}</span>
        </div>
        <div className="admin-card">
          <span className="admin-card-label">Pagos pendientes de confirmar</span>
          <span className="admin-status wip">{stats ? stats.payments_pending : '···'}</span>
        </div>
        <div className="admin-card">
          <span className="admin-card-label">Ventas pagadas (histórico)</span>
          <span className="admin-status done">{stats ? formatPrice(stats.revenue_total) : '···'}</span>
        </div>
        <div className="admin-card">
          <span className="admin-card-label">Pedidos totales</span>
          <span className="admin-status done">{stats ? stats.total_orders : '···'}</span>
        </div>
      </div>

      <div className="admin-note">
        El pago en línea con Wompi todavía no está conectado — los pedidos se registran con el
        método que elige el cliente (contra entrega, transferencia) y tú marcas el pago como
        confirmado en <strong>Pedidos</strong> cuando lo recibas. "En línea ahora" cuenta
        visitantes de la tienda en los últimos 90 segundos, no requiere que tengan cuenta.
      </div>
    </div>
  );
}
