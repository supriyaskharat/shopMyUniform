// src/pages/Cart.jsx
// Shopping cart page — shows all items, allows quantity changes, and leads to checkout.

import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;

const CATEGORY_EMOJI = {
  shirt: '👔', trouser: '👖', skirt: '👗', blazer: '🧥',
  tie: '👔', shoes: '👟', shorts: '🩳', pinafore: '👗',
};

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some uniforms to get started!</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '16px' }}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Shopping Cart 🛒</h1>
        <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="card">
          {cartItems.map((item) => {
            const emoji = CATEGORY_EMOJI[item.product.category] || '👕';
            const itemTotal = item.product.price * item.quantity;

            return (
              <div key={`${item.product._id}-${item.size}`} className="cart-item">
                <div className="cart-item-emoji">{emoji}</div>

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-meta">Size: {item.size} · ₹{item.product.price} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="qty-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.product._id, item.size, item.quantity - 1)}
                  >−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1)}
                  >+</button>
                </div>

                <p className="cart-item-price">₹{itemTotal}</p>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeFromCart(item.product._id, item.size)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? '🎉 Free' : `₹${shippingCost}`}</span>
          </div>
          {shippingCost > 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '12px' }}>
              Add ₹{FREE_SHIPPING_THRESHOLD - cartTotal} more for free shipping!
            </p>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate('/checkout')}
            style={{ marginTop: '16px' }}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
