import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ currentUser, addToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('approvals');

  // Approvals & Products states
  const [products, setProducts] = useState([]);
  
  // Users/Sellers states
  const [users, setUsers] = useState([]);

  // Flyers/Promotions states
  const [promotions, setPromotions] = useState([]);
  const [promoForm, setPromoForm] = useState({
    title: '',
    subtitle: '',
    badge: '',
    icon: '💻',
    category: 'Laptops',
    bannerColor: 'f1'
  });

  // Orders states
  const [orders, setOrders] = useState([]);

  // Chat Monitor states
  const [chatLogs, setChatLogs] = useState([]);

  // Authenticate admin access
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    if (!userObj || userObj.role !== 'admin') {
      addToast('Access denied: Admin authorization required.');
      navigate('/');
    }
  }, [navigate]);

  // Loaders
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products/admin', {
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/admin', {
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

  const fetchChatLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chats/admin/monitor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch loaders based on tabs
  useEffect(() => {
    if (activeTab === 'approvals') fetchProducts();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'flyers') fetchPromotions();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'chat-monitor') fetchChatLogs();
  }, [activeTab]);

  // Product reviews approvals
  const handleReviewProduct = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addToast(`Product listing review status set to ${status.toUpperCase()}!`);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Block/unblock users
  const handleToggleBlockUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}/block`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('User access status updated successfully.');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Promotion flyer
  const handleAddPromotion = async (e) => {
    e.preventDefault();
    if (!promoForm.title || !promoForm.subtitle || !promoForm.badge) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(promoForm)
      });

      if (res.ok) {
        addToast('New dynamic flyer seeded on homepage!');
        setPromoForm({
          title: '',
          subtitle: '',
          badge: '',
          icon: '💻',
          category: 'Laptops',
          bannerColor: 'f1'
        });
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (window.confirm('Delete this promo card?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/promotions/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          addToast('Promotion flyer deleted.');
          fetchPromotions();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Block entire chat thread between sender and receiver
  const handleToggleBlockChat = async (userA, userB, blockStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chats/admin/block', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userA, userB, blockStatus })
      });
      if (res.ok) {
        addToast(blockStatus ? 'Conversation thread BLOCKED.' : 'Conversation thread UNBLOCKED.');
        fetchChatLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingApprovals = products.filter(p => p.status === 'pending');

  return (
    <div className="page active">
      <div className="dash-wrap">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-brand-area">
            <span className="dash-brand-title">Admin Console</span>
            <div className="dash-brand-sub">GrandCart Central</div>
          </div>
          
          <ul className="dash-nav-list">
            <li 
              className={`dash-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <i className="ti ti-checklist"></i> Product Approvals
              {pendingApprovals.length > 0 && (
                <span className="nav-badge" style={{ position: 'relative', top: '0', right: '-8px', display: 'inline-flex' }}>
                  {pendingApprovals.length}
                </span>
              )}
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="ti ti-users"></i> Users & Sellers
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'flyers' ? 'active' : ''}`}
              onClick={() => setActiveTab('flyers')}
            >
              <i className="ti ti-layout"></i> Homepage Flyers
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="ti ti-shopping-cart"></i> Overall Orders
            </li>
            <li 
              className={`dash-nav-item ${activeTab === 'chat-monitor' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat-monitor')}
            >
              <i className="ti ti-messages"></i> Chat Monitor
            </li>
          </ul>
        </aside>

        {/* Main Content Dashboard */}
        <main className="dash-main">
          {activeTab === 'approvals' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Listing Review Panel</h1>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title">Pending Seller Approvals</h3>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Seller / Store</th>
                        <th>Price (Rs.)</th>
                        <th>Review Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.length > 0 ? (
                        pendingApprovals.map(p => (
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
                                  <div style={{ fontSize: '11px', color: '#888' }}>{p.category} | Qty: {p.stock}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>{p.storeName}</strong>
                            </td>
                            <td><strong>Rs. {p.price.toLocaleString()}</strong></td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn-signup" 
                                  style={{ padding: '6px 12px', background: '#16a34a' }}
                                  onClick={() => handleReviewProduct(p._id, 'approved')}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="btn-login" 
                                  style={{ padding: '6px 12px', borderColor: '#dc2626', color: '#dc2626' }}
                                  onClick={() => handleReviewProduct(p._id, 'rejected')}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: '24px' }}>
                            No pending seller approvals. All products are processed!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Users & Sellers</h1>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>User Profile</th>
                        <th>Email / Contact</th>
                        <th>Role / Scope</th>
                        <th>Status</th>
                        <th>Access Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <strong>{u.firstName} {u.lastName}</strong>
                            {u.storeName && <div style={{ fontSize: '11px', color: 'var(--brand-dark)' }}>Store: {u.storeName}</div>}
                          </td>
                          <td>
                            <div>{u.email}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>{u.phone}</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: '750', fontSize: '12px' }}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span 
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '750',
                                background: u.isBlocked ? '#FCE8E6' : '#E6F4EA',
                                color: u.isBlocked ? '#C5221F' : '#137333'
                              }}
                            >
                              {u.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-login"
                              style={{ 
                                padding: '6px 14px', 
                                color: u.isBlocked ? '#137333' : '#dc2626', 
                                borderColor: u.isBlocked ? '#137333' : '#dc2626' 
                              }}
                              onClick={() => handleToggleBlockUser(u._id)}
                            >
                              {u.isBlocked ? 'Reactivate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'flyers' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Homepage Flyers & Deals</h1>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                {/* Form */}
                <form onSubmit={handleAddPromotion} className="dash-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '15px' }}>Create Promotional Flyer</h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="flyer-title">Promo Title</label>
                    <input 
                      id="flyer-title"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Weekly Deal"
                      value={promoForm.title}
                      onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="flyer-subtitle">Promo Subtitle</label>
                    <input 
                      id="flyer-subtitle"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 15% off Audio"
                      value={promoForm.subtitle}
                      onChange={(e) => setPromoForm({ ...promoForm, subtitle: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="flyer-badge">Promo Badge</label>
                    <input 
                      id="flyer-badge"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Save Rs. 5000"
                      value={promoForm.badge}
                      onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="flyer-icon">Icon Emoji</label>
                      <input 
                        id="flyer-icon"
                        type="text" 
                        className="form-input" 
                        value={promoForm.icon}
                        onChange={(e) => setPromoForm({ ...promoForm, icon: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="flyer-category">Category</label>
                      <select 
                        id="flyer-category"
                        className="sort-select" 
                        style={{ height: '46px', padding: '10px' }}
                        value={promoForm.category}
                        onChange={(e) => setPromoForm({ ...promoForm, category: e.target.value })}
                      >
                        <option value="Laptops">Laptops</option>
                        <option value="Smartphones">Smartphones</option>
                        <option value="Audio">Audio</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Wearables">Wearables</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="flyer-color">CSS Style Class</label>
                    <select 
                      id="flyer-color"
                      className="sort-select"
                      style={{ height: '46px', padding: '10px' }}
                      value={promoForm.bannerColor}
                      onChange={(e) => setPromoForm({ ...promoForm, bannerColor: e.target.value })}
                    >
                      <option value="f1">Card Style 1 (Yellow Theme)</option>
                      <option value="f2">Card Style 2 (Dark Gray Theme)</option>
                      <option value="f3">Card Style 3 (Soft Gold Theme)</option>
                      <option value="f4">Card Style 4 (Charcoal Theme)</option>
                      <option value="f5">Card Style 5 (White Glow Theme)</option>
                      <option value="f6">Card Style 6 (Dotted Gold Theme)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-signup" style={{ marginTop: '10px' }}>
                    Publish Flyer
                  </button>
                </form>

                {/* List */}
                <div className="dash-card" style={{ flex: 1 }}>
                  <h3 className="dash-card-title">Live Flyers</h3>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Details</th>
                          <th>Category</th>
                          <th>Color Class</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promotions.map(promo => (
                          <tr key={promo._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '24px' }}>{promo.icon}</span>
                                <div>
                                  <div style={{ fontWeight: '700' }}>{promo.title}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--brand-dark)' }}>{promo.subtitle} ({promo.badge})</div>
                                </div>
                              </div>
                            </td>
                            <td>{promo.category}</td>
                            <td><code>{promo.bannerColor}</code></td>
                            <td>
                              <button className="btn-dash-icon delete" onClick={() => handleDeletePromotion(promo._id)}>
                                <i className="ti ti-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Comprehensive Orders</h1>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer / Location</th>
                        <th>Items Log</th>
                        <th>Billing Total</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td><code>{order.orderId}</code></td>
                          <td>
                            <strong>{order.customerDetails.fullName}</strong>
                            <div style={{ fontSize: '11px', color: '#777' }}>{order.customerDetails.address}, {order.customerDetails.city}</div>
                          </td>
                          <td>
                            {order.items.map((it, idx) => (
                              <div key={idx} style={{ fontSize: '11.5px' }}>
                                {it.quantity}x {it.name} (Rs. {it.price.toLocaleString()})
                              </div>
                            ))}
                          </td>
                          <td><strong>Rs. {order.total.toLocaleString()}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'chat-monitor' && (
            <>
              <div className="dash-header">
                <h1 className="dash-title">Chat Monitoring console</h1>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Receiver</th>
                        <th>Message Content</th>
                        <th>Date / Status</th>
                        <th>Admin action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatLogs.map(msg => (
                        <tr key={msg._id}>
                          <td>
                            <strong>{msg.senderId?.firstName} {msg.senderId?.lastName}</strong>
                            <div style={{ fontSize: '10px', color: '#888' }}>({msg.senderId?.role})</div>
                          </td>
                          <td>
                            <strong>{msg.receiverId?.firstName} {msg.receiverId?.lastName}</strong>
                            <div style={{ fontSize: '10px', color: '#888' }}>({msg.receiverId?.role})</div>
                          </td>
                          <td style={{ maxWidth: '280px', wordBreak: 'break-all', fontSize: '12px' }}>
                            {msg.message}
                          </td>
                          <td>
                            <div style={{ fontSize: '11px' }}>{new Date(msg.timestamp).toLocaleString()}</div>
                            <span 
                              style={{
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '9.5px',
                                fontWeight: '750',
                                background: msg.isBlocked ? '#FCE8E6' : '#E6F4EA',
                                color: msg.isBlocked ? '#C5221F' : '#137333',
                                marginTop: '4px'
                              }}
                            >
                              {msg.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-login"
                              style={{ 
                                padding: '5px 10px', 
                                fontSize: '11px',
                                color: msg.isBlocked ? '#137333' : '#dc2626',
                                borderColor: msg.isBlocked ? '#137333' : '#dc2626'
                              }}
                              onClick={() => handleToggleBlockChat(msg.senderId?._id, msg.receiverId?._id, !msg.isBlocked)}
                              disabled={!msg.senderId || !msg.receiverId}
                            >
                              {msg.isBlocked ? 'Unblock Thread' : 'Block Thread'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
