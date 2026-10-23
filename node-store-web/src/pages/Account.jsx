import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Account() {
  const { user, status, logout } = useAuth();

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
    </div>
  );
}
