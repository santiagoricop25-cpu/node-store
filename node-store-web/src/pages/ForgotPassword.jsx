import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { friendlyError } from '../lib/errors.js';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(friendlyError(err, 'No pudimos procesar la solicitud.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recuperar contraseña</h1>

        {sent ? (
          <div className="notice notice-ok" role="status">
            Si el correo existe, te enviamos un enlace para restablecer tu contraseña.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="notice notice-error" role="alert">{error}</div>}
            <label className="field">
              Correo electrónico
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="btn btn-accent btn-block" type="submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          <Link to="/ingresar">← Volver a ingresar</Link>
        </div>
      </div>
    </div>
  );
}
