import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BellRing,
  CheckCircle2,
  Clock3,
  FolderKanban,
  LogOut,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  User,
  UserCog,
  Users,
  X,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  loginAdmin,
  logoutAdmin,
  isAuthenticated,
  getUser,
  fetchAnalyticsLive,
  fetchUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  fetchProjects,
  updateProjectStatus,
  deleteProject,
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  fetchFlaggedProjects,
  createTeamReview,
  fetchReviewsForProject
} from '../services/adminService';
import '../styles/admin.css';

const tabs = [
  ['overview', 'Analytics', BarChart3],
  ['users', 'Students & Faculty', Users],
  ['projects', 'Projects', FolderKanban],
  ['roles', 'Roles & Permissions', ShieldCheck],
  ['announcements', 'Announcements', Megaphone],
  ['delayed', 'Delayed Projects', Clock3],
  ['reviews', 'Team Reviews', Star],
];

const statusLabel = (value) =>
  String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return String(value);
  }
};

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoadingSpinner({ message = 'Loading data from backend...' }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#69758a' }}>
      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
      <p>{message}</p>
    </div>
  );
}

function ErrorNotice({ message, onRetry }) {
  return (
    <div className="alert-banner" style={{ background: '#fff0ef', borderColor: '#f8d7da', color: '#721c24' }}>
      <AlertCircle size={18} />
      <div>
        <b>Error</b>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="secondary" style={{ marginLeft: 'auto' }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function AdminLoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@projecthub.local');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e8edf5', boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }}>
      <div style={{ textTransform: 'center', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', color: '#315bea', display: 'inline-grid', placeItems: 'center', marginBottom: '12px' }}>
          <ShieldCheck size={26} />
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px' }}>Admin Portal Login</h2>
        <p style={{ margin: 0, color: '#69758a', fontSize: '13px' }}>Sign in to manage platform, projects & security</p>
      </div>

      {error && <ErrorNotice message={error} />}

      <form className="form-grid" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
        <label>
          Admin Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@projecthub.local"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button className="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', background: '#315bea', color: '#fff', border: 0, borderRadius: '9px', fontWeight: 600 }}>
          {loading ? 'Authenticating with JWT...' : 'Log in as Administrator'}
        </button>
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#8a94a7' }}>
        Default credentials: <b>admin@projecthub.local</b> / <b>Admin@12345</b>
      </div>
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAnalyticsLive();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Fetching live platform analytics from Spring Boot..." />;
  if (error) return <ErrorNotice message={error} onRetry={loadData} />;
  if (!data) return null;

  const cards = [
    ['Total Users', data.totalUsers, Users],
    ['Total Projects', data.totalProjects, FolderKanban],
    ['Active Projects', data.inProgressProjects, Clock3],
    ['Completed Projects', data.completedProjects, CheckCircle2],
    ['Delayed / Inactive', Number(data.delayedProjects || 0) + Number(data.inactiveProjects || 0), BellRing],
    ['Total Tasks', `${data.completedTasks} / ${data.totalTasks}`, BarChart3],
  ];

  return (
    <>
      <div className="admin-stats">
        {cards.map(([label, value, Icon]) => (
          <div className="admin-stat" key={label}>
            <div className="stat-icon"><Icon size={18} /></div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-two-col">
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>Project status distribution</h3>
              <p>Real-time database metrics computed live</p>
            </div>
          </div>
          <div className="status-bars">
            {[
              ['Open', data.openProjects],
              ['In Progress', data.inProgressProjects],
              ['Completed', data.completedProjects],
            ].map(([status, count]) => {
              const pct = data.totalProjects ? Math.round((count / data.totalProjects) * 100) : 0;
              return (
                <div className="bar-row" key={status}>
                  <span>{status}</span>
                  <div>
                    <i style={{ width: `${Math.max(pct, count ? 10 : 0)}%` }} />
                  </div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>User distribution</h3>
              <p>Breakdown by registered roles</p>
            </div>
          </div>
          <div className="status-bars">
            {[
              ['Students', data.totalStudents],
              ['Faculty', data.totalFaculty],
              ['Total Accounts', data.totalUsers],
            ].map(([role, count]) => {
              const pct = data.totalUsers ? Math.round((count / data.totalUsers) * 100) : 0;
              return (
                <div className="bar-row" key={role}>
                  <span>{role}</span>
                  <div>
                    <i style={{ width: `${Math.max(pct, count ? 10 : 0)}%`, background: '#16844a' }} />
                  </div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const pageData = await fetchUsers(roleFilter);
      const content = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setUsers(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleUpdate = async (updatedForm) => {
    try {
      if (updatedForm.accountStatus !== editing.accountStatus) {
        await updateUserStatus(editing.id, updatedForm.accountStatus);
      }
      if (updatedForm.role !== editing.role) {
        await updateUserRole(editing.id, updatedForm.role);
      }
      setActionMsg(`User ${editing.name} updated successfully.`);
      setEditing(null);
      loadUsers();
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    try {
      await deleteUser(user.id);
      setActionMsg(`User ${user.name} deleted successfully.`);
      loadUsers();
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {actionMsg && (
        <div style={{ padding: '10px 14px', background: '#ecfdf3', border: '1px solid #abedd0', color: '#16844a', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
          {actionMsg}
        </div>
      )}
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students or faculty..."
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #dfe5ef', fontSize: '13px' }}
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>
          <span className="muted">{filtered.length} users</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching user records from MySQL..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={loadUsers} />
      ) : (
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="mini-avatar">{u.name ? u.name[0] : 'U'}</div>
                        <div>
                          <b>{u.name}</b>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${u.role ? u.role.toLowerCase() : ''}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`status ${u.accountStatus === 'ACTIVE' ? 'active-status' : ''}`} style={{ background: u.accountStatus === 'SUSPENDED' ? '#fff4df' : undefined, color: u.accountStatus === 'SUSPENDED' ? '#a86c00' : undefined }}>
                        {u.accountStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="icon-btn" title="Edit status & role" onClick={() => setEditing(u)}>
                          <Pencil size={15} />
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button className="icon-btn" title="Delete User" style={{ color: '#c94b3d' }} onClick={() => handleDelete(u)}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No users found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {editing && (
        <Modal title={`Manage User: ${editing.name}`} onClose={() => setEditing(null)}>
          <UserForm user={editing} onSave={handleUpdate} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}

function UserForm({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    accountStatus: user.accountStatus || 'ACTIVE',
    role: user.role || 'STUDENT',
  });

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <label>
        Account Status
        <select
          value={form.accountStatus}
          onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="DEACTIVATED">DEACTIVATED</option>
        </select>
      </label>
      <label>
        Platform Role
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="STUDENT">STUDENT</option>
          <option value="FACULTY">FACULTY</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" style={{ background: '#315bea', color: '#fff', border: 0, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}>
          Save changes
        </button>
      </div>
    </form>
  );
}

function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const pageData = await fetchProjects();
      const content = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setProjects(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleUpdateStatus = async (status, reason) => {
    try {
      await updateProjectStatus(editing.id, status, reason);
      setActionMsg(`Project #${editing.id} status updated to ${status}.`);
      setEditing(null);
      loadProjects();
    } catch (err) {
      alert(`Failed to update project: ${err.message}`);
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Are you sure you want to delete project "${proj.title}"?`)) return;
    try {
      await deleteProject(proj.id);
      setActionMsg(`Project "${proj.title}" deleted successfully.`);
      loadProjects();
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner message="Loading projects from MySQL..." />;
  if (error) return <ErrorNotice message={error} onRetry={loadProjects} />;

  return (
    <>
      {actionMsg && (
        <div style={{ padding: '10px 14px', background: '#ecfdf3', border: '1px solid #abedd0', color: '#16844a', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
          {actionMsg}
        </div>
      )}
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Created By (ID)</th>
              <th>Members</th>
              <th>Last update</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.length ? (
              projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.title}</b>
                    <small style={{ display: 'block', color: '#8a94a7' }}>{p.description || `Project #${p.id}`}</small>
                  </td>
                  <td>
                    <span className={`pill project-${(p.status || '').toLowerCase()}`}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td>User #{p.createdBy}</td>
                  <td>{p.memberCount ?? 1}</td>
                  <td>{formatDate(p.updatedAt || p.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="icon-btn" title="Change Status" onClick={() => setEditing(p)}>
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn" title="Delete Project" style={{ color: '#c94b3d' }} onClick={() => handleDelete(p)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  No projects recorded in MySQL database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {editing && (
        <Modal title={`Update Status: ${editing.title}`} onClose={() => setEditing(null)}>
          <ProjectStatusForm project={editing} onSave={handleUpdateStatus} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}

function ProjectStatusForm({ project, onSave, onClose }) {
  const [status, setStatus] = useState(project.status || 'OPEN');
  const [reason, setReason] = useState('');

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(status, reason);
      }}
    >
      <label className="full">
        Project Status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="DRAFT">DRAFT</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </label>
      <label className="full">
        Reason / Audit Note
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional status update notes..."
        />
      </label>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" style={{ background: '#315bea', color: '#fff', border: 0, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}>
          Update status
        </button>
      </div>
    </form>
  );
}

function Roles() {
  const [roles, setRoles] = useState({
    ADMIN: ['MANAGE_USERS', 'MANAGE_PROJECTS', 'MANAGE_ROLES', 'VIEW_ANALYTICS', 'SEND_ANNOUNCEMENTS', 'MANAGE_REVIEWS'],
    FACULTY: ['VIEW_PROJECTS', 'EVALUATE_PROJECTS', 'SEND_FEEDBACK'],
    STUDENT: ['CREATE_PROJECT', 'JOIN_TEAM', 'MANAGE_TASKS', 'SEND_MESSAGES'],
  });

  const permissions = [
    'MANAGE_USERS',
    'MANAGE_PROJECTS',
    'MANAGE_ROLES',
    'VIEW_ANALYTICS',
    'SEND_ANNOUNCEMENTS',
    'MANAGE_REVIEWS',
    'EVALUATE_PROJECTS',
    'CREATE_PROJECT',
    'JOIN_TEAM',
    'MANAGE_TASKS',
    'SEND_MESSAGES',
  ];

  const toggle = (role, permission) =>
    setRoles({
      ...roles,
      [role]: roles[role].includes(permission)
        ? roles[role].filter((p) => p !== permission)
        : [...roles[role], permission],
    });

  return (
    <section className="panel permissions">
      <div className="permission-note">
        <ShieldCheck size={18} />
        <span>
          UI permission matrix. Backend security uses Spring Security <b>@PreAuthorize</b> annotations and JWT roles to enforce authorization.
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Permission</th>
            <th>ADMIN</th>
            <th>FACULTY</th>
            <th>STUDENT</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission}>
              <td>{statusLabel(permission)}</td>
              {['ADMIN', 'FACULTY', 'STUDENT'].map((role) => (
                <td key={role}>
                  <button
                    className={`check ${roles[role].includes(permission) ? 'checked' : ''}`}
                    onClick={() => toggle(role, permission)}
                  >
                    {roles[role].includes(permission) ? '✓' : ''}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', scope: 'ALL', content: '' });

  const loadAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const pageData = await fetchAnnouncements();
      const content = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setAnnouncements(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: form.title,
        content: form.content,
        scope: form.scope,
      });
      setForm({ title: '', scope: 'ALL', content: '' });
      setOpen(false);
      loadAnnouncements();
    } catch (err) {
      alert(`Failed to create announcement: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert(`Failed to delete announcement: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner message="Loading announcements from MySQL..." />;
  if (error) return <ErrorNotice message={error} onRetry={loadAnnouncements} />;

  return (
    <>
      <div className="section-action">
        <div>
          <h3>Platform announcements</h3>
          <p>Broadcast important updates to students and faculty, persisted in MySQL.</p>
        </div>
        <button
          className="primary"
          onClick={() => setOpen(true)}
          style={{ background: '#315bea', color: '#fff', border: 0, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}
        >
          <Megaphone size={16} /> New announcement
        </button>
      </div>

      <div className="announcement-list">
        {announcements.length ? (
          announcements.map((a) => (
            <article className="announcement" key={a.id}>
              <div className="announcement-icon">
                <Megaphone size={18} />
              </div>
              <div className="announcement-body">
                <div className="announcement-meta">
                  <span className="pill">{a.scope}</span>
                  <small>{formatDate(a.createdAt)}</small>
                  <button
                    className="icon-btn"
                    style={{ marginLeft: 'auto', border: 0, color: '#c94b3d' }}
                    onClick={() => handleDelete(a.id)}
                    title="Delete Announcement"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3>{a.title}</h3>
                <p>{a.content}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="panel" style={{ textAlign: 'center', padding: '30px', color: '#8a94a7' }}>
            No announcements found in MySQL database.
          </div>
        )}
      </div>

      {open && (
        <Modal title="Send platform announcement" onClose={() => setOpen(false)}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="full">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
              />
            </label>
            <label className="full">
              Audience Scope
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
                <option value="ALL">ALL (Students & Faculty)</option>
                <option value="STUDENTS">STUDENTS</option>
                <option value="FACULTY">FACULTY</option>
              </select>
            </label>
            <label className="full">
              Message Content
              <textarea
                required
                rows="5"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write announcement message..."
              />
            </label>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="primary" style={{ background: '#315bea', color: '#fff', border: 0, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}>
                Broadcast announcement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Delayed() {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFlaggedProjects();
      setFlagged(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Running delay/inactivity detection algorithm on backend..." />;
  if (error) return <ErrorNotice message={error} onRetry={loadData} />;

  return (
    <>
      <div className="alert-banner">
        <Clock3 size={18} />
        <div>
          <b>Delayed & Inactive Project Detection</b>
          <span>
            Scans tasks and project progress tables in MySQL for overdue tasks or stale activity.
          </span>
        </div>
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Title</th>
              <th>Status Flag</th>
              <th>Overdue Tasks</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {flagged.length ? (
              flagged.map((p) => (
                <tr key={p.projectId}>
                  <td><b>#{p.projectId}</b></td>
                  <td>{p.title}</td>
                  <td>
                    {p.delayed && <span className="risk high" style={{ marginRight: '6px' }}>DELAYED (Overdue Task)</span>}
                    {p.inactive && <span className="risk high" style={{ background: '#fff4df', color: '#a86c00' }}>INACTIVE (Stale)</span>}
                  </td>
                  <td>{p.overdueTaskCount} overdue</td>
                  <td>{formatDate(p.lastActivityAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row">
                  No delayed or inactive projects detected in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Reviews() {
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [form, setForm] = useState({ revieweeId: '', rating: 5, comments: '' });
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const pRes = await fetchProjects();
        const pList = pRes?.content || (Array.isArray(pRes) ? pRes : []);
        setProjects(pList);
        if (pList.length) setSelectedProject(pList[0].id);

        const uRes = await fetchUsers('STUDENT');
        const uList = uRes?.content || (Array.isArray(uRes) ? uRes : []);
        setStudents(uList);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    async function loadProjectReviews() {
      setLoadingReviews(true);
      try {
        const data = await fetchReviewsForProject(selectedProject);
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadProjectReviews();
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !form.revieweeId) {
      alert('Please select a project and student member.');
      return;
    }
    try {
      await createTeamReview({
        projectId: selectedProject,
        revieweeId: form.revieweeId,
        rating: form.rating,
        comments: form.comments,
      });
      setActionMsg('Team review saved to MySQL successfully.');
      setForm({ revieweeId: '', rating: 5, comments: '' });
      const data = await fetchReviewsForProject(selectedProject);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(`Failed to save review: ${err.message}`);
    }
  };

  return (
    <div className="admin-two-col">
      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>Submit Team Member Review</h3>
            <p>Rate peer contributions, reliability, and collaboration</p>
          </div>
        </div>
        {actionMsg && (
          <div style={{ padding: '10px 14px', background: '#ecfdf3', border: '1px solid #abedd0', color: '#16844a', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
            {actionMsg}
          </div>
        )}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="full">
            Select Project
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (ID #{p.id})
                </option>
              ))}
            </select>
          </label>
          <label>
            Student Member
            <select
              required
              value={form.revieweeId}
              onChange={(e) => setForm({ ...form, revieweeId: e.target.value })}
            >
              <option value="">Select Student</option>
              {students.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Rating
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Review Comments
            <textarea
              rows="4"
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Write evaluation feedback..."
            />
          </label>
          <button className="primary" style={{ gridColumn: '1/-1', background: '#315bea', color: '#fff', border: 0, padding: '11px', borderRadius: '8px', fontWeight: 600, justifyContent: 'center' }}>
            Submit Review
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h3>Project Reviews</h3>
            <p>Saved reviews in MySQL for selected project</p>
          </div>
        </div>
        {loadingReviews ? (
          <LoadingSpinner message="Fetching reviews from backend..." />
        ) : (
          <div className="review-list">
            {reviews.length ? (
              reviews.map((r) => (
                <article className="review" key={r.id}>
                  <div className="review-top">
                    <b>Student User #{r.revieweeId}</b>
                    <span>
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <small>Reviewed by User #{r.reviewerId} · {formatDate(r.createdAt)}</small>
                  <p>{r.comments || 'No comment provided.'}</p>
                </article>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#8a94a7' }}>
                No reviews submitted yet for this project.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const currentUser = getUser();

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  const content = useMemo(() => {
    switch (tab) {
      case 'overview':
        return <Analytics />;
      case 'users':
        return <UsersManager />;
      case 'projects':
        return <ProjectsManager />;
      case 'roles':
        return <Roles />;
      case 'announcements':
        return <Announcements />;
      case 'delayed':
        return <Delayed />;
      case 'reviews':
        return <Reviews />;
      default:
        return <Analytics />;
    }
  }, [tab]);

  if (!authed) {
    return (
      <>
        <PageHeader
          title="Admin & System Access"
          description="Authentication required to access Member 4 administrative platform controls."
        />
        <AdminLoginForm onLoginSuccess={() => setAuthed(true)} />
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageHeader
          title="Admin & System"
          description="Manage platform users, monitor project health, publish announcements, and review team contributions."
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 14px', borderRadius: '12px', border: '1px solid #e8edf5' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', color: '#315bea', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            <User size={16} />
          </div>
          <div style={{ fontSize: '13px' }}>
            <b>{currentUser?.name || 'Administrator'}</b>
            <small style={{ display: 'block', color: '#8a94a7' }}>{currentUser?.email}</small>
          </div>
          <button
            onClick={handleLogout}
            className="icon-btn"
            title="Log Out"
            style={{ marginLeft: '8px', color: '#c94b3d' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="admin-shell" style={{ marginTop: '16px' }}>
        <div className="admin-tabs">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              className={tab === key ? 'selected' : ''}
              onClick={() => setTab(key)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="admin-content">{content}</div>
      </div>
    </>
  );
}
