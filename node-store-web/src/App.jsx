import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Favorites from './pages/Favorites.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';
import Account from './pages/Account.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Enlaces como /#rebajas bajan a su sección; el resto empieza arriba.
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="page-fade" key={location.pathname} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:slug" element={<Category />} />
            <Route path="/buscar" element={<Category />} />
            <Route path="/producto/:id" element={<Product />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ingresar" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/olvide-password" element={<ForgotPassword />} />
            <Route path="/restablecer-contrasena" element={<ResetPassword />} />
            <Route path="/verificar-correo" element={<VerifyEmail />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/cuenta" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
