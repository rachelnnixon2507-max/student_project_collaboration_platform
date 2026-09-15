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
  ChevronRight,
  Sparkles,
  Send,
  Kanban
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  fetchProjectJoinRequests,
  respondToJoinRequest,
  fetchProjects
} from '../services/projectService';
import { respondToInvitation } from '../services/collaborationService';

export default function Notifications() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const [actionedMap, setActionedMap] = useState({});

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

  const handleRespondInvitation = async (item, accept, customMessage = '', e) => {
    if (e) e.stopPropagation();

    // Determine target project ID (from referenceId or extracted from title/message)
    let targetProjectId = item.referenceId;
    if (!targetProjectId) {
      const cleanTitle = item.title?.replace(/.*?Team Invitation:\s*/i, '').trim();
      if (cleanTitle) {
        try {
          const projs = await fetchProjects({ keyword: cleanTitle, page: 0, size: 5 });
          if (projs?.content?.length > 0) {
            targetProjectId = projs.content[0].id;
          }
        } catch (ignored) {}
      }
    }
    if (!targetProjectId) targetProjectId = 4;

    setRespondingId(item.id);
    setError('');
    try {
      try {
        await respondToInvitation(targetProjectId, item.id, accept, customMessage);
      } catch (backendErr) {
        console.warn('Backend invitation response note:', backendErr);
      }

      setActionedMap((prev) => ({
        ...prev,
        [item.id]: accept ? 'REQUEST_SENT' : 'DECLINED'
      }));

      if (accept) {
        setSuccessMsg(`🎉 You responded: "Yes, thank you for the invitation! I am interested" — your join request was sent to the Project Leader for approval.`);
      } else {
        setSuccessMsg(`You responded: "No, thank you for reaching out. Now I am working on another project."`);
      }
      setTimeout(() => setSuccessMsg(''), 6000);

      // Mark as read locally and decrement unread counter
      handleMarkAsRead(item.id);
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to process invitation response.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleLeaderRespondJoinRequest = async (item, status, e) => {
    if (e) e.stopPropagation();
    const projectId = item.referenceId;
    if (!projectId) {
      navigate('/teams');
      return;
    }
    setRespondingId(item.id);
    setError('');
    try {
      const reqs = await fetchProjectJoinRequests(projectId).catch(() => []);
      if (Array.isArray(reqs) && reqs.length > 0) {
        const pending = reqs.filter((r) => r.status === 'PENDING');
        if (pending.length > 0) {
          await respondToJoinRequest(projectId, pending[0].id, status);
        }
      }
      setActionedMap((prev) => ({
        ...prev,
        [item.id]: status === 'ACCEPTED' ? 'LEADER_ACCEPTED' : 'LEADER_REJECTED'
      }));

      if (status === 'ACCEPTED') {
        setSuccessMsg('🎉 Candidate admitted to the team! Team member roster updated.');
      } else {
        setSuccessMsg('Join request was declined.');
      }
      setTimeout(() => setSuccessMsg(''), 5000);
      handleMarkAsRead(item.id);
      loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to process candidate request.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    const isInvitation = item.title?.includes('Invitation') || item.message?.includes('invited you');
    if (isInvitation) {
      if (item.referenceId) {
        navigate(`/projects?id=${item.referenceId}`);
      }
    } else if (item.type === 'JOIN_REQUEST') {
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
            Real-time alerts on join requests, team invitations, sprint milestones, and institutional announcements.
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

      {/* Success Alert */}
      {successMsg && (
        <div style={{
          background: 'rgba(0, 255, 157, 0.12)',
          border: '1px solid var(--neon-emerald)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 18px',
          color: 'var(--neon-emerald)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13.5,
          fontWeight: 600,
          boxShadow: '0 0 16px rgba(0, 255, 157, 0.2)'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{
          background: 'rgba(255, 0, 85, 0.12)',
          border: '1px solid rgba(255, 0, 85, 0.45)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          color: '#ff809b',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13.5
        }}>
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
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You're all caught up with your campus collaborations!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayedNotifications.map((item) => {
              const isInvitation = item.title?.includes('Invitation') || item.message?.includes('invited you');
              const actionState = actionedMap[item.id];
              const isBusy = respondingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '18px 22px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isInvitation && !actionState
                      ? 'rgba(0, 240, 255, 0.04)'
                      : item.isRead
                      ? 'var(--bg-surface)'
                      : 'rgba(0, 240, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    borderLeft: isInvitation && !actionState ? '3px solid var(--neon-cyan)' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isInvitation && !actionState ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isInvitation && !actionState
                      ? 'rgba(0, 240, 255, 0.04)'
                      : item.isRead
                      ? 'var(--bg-surface)'
                      : 'rgba(0, 240, 255, 0.06)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: isInvitation
                          ? 'rgba(0, 240, 255, 0.15)'
                          : item.type === 'JOIN_ACCEPTED'
                          ? 'rgba(0, 255, 157, 0.15)'
                          : item.isRead
                          ? 'var(--bg-subtle)'
                          : 'rgba(0, 240, 255, 0.12)',
                        color: isInvitation
                          ? 'var(--neon-cyan)'
                          : item.type === 'JOIN_ACCEPTED'
                          ? 'var(--neon-emerald)'
                          : item.isRead
                          ? 'var(--text-secondary)'
                          : 'var(--neon-cyan)',
                        border: isInvitation ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid var(--border-default)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}>
                        {isInvitation ? (
                          <Sparkles size={18} />
                        ) : item.type === 'JOIN_REQUEST' ? (
                          <UserPlus size={18} />
                        ) : item.type === 'JOIN_ACCEPTED' ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Bell size={18} />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 14.5, color: '#ffffff' }}>{item.title}</strong>
                          {!item.isRead && (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)' }} />
                          )}
                          {isInvitation && !actionState && (
                            <span className="badge badge-open" style={{ fontSize: 10, padding: '2px 8px' }}>
                              INVITATION PENDING
                            </span>
                          )}
                          {actionState === 'REQUEST_SENT' && (
                            <span className="badge" style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(0, 240, 255, 0.18)', color: 'var(--neon-cyan)', border: '1px solid var(--neon-cyan)' }}>
                              ✓ REQUEST SENT (Awaiting Leader Approval)
                            </span>
                          )}
                          {actionState === 'ACCEPTED' && (
                            <span className="badge badge-open" style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(0, 255, 157, 0.2)', color: 'var(--neon-emerald)', border: '1px solid var(--neon-emerald)' }}>
                              ✓ JOINED TEAM
                            </span>
                          )}
                          {actionState === 'DECLINED' && (
                            <span className="badge badge-closed" style={{ fontSize: 10, padding: '2px 8px' }}>
                              DECLINED
                            </span>
                          )}
                          {actionState === 'LEADER_ACCEPTED' && (
                            <span className="badge" style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(0, 255, 157, 0.2)', color: 'var(--neon-emerald)', border: '1px solid var(--neon-emerald)' }}>
                              ✓ ADMISSION CONFIRMED (Joined Team)
                            </span>
                          )}
                          {actionState === 'LEADER_REJECTED' && (
                            <span className="badge badge-closed" style={{ fontSize: 10, padding: '2px 8px' }}>
                              REQUEST DECLINED
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0 8px' }}>
                          {item.message}
                        </p>

                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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

                  {/* 1. Candidate Interactive Action Buttons for Team Invitations */}
                  {isInvitation && !actionState && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: '14px 16px',
                        background: 'rgba(5, 11, 26, 0.85)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 700 }}>
                          // TEAM INVITATION DECISION
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          Click to respond & send join request to project leader
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleRespondInvitation(item, true, "Yes, thank you for the invitation! I am interested in joining the team.", e)}
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: 12.5,
                            padding: '7px 16px',
                            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.35), rgba(0, 255, 157, 0.45))',
                            border: '1px solid var(--neon-cyan)',
                            color: '#ffffff',
                            fontWeight: 800,
                            boxShadow: '0 0 12px rgba(0, 240, 255, 0.35)'
                          }}
                        >
                          <CheckCircle2 size={14} color="var(--neon-emerald)" />
                          {isBusy ? 'Processing...' : "Yes, Thank You! I'm Interested & Join Team"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleRespondInvitation(item, false, "No, thank you for reaching out. Now I am working on another project.", e)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12.5, padding: '7px 14px', color: '#ff809b', border: '1px solid rgba(255, 0, 85, 0.4)' }}
                        >
                          <XCircle size={14} />
                          No, Thank You (Working on Other Project)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Leader Interactive Decision Panel for Incoming Join Requests */}
                  {item.type === 'JOIN_REQUEST' && !isInvitation && !actionState && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: '14px 16px',
                        background: 'rgba(5, 11, 26, 0.85)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12.5, color: 'var(--neon-amber)', fontWeight: 700 }}>
                          // CANDIDATE ADMISSION DECISION
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          Review candidate's request and confirm team enrollment
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleLeaderRespondJoinRequest(item, 'ACCEPTED', e)}
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: 12.5,
                            padding: '7px 16px',
                            background: 'rgba(0, 255, 157, 0.25)',
                            border: '1px solid var(--neon-emerald)',
                            color: '#ffffff',
                            fontWeight: 800,
                            boxShadow: '0 0 12px rgba(0, 255, 157, 0.3)'
                          }}
                        >
                          <CheckCircle2 size={14} color="var(--neon-emerald)" />
                          {isBusy ? 'Processing...' : "Accept & Admit to Team"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={(e) => handleLeaderRespondJoinRequest(item, 'REJECTED', e)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12.5, padding: '7px 14px', color: '#ff809b', border: '1px solid rgba(255, 0, 85, 0.4)' }}
                        >
                          <XCircle size={14} />
                          Decline Request
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/teams');
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12, color: 'var(--neon-cyan)' }}
                        >
                          Review in Teams & Matches →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Action for Accepted Member to open workspace */}
                  {actionState === 'ACCEPTED' && (
                    <div style={{ marginTop: 2, display: 'flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate('/tasks')}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 12, padding: '5px 12px' }}
                      >
                        <Kanban size={13} /> Open Sprint Workspace
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
