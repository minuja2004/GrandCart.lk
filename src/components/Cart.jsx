import React, { useState } from 'react';

export default function Cart({ 
  cart, 
  updateCartQty, 
  removeFromCart, 
  setActivePage,
  coupon,
  setCoupon,
  addToast
}) {
  const [couponInput, setCouponInput] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const isFreeDelivery = subtotal > 150000;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : 450);
  
  // Coupon logic
  const discountRate = coupon === 'GRANDTECH' ? 0.1 : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal + deliveryFee - discountAmount;

  const handleApplyCoupon = () => {
    if (couponInput.toUpperCase() === 'GRANDTECH') {
      setCoupon('GRANDTECH');
      addToast('Coupon "GRANDTECH" (10% Off) applied successfully!');
    } else {
      addToast('Invalid coupon code!');
    }
  };

  const handleCheckoutClick = () => {
    setActivePage('checkout');
  };

  return (
    <div className="page active">
      <div className="cart-wrap">
        <h1 className="cart-title" style={{ fontSize: '26px' }}>Your Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart-view" style={{ background: '#FFF', border: '1.5px solid var(--border-gold)', borderRadius: '14px' }}>
            <div className="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p className="empty-cart-text">Looks like you haven't added any tech items to your cart yet.</p>
            <button className="btn-shop-now" onClick={() => setActivePage('shop')}>
              Browse Tech Gear
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Items list */}
            <div className="cart-left-card">
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.product.id} className="cart-item-row">
                    <div className="cart-item-img">{item.product.image}</div>
                    
                    <div className="cart-item-details">
                      <div className="cart-item-brand">{item.product.brand}</div>
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-price">Rs. {item.product.price.toLocaleString()}</div>
                    </div>

                    {/* Qty edit */}
                    <div className="cart-item-qty-wrap">
                      <button 
                        className="cart-item-qty-btn"
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="cart-item-qty-val">{item.quantity}</span>
                      <button 
                        className="cart-item-qty-btn"
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>

                    {/* Item subtotal */}
                    <div style={{ fontSize: '14px', fontWeight: '800', width: '80px', textAlign: 'right' }}>
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </div>

                    {/* Remove */}
                    <button 
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label="Remove item"
                    >
                      <i className="ti ti-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="cart-summary-card">
              <h2 className="sidebar-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Order Summary</h2>
              
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? (subtotal > 0 ? 'FREE' : 'Rs. 0') : `Rs. ${deliveryFee}`}</span>
              </div>

              {coupon === 'GRANDTECH' && (
                <div className="summary-row" style={{ color: '#16a34a', fontWeight: '700' }}>
                  <span>Discount (10% Code)</span>
                  <span>- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-row total-row">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>

              {/* Coupon input */}
              <div className="coupon-wrap">
                <input 
                  type="text" 
                  className="coupon-input" 
                  placeholder="Promo Code (try GRANDTECH)" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button className="btn-coupon" onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>

              <button className="btn-checkout" onClick={handleCheckoutClick}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        &copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination
      </div>
    </div>
  );
}
