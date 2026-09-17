import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

function Shell({ children }) {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Shell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/productos"
                  element={<ComingSoon title="Productos" description="La gestión de catálogo se activará cuando el backend tenga endpoints de productos (Fase 03)." />}
                />
                <Route
                  path="/pedidos"
                  element={<ComingSoon title="Pedidos" description="La gestión de pedidos se activará junto con el carrito y los pagos (Fase 04-05)." />}
                />
                <Route
                  path="/usuarios"
                  element={<ComingSoon title="Usuarios" description="La gestión de usuarios y roles llegará en una fase posterior." />}
                />
              </Routes>
            </Shell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
