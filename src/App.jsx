import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Shop from './components/Shop';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { INITIAL_PRODUCTS } from './data/products';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Cart & Wishlist State
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Auth & Checkout State
  const [currentUser, setCurrentUser] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [toasts, setToasts] = useState([]);

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
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        addToast(`Updated ${product.brand} quantity in cart to ${newQty}!`);
        return prevCart.map((item) => 
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      addToast(`Added ${product.brand} to cart!`);
      return [...prevCart, { product, quantity }];
    });
  };

  const updateCartQty = (productId, newQty) => {
    setCart((prevCart) => 
      prevCart.map((item) => 
        item.product.id === productId ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
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
        activePage={activePage} 
        setActivePage={setActivePage} 
        cartCount={cartCount} 
        wishlistCount={wishlist.length} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
      />

      {/* Pages Container */}
      <div className="main-content-pages">
        {activePage === 'home' && (
          <Home 
            products={products}
            setActivePage={setActivePage}
            setSelectedProductId={setSelectedProductId}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {activePage === 'shop' && (
          <Shop 
            products={products}
            setActivePage={setActivePage}
            setSelectedProductId={setSelectedProductId}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {activePage === 'details' && (
          <ProductDetails 
            products={products}
            selectedProductId={selectedProductId}
            setActivePage={setActivePage}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        )}

        {activePage === 'cart' && (
          <Cart 
            cart={cart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            setActivePage={setActivePage}
            coupon={coupon}
            setCoupon={setCoupon}
            addToast={addToast}
          />
        )}

        {activePage === 'checkout' && (
          <Checkout 
            cart={cart}
            clearCart={clearCart}
            setActivePage={setActivePage}
            coupon={coupon}
            addToast={addToast}
          />
        )}

        {(activePage === 'login' || activePage === 'signup') && (
          <Auth 
            activePage={activePage}
            setActivePage={setActivePage}
            setCurrentUser={setCurrentUser}
            addToast={addToast}
          />
        )}

        {activePage === 'dashboard' && (
          <Dashboard 
            products={products}
            setProducts={setProducts}
            addToast={addToast}
          />
        )}
      </div>

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
