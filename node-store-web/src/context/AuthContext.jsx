import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | authed | anon

  // Al cargar la app, intenta recuperar sesión con el refresh token (cookie httpOnly).
  useEffect(() => {
    (async () => {
      try {
        const { accessToken: token } = await api.refresh();
        const me = await api.me(token);
        setAccessToken(token);
        setUser(me.user || me);
        setStatus('authed');
      } catch {
        setStatus('anon');
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { accessToken: token, user: u } = await api.login({ email, password });
    setAccessToken(token);
    setUser(u);
    setStatus('authed');
    return u;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const { accessToken: token, user: u } = await api.register({ email, password, fullName });
    setAccessToken(token);
    setUser(u);
    setStatus('authed');
    return u;
  }, []);

  const setSession = useCallback((token, u) => {
    setAccessToken(token);
    setUser(u);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignorar — igual limpiamos el estado local */
    }
    setAccessToken(null);
    setUser(null);
    setStatus('anon');
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, status, login, register, logout, setSession, isAuthed: status === 'authed' }),
    [user, accessToken, status, login, register, logout, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export { ApiError };
