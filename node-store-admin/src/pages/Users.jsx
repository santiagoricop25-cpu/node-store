import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';

export default function Users() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  function load() {
    api
      .users(accessToken, search ? { search } : {})
      .then(({ users: rows }) => setUsers(rows))
      .catch(() => setError('No pudimos cargar los usuarios.'));
  }

  useEffect(load, [accessToken]);

  return (
    <div className="admin-page">
      <h1>Usuarios</h1>
      <p className="admin-subtitle">Cuentas registradas en tienda.ricops.com (no incluye visitantes sin cuenta).</p>

      <div className="admin-toolbar">
        <input
          placeholder="Buscar por nombre o correo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button className="btn" onClick={load}>Buscar</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!users ? (
        <div className="admin-empty">Cargando…</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No hay usuarios registrados todavía.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Verificado</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td><span className={`admin-status ${u.role === 'admin' ? 'done' : 'next'}`}>{u.role}</span></td>
                  <td>{u.email_verified_at ? 'Sí' : 'No'}</td>
                  <td>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
