import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth({ 
  activePage, 
  setCurrentUser, 
  addToast 
}) {
  const navigate = useNavigate();
  
  // Panel Type Identification
  const isSellerPortal = activePage.startsWith('seller');
  const isAdminPortal = activePage.startsWith('admin');
  const isCustomerPortal = !isSellerPortal && !isAdminPortal;

  const [isLoginMode, setIsLoginMode] = useState(
    activePage === 'login' || activePage === 'seller-login' || activePage === 'admin-login'
  );

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup Form States
  const [suFirst, setSuFirst] = useState('');
  const [suLast, setSuLast] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suStore, setSuStore] = useState(''); // Only for sellers
  const [suAgree, setSuAgree] = useState(false);

  // Sync state with activePage changes
  useEffect(() => {
    setIsLoginMode(
      activePage === 'login' || activePage === 'seller-login' || activePage === 'admin-login'
    );
  }, [activePage]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      addToast('Please enter both email and password!');
      return;
    }

    // Role mapping
    const requiredRole = isSellerPortal ? 'seller' : (isAdminPortal ? 'admin' : 'customer');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginEmail, 
          password: loginPass,
          requiredRole 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        addToast(data.message || 'Login failed.');
        return;
      }

      // Save token & user
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      addToast(`Logged in successfully! Welcome, ${data.user.firstName}.`);
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error connecting to backend API.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!suFirst || !suLast || !suEmail || !suPhone || !suPass) {
      addToast('Please fill out all required fields!');
      return;
    }
    if (isSellerPortal && !suStore) {
      addToast('Store Name is required to register as a seller!');
      return;
    }
    if (!suAgree) {
      addToast('You must agree to the Terms and Conditions!');
      return;
    }

    const signupUrl = isSellerPortal ? '/api/auth/seller/register' : '/api/auth/register';
    const payload = {
      firstName: suFirst,
      lastName: suLast,
      email: suEmail,
      phone: suPhone,
      password: suPass,
      ...(isSellerPortal ? { storeName: suStore } : {})
    };

    try {
      const res = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.message || 'Registration failed.');
        return;
      }

      // Save token & user
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      addToast('Account created successfully!');
      
      if (data.user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error connecting to backend API.');
    }
  };

  // Determine Title Text dynamically
  const formTitle = isLoginMode 
    ? (isSellerPortal ? 'Seller Sign In' : (isAdminPortal ? 'Admin Console' : 'Sign in')) 
    : (isSellerPortal ? 'Become a Seller' : 'Create account');

  const formSubtitle = isLoginMode
    ? (isSellerPortal ? 'Access your store, products, and order logs' : (isAdminPortal ? 'Authenticate to access store management dashboard' : 'Enter your details to continue shopping'))
    : (isSellerPortal ? 'Register store profile to begin listing items' : "It's free and takes under a minute");

  return (
    <div className="page active">
      <div className="auth-wrap">
        <div className="auth-container">
          {/* Branded Left Side */}
          <div className="auth-left">
            <svg 
              className="auth-left-logo"
              width="80" 
              height="80" 
              viewBox="0 0 100 100" 
            >
              <rect x="5" y="5" width="90" height="90" rx="20" fill="#FFFFFF" />
              <rect x="15" y="15" width="70" height="70" rx="16" fill="#F5A800" />
              <path d="M30 35 H65 C70 35, 72 39, 70 43 L60 62 C58 66, 54 68, 50 68 H38 L34 30" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="42" cy="78" r="6" fill="#1C1C1C" />
              <circle cx="62" cy="78" r="6" fill="#1C1C1C" />
              <path d="M48 44 L56 50 L44 56" fill="none" stroke="#1C1C1C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            {isSellerPortal ? (
              <>
                <div className="auth-left-title">Seller Hub</div>
                <div className="auth-left-sub">Set up your e-commerce presence and reach customers island-wide.</div>
                <ul className="auth-perks">
                  <li><i className="ti ti-chart-line" aria-hidden="true"></i> Monitor store metrics and revenue</li>
                  <li><i className="ti ti-box" aria-hidden="true"></i> Upload listings instantly with Cloudinary</li>
                  <li><i className="ti ti-message" aria-hidden="true"></i> Chat with customers directly</li>
                </ul>
              </>
            ) : isAdminPortal ? (
              <>
                <div className="auth-left-title">Management Console</div>
                <div className="auth-left-sub">Authorized system administrators only. Safeguard server rules.</div>
                <ul className="auth-perks">
                  <li><i className="ti ti-checklist" aria-hidden="true"></i> Review and approve listings</li>
                  <li><i className="ti ti-shield" aria-hidden="true"></i> Monitor customer-seller chats</li>
                  <li><i className="ti ti-layout" aria-hidden="true"></i> Manage homepage deal flyers</li>
                </ul>
              </>
            ) : (
              <>
                <div className="auth-left-title">Welcome Back!</div>
                <div className="auth-left-sub">Log in to access your orders, wishlist, and exclusive deals.</div>
                <ul className="auth-perks">
                  <li><i className="ti ti-package" aria-hidden="true"></i> Track your orders in real time</li>
                  <li><i className="ti ti-heart" aria-hidden="true"></i> Save items to your wishlist</li>
                  <li><i className="ti ti-tag" aria-hidden="true"></i> Unlock member-only deals</li>
                </ul>
              </>
            )}
          </div>

          {/* Form Right Side */}
          <div className="auth-right">
            {isLoginMode ? (
              // LOGIN FORM
              <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
                <div className="auth-heading">{formTitle}</div>
                <div className="auth-sub">{formSubtitle}</div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="l-email">Email address</label>
                  <input 
                    className="form-input" 
                    type="email" 
                    id="l-email" 
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="l-pass">
                    Password 
                    {!isAdminPortal && (
                      <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); addToast("Password reset link sent!"); }}>
                        Forgot password?
                      </a>
                    )}
                  </label>
                  <input 
                    className="form-input" 
                    type="password" 
                    id="l-pass" 
                    placeholder="Enter your password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                  />
                </div>
                
                <button type="submit" className="btn-auth">Sign In</button>
                
                {isCustomerPortal && (
                  <p className="auth-switch" style={{ marginTop: '16px' }}>
                    Don't have an account? <a onClick={() => { setIsLoginMode(false); navigate('/signup'); }}>Sign up free</a>
                  </p>
                )}

                {isSellerPortal && (
                  <p className="auth-switch" style={{ marginTop: '16px' }}>
                    Want to sell with us? <a onClick={() => { setIsLoginMode(false); navigate('/seller/signup'); }}>Register store</a>
                  </p>
                )}
              </form>
            ) : (
              // SIGNUP FORM (Only for Customer & Seller)
              <form onSubmit={handleSignupSubmit} style={{ width: '100%' }}>
                <div className="auth-heading">{formTitle}</div>
                <div className="auth-sub">{formSubtitle}</div>
                
                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="su-first">First name</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      id="su-first" 
                      value={suFirst}
                      onChange={(e) => setSuFirst(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="su-last">Last name</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      id="su-last" 
                      value={suLast}
                      onChange={(e) => setSuLast(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {isSellerPortal && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="su-store">Store Name *</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      id="su-store" 
                      placeholder="e.g. Abans Tech Store"
                      value={suStore}
                      onChange={(e) => setSuStore(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="su-email">Email address</label>
                  <input 
                    className="form-input" 
                    type="email" 
                    id="su-email" 
                    placeholder="you@example.com"
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="su-phone">Phone number</label>
                  <input 
                    className="form-input" 
                    type="tel" 
                    id="su-phone" 
                    placeholder="+94 77 123 4567"
                    value={suPhone}
                    onChange={(e) => setSuPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="su-pass">Password</label>
                  <input 
                    className="form-input" 
                    type="password" 
                    id="su-pass" 
                    placeholder="Min. 8 characters"
                    value={suPass}
                    onChange={(e) => setSuPass(e.target.value)}
                    required
                  />
                </div>

                <div className="checkbox-row">
                  <input 
                    type="checkbox" 
                    id="su-agree" 
                    checked={suAgree}
                    onChange={(e) => setSuAgree(e.target.checked)}
                    required
                  />
                  <label htmlFor="su-agree">I agree to the Terms of Service and Privacy Policy</label>
                </div>

                <button type="submit" className="btn-auth">Register Profile</button>

                {isCustomerPortal ? (
                  <p className="auth-switch" style={{ marginTop: '16px' }}>
                    Already have an account? <a onClick={() => { setIsLoginMode(true); navigate('/login'); }}>Log in</a>
                  </p>
                ) : (
                  <p className="auth-switch" style={{ marginTop: '16px' }}>
                    Already registered store? <a onClick={() => { setIsLoginMode(true); navigate('/seller/login'); }}>Sign in</a>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
