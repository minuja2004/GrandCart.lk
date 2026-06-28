import React, { useState, useEffect, useRef } from 'react';

export default function ChatWidget({ currentUser, activeRecipient, setActiveRecipient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const messageEndRef = useRef(null);
  
  // Fetch conversations (sellers we chatted with)
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chats/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching chat threads:', err);
    }
  };

  // Fetch messages between customer and selected seller
  const fetchMessages = async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chats/history/${recipientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setErrorMsg('');
      }
    } catch (err) {
      console.error('Error loading chat messages:', err);
    }
  };

  // Open chat automatically if a recipient was selected (e.g. from details page)
  useEffect(() => {
    if (activeRecipient) {
      setIsOpen(true);
      fetchMessages(activeRecipient.id);
      
      // Add to conversation list if not already there
      setConversations(prev => {
        const exists = prev.some(c => c._id === activeRecipient.id);
        if (!exists) {
          return [
            {
              _id: activeRecipient.id,
              firstName: activeRecipient.firstName || '',
              lastName: activeRecipient.lastName || '',
              storeName: activeRecipient.storeName || 'Seller Store',
              role: 'seller'
            },
            ...prev
          ];
        }
        return prev;
      });
    }
  }, [activeRecipient]);

  // Load conversations list on mount
  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      fetchConversations();
    }
  }, [currentUser]);

  // Message Poller (every 4 seconds when open)
  useEffect(() => {
    let interval;
    if (isOpen && activeRecipient) {
      interval = setInterval(() => {
        fetchMessages(activeRecipient.id);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeRecipient]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRecipient) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chats/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activeRecipient.id,
          message: inputText
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, data]);
        setInputText('');
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error sending message.');
    }
  };

  const selectConversation = (contact) => {
    const recipientInfo = {
      id: contact._id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      storeName: contact.storeName || `${contact.firstName} ${contact.lastName}`,
      role: contact.role
    };
    setActiveRecipient(recipientInfo);
    fetchMessages(contact._id);
  };

  if (!currentUser || currentUser.role !== 'customer') return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'var(--font)' }}>
      {/* Floating Toggle Button */}
      <button 
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--brand)',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--white)',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition)'
        }}
        onClick={() => {
          setIsOpen(!isOpen);
          fetchConversations();
        }}
        title="Chat with Sellers"
      >
        {isOpen ? <i className="ti ti-x"></i> : <i className="ti ti-message-2"></i>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            bottom: '76px',
            right: '0',
            width: '420px',
            height: '520px',
            background: 'var(--white)',
            border: '2px solid var(--brand)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div 
            style={{
              background: 'var(--brand)',
              color: 'var(--white)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontWeight: '800', fontSize: '15px' }}>
              {activeRecipient ? `Store: ${activeRecipient.storeName}` : 'Chat with Sellers'}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>
              GrandCart Support
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Thread List (Only show if not locked in a conversation, or small side column) */}
            <div 
              style={{
                width: '130px',
                borderRight: '1px solid var(--border-light)',
                background: 'var(--brand-pale)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              <div style={{ padding: '8px', fontSize: '10px', fontWeight: '800', color: 'var(--text-sub)', borderBottom: '1px solid var(--border-light)' }}>
                Active Store Chats
              </div>
              {conversations.length > 0 ? (
                conversations.map(c => (
                  <div 
                    key={c._id}
                    onClick={() => selectConversation(c)}
                    style={{
                      padding: '10px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      background: activeRecipient?.id === c._id ? '#FFF' : 'transparent',
                      fontWeight: activeRecipient?.id === c._id ? '750' : '500',
                      color: activeRecipient?.id === c._id ? 'var(--brand-dark)' : 'var(--text-main)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={c.storeName || `${c.firstName} ${c.lastName}`}
                  >
                    {c.storeName || `${c.firstName} ${c.lastName}`}
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px 8px', fontSize: '10px', color: '#999', textAlign: 'center' }}>
                  No active chats. Start chat on a product!
                </div>
              )}
            </div>

            {/* Right Chat Messages Thread */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>
              {activeRecipient ? (
                <>
                  {/* Messages Bubble Area */}
                  <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div 
                          key={idx}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            background: isMe ? 'var(--brand)' : 'var(--white)',
                            color: isMe ? 'var(--white)' : 'var(--charcoal)',
                            padding: '8px 12px',
                            borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            maxWidth: '85%',
                            fontSize: '12.5px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            lineHeight: '1.4'
                          }}
                        >
                          {msg.message}
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>

                  {errorMsg && (
                    <div style={{ background: '#FCE8E6', color: '#C5221F', fontSize: '11px', padding: '6px 12px', fontWeight: '750' }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* Send Input Form */}
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-light)', background: '#FFF' }}>
                    <input 
                      type="text" 
                      placeholder="Type a message to the seller..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      style={{
                        flex: 1,
                        border: 'none',
                        padding: '12px 16px',
                        fontSize: '12.5px',
                        outline: 'none',
                        fontFamily: 'var(--font)'
                      }}
                    />
                    <button 
                      type="submit" 
                      style={{
                        background: 'var(--brand)',
                        border: 'none',
                        color: 'var(--white)',
                        padding: '0 18px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'var(--transition)'
                      }}
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                  <h4 style={{ color: 'var(--charcoal)', fontSize: '14px', marginBottom: '6px' }}>Your Inbox</h4>
                  <p style={{ fontSize: '11px' }}>Select a seller store from the side menu or click **Chat with Seller** on any product specifications details sheet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
