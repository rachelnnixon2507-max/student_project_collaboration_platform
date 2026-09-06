import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import '../styles/collaboration.css';
import {
  sendMessage,
  fetchProjectMessages,
  fetchDirectMessages,
  fetchActiveConversations
} from '../services/collaborationService';
import { fetchProjects, getUser } from '../services/adminService';

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState({ type: 'PROJECT', id: 1, title: 'Campus Smart Parking' });
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick direct message modal / input
  const [targetUserId, setTargetUserId] = useState('');

  const messagesEndRef = useRef(null);
  const currentUser = getUser();
  const currentUserId = currentUser?.id || 1;

  // Load conversation list and initial channels
  useEffect(() => {
    loadConversationList();
  }, []);

  // Reload messages whenever activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    loadMessagesForActiveChat();
  }, [activeChat]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversationList() {
    try {
      const convList = await fetchActiveConversations();
      if (convList && convList.length > 0) {
        setConversations(convList);
      } else {
        // Fallback default project channels
        setConversations([
          { conversationType: 'PROJECT', targetId: 1, title: 'Campus Smart Parking', subtitle: 'Project Team Chat', lastMessage: 'Welcome to team chat!' },
          { conversationType: 'PROJECT', targetId: 2, title: 'AI Study Planner', subtitle: 'Project Team Chat', lastMessage: 'Sprint kickoff tomorrow.' },
          { conversationType: 'PROJECT', targetId: 3, title: 'IoT Lab Monitor', subtitle: 'Project Team Chat', lastMessage: 'Sensors arriving soon.' },
        ]);
      }
    } catch (err) {
      setConversations([
        { conversationType: 'PROJECT', targetId: 1, title: 'Campus Smart Parking', subtitle: 'Project Team Chat', lastMessage: 'Welcome to team chat!' },
        { conversationType: 'PROJECT', targetId: 2, title: 'AI Study Planner', subtitle: 'Project Team Chat', lastMessage: 'Sprint kickoff tomorrow.' },
      ]);
    }
  }

  async function loadMessagesForActiveChat() {
    setLoading(true);
    setError('');
    try {
      let res = [];
      if (activeChat.type === 'PROJECT') {
        res = await fetchProjectMessages(activeChat.id);
      } else {
        res = await fetchDirectMessages(activeChat.id);
      }
      setMessages(res || []);
    } catch (err) {
      // If unauthenticated guest, gracefully clear error
      if (!currentUser || err.message?.includes('403') || err.message?.includes('401')) {
        setError('');
        setMessages([]);
      } else {
        setError(err.message || 'Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to send messages and participate in discussions.');
      navigate('/login');
      return;
    }
    if (!newMessageText.trim()) return;

    const payload = {
      content: newMessageText.trim(),
      messageType: 'TEXT',
      projectId: activeChat.type === 'PROJECT' ? Number(activeChat.id) : null,
      receiverId: activeChat.type === 'DIRECT' ? Number(activeChat.id) : null,
    };

    try {
      await sendMessage(payload);
      setNewMessageText('');
      loadMessagesForActiveChat();
      loadConversationList();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleStartDirectMessage(e) {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to start direct messages.');
      navigate('/login');
      return;
    }
    if (!targetUserId) return;
    setActiveChat({
      type: 'DIRECT',
      id: Number(targetUserId),
      title: `User #${targetUserId}`
    });
    setTargetUserId('');
  }

  const projectChannels = conversations.filter(c => c.conversationType === 'PROJECT');
  const directChats = conversations.filter(c => c.conversationType === 'DIRECT');

  return (
    <div className="collab-container">
      <div className="page-header">
        <div>
          <h2>Team Chat & Direct Messaging</h2>
          <p>Collaborate in real-time on project channels or direct message teammates.</p>
        </div>
      </div>

      {!currentUser && (
        <div style={{ padding: '12px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: '#1d4ed8' }}>Guest Mode:</strong> You are currently viewing discussions as a guest. Sign in to send messages and chat with teammates.
          </div>
          <Link
            to="/login"
            style={{ padding: '6px 14px', background: '#315bea', color: '#ffffff', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Sign In
          </Link>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="chat-container">
        {/* Left Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span>Conversations</span>
          </div>

          <div className="chat-thread-list">
            <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Project Channels
            </div>
            {projectChannels.map(c => (
              <div
                key={`proj_${c.targetId}`}
                className={`chat-thread-item ${activeChat.type === 'PROJECT' && activeChat.id === c.targetId ? 'active' : ''}`}
                onClick={() => setActiveChat({ type: 'PROJECT', id: c.targetId, title: c.title })}
              >
                <div className="thread-title">
                  <span># {c.title}</span>
                </div>
                <div className="thread-preview">{c.lastMessage || 'No messages yet'}</div>
              </div>
            ))}

            <div style={{ padding: '16px 16px 8px 16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Direct Messages
            </div>
            {directChats.length === 0 ? (
              <div style={{ padding: '8px 16px', fontSize: '12px', color: '#94a3b8' }}>
                No active direct messages.
              </div>
            ) : (
              directChats.map(c => (
                <div
                  key={`direct_${c.targetId}`}
                  className={`chat-thread-item ${activeChat.type === 'DIRECT' && activeChat.id === c.targetId ? 'active' : ''}`}
                  onClick={() => setActiveChat({ type: 'DIRECT', id: c.targetId, title: c.title })}
                >
                  <div className="thread-title">
                    <span>💬 {c.title}</span>
                    {c.unreadCount > 0 && (
                      <span style={{ background: '#315bea', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="thread-subtitle">{c.subtitle}</div>
                  <div className="thread-preview">{c.lastMessage}</div>
                </div>
              ))
            )}

            {/* Quick start direct chat */}
            <form onSubmit={handleStartDirectMessage} style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                Chat with User ID:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="ID (e.g. 2)"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <button type="submit" style={{ padding: '6px 10px', background: '#315bea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  Chat
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="chat-main">
          <div className="chat-header">
            <div>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '16px' }}>
                {activeChat.type === 'PROJECT' ? `# ${activeChat.title}` : `💬 ${activeChat.title}`}
              </h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {activeChat.type === 'PROJECT' ? 'Project Team Channel' : 'Direct 1-on-1 Conversation'}
              </span>
            </div>
            <button
              onClick={loadMessagesForActiveChat}
              style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="chat-messages-area">
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading conversation history...</p>
            ) : messages.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto', maxWidth: '360px' }}>
                <div className="empty-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Send the first message to start the discussion!</p>
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`message-bubble ${isMine ? 'message-mine' : 'message-theirs'}`}
                  >
                    {!isMine && (
                      <span className="message-sender">
                        {m.senderName} • {m.senderRole}
                      </span>
                    )}
                    <div>{m.content}</div>
                    <span className="message-time">
                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <input
              type="text"
              placeholder={currentUser ? `Message ${activeChat.title}...` : 'Please sign in to send messages...'}
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              disabled={!currentUser}
            />
            {currentUser ? (
              <button type="submit" className="primary" style={{ padding: '10px 20px' }}>
                Send
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="primary"
                style={{ padding: '10px 20px', background: '#315bea' }}
              >
                Sign In to Chat
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
