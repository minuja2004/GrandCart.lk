import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Shop({ 
  products, 
  addToCart, 
  toggleWishlist, 
  wishlist
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Category URL parameter sync
  const selectedCategory = searchParams.get('category') || 'All';
  
  // Search query parameter sync
  const searchParamsQuery = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(searchParamsQuery);

  useEffect(() => {
    setSearchTerm(searchParamsQuery);
  }, [searchParamsQuery]);

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('popular');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);

  // Set category in URL params
  const setSelectedCategory = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  // Available brands in tech products
  const brands = useMemo(() => {
    const allBrands = products.map(p => p.brand);
    return [...new Set(allBrands)];
  }, [products]);

  // Categories list
  const categories = ['All', 'Laptops', 'Smartphones', 'Audio', 'Gaming', 'Wearables', 'Accessories'];

  // Toggle brand selection
  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('search');
    setSearchParams(newParams);
    setSelectedBrands([]);
    setMaxPrice(1000000);
    setOnlyInStock(false);
    setOnlyOnSale(false);
    setSearchTerm('');
  };

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(term) || 
             p.brand.toLowerCase().includes(term) ||
             p.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price filter
    result = result.filter(p => p.price <= maxPrice);

    // In stock filter
    if (onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // On sale filter
    if (onlyOnSale) {
      result = result.filter(p => p.oldPrice);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } // 'popular' is default (retains database/initial order)

    return result;
  }, [products, searchTerm, selectedCategory, selectedBrands, maxPrice, onlyInStock, onlyOnSale, sortBy]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="page active">
      <div className="shop-wrap">
        {/* Sidebar Filter Panel */}
        <aside className="shop-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="sidebar-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Filters</h2>
            <button 
              onClick={handleResetFilters}
              style={{ background: 'none', border: 'none', color: '#D48E00', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>

          {/* Search bar inside filters */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="sidebar-search">Search Gear</label>
            <input 
              id="sidebar-search"
              type="text" 
              className="form-input" 
              placeholder="iPhone, Asus, mouse..." 
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                const newParams = new URLSearchParams(searchParams);
                if (val) {
                  newParams.set('search', val);
                } else {
                  newParams.delete('search');
                }
                setSearchParams(newParams);
              }}
              style={{ padding: '8px 10px', fontSize: '13px' }}
            />
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <div className="filter-label">Categories</div>
            <div className="filter-options">
              {categories.map(cat => (
                <label key={cat} className="filter-checkbox">
                  <input 
                    type="radio" 
                    name="category"
                    checked={selectedCategory === cat} 
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <div className="filter-label">Brands</div>
            <div className="filter-options">
              {brands.map(brand => (
                <label key={brand} className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand)} 
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <div className="filter-label">Max Price (Rs.)</div>
            <div className="range-slider-wrap">
              <input 
                type="range" 
                min="10000" 
                max="1000000" 
                step="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand)' }}
              />
              <div className="range-values">
                <span>Rs. 10,000</span>
                <span>Rs. {maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <div className="filter-label">Status</div>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input 
                  type="checkbox" 
                  checked={onlyInStock} 
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
              <label className="filter-checkbox">
                <input 
                  type="checkbox" 
                  checked={onlyOnSale} 
                  onChange={(e) => setOnlyOnSale(e.target.checked)}
                />
                <span>On Discount</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog Main Panel */}
        <main className="shop-content">
          <div className="shop-header">
            <div className="results-count">
              Found <strong>{processedProducts.length}</strong> items in <strong>{selectedCategory}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="sort-select" style={{ fontSize: '13px', fontWeight: '700', color: '#666' }}>Sort by:</label>
              <select 
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {processedProducts.length > 0 ? (
            <div className="products-grid">
              {processedProducts.map((p) => {
                const isWishlisted = wishlist.includes(p._id);
                return (
                  <div key={p._id} className="product-card">
                    <div className="product-img-container" onClick={() => handleProductClick(p._id)}>
                      <span className="badge-pos">
                        {p.oldPrice && p.oldPrice > p.price ? (
                          <span className="badge-sale">
                            -{Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% OFF
                          </span>
                        ) : (
                          <span className="badge-new">NEW</span>
                        )}
                      </span>
                      {/* Wishlist Button */}
                      <button 
                        className={`btn-wishlist-card ${isWishlisted ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p._id);
                        }}
                        aria-label="Wishlist"
                      >
                        <i className={isWishlisted ? 'ti ti-heart-filled' : 'ti ti-heart'} aria-hidden="true"></i>
                      </button>
                      
                      {p.image.startsWith('http') ? (
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '50px' }}>{p.image}</span>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-brand" onClick={() => handleProductClick(p._id)}>{p.brand}</div>
                      
                      {/* Inline ratings */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }} onClick={() => handleProductClick(p._id)}>
                        <span className="stars" style={{ marginBottom: 0 }}>{p.stars}</span>
                        <span style={{ fontSize: '11.5px', color: '#888', fontWeight: '600' }}>({p.reviews} reviews)</span>
                      </div>

                      <div 
                        className="product-name" 
                        onClick={() => handleProductClick(p._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {p.name.length > 50 ? p.name.substring(0, 50) + '...' : p.name}
                      </div>
                      <div className="product-footer">
                        <div className="price-container">
                          <span className="product-price">
                            LKR {p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {p.oldPrice && (
                            <span className="product-price-old">
                              LKR {p.oldPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-cart-view" style={{ background: '#FFF', border: '1.5px solid var(--border-gold)', borderRadius: '14px' }}>
              <div className="empty-cart-icon" style={{ fontSize: '50px' }}>🔍</div>
              <h3>No matching gear found</h3>
              <p className="empty-cart-text">Try adjusting your filters, modifying search keywords, or clearing them completely.</p>
              <button className="btn-shop-now" onClick={handleResetFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <div className="footer">
        &copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination
      </div>
    </div>
  );
}
