import React, { useState, useEffect } from 'react';

export default function Auth({ 
  activePage, 
  setActivePage, 
  setCurrentUser, 
  addToast 
}) {
  const [isLoginMode, setIsLoginMode] = useState(activePage === 'login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup Form States
  const [suFirst, setSuFirst] = useState('');
  const [suLast, setSuLast] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suAgree, setSuAgree] = useState(false);

  // Sync state with activePage changes
  useEffect(() => {
    setIsLoginMode(activePage === 'login');
  }, [activePage]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      addToast('Please enter both email and password!');
      return;
    }
    
    // Extract name from email for mock personalized hello
    const emailName = loginEmail.split('@')[0];
    const capitalizedFirstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

    const mockUser = {
      firstName: capitalizedFirstName,
      lastName: 'Perera',
      email: loginEmail
    };

    setCurrentUser(mockUser);
    addToast(`Logged in successfully! Welcome, ${capitalizedFirstName}.`);
    setActivePage('home');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!suFirst || !suLast || !suEmail || !suPhone || !suPass) {
      addToast('Please fill out all required fields!');
      return;
    }
    if (!suAgree) {
      addToast('You must agree to the Terms and Conditions!');
      return;
    }

    const mockUser = {
      firstName: suFirst,
      lastName: suLast,
      email: suEmail,
      phone: suPhone
    };

    setCurrentUser(mockUser);
    addToast('Account created successfully!');
    setActivePage('home');
  };

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
            
            {isLoginMode ? (
              <>
                <div className="auth-left-title">Welcome Back!</div>
                <div className="auth-left-sub">Log in to access your orders, wishlist, and exclusive deals.</div>
                <ul className="auth-perks">
                  <li><i className="ti ti-package" aria-hidden="true"></i> Track your orders in real time</li>
                  <li><i className="ti ti-heart" aria-hidden="true"></i> Save items to your wishlist</li>
                  <li><i className="ti ti-tag" aria-hidden="true"></i> Unlock member-only deals</li>
                </ul>
              </>
            ) : (
              <>
                <div className="auth-left-title">Join GrandCart!</div>
                <div className="auth-left-sub">Create your free account and start shopping from thousands of products across Sri Lanka.</div>
                <ul className="auth-perks">
                  <li><i className="ti ti-gift" aria-hidden="true"></i> Welcome offer on first order</li>
                  <li><i className="ti ti-clock" aria-hidden="true"></i> Fast island-wide delivery</li>
                  <li><i className="ti ti-shield-check" aria-hidden="true"></i> 100% secure checkout</li>
                </ul>
              </>
            )}
          </div>

          {/* Form Right Side */}
          <div className="auth-right">
            {isLoginMode ? (
              // LOGIN FORM
              <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
                <div className="auth-heading">Log in</div>
                <div className="auth-sub">Enter your details to continue shopping</div>
                
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
                    <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); addToast("Reset password link sent to email!"); }}>
                      Forgot password?
                    </a>
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
                
                <button type="submit" className="btn-auth">Log in to GrandCart</button>
                
                <div className="auth-divider">
                  <div className="auth-divider-line"></div>
                  <div className="auth-divider-text">or continue with</div>
                  <div className="auth-divider-line"></div>
                </div>
                
                <button 
                  type="button" 
                  className="btn-google"
                  onClick={() => {
                    setCurrentUser({ firstName: 'GoogleUser', lastName: 'G', email: 'user@google.com' });
                    addToast('Logged in via Google (Mock)');
                    setActivePage('home');
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>
                
                <p className="auth-switch">
                  Don't have an account? <a onClick={() => { setIsLoginMode(false); setActivePage('signup'); }}>Sign up free</a>
                </p>
              </form>
            ) : (
              // SIGNUP FORM
              <form onSubmit={handleSignupSubmit} style={{ width: '100%' }}>
                <div className="auth-heading">Create account</div>
                <div className="auth-sub">It's free and takes under a minute</div>
                
                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="su-first">First name</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      id="su-first" 
                      placeholder="Kamal"
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
                      placeholder="Perera"
                      value={suLast}
                      onChange={(e) => setSuLast(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <div className="form-hint">For order updates and delivery notifications</div>
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
                  <label htmlFor="su-agree">I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></label>
                </div>

                <button type="submit" className="btn-auth">Create my account</button>

                <div className="auth-divider">
                  <div className="auth-divider-line"></div>
                  <div className="auth-divider-text">or sign up with</div>
                  <div className="auth-divider-line"></div>
                </div>

                <button 
                  type="button" 
                  className="btn-google"
                  onClick={() => {
                    setCurrentUser({ firstName: 'GoogleUser', lastName: 'G', email: 'user@google.com' });
                    addToast('Signed up via Google (Mock)');
                    setActivePage('home');
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign up with Google
                </button>

                <p className="auth-switch">
                  Already have an account? <a onClick={() => { setIsLoginMode(true); setActivePage('login'); }}>Log in</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
