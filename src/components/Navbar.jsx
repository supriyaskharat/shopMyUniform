// src/components/Navbar.jsx
// The top navigation bar shown on every page.
// Shows different links depending on whether the user is logged in.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, ShoppingCart, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/products" className="navbar-logo" onClick={closeMenu}>
        <School size={20} /> ShopMyUniform
      </Link>

      {/* Mobile-only actions — visible next to the hamburger without opening the menu */}
      {user && (
        <div className="navbar-mobile-actions">
          <Link to="/cart" className="cart-link" onClick={closeMenu}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>
        </div>
      )}

      {/* Mobile menu toggle */}
      <button
        className="navbar-menu-toggle"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <li>
          <Link to="/products" onClick={closeMenu}>Products</Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/orders" onClick={closeMenu}>My Orders</Link>
            </li>
            <li>
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
            </li>
            <li className="navbar-links-cart">
              {/* Cart icon with item count badge */}
              <Link to="/cart" className="cart-link" onClick={closeMenu}>
                <ShoppingCart size={16} /> Cart
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
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
            <li><Link to="/register" onClick={closeMenu}>Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
