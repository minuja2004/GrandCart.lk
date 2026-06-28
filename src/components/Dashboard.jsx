import React, { useState, useEffect, useMemo } from 'react';

export default function Dashboard({ 
  products, 
  setProducts, 
  addToast, 
  fetchProducts 
}) {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageEmoji, setImageEmoji] = useState('💻');
  const [description, setDescription] = useState('');
  
  // Image upload status
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  // Fetch Live Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'analytics') {
      fetchOrders();
    }
  }, [activeTab]);

  // Analytics Math
  const analyticsData = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const activeListings = products.length;

    return { totalRevenue, totalOrders, avgOrder, activeListings };
  }, [orders, products]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategory('Laptops');
    setPrice('');
    setStock('');
    setImageEmoji('💻');
    setDescription('');
    setUploadedUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setPrice(p.price.toString());
    setStock(p.stock.toString());
    
    // Check if image is URL or Emoji
    if (p.image.startsWith('http') || p.image.startsWith('cloudinary://')) {
      setUploadedUrl(p.image);
      setImageEmoji('💻');
    } else {
      setImageEmoji(p.image);
      setUploadedUrl('');
    }
    
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  // Real Cloudinary File Upload handler
  const handleRealCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    addToast('Uploading image to Cloudinary secure cloud...');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedUrl(data.url);
        addToast('Image uploaded successfully to Cloudinary!');
      } else {
        addToast(data.message || 'Cloudinary upload failed.');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error during image upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !brand || !price || !stock) {
      addToast('Please fill out all required fields!');
      return;
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);
    const finalImage = uploadedUrl || imageEmoji;

    const payload = {
      name,
      brand,
      category,
      price: priceNum,
      stock: stockNum,
      image: finalImage,
      description,
      specs: {
        "Brand": brand,
        "Category": category,
        "Warranty": "1 Year Warranty",
        "Upload Source": uploadedUrl ? "Cloudinary Cloud" : "Standard Icon"
      }
    };

    try {
      let res;
      if (editingProduct) {
        // PUT update API
        res = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // POST create API
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();

      if (res.ok) {
        addToast(editingProduct ? 'Product updated successfully!' : 'New product listed successfully!');
        fetchProducts(); // Refresh list on App level
        setIsModalOpen(false);
      } else {
        addToast(data.message || 'Error saving product details.');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error saving product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (res.ok) {
          addToast('Product deleted successfully.');
          fetchProducts(); // Refresh list
        } else {
          addToast(data.message || 'Error deleting product.');
        }
      } catch (err) {
        console.error(err);
        addToast('Network error deleting product.');
      }
    }
  };

  return (
    <div className="page active">
      <div className="dash-wrap">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-brand-area">
            <span className="dash-brand-title">Seller Console</span>
            <div className="dash-brand-sub">GrandCart.lk</div>
          </div>
          
          <ul className="dash-nav-list">
            <li 
              className={`dash-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="ti ti-box" aria-hidden="true"></i> Listed Products
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="ti ti-chart-line" aria-hidden="true"></i> Store Analytics
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="ti ti-receipt" aria-hidden="true"></i> Orders
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="dash-main">
          {activeTab === 'products' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Listed Products</h1>
                <button className="btn-dash-action" onClick={handleOpenAddModal}>
                  <i className="ti ti-plus" aria-hidden="true"></i> Add New Product
                </button>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Category</th>
                        <th>Price (Rs.)</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="dash-prod-cell">
                              <span className="dash-prod-icon">
                                {p.image.startsWith('http') ? (
                                  <img 
                                    src={p.image} 
                                    alt="" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} 
                                  />
                                ) : (
                                  p.image
                                )}
                              </span>
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#888' }}>Brand: {p.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize: '12px', fontWeight: '600' }}>{p.category}</span></td>
                          <td><strong>Rs. {p.price.toLocaleString()}</strong></td>
                          <td>
                            <span 
                              style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                fontWeight: '750',
                                background: p.stock > 5 ? '#E6F4EA' : '#FCE8E6',
                                color: p.stock > 5 ? '#137333' : '#C5221F'
                              }}
                            >
                              {p.stock} Units
                            </span>
                          </td>
                          <td>
                            <div className="dash-actions-cell">
                              <button 
                                className="btn-dash-icon edit" 
                                title="Edit Product"
                                onClick={() => handleOpenEditModal(p)}
                              >
                                <i className="ti ti-pencil" aria-hidden="true"></i>
                              </button>
                              <button 
                                className="btn-dash-icon delete" 
                                title="Delete Product"
                                onClick={() => handleDeleteProduct(p._id)}
                              >
                                <i className="ti ti-trash" aria-hidden="true"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Store Analytics</h1>
              </div>

              {/* Stats Cards */}
              <div className="dash-stats-grid">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon-box">💰</div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-label">Total Revenue</span>
                    <span className="dash-stat-value">Rs. {analyticsData.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon-box">📦</div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-label">Total Orders</span>
                    <span className="dash-stat-value">{analyticsData.totalOrders}</span>
                  </div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon-box">⚡</div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-label">Average Order</span>
                    <span className="dash-stat-value">Rs. {analyticsData.avgOrder.toLocaleString()}</span>
                  </div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon-box">🛡️</div>
                  <div className="dash-stat-info">
                    <span className="dash-stat-label">Active Listings</span>
                    <span className="dash-stat-value">{analyticsData.activeListings}</span>
                  </div>
                </div>
              </div>

              {/* Chart Mockup */}
              <div className="dash-card">
                <h2 className="dash-card-title">Sales Trend (Last 7 Days)</h2>
                <div 
                  style={{ 
                    height: '200px', 
                    background: '#FAFAFA', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'space-between',
                    padding: '20px 40px',
                    border: '1.5px solid var(--border-gold)'
                  }}
                >
                  {/* Bars */}
                  {[40, 60, 45, 90, 75, 110, 130].map((val, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        width: '32px', 
                        height: `${val}%`, 
                        background: 'var(--brand)', 
                        borderTopLeftRadius: '6px',
                        borderTopRightRadius: '6px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '8px 0'
                      }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: '800', color: '#FFF' }}>{val * 10}</span>
                      <span style={{ fontSize: '10px', color: '#1c1c1c', fontWeight: '800', position: 'relative', bottom: '-24px' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Store Orders</h1>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <tr key={order._id}>
                            <td><code>{order.orderId}</code></td>
                            <td><strong>{order.customerDetails.fullName}</strong></td>
                            <td>Rs. {order.total.toLocaleString()}</td>
                            <td>{order.paymentMethod.toUpperCase()}</td>
                            <td>
                              <span 
                                style={{ 
                                  background: order.status === 'Delivered' ? '#E6F4EA' : '#FEF7E0', 
                                  color: order.status === 'Delivered' ? '#137333' : '#B06000', 
                                  padding: '3px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: '750' 
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                            No orders placed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">
                {editingProduct ? 'Modify Listing' : 'List New Tech Product'}
              </span>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-name">Product Name *</label>
                    <input 
                      id="prod-name"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. MacBook Pro M3"
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-brand">Brand *</label>
                    <input 
                      id="prod-brand"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Apple"
                      value={brand} 
                      onChange={(e) => setBrand(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-category">Category *</label>
                    <select 
                      id="prod-category"
                      className="sort-select"
                      style={{ width: '100%', height: '46px', padding: '12px' }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Laptops">Laptops</option>
                      <option value="Smartphones">Smartphones</option>
                      <option value="Audio">Audio</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-emoji">Product Emoji/Icon *</label>
                    <select 
                      id="prod-emoji"
                      className="sort-select"
                      style={{ width: '100%', height: '46px', padding: '12px' }}
                      value={imageEmoji}
                      onChange={(e) => setImageEmoji(e.target.value)}
                    >
                      <option value="💻">💻 Laptop</option>
                      <option value="📱">📱 Smartphone</option>
                      <option value="🎧">🎧 Headphones</option>
                      <option value="🎮">🎮 Gaming Console</option>
                      <option value="⌚">⌚ Smart Watch</option>
                      <option value="⌨️">⌨️ Keyboard</option>
                      <option value="🖱️">🖱️ Mouse</option>
                    </select>
                  </div>
                </div>

                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-price">Price (Rs.) *</label>
                    <input 
                      id="prod-price"
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 150000"
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-stock">Stock Quantity *</label>
                    <input 
                      id="prod-stock"
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 10"
                      value={stock} 
                      onChange={(e) => setStock(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                {/* Cloudinary Image Uploader */}
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">Cloudinary Image Upload (Real File)</label>
                  <input 
                    type="file" 
                    id="prod-image-file" 
                    accept="image/*" 
                    onChange={handleRealCloudinaryUpload} 
                    style={{ display: 'none' }} 
                  />
                  <div 
                    style={{ 
                      border: '2px dashed var(--border-gold)', 
                      borderRadius: '8px', 
                      padding: '16px', 
                      textAlign: 'center', 
                      background: 'var(--brand-pale)',
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('prod-image-file').click()}
                  >
                    {uploadingImage ? (
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#D48E00' }}>Uploading to Cloudinary secure server...</span>
                    ) : uploadedUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>
                          ✓ Image Uploaded Successfully!
                        </span>
                        <img 
                          src={uploadedUrl} 
                          alt="" 
                          style={{ maxHeight: '80px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }} 
                        />
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        Click to upload product image to **Cloudinary** secure storage
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-desc">Product Description</label>
                  <textarea 
                    id="prod-desc"
                    className="form-input" 
                    placeholder="Enter detailed description of the tech product..."
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingProduct ? 'Save Changes' : 'List Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
