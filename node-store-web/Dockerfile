# syntax=docker/dockerfile:1.4

# --- Etapa 1: build de la SPA con Vite ---
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=https://api.ricops.com
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Etapa 2: servir los estáticos con nginx ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA: cualquier ruta que no sea un archivo real cae en index.html
# (para que /producto/p1, /categoria/tecnologia, etc. funcionen al recargar).
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:css|js|svg|png|jpg|jpeg|gif|webp|woff2?)$ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800, immutable";
  }
}
EOF

EXPOSE 80
