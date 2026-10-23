// La API responde con códigos (`email_in_use`, `invalid_credentials`…);
// aquí se traducen a frases que un cliente entiende.
const MESSAGES = {
  email_in_use: 'Ya existe una cuenta con ese correo. Ingresa o recupera tu contraseña.',
  invalid_credentials: 'El correo o la contraseña no coinciden.',
  invalid_or_expired_token: 'El enlace no es válido o ya expiró. Pide uno nuevo.',
  missing_token: 'Al enlace le falta información. Ábrelo de nuevo desde el correo.',
  too_many_attempts: 'Demasiados intentos seguidos. Espera unos minutos e intenta otra vez.',
  user_not_found: 'No encontramos una cuenta con ese correo.',
  validation_error: 'Revisa los datos: falta algo o tiene un formato que no reconocemos.',
  session_revoked: 'Tu sesión se cerró. Vuelve a ingresar.',
};

export function friendlyError(err, fallback) {
  if (!err) return fallback;
  if (err.message === 'Failed to fetch') return 'No pudimos conectar con el servidor. Revisa tu internet e intenta de nuevo.';
  return MESSAGES[err.message] || MESSAGES[err.data?.error] || err.message || fallback;
}
