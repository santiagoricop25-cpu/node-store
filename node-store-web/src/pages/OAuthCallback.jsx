import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(oauthError);

  useEffect(() => {
    if (!code || oauthError) return;
    api
      .oauthExchange(code)
      .then(({ accessToken, user }) => {
        setSession(accessToken, user);
        navigate('/');
      })
      .catch((err) => setError(err.message || 'No pudimos completar el inicio de sesión.'));
  }, [code, oauthError, setSession, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-eyebrow">// tienda.ricops.com</div>
        <h1>Iniciando sesión…</h1>
        {error ? (
          <>
            <div className="auth-error">{error}</div>
            <Link to="/ingresar" className="btn btn-buy btn-block">Volver a intentar</Link>
          </>
        ) : (
          <p>Un momento, estamos confirmando tu cuenta.</p>
        )}
      </div>
    </div>
  );
}
