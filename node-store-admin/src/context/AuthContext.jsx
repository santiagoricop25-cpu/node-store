import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | authed | anon | forbidden

  useEffect(() => {
    (async () => {
      try {
        const { accessToken: token } = await api.refresh();
        const me = await api.me(token);
        const u = me.user || me;
        setAccessToken(token);
        setUser(u);
        setStatus(u.role === 'admin' ? 'authed' : 'forbidden');
      } catch {
        setStatus('anon');
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { accessToken: token, user: u } = await api.login({ email, password });
    if (u.role !== 'admin') {
      setStatus('forbidden');
      throw new Error('Esta cuenta no tiene permisos de administrador.');
    }
    setAccessToken(token);
    setUser(u);
    setStatus('authed');
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignorar */
    }
    setAccessToken(null);
    setUser(null);
    setStatus('anon');
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, status, login, logout, isAuthed: status === 'authed' }),
    [user, accessToken, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
