import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import './Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState('loading'); // loading | ok | error

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    api
      .verifyEmail(token)
      .then(() => setState('ok'))
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-eyebrow">// tienda.ricops.com</div>
        <h1>Verificación de correo</h1>

        {state === 'loading' && <p>Verificando tu correo…</p>}
        {state === 'ok' && (
          <div className="auth-success">¡Tu correo quedó verificado! Ya puedes disfrutar de la tienda.</div>
        )}
        {state === 'error' && (
          <div className="auth-error">El enlace no es válido o ya expiró.</div>
        )}

        <Link to="/" className="btn btn-buy btn-block">Ir a la tienda</Link>
      </div>
    </div>
  );
}
