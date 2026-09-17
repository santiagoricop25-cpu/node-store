import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === 'checking') {
    return <div className="admin-loading">Cargando…</div>;
  }
  if (status === 'anon') {
    return <Navigate to="/login" replace />;
  }
  if (status === 'forbidden') {
    return (
      <div className="admin-loading">
        <p>Esta cuenta no tiene permisos de administrador.</p>
      </div>
    );
  }
  return children;
}
