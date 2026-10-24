import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import './Users.css';

const ROLE_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Administradores' },
  { value: 'customer', label: 'Clientes' },
];

const ERRORS = {
  cannot_demote_self: 'No puedes quitarte tus propios permisos de administrador.',
  last_admin: 'Debe quedar al menos un administrador. Primero da permisos a otra persona.',
  not_found: 'Ese usuario ya no existe.',
  forbidden: 'Tu cuenta no tiene permisos para hacer este cambio.',
};

export default function Users() {
  const { user: me, accessToken } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState(null); // { user, role }
  const [saving, setSaving] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    (term, roleFilter, pageNumber) => {
      const id = (requestId.current += 1);
      api
        .users(accessToken, {
          ...(term ? { search: term } : {}),
          ...(roleFilter ? { role: roleFilter } : {}),
          page: pageNumber,
        })
        .then((res) => {
          if (id !== requestId.current) return; // llegó una respuesta más nueva
          setData(res);
          setError(null);
        })
        .catch(() => id === requestId.current && setError('No pudimos cargar los usuarios.'));
    },
    [accessToken]
  );

  // Busca mientras escribes, con una pausa corta para no pedir en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => load(search.trim(), role, page), search ? 280 : 0);
    return () => clearTimeout(t);
  }, [search, role, page, load]);

  function changeSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function changeRole(value) {
    setRole(value);
    setPage(1);
  }

  async function confirmChange() {
    if (!confirming) return;
    setSaving(true);
    try {
      const { user: updated } = await api.setUserRole(accessToken, confirming.user.id, confirming.role);
      setNotice(
        updated.role === 'admin'
          ? `${updated.full_name || updated.email} ahora es administrador. Verá el panel al volver a iniciar sesión.`
          : `${updated.full_name || updated.email} ya no es administrador.`
      );
      setConfirming(null);
      load(search.trim(), role, page);
    } catch (err) {
      setError(ERRORS[err.message] || 'No se pudo cambiar el permiso. Intenta de nuevo.');
      setConfirming(null);
    } finally {
      setSaving(false);
    }
  }

  const users = data?.users;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / (data.pageSize || 20))) : 1;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Usuarios</h1>
          <p className="admin-subtitle">
            Cuentas registradas en tienda.ricops.com. Aquí das o quitas permisos de administrador.
          </p>
        </div>
      </div>

      <section className="user-stats" aria-label="Resumen de usuarios">
        <div className="user-stat">
          <strong>{data ? data.all : '···'}</strong>
          <span>usuarios registrados</span>
        </div>
        <div className="user-stat">
          <strong>{data ? data.admins : '···'}</strong>
          <span>administradores</span>
        </div>
        <div className="user-stat">
          <strong>{data ? data.all - data.admins : '···'}</strong>
          <span>clientes</span>
        </div>
      </section>

      <div className="admin-toolbar">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Buscar usuarios</span>
          <input
            type="search"
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
          />
        </label>
        <div className="segmented" role="group" aria-label="Filtrar por rol">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={role === f.value ? 'active' : ''}
              onClick={() => changeRole(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="notice-ok" role="status">
          <span>{notice}</span>
          <button type="button" className="icon-btn" onClick={() => setNotice(null)} aria-label="Cerrar aviso">
            <X size={16} />
          </button>
        </div>
      )}
      {error && <div className="admin-error">{error}</div>}

      {!users ? (
        <div className="admin-empty">Cargando…</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          {search || role ? 'Ningún usuario coincide con tu búsqueda.' : 'No hay usuarios registrados todavía.'}
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Correo verificado</th>
                  <th>Registrado</th>
                  <th className="num">Permisos</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.id === me?.id;
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="prod-cell">
                          <span className="admin-user-avatar" aria-hidden="true">
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </span>
                          <div>
                            <strong>
                              {u.full_name || 'Sin nombre'} {isMe && <em className="me-tag">tú</em>}
                            </strong>
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-status ${isAdmin ? 'done' : 'next'}`}>
                          {isAdmin ? 'Administrador' : 'Cliente'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status ${u.email_verified_at ? 'done' : 'wip'}`}>
                          {u.email_verified_at ? 'Verificado' : 'Sin verificar'}
                        </span>
                      </td>
                      <td>{formatDate(u.created_at)}</td>
                      <td className="num">
                        {isAdmin ? (
                          <button
                            type="button"
                            className="btn btn-sm"
                            disabled={isMe}
                            title={isMe ? 'No puedes quitarte tus propios permisos' : undefined}
                            onClick={() => setConfirming({ user: u, role: 'customer' })}
                          >
                            <ShieldOff size={15} aria-hidden="true" /> Quitar permisos
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-accent"
                            onClick={() => setConfirming({ user: u, role: 'admin' })}
                          >
                            <ShieldCheck size={15} aria-hidden="true" /> Hacer administrador
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <nav className="pager" aria-label="Páginas">
            <span className="muted">
              {data.total} {data.total === 1 ? 'usuario' : 'usuarios'}
              {(search || role) && ' con este filtro'}
            </span>
            <div className="pager-buttons">
              <button
                type="button"
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} aria-hidden="true" /> Anterior
              </button>
              <span className="pager-count">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </nav>
        </>
      )}

      {confirming && (
        <div className="modal-backdrop" onClick={() => !saving && setConfirming(null)}>
          <div className="modal-card confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="confirm-title">
              {confirming.role === 'admin' ? '¿Dar permisos de administrador?' : '¿Quitar permisos de administrador?'}
            </h2>
            <p className="confirm-person">
              <strong>{confirming.user.full_name || 'Sin nombre'}</strong>
              <span>{confirming.user.email}</span>
            </p>
            <p className="muted">
              {confirming.role === 'admin'
                ? 'Podrá ver y cambiar productos, pedidos y usuarios en este panel. Cuando vuelva a iniciar sesión, el panel le dejará entrar.'
                : 'Dejará de poder entrar a este panel. Si ya tiene una sesión abierta, puede seguir dentro hasta 15 minutos.'}
            </p>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setConfirming(null)} disabled={saving}>
                Cancelar
              </button>
              <button type="button" className="btn btn-accent" onClick={confirmChange} disabled={saving}>
                {saving ? 'Guardando…' : confirming.role === 'admin' ? 'Dar permisos' : 'Quitar permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
