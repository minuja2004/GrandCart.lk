import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard({ currentUser, addToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  
  // Products states
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageEmoji, setImageEmoji] = useState('💻');
  const [description, setDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  // Orders states
  const [orders, setOrders] = useState([]);

  // Chat states
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);

  // Authenticate role
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    if (!userObj || userObj.role !== 'seller') {
      addToast('Access denied: Seller authentication required.');
      navigate('/');
    }
  }, [navigate]);

  // Fetch Seller Products
  const fetchSellerProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products/seller', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Seller Orders
  const fetchSellerOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/seller', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Seller Chats
  const fetchSellerChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chats/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages with specific customer
  const fetchChatMessages = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chats/history/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setErrorMsg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers for switching tabs
  useEffect(() => {
    if (activeTab === 'products') fetchSellerProducts();
    if (activeTab === 'orders') fetchSellerOrders();
    if (activeTab === 'messages') {
      fetchSellerChats();
      setSelectedChat(null);
      setMessages([]);
    }
  }, [activeTab]);

  // Messages Poller
  useEffect(() => {
    let interval;
    if (activeTab === 'messages' && selectedChat) {
      interval = setInterval(() => {
        fetchChatMessages(selectedChat._id);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedChat]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (p.image.startsWith('http')) {
      setUploadedUrl(p.image);
    } else {
      setImageEmoji(p.image);
      setUploadedUrl('');
    }
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    addToast('Uploading listing image to Cloudinary...');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedUrl(data.url);
        addToast('Cloudinary upload success!');
      } else {
        addToast(data.message || 'Upload failed.');
      }
    } catch (err) {
      console.error(err);
      addToast('Upload failed due to connection error.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !brand || !price || !stock) return;

    const payload = {
      name,
      brand,
      category,
      price: Number(price),
      image: uploadedUrl || imageEmoji,
      stock: Number(stock),
      description,
      specs: {
        "Brand": brand,
        "Warranty": "1 Year Store Warranty",
        "Listed By": currentUser?.storeName || 'Independent Seller'
      }
    };

    try {
      const token = localStorage.getItem('token');
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        addToast(editingProduct ? 'Product updated & sent to admin review.' : 'Product listed & sent to admin review.');
        setIsModalOpen(false);
        fetchSellerProducts();
      } else {
        addToast(data.message || 'Error saving listing details.');
      }
    } catch (err) {
      console.error(err);
      addToast('Error listing product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product permanently?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          addToast('Listing deleted successfully.');
          fetchSellerProducts();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chats/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedChat._id,
          message: replyText
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data]);
        setReplyText('');
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Error sending reply.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to send reply.');
    }
  };

  const openConversation = (customer) => {
    setSelectedChat(customer);
    fetchChatMessages(customer._id);
  };

  return (
    <div className="page active">
      <div className="dash-wrap">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-brand-area">
            <span className="dash-brand-title">Seller Portal</span>
            <div className="dash-brand-sub">{currentUser?.storeName || 'My Store'}</div>
          </div>
          
          <ul className="dash-nav-list">
            <li 
              className={`dash-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="ti ti-box"></i> My Products
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="ti ti-receipt"></i> Store Orders
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <i className="ti ti-messages"></i> Customer Chats
            </li>
          </ul>
        </aside>

        {/* Main Console */}
        <main className="dash-main">
          {activeTab === 'products' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Listed Products</h1>
                <button className="btn-dash-action" onClick={handleOpenAddModal}>
                  + Add Product
                </button>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Details</th>
                        <th>Category</th>
                        <th>Price (Rs.)</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id}>
                          <td>
                            <div className="dash-prod-cell">
                              <span className="dash-prod-icon">
                                {p.image.startsWith('http') ? (
                                  <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  p.image
                                )}
                              </span>
                              <div>
                                <div style={{ fontWeight: '700' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#888' }}>Stock: {p.stock} Units</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td><strong>Rs. {p.price.toLocaleString()}</strong></td>
                          <td>
                            <span 
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '750',
                                background: p.status === 'approved' ? '#E6F4EA' : p.status === 'rejected' ? '#FCE8E6' : '#FEF7E0',
                                color: p.status === 'approved' ? '#137333' : p.status === 'rejected' ? '#C5221F' : '#B06000'
                              }}
                            >
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="dash-actions-cell">
                              <button className="btn-dash-icon edit" onClick={() => handleOpenEditModal(p)} title="Edit">
                                <i className="ti ti-pencil"></i>
                              </button>
                              <button className="btn-dash-icon delete" onClick={() => handleDeleteProduct(p._id)} title="Delete">
                                <i className="ti ti-trash"></i>
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
                        <th>Items Purchased</th>
                        <th>Earnings (Rs.)</th>
                        <th>Expected Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map(order => (
                          <tr key={order._id}>
                            <td><code>{order.orderId}</code></td>
                            <td>
                              <strong>{order.customerDetails.fullName}</strong>
                              <div style={{ fontSize: '11px', color: '#666' }}>{order.customerDetails.phone}</div>
                            </td>
                            <td>
                              {order.items.map((item, idx) => (
                                <div key={idx} style={{ fontSize: '12px' }}>
                                  {item.quantity}x {item.name}
                                </div>
                              ))}
                            </td>
                            <td><strong>Rs. {order.total.toLocaleString()}</strong></td>
                            <td>1–3 Business Days</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                            No orders received for your store products yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'flex', height: 'calc(100vh - 160px)', gap: '20px' }}>
              {/* Customers list */}
              <div className="dash-card" style={{ width: '220px', padding: '16px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '14px', borderBottom: '1px solid #EEE', paddingBottom: '10px', marginBottom: '10px' }}>
                  Inquiries
                </h3>
                {chats.map(chat => (
                  <div 
                    key={chat._id}
                    onClick={() => openConversation(chat)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedChat?._id === chat._id ? 'var(--brand-bg)' : 'transparent',
                      fontWeight: selectedChat?._id === chat._id ? '700' : '500',
                      marginBottom: '6px',
                      fontSize: '13px'
                    }}
                  >
                    {chat.firstName} {chat.lastName}
                  </div>
                ))}
              </div>

              {/* Chat panel */}
              <div className="dash-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedChat ? (
                  <>
                    <div style={{ padding: '16px', background: 'var(--brand-pale)', borderBottom: '1px solid #EEE' }}>
                      <strong>Chatting with:</strong> {selectedChat.firstName} {selectedChat.lastName} ({selectedChat.email})
                    </div>
                    
                    {/* Message Area */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAFA' }}>
                      {messages.map((m, idx) => {
                        const isMe = m.senderId === currentUser.id;
                        return (
                          <div 
                            key={idx}
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              background: isMe ? 'var(--brand)' : '#FFF',
                              color: isMe ? '#FFF' : '#333',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              maxWidth: '70%',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              fontSize: '13px'
                            }}
                          >
                            {m.message}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {errorMsg && (
                      <div style={{ padding: '8px 16px', background: '#FCE8E6', color: '#C5221F', fontSize: '12px', fontWeight: '700' }}>
                        {errorMsg}
                      </div>
                    )}

                    {/* Reply Form */}
                    <form onSubmit={handleSendReply} style={{ display: 'flex', borderTop: '1px solid #EEE' }}>
                      <input 
                        type="text" 
                        placeholder="Type response message..."
                        className="form-input"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ border: 'none', borderRadius: 0, padding: '16px' }}
                      />
                      <button type="submit" className="btn-signup" style={{ borderRadius: 0, padding: '0 30px' }}>
                        Reply
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    <div style={{ fontSize: '40px' }}>💬</div>
                    <div>Select a customer thread from the side panel to reply to store inquiries.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">{editingProduct ? 'Edit Listing' : 'List New Product'}</span>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="seller-prod-name">Product Name *</label>
                    <input 
                      id="seller-prod-name"
                      type="text" 
                      className="form-input" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="seller-prod-brand">Brand *</label>
                    <input 
                      id="seller-prod-brand"
                      type="text" 
                      className="form-input" 
                      value={brand} 
                      onChange={(e) => setBrand(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="seller-prod-category">Category *</label>
                    <select 
                      id="seller-prod-category"
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
                    <label className="form-label" htmlFor="seller-prod-emoji">Standard Icon *</label>
                    <select 
                      id="seller-prod-emoji"
                      className="sort-select" 
                      style={{ width: '100%', height: '46px', padding: '12px' }}
                      value={imageEmoji} 
                      onChange={(e) => setImageEmoji(e.target.value)}
                    >
                      <option value="💻">💻 Laptop</option>
                      <option value="📱">📱 Smartphone</option>
                      <option value="🎧">🎧 Audio</option>
                      <option value="🎮">🎮 Gaming</option>
                      <option value="⌚">⌚ Smart Watch</option>
                      <option value="⌨️">⌨️ Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="form-row form-row-mb">
                  <div className="form-group">
                    <label className="form-label" htmlFor="seller-prod-price">Price (Rs.) *</label>
                    <input 
                      id="seller-prod-price"
                      type="number" 
                      className="form-input" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="seller-prod-stock">Stock Qty *</label>
                    <input 
                      id="seller-prod-stock"
                      type="number" 
                      className="form-input" 
                      value={stock} 
                      onChange={(e) => setStock(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Product Image (Cloudinary File Upload)</label>
                  <input type="file" id="seller-file" accept="image/*" onChange={handleCloudinaryUpload} style={{ display: 'none' }} />
                  <div 
                    onClick={() => document.getElementById('seller-file').click()}
                    style={{ border: '2px dashed var(--border-gold)', padding: '16px', textAlign: 'center', background: 'var(--brand-pale)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {uploadingImage ? (
                      'Uploading to Cloudinary...'
                    ) : uploadedUrl ? (
                      <div>
                        <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: '700' }}>✓ Upload Successful</div>
                        <img src={uploadedUrl} alt="" style={{ height: '70px', marginTop: '6px' }} />
                      </div>
                    ) : (
                      'Select image to upload to Cloudinary storage'
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="seller-prod-desc">Description</label>
                  <textarea 
                    id="seller-prod-desc"
                    className="form-input" 
                    rows="3" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-modal-submit">Save & Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
