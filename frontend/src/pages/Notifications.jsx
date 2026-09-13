import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../services/projectService';

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
      navigate('/login');
      return;
    }
    loadNotifications();
  }, [loggedIn, navigate]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [res, unreadRes] = await Promise.all([
        fetchNotifications(0, 50),
        fetchUnreadNotificationCount().catch(() => ({ unreadCount: 0 })),
      ]);
      setNotifications(res?.content || (Array.isArray(res) ? res : []));
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

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    if (item.type === 'JOIN_REQUEST') {
      navigate('/teams');
    } else if (item.type === 'JOIN_ACCEPTED') {
      navigate('/tasks');
    } else if (item.referenceType === 'PROJECT' && item.referenceId) {
      navigate(`/projects?id=${item.referenceId}`);
    }
  };

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Notification Center</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Real-time alerts on join requests, team sprint approvals, and institutional announcements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`btn btn-sm ${filterUnreadOnly ? 'btn-primary' : 'btn-secondary'}`}
          >
            {filterUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
              <CheckCheck size={14} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-100)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading notifications...</div>
        ) : displayedNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Bell size={40} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>No notifications</h3>
            <p style={{ fontSize: 13 }}>You're all caught up with your campus collaborations!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayedNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: item.isRead ? 'var(--bg-surface)' : 'var(--primary-50)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: item.isRead ? 'var(--bg-subtle)' : 'var(--primary-100)',
                    color: item.isRead ? 'var(--text-secondary)' : 'var(--primary-700)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}>
                    {item.type === 'JOIN_REQUEST' ? <UserPlus size={18} /> : item.type === 'JOIN_ACCEPTED' ? <CheckCircle2 size={18} /> : <Bell size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>{item.title}</strong>
                      {!item.isRead && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary-600)' }} />
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '2px 0 6px' }}>
                      {item.message}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--text-muted)', padding: 6 }}
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
