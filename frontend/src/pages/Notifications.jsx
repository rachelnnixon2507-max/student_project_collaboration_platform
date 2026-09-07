import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCheck, Trash2, UserPlus, CheckCircle2, 
  XCircle, Info, ExternalLink, AlertCircle 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { getUser, isAuthenticated } from '../services/adminService';
import { 
  fetchNotifications, fetchUnreadNotificationCount, 
  markNotificationRead, markAllNotificationsRead, deleteNotification 
} from '../services/projectService';
import '../styles/admin.css';
import '../styles/member1.css';

export default function Notifications() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    loadNotifications();
  }, [loggedIn]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [res, unreadRes] = await Promise.all([
        fetchNotifications(0, 50),
        fetchUnreadNotificationCount().catch(() => ({ unreadCount: 0 })),
      ]);
      setNotifications(res?.content || []);
      setUnreadCount(unreadRes?.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Failed to mark notifications as read');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'JOIN_REQUEST':
        return (
          <div className="notification-icon join">
            <UserPlus size={18} />
          </div>
        );
      case 'JOIN_ACCEPTED':
        return (
          <div className="notification-icon accept">
            <CheckCircle2 size={18} />
          </div>
        );
      case 'JOIN_REJECTED':
        return (
          <div className="notification-icon reject">
            <XCircle size={18} />
          </div>
        );
      default:
        return (
          <div className="notification-icon system">
            <Info size={18} />
          </div>
        );
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <PageHeader title="Notifications" description="Please log in to view your updates and alerts." />
        <button onClick={() => navigate('/login')} className="primary" style={{ marginTop: '20px' }}>
          Sign In to Access Notifications
        </button>
      </div>
    );
  }

  const displayedList = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p>Real-time updates on your project teams, incoming join requests, and platform activity.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fff0ef', border: '1px solid #fecdd3', color: '#c94b3d', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filters-bar" style={{ padding: '12px 18px' }}>
        <div className="filter-group">
          <button
            type="button"
            className={`status-chip ${!filterUnreadOnly ? 'active' : ''}`}
            onClick={() => setFilterUnreadOnly(false)}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            type="button"
            className={`status-chip ${filterUnreadOnly ? 'active' : ''}`}
            onClick={() => setFilterUnreadOnly(true)}
          >
            Unread Only ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8791a5' }}>
          Loading notifications...
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          title={filterUnreadOnly ? "No unread notifications" : "No notifications yet"}
          description="You are all caught up! Activity about your projects and team join requests will appear here."
        />
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {displayedList.map((notif) => (
            <div
              key={notif.id}
              className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => {
                if (!notif.isRead) handleMarkAsRead(notif.id);
                if (notif.referenceType === 'PROJECT') {
                  navigate('/teams');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {getIcon(notif.type)}

              <div className="notification-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 className="notification-title">{notif.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!notif.isRead && (
                      <span className="pill student" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        NEW
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="icon-btn"
                      title="Delete notification"
                      style={{ border: 0, color: '#94a3b8' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p className="notification-message">{notif.message}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span className="notification-time">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                  </span>

                  {notif.referenceType === 'PROJECT' && (
                    <span style={{ fontSize: '12px', color: '#315bea', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      View in Teams <ExternalLink size={12} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
