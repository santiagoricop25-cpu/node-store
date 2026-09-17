import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="admin-page">
      <h1>Resumen</h1>
      <p className="admin-subtitle">Hola, {user?.full_name?.split(' ')[0] || 'admin'} — este es el panel de administración de tienda.ricops.com.</p>

      <div className="admin-cards">
        <div className="admin-card">
          <span className="admin-card-label">Backend + autenticación</span>
          <span className="admin-status done">Listo</span>
        </div>
        <div className="admin-card">
          <span className="admin-card-label">Catálogo real (base de datos)</span>
          <span className="admin-status wip">En progreso</span>
        </div>
        <div className="admin-card">
          <span className="admin-card-label">Gestión de pedidos</span>
          <span className="admin-status next">Próximo</span>
        </div>
        <div className="admin-card">
          <span className="admin-card-label">Gestión de usuarios</span>
          <span className="admin-status next">Próximo</span>
        </div>
      </div>

      <div className="admin-note">
        Este panel ya valida que solo cuentas con rol <strong>admin</strong> puedan entrar. Las secciones
        de Productos, Pedidos y Usuarios se conectarán a datos reales cuando esos endpoints existan en
        node-store-api.
      </div>
    </div>
  );
}
