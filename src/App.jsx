import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Shop from './components/Shop';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard'; // Old dashboard (unused, but kept to avoid compilation break)
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ChatWidget from './components/ChatWidget';

export default function App() {
  const [products, setProducts] = useState([]);
  
  // Cart & Wishlist State
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Customer Chat State
  const [activeRecipient, setActiveRecipient] = useState(null);

  // Fetch Products from Express API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error("Failed to fetch products.");
      }
    } catch (err) {
      console.error("Error connecting to backend API:", err);
    }
  };

  // On mount: fetch products & check localStorage credentials
  useEffect(() => {
    fetchProducts();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Monitor Auth changes to sync localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [currentUser]);

  // Toast Notifications Helper
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Cart operations
  const addToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product._id === product._id);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        addToast(`Updated ${product.brand} quantity in cart to ${newQty}!`);
        return prevCart.map((item) => 
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      addToast(`Added ${product.brand} to cart!`);
      return [...prevCart, { product, quantity }];
    });
  };

  const updateCartQty = (productId, newQty) => {
    setCart((prevCart) => 
      prevCart.map((item) => 
        item.product._id === productId ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
    addToast('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        addToast('Removed from wishlist.');
        return prevWishlist.filter((id) => id !== productId);
      }
      addToast('Added to wishlist!');
      return [...prevWishlist, productId];
    });
  };

  // Total cart item count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="app-root">
      {/* Navbar */}
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlist.length} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
      />

      {/* Pages Router */}
      <div className="main-content-pages">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                products={products}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
            } 
          />
          
          <Route 
            path="/shop" 
            element={
              <Shop 
                products={products}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
            } 
          />
          
          <Route 
            path="/product/:id" 
            element={
              <ProductDetails 
                products={products}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                wishlist={wishlist}
                currentUser={currentUser}
                setActiveRecipient={setActiveRecipient}
                addToast={addToast}
              />
            } 
          />
          
          <Route 
            path="/cart" 
            element={
              <Cart 
                cart={cart}
                updateCartQty={updateCartQty}
                removeFromCart={removeFromCart}
                coupon={coupon}
                setCoupon={setCoupon}
                addToast={addToast}
              />
            } 
          />
          
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cart={cart}
                clearCart={clearCart}
                coupon={coupon}
                addToast={addToast}
              />
            } 
          />
          
          {/* Customer Auth */}
          <Route 
            path="/login" 
            element={
              <Auth 
                activePage="login"
                setCurrentUser={setCurrentUser}
                addToast={addToast}
              />
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <Auth 
                activePage="signup"
                setCurrentUser={setCurrentUser}
                addToast={addToast}
              />
            } 
          />

          {/* Seller Portal */}
          <Route 
            path="/seller/login" 
            element={
              <Auth 
                activePage="seller-login"
                setCurrentUser={setCurrentUser}
                addToast={addToast}
              />
            } 
          />
          
          <Route 
            path="/seller/signup" 
            element={
              <Auth 
                activePage="seller-signup"
                setCurrentUser={setCurrentUser}
                addToast={addToast}
              />
            } 
          />

          <Route 
            path="/seller/dashboard" 
            element={
              <SellerDashboard 
                currentUser={currentUser}
                addToast={addToast}
              />
            } 
          />

          {/* Admin Console */}
          <Route 
            path="/admin/login" 
            element={
              <Auth 
                activePage="admin-login"
                setCurrentUser={setCurrentUser}
                addToast={addToast}
              />
            } 
          />

          <Route 
            path="/admin/dashboard" 
            element={
              <AdminDashboard 
                currentUser={currentUser}
                addToast={addToast}
              />
            } 
          />

          {/* Fallback to legacy dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                products={products}
                setProducts={setProducts}
                addToast={addToast}
                fetchProducts={fetchProducts}
              />
            } 
          />
        </Routes>
      </div>

      {/* Floating Chat Box Overlay */}
      <ChatWidget 
        currentUser={currentUser} 
        activeRecipient={activeRecipient} 
        setActiveRecipient={setActiveRecipient} 
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-card">
            <i className="ti ti-info-circle" aria-hidden="true" style={{ color: 'var(--brand)', fontSize: '16px' }}></i>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
