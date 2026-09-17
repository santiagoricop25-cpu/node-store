# node-store-web

Frontend de la tienda (SPA en React + Vite). Consume `node-store-api` para
autenticación; el catálogo de productos todavía es un set de datos de muestra
(`src/data/catalog.js`) mientras se construye la Fase 03 del backend (catálogo
real). Cuando ese endpoint exista, solo hay que cambiar `src/data/catalog.js`
por llamadas a la API — el resto de los componentes ya están hechos para
recibir productos con esa misma forma (`id, title, price, image, rating, …`).

## Desarrollo local

```bash
npm install
cp .env.example .env   # y ajusta VITE_API_URL si no usas la API en producción
npm run dev             # http://localhost:5173
```

## Despliegue en Coolify

1. **Conectar el repo**: "New Resource" → Public/Private Git Repository → pega la URL de `node-store-web`.
2. **Build strategy**: `Dockerfile` (ya está en la raíz del repo). Incluye un build multi-stage: compila con Vite y sirve los estáticos con nginx.
3. **Build Arg**: define `VITE_API_URL=https://api.ricops.com` (o el dominio real de la API) como *Build Variable* en Coolify — Vite la necesita en tiempo de build, no de runtime.
4. **Domain**: `https://tienda.ricops.com`, puerto `80` (el que expone nginx).
5. **Deploy**.

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Home con vitrinas por categoría |
| `/categoria/:slug` | Listado con filtros (precio, calificación, envío) |
| `/buscar?q=...` | Resultados de búsqueda |
| `/producto/:id` | Ficha de producto (galería + buy box) |
| `/carrito` | Carrito de compras (persistido en `localStorage`) |
| `/checkout` | Vista previa del flujo de compra (pagos con Wompi, pendientes) |
| `/ingresar`, `/registro` | Autenticación con la API |
| `/olvide-password`, `/restablecer-contrasena` | Recuperación de contraseña |
| `/verificar-correo` | Confirmación de correo (enlace que envía la API) |
| `/oauth/callback` | Vuelta del login social (Fase 02, pendiente de credenciales) |
| `/cuenta` | Datos del usuario logueado |

## Pendientes conocidos

- Catálogo real (Fase 03 del backend): reemplazar `src/data/catalog.js`.
- Carrito → pedidos reales en base de datos (hoy el checkout es una vista previa que no persiste nada en el servidor).
- Pasarela de pagos (Wompi).
- Botones de login social (Google/Apple) en `/ingresar` — el backend y la ruta `/oauth/callback` ya están listos, solo falta activar los botones cuando haya credenciales.
