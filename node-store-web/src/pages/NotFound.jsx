import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container empty-page">
      <h1>Esta página no existe</h1>
      <p>El enlace que seguiste está incompleto o el producto ya no está en la tienda.</p>
      <Link to="/" className="btn btn-accent">Volver al inicio</Link>
    </div>
  );
}
