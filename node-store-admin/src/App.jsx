import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Users from './pages/Users.jsx';

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
                <Route path="/productos" element={<Products />} />
                <Route path="/pedidos" element={<Orders />} />
                <Route path="/usuarios" element={<Users />} />
              </Routes>
            </Shell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
