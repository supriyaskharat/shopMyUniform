// src/pages/Orders.jsx
// Shows all orders placed by the logged-in user.

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../api/axios';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Pick up the success message if we were redirected here from Checkout
  const successMessage = location.state?.successMessage;

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track your uniform orders</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Package size={40} /></div>
          <h3>No orders yet</h3>
          <p>Once you place an order, it will appear here</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '16px' }}>
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-left">
                <h3>{order.orderNumber}</h3>
                <p>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="order-card-right">
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
                <span className="order-total">₹{order.totalAmount}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
