import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home({ 
  products, 
  addToCart, 
  toggleWishlist, 
  wishlist
}) {
  const navigate = useNavigate();
  const trendingProducts = products.slice(0, 6);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleCategoryClick = (catName) => {
    navigate(`/shop?category=${catName}`);
  };

  return (
    <div className="page active" id="page-home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-label">Sri Lanka's Ultimate Tech Store</p>
          <h1 className="hero-title">
            Upgrade Your<br />Digital <em>Setup.</em>
          </h1>
          <p className="hero-sub">
            Thousands of premium tech products delivered island-wide. Quality you can trust, prices you'll love.
          </p>
          <div className="hero-btns">
            <Link to="/shop" className="btn-hero-white" style={{ textDecoration: 'none' }}>
              Shop Tech Now
            </Link>
            <Link to="/shop" className="btn-hero-outline" style={{ textDecoration: 'none' }}>
              View Deals
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <svg 
            className="hero-logo-big"
            width="180" 
            height="180" 
            viewBox="0 0 100 100" 
          >
            <rect x="5" y="5" width="90" height="90" rx="20" fill="#FFFFFF" />
            <rect x="15" y="15" width="70" height="70" rx="16" fill="#F5A800" />
            <path d="M30 35 H65 C70 35, 72 39, 70 43 L60 62 C58 66, 54 68, 50 68 H38 L34 30" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="42" cy="78" r="6" fill="#1C1C1C" />
            <circle cx="62" cy="78" r="6" fill="#1C1C1C" />
            <path d="M48 44 L56 50 L44 56" fill="none" stroke="#1C1C1C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">100%</div>
          <div className="stat-label">Original Brands</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">Rs. 50M+</div>
          <div className="stat-label">Tech Sold</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">15K+</div>
          <div className="stat-label">Happy Techies</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">1–3 Days</div>
          <div className="stat-label">Island-wide Delivery</div>
        </div>
      </div>

      {/* Locomotion Flyer Section */}
      <section className="flyer-section">
        <div className="section-header">
          <div className="section-eyebrow">Limited Time Offers</div>
          <h2 className="section-title">Weekly Tech Deals & Bundles</h2>
        </div>
        <div className="flyers-outer">
          <div className="flyers-track">
            {/* Original slides */}
            <div className="flyer-card f1" onClick={() => handleCategoryClick('Laptops')}>
              <span className="flyer-icon">💻</span>
              <div className="flyer-content">
                <span className="flyer-badge">Save Rs. 50,000</span>
                <div className="flyer-title">Pro Laptops</div>
                <div className="flyer-sub">MacBooks & ROG Zephyrus</div>
              </div>
            </div>
            <div className="flyer-card f2" onClick={() => handleCategoryClick('Smartphones')}>
              <span className="flyer-icon">📱</span>
              <div className="flyer-content">
                <span className="flyer-badge">New In</span>
                <div className="flyer-title">Flagships</div>
                <div className="flyer-sub">iPhone 15 Pro & S24 Ultra</div>
              </div>
            </div>
            <div className="flyer-card f3" onClick={() => handleCategoryClick('Audio')}>
              <span className="flyer-icon">🎧</span>
              <div className="flyer-content">
                <span className="flyer-badge">15% Off</span>
                <div className="flyer-title">ANC Audio</div>
                <div className="flyer-sub">Sony XM5 & AirPods Pro</div>
              </div>
            </div>
            <div className="flyer-card f4" onClick={() => handleCategoryClick('Gaming')}>
              <span className="flyer-icon">🎮</span>
              <div className="flyer-content">
                <span className="flyer-badge">In Stock</span>
                <div className="flyer-title">Gaming Zone</div>
                <div className="flyer-sub">PS5 Slim & Nintendo OLED</div>
              </div>
            </div>
            <div className="flyer-card f5" onClick={() => handleCategoryClick('Wearables')}>
              <span className="flyer-icon">⌚</span>
              <div className="flyer-content">
                <span className="flyer-badge">Free Strap</span>
                <div className="flyer-title">Smart Watches</div>
                <div className="flyer-sub">Apple Watch Ultra 2 & Watch 6</div>
              </div>
            </div>
            <div className="flyer-card f6" onClick={() => handleCategoryClick('Accessories')}>
              <span className="flyer-icon">⌨️</span>
              <div className="flyer-content">
                <span className="flyer-badge">Hot Pick</span>
                <div className="flyer-title">Accessories</div>
                <div className="flyer-sub">Keychron Keyboards & MX Mice</div>
              </div>
            </div>
            {/* Duplicated slides for seamless loop */}
            <div className="flyer-card f1" onClick={() => handleCategoryClick('Laptops')}>
              <span className="flyer-icon">💻</span>
              <div className="flyer-content">
                <span className="flyer-badge">Save Rs. 50,000</span>
                <div className="flyer-title">Pro Laptops</div>
                <div className="flyer-sub">MacBooks & ROG Zephyrus</div>
              </div>
            </div>
            <div className="flyer-card f2" onClick={() => handleCategoryClick('Smartphones')}>
              <span className="flyer-icon">📱</span>
              <div className="flyer-content">
                <span className="flyer-badge">New In</span>
                <div className="flyer-title">Flagships</div>
                <div className="flyer-sub">iPhone 15 Pro & S24 Ultra</div>
              </div>
            </div>
            <div className="flyer-card f3" onClick={() => handleCategoryClick('Audio')}>
              <span className="flyer-icon">🎧</span>
              <div className="flyer-content">
                <span className="flyer-badge">15% Off</span>
                <div className="flyer-title">ANC Audio</div>
                <div className="flyer-sub">Sony XM5 & AirPods Pro</div>
              </div>
            </div>
            <div className="flyer-card f4" onClick={() => handleCategoryClick('Gaming')}>
              <span className="flyer-icon">🎮</span>
              <div className="flyer-content">
                <span className="flyer-badge">In Stock</span>
                <div className="flyer-title">Gaming Zone</div>
                <div className="flyer-sub">PS5 Slim & Nintendo OLED</div>
              </div>
            </div>
            <div className="flyer-card f5" onClick={() => handleCategoryClick('Wearables')}>
              <span className="flyer-icon">⌚</span>
              <div className="flyer-content">
                <span className="flyer-badge">Free Strap</span>
                <div className="flyer-title">Smart Watches</div>
                <div className="flyer-sub">Apple Watch Ultra 2 & Watch 6</div>
              </div>
            </div>
            <div className="flyer-card f6" onClick={() => handleCategoryClick('Accessories')}>
              <span className="flyer-icon">⌨️</span>
              <div className="flyer-content">
                <span className="flyer-badge">Hot Pick</span>
                <div className="flyer-title">Accessories</div>
                <div className="flyer-sub">Keychron Keyboards & MX Mice</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="cat-section">
        <div className="section-header">
          <div className="section-eyebrow">Browse Tech Categories</div>
          <h2 className="section-title">What gear are you hunting?</h2>
        </div>
        <div className="cat-grid">
          <div className="cat-card" onClick={() => handleCategoryClick('Laptops')}>
            <span className="cat-icon">💻</span>
            <div className="cat-name">Laptops</div>
          </div>
          <div className="cat-card" onClick={() => handleCategoryClick('Smartphones')}>
            <span className="cat-icon">📱</span>
            <div className="cat-name">Smartphones</div>
          </div>
          <div className="cat-card" onClick={() => handleCategoryClick('Audio')}>
            <span className="cat-icon">🎧</span>
            <div className="cat-name">Audio</div>
          </div>
          <div className="cat-card" onClick={() => handleCategoryClick('Gaming')}>
            <span className="cat-icon">🎮</span>
            <div className="cat-name">Gaming</div>
          </div>
          <div className="cat-card" onClick={() => handleCategoryClick('Wearables')}>
            <span className="cat-icon">⌚</span>
            <div className="cat-name">Wearables</div>
          </div>
          <div className="cat-card" onClick={() => handleCategoryClick('Accessories')}>
            <span className="cat-icon">⌨️</span>
            <div className="cat-name">Accessories</div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="products-container">
          <div className="section-header">
            <div className="section-eyebrow">Featured Tech</div>
            <h2 className="section-title">Trending Right Now</h2>
          </div>
          <div className="products-grid">
            {trendingProducts.map((p) => {
              const isWishlisted = wishlist.includes(p._id);
              return (
                <div key={p._id} className="product-card">
                  <div className="product-img-container" onClick={() => handleProductClick(p._id)}>
                    <span className="badge-pos">
                      {p.badgeType === 'sale' ? (
                        <span className="badge-sale">{p.badge}</span>
                      ) : (
                        <span className="badge-new">{p.badge}</span>
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
                      p.image
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-brand" onClick={() => handleProductClick(p._id)}>{p.brand}</div>
                    <div className="stars" onClick={() => handleProductClick(p._id)}>{p.stars}</div>
                    <div 
                      className="product-name" 
                      onClick={() => handleProductClick(p._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.name.length > 50 ? p.name.substring(0, 50) + '...' : p.name}
                    </div>
                    <div className="product-footer">
                      <div className="price-container">
                        <span className="product-price">Rs. {p.price.toLocaleString()}</span>
                        {p.oldPrice && (
                          <span className="product-price-old">Rs. {p.oldPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <button 
                        className="btn-cart" 
                        aria-label="Add to cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                      >
                        <i className="ti ti-shopping-cart-plus" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/shop" className="btn-shop-now" style={{ textDecoration: 'none' }}>
              View All Tech Gear
            </Link>
          </div>
        </div>
      </section>

      {/* Banner strip */}
      <div className="banner-strip">
        <div className="banner-item">
          <i className="ti ti-truck" aria-hidden="true"></i> Island-wide Delivery
        </div>
        <div className="banner-item">
          <i className="ti ti-shield-check" aria-hidden="true"></i> Secure Payments
        </div>
        <div className="banner-item">
          <i className="ti ti-refresh" aria-hidden="true"></i> Easy Returns
        </div>
        <div className="banner-item">
          <i className="ti ti-headset" aria-hidden="true"></i> 24/7 Support
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        &copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination
      </div>
    </div>
  );
}
