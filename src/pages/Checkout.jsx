// src/pages/Checkout.jsx
// Checkout page — collects shipping address and places the order.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', street: '', city: '', state: '', pincode: '', phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generic input handler — updates whichever field changed
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Send cart items + address to the backend
      const orderItems = cartItems.map((item) => ({
        productId: item.product._id,
        size: item.size,
        quantity: item.quantity,
      }));

      await api.post('/orders', {
        items: orderItems,
        shippingAddress: form,
      });

      clearCart(); // Empty the cart after successful order
      navigate('/orders', { state: { successMessage: 'Order placed successfully!' } });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Checkout</h1>
        <p>Enter your delivery address to complete the order</p>
      </div>

      <div className="cart-layout">
        {/* Shipping Address Form */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Shipping Address</h3>

          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="Recipient's full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input name="street" className="form-input" value={form.street} onChange={handleChange} required placeholder="House no., street, area" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input name="city" className="form-input" value={form.city} onChange={handleChange} required placeholder="City" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input name="state" className="form-input" value={form.state} onChange={handleChange} required placeholder="State" />
            </div>
            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input name="pincode" className="form-input" value={form.pincode} onChange={handleChange} required placeholder="6-digit PIN code" maxLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="phone" className="form-input" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile number" maxLength={10} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Placing Order...' : <><CheckCircle size={16} /> Place Order</>}
            </button>
          </form>
        </div>

        {/* Order Summary (read-only) */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={`${item.product._id}-${item.size}`} className="summary-row">
              <span>{item.product.name} ({item.size}) × {item.quantity}</span>
              <span>₹{item.product.price * item.quantity}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
