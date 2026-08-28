// src/components/ProductCardSkeleton.jsx
// Shimmering placeholder shown in the products grid while a page is loading.
// Mirrors ProductCard's layout so the grid doesn't jump when real cards arrive.

function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton skeleton-image" />

      <div className="product-card-body">
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />

        <div className="size-chips">
          <span className="skeleton skeleton-chip" />
          <span className="skeleton skeleton-chip" />
          <span className="skeleton skeleton-chip" />
        </div>

        <div className="skeleton skeleton-text" style={{ width: '40%', height: '1.1rem' }} />
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
