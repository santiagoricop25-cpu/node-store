import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">tienda<span>admin</span></div>
      <nav className="admin-nav" aria-label="Secciones">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            aria-label={l.label}
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <l.icon size={18} aria-hidden="true" />
            <span className="label">{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="admin-user">
        <div className="admin-user-avatar">{user?.full_name?.[0] || 'A'}</div>
        <div className="admin-user-info">
          <strong>{user?.full_name || 'Administrador'}</strong>
          <span>{user?.email}</span>
        </div>
        <button className="admin-logout" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
