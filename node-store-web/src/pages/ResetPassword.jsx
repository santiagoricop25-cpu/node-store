import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ token, password });
      setDone(true);
      setTimeout(() => navigate('/ingresar'), 1800);
    } catch (err) {
      setError(err.message || 'El enlace no es válido o ya expiró.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card card">
          <h1>Enlace inválido</h1>
          <p>Falta el token de recuperación. Solicita uno nuevo desde el correo.</p>
          <Link to="/olvide-password" className="btn btn-buy btn-block">Solicitar de nuevo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-eyebrow">// tienda.ricops.com</div>
        <h1>Define tu nueva contraseña</h1>

        {done ? (
          <div className="auth-success">Contraseña actualizada — redirigiendo a ingresar…</div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <label>
              Nueva contraseña
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="btn btn-buy btn-block" type="submit" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
