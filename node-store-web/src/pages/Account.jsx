import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Account() {
  const { user, status, logout } = useAuth();

  if (status === 'checking') return null;
  if (status === 'anon') return <Navigate to="/ingresar" replace />;

  return (
    <div className="account-page">
      <h1>Mi cuenta</h1>
      <div className="account-card card">
        <div className="account-row">
          <span>Nombre</span>
          <span>{user?.full_name}</span>
        </div>
        <div className="account-row">
          <span>Correo</span>
          <span>{user?.email}</span>
        </div>
        <div className="account-row">
          <span>Correo verificado</span>
          <span>{user?.email_verified_at ? 'Sí' : 'Pendiente'}</span>
        </div>
        <div className="account-row">
          <span>Rol</span>
          <span>{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
        </div>
        <button className="btn btn-block" onClick={logout}>Cerrar sesión</button>
      </div>
      <p className="auth-switch" style={{ marginTop: 16 }}>
        <Link to="/">← Volver a la tienda</Link>
      </p>
    </div>
  );
}
