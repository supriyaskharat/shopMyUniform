// src/components/ProductCard.jsx
// Displays a single product in the catalog grid.
// Clicking "View Details" navigates to the full product page.

import { useNavigate } from 'react-router-dom';

// Map each product category to a descriptive emoji
const CATEGORY_EMOJI = {
  shirt:    '👔',
  trouser:  '👖',
  skirt:    '👗',
  blazer:   '🧥',
  tie:      '👔',
  shoes:    '👟',
  shorts:   '🩳',
  pinafore: '👗',
};

function ProductCard({ product }) {
  const navigate = useNavigate();
  const emoji = CATEGORY_EMOJI[product.category] || '👕';

  return (
    <div className="product-card">
      {/* Product image placeholder using emoji */}
      <div className="product-card-image">{emoji}</div>

      <div className="product-card-body">
        <p className="product-name">{product.name}</p>
        <p className="product-school">🏫 {product.school?.name || 'All Schools'}</p>

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
