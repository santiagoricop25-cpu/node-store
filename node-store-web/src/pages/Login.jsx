import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { friendlyError } from '../lib/errors.js';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo);
    } catch (err) {
      setError(friendlyError(err, 'No pudimos iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Ingresa a tu cuenta</h1>
        <p className="auth-lead">Tu carrito y tus favoritos te esperan del otro lado.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <label className="field">
            Correo electrónico
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="field">
            Contraseña
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          <Link to="/olvide-password" className="auth-forgot">¿Olvidaste tu contraseña?</Link>
          <button className="btn btn-accent btn-block" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/registro" state={location.state}>Crea una</Link>
        </p>
      </div>
    </div>
  );
}
