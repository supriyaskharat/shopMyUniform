// src/components/ProductCard.jsx
// Displays a single product in the catalog grid.
// Clicking "View Details" navigates to the full product page.

import { useNavigate } from 'react-router-dom';
import { Shirt, School } from 'lucide-react';

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="product-card">
      {/* Product image placeholder */}
      <div className="product-card-image"><Shirt size={40} /></div>

      <div className="product-card-body">
        <p className="product-name">{product.name}</p>
        <p className="product-school"><School size={14} /> {product.school?.name || 'All Schools'}</p>

        {/* Show available sizes as small chips */}
        <div className="size-chips">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="size-chip">{size}</span>
          ))}
          {product.sizes.length > 4 && (
            <span className="size-chip">+{product.sizes.length - 4}</span>
          )}
        </div>

        <p className="product-price">₹{product.price}</p>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
