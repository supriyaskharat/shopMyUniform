// src/pages/OrderDetail.jsx
// Shows the full details of a single order, including a visual progress tracker.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Settings, Truck, CheckCircle, Calendar, Phone } from 'lucide-react';
import api from '../api/axios';

// The four stages of an order in sequence
const ORDER_STAGES = ['placed', 'processing', 'shipped', 'delivered'];

const STAGE_ICON = {
  placed:     ClipboardList,
  processing: Settings,
  shipped:    Truck,
  delivered:  CheckCircle,
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!order) return null;

  // Find where the current status falls in the stages array
  const currentStageIndex = ORDER_STAGES.indexOf(order.status);

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/orders')} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={14} /> Back to Orders
      </button>

      <div className="card" style={{ maxWidth: '700px' }}>
        {/* Order Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ color: 'var(--primary)' }}>{order.orderNumber}</h2>
          <span className={`status-badge status-${order.status}`}>{order.status}</span>
        </div>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Visual Progress Tracker */}
        {order.status !== 'cancelled' && (
          <div className="progress-tracker">
            {ORDER_STAGES.map((stage, index) => {
              const isDone   = index < currentStageIndex;
              const isActive = index === currentStageIndex;
              const StageIcon = STAGE_ICON[stage];

              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div className="progress-step">
                    <div className={`step-circle ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                      <StageIcon size={16} />
                    </div>
                    <span className={`step-label ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                      {stage}
                    </span>
                  </div>
                  {/* Draw a line between steps (not after the last one) */}
                  {index < ORDER_STAGES.length - 1 && (
                    <div className={`progress-line ${isDone ? 'done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Estimated Delivery */}
        {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="alert alert-info" style={{ marginBottom: '24px' }}>
            <Calendar size={14} style={{ verticalAlign: 'text-bottom' }} /> Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        )}

        {/* Items Table */}
        <h3 style={{ marginBottom: '12px' }}>Items Ordered</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Item</th>
              <th style={{ padding: '8px 12px' }}>Size</th>
              <th style={{ padding: '8px 12px' }}>Qty</th>
              <th style={{ padding: '8px 12px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px' }}>{item.name}</td>
                <td style={{ padding: '10px 12px' }}>{item.size}</td>
                <td style={{ padding: '10px 12px' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', fontWeight: '600' }}>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Shipping Address + Total */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Shipping To</h3>
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p><Phone size={14} style={{ verticalAlign: 'text-bottom' }} /> {order.shippingAddress.phone}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ marginBottom: '8px' }}>Total Amount</h3>
            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)' }}>₹{order.totalAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
