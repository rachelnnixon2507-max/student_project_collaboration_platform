import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, CheckSquare, MessageSquare, Bell, User, GraduationCap, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { getUser, logoutAdmin } from '../services/adminService';

const links = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/projects', 'Projects', FolderKanban],
  ['/teams', 'Teams', Users],
  ['/tasks', 'Tasks & Progress', CheckSquare],
  ['/messages', 'Messages', MessageSquare],
  ['/notifications', 'Notifications', Bell],
  ['/profile', 'Profile', User],
  ['/faculty', 'Faculty', GraduationCap],
  ['/admin', 'Admin', ShieldCheck],
];

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SP</div>
          <div>
            <strong>ProjectHub</strong>
            <span>Collaboration Platform</span>
          </div>
        </div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
            <LogIn size={18} />
            Portal Login
          </NavLink>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Student Project Collaboration Platform</span>
            <h1>Workspace</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #dfe5ef' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#315bea' }}>{user.name}</span>
                <span style={{ fontSize: '11px', background: '#eef2ff', color: '#315bea', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  {user.role}
                </span>
                <button onClick={handleLogout} className="icon-btn" title="Log Out" style={{ color: '#c94b3d', padding: '2px' }}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="primary" style={{ padding: '8px 14px', fontSize: '13px', background: '#315bea', color: '#fff', border: 0, borderRadius: '8px', fontWeight: 600 }}>
                Sign In
              </button>
            )}
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
