// src/pages/Products.jsx
// The main product catalog page with search and filters.
// Fetches products from the backend whenever filters change.

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Shirt, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

// Available filter options
const CATEGORIES = ['shirt', 'trouser', 'skirt', 'blazer', 'tie', 'shoes', 'shorts', 'pinafore'];
const GENDERS    = ['boys', 'girls', 'unisex'];
const GRADES     = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const PAGE_SIZE  = 12;

function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch products from the API whenever any filter or the page changes
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (searchText)       params.search   = searchText;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedGender)   params.gender   = selectedGender;
      if (selectedGrade)    params.grade    = selectedGrade;

      const res = await api.get('/products', { params });
      setProducts(res.data.data);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
      setTotal(res.data.pagination?.total ?? res.data.data.length);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchText, selectedCategory, selectedGender, selectedGrade]);

  useEffect(() => {
    // Add a small delay for the search input so we don't hit the API on every keystroke
    const debounceTimer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(debounceTimer); // Clear timer if filter changes before 400ms
  }, [fetchProducts]);

  // Each filter setter also resets to page 1, so a new filter never lands on
  // a now out-of-range page instead of chaining a second effect off of it.
  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleSearchChange = updateFilter(setSearchText);
  const handleCategoryChange = updateFilter(setSelectedCategory);
  const handleGenderChange = updateFilter(setSelectedGender);
  const handleGradeChange = updateFilter(setSelectedGrade);

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedGender('');
    setSelectedGrade('');
    setPage(1);
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
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
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
          onChange={(e) => handleGenderChange(e.target.value)}
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
          onChange={(e) => handleGradeChange(e.target.value)}
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
        <div className="products-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
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
            Showing {products.length} of {total} product{total !== 1 ? 's' : ''}
          </p>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span className="pagination-status">Page {page} of {totalPages}</span>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
