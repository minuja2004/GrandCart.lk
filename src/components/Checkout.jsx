import React, { useState } from 'react';

export default function Checkout({ 
  cart, 
  clearCart, 
  setActivePage, 
  coupon, 
  addToast 
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    district: 'Colombo',
    city: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const isFreeDelivery = subtotal > 150000;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : 450);
  const discountRate = coupon === 'GRANDTECH' ? 0.1 : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal + deliveryFee - discountAmount;

  // Sri Lankan Districts
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // Quick validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
      addToast('Please fill out all required fields!');
      return;
    }

    // Generate random Order ID
    const generatedId = `GCLK-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setIsOrdered(true);
    clearCart();
    addToast('Order Placed Successfully!');
  };

  if (isOrdered) {
    return (
      <div className="page active">
        <div className="checkout-wrap" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div 
            className="checkout-form-side" 
            style={{ padding: '50px 30px', border: '2px solid var(--brand)', borderRadius: '20px' }}
          >
            <div style={{ fontSize: '70px', color: '#16a34a', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '24px', fontWeight: '850', color: 'var(--charcoal)', marginBottom: '8px' }}>
              Order Confirmed!
            </h1>
            <p style={{ color: '#777', fontSize: '13px', marginBottom: '24px' }}>
              Thank you for shopping at GrandCart.lk. Your order has been placed and is currently being processed.
            </p>
            
            <div 
              style={{ 
                background: 'var(--brand-pale)', 
                border: '1.5px dashed var(--border-gold)', 
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '30px',
                textAlign: 'left'
              }}
            >
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>Order ID:</strong> <code style={{ fontSize: '14px', background: '#FFF', border: '1px solid var(--border-gold)' }}>{orderId}</code>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>Payment Method:</strong> {paymentMethod.toUpperCase()}
              </div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>Deliver To:</strong> {formData.fullName}, {formData.address}, {formData.city}
              </div>
              <div style={{ fontSize: '13px' }}>
                <strong>Expected Delivery:</strong> 1–3 Business Days
              </div>
            </div>

            <button className="btn-shop-now" onClick={() => setActivePage('home')}>
              Continue Shopping
            </button>
          </div>
        </div>
        <div className="footer">&copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination</div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="checkout-wrap">
        <h1 className="cart-title" style={{ fontSize: '26px' }}>Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="cart-grid">
          {/* Billing / Shipping Details Form */}
          <div className="checkout-form-side">
            <h2 className="checkout-section-title">Shipping Information</h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name *</label>
              <input 
                id="fullName"
                name="fullName"
                type="text" 
                className="form-input" 
                placeholder="Kamal Perera"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row form-row-mb">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address *</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  className="form-input" 
                  placeholder="kamal@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number *</label>
                <input 
                  id="phone"
                  name="phone"
                  type="tel" 
                  className="form-input" 
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Delivery Address *</label>
              <input 
                id="address"
                name="address"
                type="text" 
                className="form-input" 
                placeholder="No. 12, Flower Road"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row form-row-mb">
              <div className="form-group">
                <label className="form-label" htmlFor="district">District *</label>
                <select 
                  id="district"
                  name="district"
                  className="sort-select" 
                  style={{ width: '100%', height: '46px', padding: '12px 14px' }}
                  value={formData.district}
                  onChange={handleInputChange}
                >
                  {districts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City / Town *</label>
                <input 
                  id="city"
                  name="city"
                  type="text" 
                  className="form-input" 
                  placeholder="Colombo 03"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Order Notes (Optional)</label>
              <textarea 
                id="notes"
                name="notes"
                className="form-input" 
                placeholder="Notes about your delivery, e.g. special instructions."
                rows="3"
                value={formData.notes}
                onChange={handleInputChange}
                style={{ resize: 'none' }}
              />
            </div>

            <h2 className="checkout-section-title" style={{ marginTop: '30px' }}>Payment Method</h2>
            
            <div className="payment-methods">
              {/* COD */}
              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <input 
                  type="radio" 
                  id="payment-cod"
                  name="payment" 
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="payment-details">
                  <span className="payment-title">Cash on Delivery (COD)</span>
                  <span className="payment-desc">Pay with cash when your items are delivered to your door.</span>
                </div>
              </div>

              {/* CARD */}
              <div 
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <input 
                  type="radio" 
                  id="payment-card"
                  name="payment" 
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <div className="payment-details">
                  <span className="payment-title">Credit / Debit Card</span>
                  <span className="payment-desc">Pay securely online using Visa, Mastercard, or AMEX.</span>
                </div>
              </div>

              {/* KOKO / MINTPAY */}
              <div 
                className={`payment-option ${paymentMethod === 'koko' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('koko')}
              >
                <input 
                  type="radio" 
                  id="payment-koko"
                  name="payment" 
                  checked={paymentMethod === 'koko'}
                  onChange={() => setPaymentMethod('koko')}
                />
                <div className="payment-details">
                  <span className="payment-title">Koko / Mintpay (3 Interest-Free Installments)</span>
                  <span className="payment-desc">Split your purchase into 3 monthly payments without any interest.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Review Panel */}
          <div className="cart-summary-card">
            <h2 className="sidebar-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Review Your Order</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#555', maxWidth: '70%' }}>
                    {item.quantity}x {item.product.name.length > 30 ? item.product.name.substring(0, 30) + '...' : item.product.name}
                  </span>
                  <span style={{ fontWeight: '700' }}>
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-row" style={{ borderTop: '1px solid #EEE', paddingTop: '12px' }}>
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}</span>
            </div>

            {coupon === 'GRANDTECH' && (
              <div className="summary-row" style={{ color: '#16a34a', fontWeight: '700' }}>
                <span>Discount (10%)</span>
                <span>- Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="summary-row total-row">
              <span>Total Bill</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>

            <button type="submit" className="btn-checkout">
              Place Order (Rs. {total.toLocaleString()})
            </button>
          </div>
        </form>
      </div>

      <div className="footer">
        &copy; 2026 <strong>GrandCart.lk</strong> — Sri Lanka's Grand Shopping Destination
      </div>
    </div>
  );
}
