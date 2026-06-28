import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetails({ 
  products, 
  addToCart, 
  toggleWishlist, 
  wishlist 
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  // Find product by MongoDB _id or fallback
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

  const isWishlisted = wishlist.includes(product._id);

  // Mock thumbnails based on product category
  const thumbs = [
    product.image,
    product.category === 'Laptops' ? '🖥' : product.category === 'Smartphones' ? '📞' : '⚙️',
    product.category === 'Laptops' ? '⌨️' : product.category === 'Smartphones' ? '🔋' : '🔌'
  ];

  return (
    <div className="page active">
      <div className="details-wrap">
        {/* Back Link */}
        <span className="back-btn" onClick={() => navigate('/shop')}>
          <i className="ti ti-arrow-left" aria-hidden="true"></i> Back to Shop Catalog
        </span>

        {/* Details Card Grid */}
        <div className="details-grid">
          {/* Gallery View */}
          <div className="details-gallery">
            <div className="main-img-box">
              {thumbs[activeThumb].startsWith('http') ? (
                <img 
                  src={thumbs[activeThumb]} 
                  alt="" 
                  style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                />
              ) : (
                thumbs[activeThumb]
              )}
            </div>
            <div className="thumbnail-row">
              {thumbs.map((thumb, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-box ${activeThumb === idx ? 'active' : ''}`}
                  onClick={() => setActiveThumb(idx)}
                >
                  {thumb.startsWith('http') ? (
                    <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    thumb
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info View */}
          <div className="details-info-side">
            <div className="detail-brand">{product.brand}</div>
            <h1 className="detail-name">{product.name}</h1>
            
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

            <div className="stock-status">
              Stock Status: 
              {product.stock > 0 ? (
                <span className="stock-status stock-instock" style={{ marginBottom: 0 }}>
                  <i className="ti ti-circle-check" aria-hidden="true"></i> {product.stock} Units In Stock
                </span>
              ) : (
                <span className="stock-status stock-out" style={{ marginBottom: 0 }}>
                  <i className="ti ti-circle-x" aria-hidden="true"></i> Out of Stock
                </span>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Qty & Add to Cart Controls */}
            {product.stock > 0 && (
              <div className="controls-row">
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
              </div>
            )}

            {/* Specifications */}
            <div className="specs-section">
              <h2 className="specs-title">Technical Specifications</h2>
              <table className="specs-table">
                <tbody>
                  {product.specs && Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key}>
                      <td className="specs-key">{key}</td>
                      <td className="specs-val">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        &copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination
      </div>
    </div>
  );
}
