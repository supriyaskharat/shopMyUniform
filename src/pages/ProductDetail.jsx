// src/pages/ProductDetail.jsx
// Shows full details for a single product.
// User can select a size and quantity, then add to cart.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shirt, School, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch the product when the page loads
  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => navigate('/products')) // Redirect if product not found
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    addToCart(product, selectedSize, quantity);
    setSuccessMessage(`Added ${quantity}x ${product.name} (${selectedSize}) to your cart!`);
    setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
  };

  if (isLoading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (!product) return null;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="product-detail-layout">
        {/* Product Image placeholder */}
        <div className="product-detail-image"><Shirt size={64} /></div>

        {/* Product Info */}
        <div className="product-detail-info">
          <p style={{ color: 'var(--text-light)', textTransform: 'capitalize' }}>
            {product.category} · {product.gender} · <School size={14} style={{ verticalAlign: 'text-bottom' }} /> {product.school?.name}
          </p>
          <h1>{product.name}</h1>

          {product.description && (
            <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>{product.description}</p>
          )}

          <div className="product-detail-price">₹{product.price}</div>

          <p style={{ marginBottom: '8px' }}>
            <strong>Color:</strong> {product.color} &nbsp;
            <strong>Grades:</strong> {product.grades.join(', ')}
          </p>

          {/* Size Selector */}
          <div className="form-group">
            <label className="form-label">Select Size</label>
            <div className="size-chips">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className={`size-chip ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  style={{ cursor: 'pointer', padding: '6px 12px' }}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
          </div>

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn btn-primary" onClick={handleAddToCart}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
