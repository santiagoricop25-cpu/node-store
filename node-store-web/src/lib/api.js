// Cliente delgado para hablar con node-store-api.
// El accessToken vive solo en memoria (nunca en localStorage); el refresh
// token vive en una cookie httpOnly que el navegador maneja solo.

const API_URL = import.meta.env.VITE_API_URL || 'https://api.ricops.com';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, accessToken, headers } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(data?.error || data?.message || `Error ${res.status}`, res.status, data);
  }
  return data;
}

export const api = {
  register: ({ email, password, fullName }) =>
    request('/auth/register', { method: 'POST', body: { email, password, fullName } }),

  login: ({ email, password }) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  refresh: () => request('/auth/refresh', { method: 'POST' }),

  me: (accessToken) => request('/auth/me', { accessToken }),

  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: ({ token, password }) =>
    request('/auth/reset-password', { method: 'POST', body: { token, password } }),

  verifyEmail: (token) => request(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  oauthExchange: (code) => request('/auth/oauth/exchange', { method: 'POST', body: { code } }),

  // Catálogo real (Fase 03) — si esto falla (API caída, red bloqueada), quien
  // llama debe caer de vuelta al catálogo local para que la tienda nunca se
  // quede en blanco.
  products: () => request('/products'),

  // Checkout (Fase 04) — crea la orden en el backend. accessToken es opcional:
  // sin sesión, la compra sigue funcionando como invitado.
  createOrder: (payload, accessToken) =>
    request('/orders', { method: 'POST', body: payload, accessToken }),

  myOrders: (accessToken) => request('/orders/me', { accessToken }),

  pingPresence: (visitorId) =>
    request('/presence/ping', { method: 'POST', body: { visitorId } }),
};

// URLs de redirección directa para login social (Fase 02) — el navegador
// navega de verdad a estas rutas, no se llaman por fetch.
export const oauthUrls = {
  google: `${API_URL}/auth/google`,
  apple: `${API_URL}/auth/apple`,
};

export { ApiError, API_URL };
