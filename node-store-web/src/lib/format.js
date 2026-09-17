const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatPrice(value) {
  return cop.format(value);
}

export function formatRating(value) {
  return value.toFixed(1).replace('.', ',');
}
