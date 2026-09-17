// Cliente delgado para hablar con node-store-api (mismo backend que la tienda).
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
  login: ({ email, password }) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  refresh: () => request('/auth/refresh', { method: 'POST' }),
  me: (accessToken) => request('/auth/me', { accessToken }),

  // --- Dashboard ---
  stats: (accessToken) => request('/admin/stats', { accessToken }),
  onlineCount: (accessToken) => request('/admin/online-count', { accessToken }),

  // --- Productos ---
  products: (accessToken, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/products${qs ? `?${qs}` : ''}`, { accessToken });
  },
  createProduct: (accessToken, body) =>
    request('/admin/products', { method: 'POST', body, accessToken }),
  updateProduct: (accessToken, id, body) =>
    request(`/admin/products/${id}`, { method: 'PUT', body, accessToken }),
  deleteProduct: (accessToken, id) =>
    request(`/admin/products/${id}`, { method: 'DELETE', accessToken }),

  // --- Pedidos ---
  orders: (accessToken, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/orders${qs ? `?${qs}` : ''}`, { accessToken });
  },
  updateOrder: (accessToken, id, body) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', body, accessToken }),

  // --- Usuarios ---
  users: (accessToken, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/users${qs ? `?${qs}` : ''}`, { accessToken });
  },
};

export { ApiError, API_URL };
