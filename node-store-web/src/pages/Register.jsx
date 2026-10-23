import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { friendlyError } from '../lib/errors.js';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
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
      await register(email, password, fullName);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(friendlyError(err, 'No pudimos crear tu cuenta.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Crea tu cuenta</h1>
        <p className="auth-lead">Con tu cuenta guardas direcciones y sigues tus pedidos.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <label className="field">
            Nombre completo
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </label>
          <label className="field">
            Correo electrónico
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="field">
            Contraseña
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} aria-describedby="pw-hint" />
            <span id="pw-hint" className="field-hint">Mínimo 8 caracteres.</span>
          </label>
          <button className="btn btn-accent btn-block" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/ingresar" state={location.state}>Ingresa</Link>
        </p>
      </div>
    </div>
  );
}
