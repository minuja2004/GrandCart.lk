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

  // Reset page scroll and quantity state when product changes
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
      addToast('Please log in as a customer to chat with the seller!');
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'customer') {
      addToast('Sellers or Admins cannot open customer chat threads.');
      return;
    }
    
    setActiveRecipient({
      id: product.sellerId || 'admin_fallback_id', 
      storeName: product.storeName || 'GrandCart Official'
    });
  };

  const isWishlisted = wishlist.includes(product._id);

  // Thumbnails based on images
  const thumbs = [
    product.image,
    product.category === 'Laptops' ? '🖥' : product.category === 'Smartphones' ? '📞' : '⚙️',
    product.category === 'Laptops' ? '⌨️' : product.category === 'Smartphones' ? '🔋' : '🔌'
  ];

  // Suggested products (filtered by category, excluding current product)
  const suggested = products
    .filter(p => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const finalSuggested = suggested.length > 0 
    ? suggested 
    : products.filter(p => p._id !== product._id).slice(0, 4);

  return (
    <div className="page active">
      <div className="details-wrap" style={{ maxWidth: '1200px', margin: '30px auto' }}>
        {/* Back Link */}
        <span className="back-btn" onClick={() => navigate('/shop')}>
          <i className="ti ti-arrow-left" aria-hidden="true"></i> Back to Shop Catalog
        </span>

        {/* Top Details Split Grid */}
        <div className="details-grid">
          {/* Gallery Column */}
          <div className="details-gallery">
            <div className="main-img-box" style={{ background: '#FFF', border: '1.5px solid var(--border-gold)' }}>
              {thumbs[activeThumb].startsWith('http') ? (
                <img 
                  src={thumbs[activeThumb]} 
                  alt={product.name} 
                  style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                />
              ) : (
                <span style={{ fontSize: '100px' }}>{thumbs[activeThumb]}</span>
              )}
            </div>
            <div className="thumbnail-row">
              {thumbs.map((thumb, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-box ${activeThumb === idx ? 'active' : ''}`}
                  onClick={() => setActiveThumb(idx)}
                  style={{ background: '#FFF', cursor: 'pointer' }}
                >
                  {thumb.startsWith('http') ? (
                    <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>{thumb}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Core Info Column */}
          <div className="details-info-side">
            <div className="detail-brand">{product.brand}</div>
            <h1 className="detail-name" style={{ fontSize: '28px', fontWeight: '850', color: 'var(--charcoal)' }}>
              {product.name}
            </h1>
            
            <div className="detail-stars-row">
              <span className="stars">{product.stars}</span>
              <span className="review-count">({product.reviews} customer reviews)</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">Rs. {product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="detail-price-old">Rs. {product.oldPrice.toLocaleString()}</span>
              )}
            </div>

            <div className="stock-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                Stock Status: 
                {product.stock > 0 ? (
                  <span className="stock-status stock-instock" style={{ marginBottom: 0, display: 'inline-block', marginLeft: '6px' }}>
                    <i className="ti ti-circle-check" aria-hidden="true"></i> {product.stock} Units In Stock
                  </span>
                ) : (
                  <span className="stock-status stock-out" style={{ marginBottom: 0, display: 'inline-block', marginLeft: '6px' }}>
                    <i className="ti ti-circle-x" aria-hidden="true"></i> Out of Stock
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12.5px', color: '#666', background: 'var(--brand-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontWeight: '700' }}>
                Store: {product.storeName}
              </div>
            </div>

            {/* Qty & Add to Cart Controls */}
            {product.stock > 0 && (
              <div className="controls-row" style={{ flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                <div className="qty-box">
                  <button className="qty-btn" onClick={() => handleQtyChange('dec')}>-</button>
                  <input 
                    type="text" 
                    className="qty-input" 
                    value={quantity} 
                    readOnly 
                    aria-label="Quantity"
                  />
                  <button className="qty-btn" onClick={() => handleQtyChange('inc')}>+</button>
                </div>
                
                <button 
                  className="btn-detail-add"
                  onClick={() => addToCart(product, quantity)}
                >
                  <i className="ti ti-shopping-cart" aria-hidden="true"></i> Add to Cart
                </button>

                <button 
                  className={`btn-detail-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product._id)}
                  aria-label="Wishlist"
                >
                  <i className={isWishlisted ? 'ti ti-heart-filled' : 'ti ti-heart'} aria-hidden="true"></i>
                </button>

                <button 
                  className="btn-login"
                  style={{ height: '48px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={handleStartChat}
                >
                  <i className="ti ti-message-2" style={{ fontSize: '18px' }}></i> Chat with Seller
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lower Full-Width Section (Long Description & Specs) */}
        <div style={{ marginTop: '50px', borderTop: '2.5px solid var(--brand)', paddingTop: '36px' }}>
          
          {/* Long Description Overview */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '850', color: 'var(--charcoal)', marginBottom: '16px' }}>
              Product Overview
            </h2>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#555', whiteSpace: 'pre-wrap' }}>
              {product.description || "No product overview provided."}
            </p>
          </div>

          {/* Technical Specifications Sheet */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '850', color: 'var(--charcoal)', marginBottom: '16px' }}>
                Technical Specifications
              </h2>
              <table className="specs-table" style={{ width: '100%', maxWidth: '800px', background: '#FFF', border: '1.5px solid var(--border-gold)', borderRadius: '12px', overflow: 'hidden' }}>
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td className="specs-key" style={{ width: '220px', padding: '14px 20px', fontWeight: '750', background: 'var(--brand-pale)', color: 'var(--text-sub)' }}>
                        {key}
                      </td>
                      <td className="specs-val" style={{ padding: '14px 20px', color: 'var(--text-main)' }}>
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Suggested Tech Products Section */}
        <div style={{ marginTop: '60px', borderTop: '2.5px solid var(--brand)', paddingTop: '40px' }}>
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
                        <i className="ti ti-shopping-cart-plus" aria-hidden="true"></i>
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
