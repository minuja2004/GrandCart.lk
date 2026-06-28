import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ 
  cartCount, 
  wishlistCount, 
  currentUser, 
  setCurrentUser 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const isHome = location.pathname === '/';
  const isShop = location.pathname.startsWith('/shop');
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="nav">
      {/* Brand Logo Link */}
      <Link to="/" className="nav-logo-wrap" style={{ textDecoration: 'none' }}>
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
      </Link>

      {/* Middle Long Search Bar */}
      <form className="nav-search-form" onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          className="nav-search-input" 
          placeholder="Search original tech brands & items..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="nav-search-btn" aria-label="Search">
          <i className="ti ti-search" aria-hidden="true"></i>
        </button>
      </form>

      {/* Right Side Links & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {/* Nav Links */}
        <ul className="nav-links" style={{ marginBottom: 0 }}>
          <li>
            <Link to="/" className={isHome ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" className={isShop ? 'active' : ''}>
              Shop Tech
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={isDashboard ? 'active' : ''}>
              Seller Portal
            </Link>
          </li>
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Wishlist Link */}
          <Link 
            to="/shop" 
            className="nav-icon-btn" 
            aria-label="Wishlist"
          >
            <i className="ti ti-heart" aria-hidden="true"></i>
            {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
          </Link>

          {/* Cart Link */}
          <Link 
            to="/cart" 
            className="nav-icon-btn" 
            aria-label="Cart"
          >
            <i className="ti ti-shopping-cart" aria-hidden="true"></i>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

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
              <Link to="/login" className="btn-login" style={{ textDecoration: 'none' }}>
                Log in
              </Link>
              <Link to="/signup" className="btn-signup" style={{ textDecoration: 'none' }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
