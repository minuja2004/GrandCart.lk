import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetails({ 
  products, 
  addToCart, 
  toggleWishlist, 
  wishlist,
  currentUser,
  setActiveRecipient,
  addToast
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  // Find product by MongoDB _id
  const product = products.find(p => p._id === id);

  // Reset scroll and quantity on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setActiveThumb(0);
  }, [id]);

  if (!product) {
    return (
      <div className="page active">
        <div className="details-wrap" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Product not found.</h2>
          <button className="btn-shop-now" style={{ marginTop: '20px' }} onClick={() => navigate('/shop')}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleQtyChange = (type) => {
    if (type === 'dec' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'inc' && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleStartChat = () => {
    if (!currentUser) {
      addToast('Please log in as a customer to chat with the store!');
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'customer') {
      addToast('Authorized customer logins only.');
      return;
    }
    
    setActiveRecipient({
      id: product.sellerId || 'admin_fallback_id', 
      storeName: product.storeName || 'GrandCart Official'
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Product link copied to clipboard!');
  };

  const isWishlisted = wishlist.includes(product._id);

  // Thumbnails mapping
  const thumbs = [
    product.image,
    product.category === 'Laptops' ? '🖥' : product.category === 'Smartphones' ? '📞' : '⚙️',
    product.category === 'Laptops' ? '⌨️' : product.category === 'Smartphones' ? '🔋' : '🔌'
  ];

  // Suggested products
  const suggested = products
    .filter(p => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const finalSuggested = suggested.length > 0 
    ? suggested 
    : products.filter(p => p._id !== product._id).slice(0, 4);

  // Parse details specs
  const productSpecs = product.specs ? (product.specs instanceof Map ? Object.fromEntries(product.specs) : product.specs) : {};

  return (
    <div className="page active">
      <div className="details-wrap" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 16px' }}>
        
        {/* Back navigation */}
        <span className="back-btn" onClick={() => navigate('/shop')}>
          <i className="ti ti-arrow-left" aria-hidden="true"></i> Back to Catalog
        </span>

        {/* 3-Column Split Layout */}
        <div className="details-grid">
          
          {/* Column 1: Gallery & Vertical Thumbnails */}
          <div className="details-gallery">
            <div className="vertical-thumbnails">
              {thumbs.map((thumb, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-box ${activeThumb === idx ? 'active' : ''}`}
                  onClick={() => setActiveThumb(idx)}
                >
                  {thumb.startsWith('http') ? (
                    <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>{thumb}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="main-img-box">
              {thumbs[activeThumb].startsWith('http') ? (
                <img 
                  src={thumbs[activeThumb]} 
                  alt={product.name} 
                  style={{ width: '90%', height: '90%', objectFit: 'contain' }} 
                />
              ) : (
                <span style={{ fontSize: '120px' }}>{thumbs[activeThumb]}</span>
              )}
            </div>
          </div>

          {/* Column 2: Product Specifications & Middle Info */}
          <div className="details-info-side" style={{ padding: '0 10px' }}>
            <span className="detail-brand">{product.brand}</span>
            <h1 className="detail-name" style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 10px 0', lineHeight: '1.3' }}>
              {product.name}
            </h1>

            {/* Ratings summary */}
            <div className="detail-stars-row" style={{ gap: '12px', margin: '4px 0' }}>
              <span className="stars" style={{ fontSize: '13px' }}>{product.stars}</span>
              <span style={{ fontSize: '12.5px', fontWeight: '750', color: '#B89A3E' }}>4.8 Rating</span>
              <span className="review-count">| {product.reviews} Reviews</span>
              <span style={{ fontSize: '12px', color: '#666', background: '#EEE', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                50+ sold
              </span>
            </div>

            {/* Welcome Deal Price Banner */}
            <div className="welcome-deal-banner">
              <span className="welcome-deal-badge">Welcome Deal</span>
              <div className="deal-price-row">
                <span className="deal-price">Rs. {product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="deal-price-old">Rs. {product.oldPrice.toLocaleString()}</span>
                )}
              </div>
              {product.oldPrice && (
                <div className="deal-saving-text">
                  New shopper price! You save Rs. {(product.oldPrice - product.price).toLocaleString()} (50% Off)
                </div>
              )}
            </div>

            {/* Quick highlights overview */}
            <div className="highlights-box">
              <div className="highlights-title">
                <i className="ti ti-sparkles" style={{ color: 'var(--brand)' }}></i> AI Overview & Highlights
              </div>
              <ul className="highlights-list">
                <li className="highlights-item">100% Authentic Original Tech gear certified by GrandCart.lk.</li>
                <li className="highlights-item">{productSpecs["Warranty"] || "1 Year official agent store warranty protection included."}</li>
                <li className="highlights-item">Supports instant cash-on-delivery or split installment billing at checkout.</li>
              </ul>
            </div>
          </div>

          {/* Column 3: Store & Buy Actions Card */}
          <div className="buy-panel-card">
            {/* Store card info */}
            <div className="sold-by-box">
              <div>
                <div style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>Sold By</div>
                <div className="sold-by-store">{product.storeName}</div>
              </div>
              <button className="btn-chat-seller" onClick={handleStartChat}>
                <i className="ti ti-message-2"></i> Chat
              </button>
            </div>

            {/* Commitments */}
            <div className="commitments-list">
              <div className="commitment-item">
                <i className="ti ti-circle-check"></i>
                <span>Free shipping over Rs. 150,000</span>
              </div>
              <div className="commitment-item">
                <i className="ti ti-truck"></i>
                <span>Delivery: 1–3 Business Days</span>
              </div>
              <div className="commitment-item">
                <i className="ti ti-shield-check"></i>
                <span>7-Day Return Policy</span>
              </div>
            </div>

            {/* Stock status */}
            <div style={{ fontSize: '13px' }}>
              <strong>Availability:</strong>{' '}
              {product.stock > 0 ? (
                <span style={{ color: '#16a34a', fontWeight: '800' }}>{product.stock} Units In Stock</span>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: '800' }}>Out of Stock</span>
              )}
            </div>

            {/* Qty count selector */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Quantity:</span>
                <div className="qty-box" style={{ margin: 0, scale: '0.9' }}>
                  <button className="qty-btn" onClick={() => handleQtyChange('dec')}>-</button>
                  <input type="text" className="qty-input" value={quantity} readOnly aria-label="Quantity" />
                  <button className="qty-btn" onClick={() => handleQtyChange('inc')}>+</button>
                </div>
              </div>
            )}

            {/* Checkout buttons */}
            {product.stock > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <button className="btn-buy-now" onClick={handleBuyNow}>
                  Buy Now
                </button>
                <button className="btn-add-cart-outline" onClick={() => addToCart(product, quantity)}>
                  Add to Cart
                </button>
              </div>
            ) : (
              <button className="btn-buy-now" style={{ background: '#CCC', cursor: 'not-allowed' }} disabled>
                Out of Stock
              </button>
            )}

            {/* Bottom auxiliary icons */}
            <div className="buy-actions-row">
              <button className="btn-action-outline" onClick={handleShareLink}>
                <i className="ti ti-share"></i> Share
              </button>
              <button 
                className="btn-action-outline" 
                onClick={() => toggleWishlist(product._id)}
                style={{ color: isWishlisted ? 'red' : '' }}
              >
                <i className={isWishlisted ? 'ti ti-heart-filled' : 'ti ti-heart'}></i>
                {isWishlisted ? 'Liked' : 'Wishlist'}
              </button>
            </div>
          </div>

        </div>

        {/* Lower Sheet: Technical Specifications & Product Description */}
        <div style={{ marginTop: '40px', borderTop: '2.5px solid var(--brand)', paddingTop: '36px' }}>
          
          {/* Technical Specifications */}
          {Object.keys(productSpecs).length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '850', color: 'var(--charcoal)', marginBottom: '16px' }}>
                Technical Specifications
              </h2>
              <table className="specs-table" style={{ width: '100%', maxWidth: '800px', background: '#FFF', border: '1.5px solid var(--border-gold)', borderRadius: '12px', overflow: 'hidden' }}>
                <tbody>
                  {Object.entries(productSpecs).map(([key, val]) => (
                    <tr key={key} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="specs-key" style={{ width: '220px', padding: '12px 20px', fontWeight: '750', background: 'var(--brand-pale)', color: 'var(--text-sub)' }}>
                        {key}
                      </td>
                      <td className="specs-val" style={{ padding: '12px 20px', color: 'var(--text-main)', fontSize: '13.5px' }}>
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Product Overview Description */}
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '850', color: 'var(--charcoal)', marginBottom: '16px' }}>
              Product Overview & Description
            </h2>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#555', whiteSpace: 'pre-wrap' }}>
              {product.description || "No detailed product description provided."}
            </p>
          </div>
        </div>

        {/* Suggested Tech Products Section */}
        <div style={{ marginTop: '50px', borderTop: '2.5px solid var(--brand)', paddingTop: '40px' }}>
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <div className="section-eyebrow">Matched Gear</div>
            <h2 className="section-title" style={{ fontSize: '24px' }}>Suggested Products For You</h2>
          </div>
          
          <div className="products-grid">
            {finalSuggested.map((p) => {
              const isWishlisted = wishlist.includes(p._id);
              return (
                <div key={p._id} className="product-card">
                  <div className="product-img-container" onClick={() => navigate(`/product/${p._id}`)}>
                    <span className="badge-pos">
                      {p.badgeType === 'sale' ? (
                        <span className="badge-sale">{p.badge}</span>
                      ) : (
                        <span className="badge-new">{p.badge}</span>
                      )}
                    </span>
                    <button 
                      className={`btn-wishlist-card ${isWishlisted ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p._id);
                      }}
                      aria-label="Wishlist"
                    >
                      <i className={isWishlisted ? 'ti ti-heart-filled' : 'ti ti-heart'}></i>
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
                    <div className="product-brand" onClick={() => navigate(`/product/${p._id}`)}>{p.brand}</div>
                    <div className="stars" onClick={() => navigate(`/product/${p._id}`)}>{p.stars}</div>
                    <div 
                      className="product-name" 
                      onClick={() => navigate(`/product/${p._id}`)}
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
                        <i className="ti ti-shopping-cart-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="footer">
        &copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination
      </div>
    </div>
  );
}
