import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Users2,
  User,
  Hash,
  Search,
  CheckCheck,
  Plus,
  ArrowRight
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  sendMessage,
  fetchProjectMessages,
  fetchDirectMessages,
  fetchActiveConversations
} from '../services/collaborationService';
import {
  fetchMyCreatedProjects,
  fetchMyJoinedProjects,
  fetchProjects
} from '../services/projectService';

export default function Messages() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // New Direct message modal
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directRecipientId, setDirectRecipientId] = useState('');
  const [directRecipientName, setDirectRecipientName] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    loadAllConversations();
  }, [loggedIn, navigate]);

  useEffect(() => {
    if (!activeChat) return;
    loadMessagesForActiveChat();
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAllConversations = async () => {
    try {
      const [created, joined, convList] = await Promise.all([
        fetchMyCreatedProjects().catch(() => []),
        fetchMyJoinedProjects().catch(() => []),
        fetchActiveConversations().catch(() => []),
      ]);

      const projectChannels = [...created, ...joined.filter(jp => !created.some(cp => cp.id === jp.id))].map((p) => ({
        type: 'PROJECT',
        id: p.id,
        title: p.title,
        subtitle: `Project Team Channel`,
      }));

      // If user has no active projects, fetch public projects
      let initialList = projectChannels;
      if (initialList.length === 0) {
        const publicRes = await fetchProjects({ page: 0, size: 5 });
        if (publicRes && publicRes.content) {
          initialList = publicRes.content.map((p) => ({
            type: 'PROJECT',
            id: p.id,
            title: p.title,
            subtitle: `Project Team Channel`,
          }));
        }
      }

      setConversations(initialList);
      if (initialList.length > 0 && !activeChat) {
        setActiveChat(initialList[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessagesForActiveChat = async () => {
    if (!activeChat) return;
    setLoading(true);
    setError('');
    try {
      let res = [];
      if (activeChat.type === 'PROJECT') {
        res = await fetchProjectMessages(activeChat.id);
      } else {
        res = await fetchDirectMessages(activeChat.id);
      }
      setMessages(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;

    setSending(true);
    try {
      const payload = {
        content: newMessageText.trim(),
        messageType: 'TEXT',
      };

      if (activeChat.type === 'PROJECT') {
        payload.projectId = Number(activeChat.id);
      } else {
        payload.receiverId = Number(activeChat.id);
      }

      await sendMessage(payload);
      setNewMessageText('');
      loadMessagesForActiveChat();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartDirectChat = (e) => {
    e.preventDefault();
    if (!directRecipientId) return;
    const directChatObj = {
      type: 'DIRECT',
      id: Number(directRecipientId),
      title: directRecipientName || `Student (${directRecipientId})`,
      subtitle: 'Direct Message',
    };
    setConversations((prev) => [directChatObj, ...prev.filter(c => !(c.type === 'DIRECT' && c.id === directChatObj.id))]);
    setActiveChat(directChatObj);
    setShowDirectModal(false);
    setDirectRecipientId('');
    setDirectRecipientName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Team Discussions & Messages</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Collaborate in real time with project teammates and student creators.
          </p>
        </div>

        <button
          onClick={() => setShowDirectModal(true)}
          className="btn btn-secondary btn-sm"
        >
          <Plus size={15} /> New Direct Message
        </button>
      </div>

      {/* Main Chat Shell */}
      <div className="chat-shell">
        {/* Left Sidebar: Channels & Conversations */}
        <div className="chat-sidebar">
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Channels & Chats
            </span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {conversations.map((conv) => {
              const isSelected = activeChat && activeChat.type === conv.type && activeChat.id === conv.id;
              return (
                <div
                  key={`${conv.type}-${conv.id}`}
                  onClick={() => setActiveChat(conv)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--primary-50)' : 'transparent',
                    color: isSelected ? 'var(--primary-700)' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isSelected ? 'var(--primary-600)' : 'var(--bg-subtle)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}>
                    {conv.type === 'PROJECT' ? <Hash size={16} /> : <User size={16} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: 11, color: isSelected ? 'var(--primary-600)' : 'var(--text-muted)' }}>
                      {conv.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="chat-main">
          {activeChat ? (
            <>
              {/* Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'grid', placeItems: 'center' }}>
                    {activeChat.type === 'PROJECT' ? <Hash size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{activeChat.title}</h3>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{activeChat.subtitle}</span>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="chat-messages">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading conversation...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', margin: 'auto' }}>
                    <MessageSquare size={40} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Start the conversation!</p>
                    <p style={{ fontSize: 12.5 }}>Share updates, code snippets, or sprint plans with teammates.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble ${isMe ? 'bubble-outgoing' : 'bubble-incoming'}`}
                      >
                        {!isMe && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-700)', marginBottom: 2 }}>
                            {msg.senderName || 'Teammate'}
                          </div>
                        )}
                        <div>{msg.content}</div>
                        <div style={{
                          fontSize: 10,
                          opacity: 0.75,
                          marginTop: 4,
                          textAlign: isMe ? 'right' : 'left'
                        }}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder={`Message ${activeChat.title}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessageText.trim()}
                  className="btn btn-primary"
                  style={{ padding: '9px 16px' }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', margin: 'auto' }}>
              Select a channel to begin messaging.
            </div>
          )}
        </div>
      </div>

      {/* Direct Message Modal */}
      {showDirectModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Start Direct Conversation</h3>
              <button onClick={() => setShowDirectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleStartDirectChat}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Student User ID *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2, 3, 4"
                    value={directRecipientId}
                    onChange={(e) => setDirectRecipientId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Name (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Krishnan"
                    value={directRecipientName}
                    onChange={(e) => setDirectRecipientName(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowDirectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Open Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
