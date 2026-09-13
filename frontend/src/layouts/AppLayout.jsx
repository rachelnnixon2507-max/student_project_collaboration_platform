import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Users2,
  Kanban,
  MessageSquare,
  User,
  Bell,
  GraduationCap,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
  Cpu,
  Terminal,
  Activity
} from 'lucide-react';
import { getUser, clearAuth, isAuthenticated } from '../services/adminService';
import { fetchUnreadNotificationCount } from '../services/projectService';

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
      return;
    }

    // Load unread notifications
    if (currentUser) {
      fetchUnreadNotificationCount()
        .then((res) => {
          if (res && res.unreadCount !== undefined) {
            setUnreadCount(res.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const role = user?.role || 'STUDENT';
  const institutionalId = user?.institutionalId || (role === 'STUDENT' ? 'STU10001' : role === 'FACULTY' ? 'FAC10001' : 'ADM10001');

  const studentNavItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Teams & Matches', path: '/teams', icon: Users2 },
    { label: 'Sprint Workspace', path: '/tasks', icon: Kanban },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'My Portfolio', path: '/profile', icon: User },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const facultyNavItems = [
    { label: 'Faculty Dashboard', path: '/faculty', icon: GraduationCap },
    { label: 'Projects Directory', path: '/faculty?tab=projects', icon: FolderGit2 },
    { label: 'Rubric Evaluations', path: '/faculty?tab=evaluations', icon: ClipboardCheck },
    { label: 'Mentorship Feedback', path: '/faculty?tab=feedbacks', icon: MessageSquare },
    { label: 'Project Approvals', path: '/faculty?tab=approvals', icon: ShieldCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const adminNavItems = [
    { label: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { label: 'User Directory', path: '/admin?tab=users', icon: Users2 },
    { label: 'Projects Moderation', path: '/admin?tab=projects', icon: FolderGit2 },
    { label: 'Delayed Sprints', path: '/admin?tab=flagged', icon: Kanban },
    { label: 'Announcements', path: '/admin?tab=announcements', icon: Bell },
    { label: 'Peer Reviews', path: '/admin?tab=reviews', icon: Sparkles },
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : role === 'FACULTY' ? facultyNavItems : studentNavItems;

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 35 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo-badge">
            <Cpu size={22} />
          </div>
          <div className="brand-info">
            <h2>COLLABNEXUS</h2>
            <p>AI PROJECT PLATFORM</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {role === 'ADMIN' ? 'Platform Governance' : role === 'FACULTY' ? 'Academic Mentorship' : 'Workspace Matrix'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path.split('?')[0];
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="sidebar-user-card">
          <div className="user-avatar-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
              {user?.name || 'Academic User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span className={`badge ${role === 'ADMIN' ? 'badge-admin' : role === 'FACULTY' ? 'badge-faculty' : 'badge-student'}`} style={{ fontSize: 9.5, padding: '1px 6px' }}>
                {role}
              </span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700 }}>
                {institutionalId}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              display: 'grid',
              placeItems: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-crimson)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', padding: 7 }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="topbar-breadcrumbs">
              <span>
                {role === 'ADMIN' ? 'ADM // CONSOLE' : role === 'FACULTY' ? 'FACULTY // PORTAL' : 'STUDENT // NEXUS'}
              </span>
              <ChevronRight size={14} style={{ color: 'var(--neon-cyan)', opacity: 0.7 }} />
              <span style={{ textTransform: 'capitalize', color: '#fff', fontWeight: 600 }}>
                {location.pathname.replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            {/* HUD Telemetry Node Tag */}
            <div className="hud-identity-chip">
              <span className="hud-pulse-dot" />
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                NODE: <strong style={{ color: 'var(--neon-cyan)' }}>{institutionalId}</strong>
              </span>
              <span style={{ color: 'var(--text-subtle)' }}>|</span>
              <span style={{ color: 'var(--text-secondary)' }}>{user?.department || 'COLLEGE'}</span>
            </div>

            <Link to="/notifications" className="btn btn-secondary btn-sm" style={{ position: 'relative', padding: 8 }} title="Notifications">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--neon-crimson)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 0 8px var(--neon-crimson)'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link to="/" className="btn btn-ghost btn-sm" title="Public Holographic Terminal">
              <ExternalLink size={15} />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
