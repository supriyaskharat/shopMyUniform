// src/components/Breadcrumbs.jsx
// Derives a breadcrumb trail from the current URL — no page-level wiring needed.

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Human-readable label for each static route segment
const SEGMENT_LABELS = {
  products: 'Products',
  cart: 'Cart',
  checkout: 'Checkout',
  orders: 'Orders',
  profile: 'Profile',
};

// Pages where a breadcrumb trail doesn't add value
const HIDDEN_PATHS = ['/', '/login', '/register', '/products'];

function labelFor(segment, previousSegment) {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Dynamic :id segment — label it based on what it's an id of
  if (previousSegment === 'products') return 'Product Details';
  if (previousSegment === 'orders') return 'Order Details';
  return segment;
}

function Breadcrumbs() {
  const { pathname } = useLocation();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: labelFor(segment, segments[index - 1]),
    path: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/products">Home</Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="breadcrumb-item">
          <ChevronRight size={14} />
          {crumb.isLast ? (
            <span aria-current="page">{crumb.label}</span>
          ) : (
            <Link to={crumb.path}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
