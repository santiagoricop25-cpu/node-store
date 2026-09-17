import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'node-store-wishlist';

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible — favoritos sigue funcionando en memoria */
    }
  }, [items]);

  const isWished = useCallback((id) => items.some((it) => it.id === id), [items]);

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.id === product.id);
      if (exists) return prev.filter((it) => it.id !== product.id);
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice || null,
          rating: product.rating,
          reviews: product.reviews,
          stock: product.stock,
          category: product.category,
          brand: product.brand,
          freeShipping: product.freeShipping,
        },
      ];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.length;

  const value = useMemo(
    () => ({ items, isWished, toggle, remove, clear, count }),
    [items, isWished, toggle, remove, clear, count]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist debe usarse dentro de <WishlistProvider>');
  return ctx;
}
