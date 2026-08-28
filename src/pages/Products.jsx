// src/pages/Products.jsx
// The main product catalog page with search and filters.
// Fetches products from the backend whenever filters change.

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Shirt } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

// Available filter options
const CATEGORIES = ['shirt', 'trouser', 'skirt', 'blazer', 'tie', 'shoes', 'shorts', 'pinafore'];
const GENDERS    = ['boys', 'girls', 'unisex'];
const GRADES     = ['1','2','3','4','5','6','7','8','9','10','11','12'];

function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  // Fetch products from the API whenever any filter changes
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchText)       params.search   = searchText;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedGender)   params.gender   = selectedGender;
      if (selectedGrade)    params.grade    = selectedGrade;

      const res = await api.get('/products', { params });
      setProducts(res.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchText, selectedCategory, selectedGender, selectedGrade]);

  useEffect(() => {
    // Add a small delay for the search input so we don't hit the API on every keystroke
    const debounceTimer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(debounceTimer); // Clear timer if filter changes before 400ms
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedGender('');
    setSelectedGrade('');
  };

  const hasActiveFilters = searchText || selectedCategory || selectedGender || selectedGrade;

  return (
    <div>
      <div className="page-header">
        <h1>School Uniforms Catalog</h1>
        <p>Find the right uniforms for your school and grade</p>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
        >
          <option value="">All Genders</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          <option value="">All Grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="loading-screen" style={{ height: '200px' }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Shirt size={40} /></div>
          <h3>No products found</h3>
          <p>Try changing your filters or search term</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '16px', color: 'var(--text-light)' }}>
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Products;
