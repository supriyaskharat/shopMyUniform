// src/components/Navbar.jsx
// The top navigation bar shown on every page.
// Shows different links depending on whether the user is logged in.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/products" className="navbar-logo">
        🏫 ShopMyUniform
      </Link>

      {/* Navigation Links */}
      <ul className="navbar-links">
        <li>
          <Link to="/products">Products</Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/orders">My Orders</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              {/* Cart icon with item count badge */}
              <Link to="/cart" className="cart-link">
                🛒 Cart
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
