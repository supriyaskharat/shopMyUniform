// src/App.jsx
// Defines the app's page routes and wraps them with the Navbar and ChatWidget.
// ProtectedRoute ensures only logged-in users can access certain pages.

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import './App.css';

// Wraps a page to redirect to login if the user is not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Breadcrumbs />
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — require login */}
          <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

          {/* Public routes */}
          <Route path="/products"    element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      {/* AI chat widget — floats on every page */}
      <ChatWidget />
    </>
  );
}

export default App;
