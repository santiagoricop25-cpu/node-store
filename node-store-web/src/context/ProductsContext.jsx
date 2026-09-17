import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { replaceProducts } from '../data/catalog.js';

const ProductsContext = createContext({ ready: false, source: 'local' });

// Al montar la app, intenta traer el catálogo real desde la API. Si funciona,
// reemplaza los datos locales (misma forma, así que nada más se rompe) y
// avisa a los componentes suscritos que vuelvan a renderizar. Si falla
// (API caída, sin red), la tienda sigue funcionando con el catálogo de
// muestra — nunca se queda en blanco por esto.
export function ProductsProvider({ children }) {
  const [state, setState] = useState({ ready: false, source: 'local' });

  useEffect(() => {
    let cancelled = false;
    api
      .products()
      .then(({ products }) => {
        if (cancelled) return;
        replaceProducts(products);
        setState({ ready: true, source: 'api' });
      })
      .catch(() => {
        if (!cancelled) setState({ ready: true, source: 'local' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ProductsContext.Provider value={state}>{children}</ProductsContext.Provider>;
}

// Los componentes que leen PRODUCTS/getProduct/etc. de catalog.js llaman este
// hook solo para suscribirse: cuando el catálogo real llega, este hook fuerza
// el re-render y las páginas vuelven a leer catalog.js, que para entonces ya
// tiene los datos frescos.
export function useProducts() {
  return useContext(ProductsContext);
}
