import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '90px 6vw', textAlign: 'center' }}>
      <h1>404 — página no encontrada</h1>
      <p style={{ color: 'var(--muted)' }}>El enlace que seguiste no existe o fue movido.</p>
      <Link to="/" className="btn btn-buy" style={{ marginTop: 16 }}>
        Volver al inicio
      </Link>
    </div>
  );
}
