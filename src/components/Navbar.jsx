import React, { useState } from 'react';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  cartCount, 
  wishlistCount, 
  currentUser, 
  setCurrentUser 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
  };

  return (
    <nav className="nav">
      {/* Dynamic Vector Logo - High Sharpness, Zero External Dependencies */}
      <div className="nav-logo-wrap" onClick={() => setActivePage('home')}>
        <svg 
          width="42" 
          height="42" 
          viewBox="0 0 100 100" 
          style={{ marginRight: '8px' }}
        >
          <rect x="10" y="10" width="80" height="80" rx="18" fill="#F5A800" />
          <path d="M30 30 H65 C70 30, 72 34, 70 38 L60 60 C58 64, 54 66, 50 66 H38 L34 25" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="42" cy="78" r="8" fill="#1C1C1C" />
          <circle cx="62" cy="78" r="8" fill="#1C1C1C" />
          <path d="M48 40 L58 48 L44 56" fill="none" stroke="#1C1C1C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#1C1C1C' }}>
          Grand<span style={{ color: '#F5A800' }}>Cart</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#BBB', marginLeft: '2px' }}>.lk</span>
        </span>
      </div>

      {/* Nav Links */}
      <ul className="nav-links">
        <li>
          <a 
            className={activePage === 'home' ? 'active' : ''} 
            onClick={() => setActivePage('home')}
          >
            Home
          </a>
        </li>
        <li>
          <a 
            className={activePage === 'shop' ? 'active' : ''} 
            onClick={() => setActivePage('shop')}
          >
            Shop Tech
          </a>
        </li>
        <li>
          <a 
            className={activePage === 'dashboard' ? 'active' : ''} 
            onClick={() => setActivePage('dashboard')}
          >
            Seller Portal
          </a>
        </li>
      </ul>

      {/* Actions */}
      <div className="nav-actions">
        {/* Wishlist Button with Badge */}
        <button 
          className="nav-icon-btn" 
          aria-label="Wishlist"
          onClick={() => setActivePage('shop')} // Shop will let them filter or view liked items
        >
          <i className="ti ti-heart" aria-hidden="true"></i>
          {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
        </button>

        {/* Cart Button with Badge */}
        <button 
          className="nav-icon-btn" 
          aria-label="Cart"
          onClick={() => setActivePage('cart')}
        >
          <i className="ti ti-shopping-cart" aria-hidden="true"></i>
          {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </button>

        {/* User Account Controls */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#7A6830' }}>
              Hi, {currentUser.firstName}
            </span>
            <button className="btn-login" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <>
            <button className="btn-login" onClick={() => setActivePage('login')}>
              Log in
            </button>
            <button className="btn-signup" onClick={() => setActivePage('signup')}>
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
