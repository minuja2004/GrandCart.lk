import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home({ 
  products, 
  addToCart, 
  toggleWishlist, 
  wishlist
}) {
  const navigate = useNavigate();
  const trendingProducts = products.slice(0, 6);
  const [promotions, setPromotions] = useState([]);

  // Load promotions dynamically from database
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch('/api/promotions');
        if (res.ok) {
          const data = await res.json();
          setPromotions(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPromotions();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleCategoryClick = (catName) => {
    navigate(`/shop?category=${catName}`);
  };

  // Duplicate promos for seamless marquee looping
  const loopPromotions = [...promotions, ...promotions];

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

      {/* Dynamic Locomotion Flyer Section */}
      <section className="flyer-section">
        <div className="section-header">
          <div className="section-eyebrow">Limited Time Offers</div>
          <h2 className="section-title">Weekly Tech Deals & Bundles</h2>
        </div>
        <div className="flyers-outer">
          <div className="flyers-track">
            {loopPromotions.map((promo, idx) => (
              <div 
                key={idx} 
                className={`flyer-card ${promo.bannerColor || 'f1'}`} 
                onClick={() => handleCategoryClick(promo.category)}
                style={{ cursor: 'pointer' }}
              >
                <span className="flyer-icon">{promo.icon}</span>
                <div className="flyer-content">
                  <span className="flyer-badge">{promo.badge}</span>
                  <div className="flyer-title">{promo.title}</div>
                  <div className="flyer-sub">{promo.subtitle}</div>
                </div>
              </div>
            ))}
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
