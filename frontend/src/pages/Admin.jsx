import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users2,
  FolderGit2,
  ShieldCheck,
  Megaphone,
  Clock,
  Star,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  getUser,
  isAuthenticated,
  isAdminAuthenticated,
  fetchAdminStatus,
  setupAdmin,
  loginAdmin,
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
  fetchReviewsForProject,
  fetchRolePermissions,
  updateRolePermissions
} from '../services/adminService';

const tabs = [
  ['overview', 'Analytics', BarChart3],
  ['users', 'Users & Institutional IDs', Users2],
  ['projects', 'Projects Moderation', FolderGit2],
  ['announcements', 'Announcements', Megaphone],
  ['flagged', 'Delayed Sprints', Clock],
  ['reviews', 'Peer Reviews', Star],
];

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Projects State
  const [adminProjects, setAdminProjects] = useState([]);
  const [projectStatusFilter, setProjectStatusFilter] = useState('');

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnScope, setNewAnnScope] = useState('ALL');
  const [showAnnModal, setShowAnnModal] = useState(false);

  // Flagged Projects State
  const [flaggedProjects, setFlaggedProjects] = useState([]);

  // Peer Reviews State
  const [reviews, setReviews] = useState([]);
  const [selectedReviewProjectId, setSelectedReviewProjectId] = useState(1);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'users', 'projects', 'announcements', 'flagged', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    loadTabContent(activeTab);
  }, [activeTab]);

  const loadTabContent = async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') {
        const data = await fetchAnalyticsLive();
        setAnalytics(data);
      } else if (tab === 'users') {
        const data = await fetchUsers(userRoleFilter);
        setUsers(Array.isArray(data) ? data : data?.content || []);
      } else if (tab === 'projects') {
        const data = await fetchProjects(projectStatusFilter);
        setAdminProjects(Array.isArray(data) ? data : data?.content || []);
      } else if (tab === 'announcements') {
        const data = await fetchAnnouncements();
        setAnnouncements(Array.isArray(data) ? data : []);
      } else if (tab === 'flagged') {
        const data = await fetchFlaggedProjects();
        setFlaggedProjects(Array.isArray(data) ? data : []);
      } else if (tab === 'reviews') {
        const data = await fetchReviewsForProject(selectedReviewProjectId);
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatus(userId, nextStatus);
      setSuccessMsg(`User status updated to ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadTabContent('users');
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setSuccessMsg('User account deleted.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadTabContent('users');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await updateProjectStatus(projectId, newStatus);
      setSuccessMsg(`Project status changed to ${newStatus}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadTabContent('projects');
    } catch (err) {
      setError(err.message || 'Failed to update project status');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all associated tasks?')) return;
    try {
      await deleteProject(projectId);
      setSuccessMsg('Project removed.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadTabContent('projects');
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    try {
      await createAnnouncement({
        title: newAnnTitle,
        content: newAnnContent,
        scope: newAnnScope,
      });
      setShowAnnModal(false);
      setNewAnnTitle('');
      setNewAnnContent('');
      setSuccessMsg('Announcement broadcasted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadTabContent('announcements');
    } catch (err) {
      setError(err.message || 'Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(annId);
      loadTabContent('announcements');
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchId = (u.institutionalId || '').toLowerCase().includes(q);
      const matchDept = (u.department || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchId || matchDept;
    });
  }, [users, userSearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--warning-50)', color: 'var(--warning-700)', display: 'grid', placeItems: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Institutional Administration Console</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              Manage student & faculty accounts, project governance, broadcast announcements, and track live analytics.
            </p>
          </div>
        </div>

        {activeTab === 'announcements' && (
          <button onClick={() => setShowAnnModal(true)} className="btn btn-primary btn-sm">
            <Plus size={15} /> Post Announcement
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ background: 'var(--success-50)', color: 'var(--success-700)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-100)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-100)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 2, overflowX: 'auto' }}>
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`btn ${activeTab === key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 13 }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Analytics */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <Users2 size={22} />
              </div>
              <div>
                <div className="stat-label">Registered Students & Faculty</div>
                <div className="stat-value">{analytics?.totalUsers || users.length || 6}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                <FolderGit2 size={22} />
              </div>
              <div>
                <div className="stat-label">Total Student Projects</div>
                <div className="stat-value">{analytics?.totalProjects || adminProjects.length || 4}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--warning-50)', color: 'var(--warning-700)' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="stat-label">Active Sprint Sprints</div>
                <div className="stat-value">{analytics?.activeProjects || 3}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--info-50)', color: 'var(--info-600)' }}>
                <Award size={22} />
              </div>
              <div>
                <div className="stat-label">Completed Capstones</div>
                <div className="stat-value">{analytics?.completedProjects || 1}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Institutional IDs Table */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="form-input"
                style={{ border: 'none', padding: 4 }}
                placeholder="Search by name, institutional ID (e.g. STU10001), or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {['', 'STUDENT', 'FACULTY', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRoleFilter(r);
                    fetchUsers(r).then((d) => setUsers(Array.isArray(d) ? d : d?.content || []));
                  }}
                  className={`btn btn-sm ${userRoleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 11.5 }}
                >
                  {r === '' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 20px' }}>Institutional ID</th>
                  <th style={{ padding: '12px 20px' }}>User Details</th>
                  <th style={{ padding: '12px 20px' }}>Role</th>
                  <th style={{ padding: '12px 20px' }}>Department</th>
                  <th style={{ padding: '12px 20px' }}>Account Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {u.institutionalId || (u.role === 'STUDENT' ? `STU1000${u.id}` : u.role === 'FACULTY' ? `FAC1000${u.id}` : `ADM1000${u.id}`)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : u.role === 'FACULTY' ? 'badge-faculty' : 'badge-student'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {u.department || 'Computer Science'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${u.accountStatus === 'SUSPENDED' ? 'badge-closed' : 'badge-open'}`}>
                          {u.accountStatus || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.accountStatus || 'ACTIVE')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: 11.5 }}
                          >
                            {u.accountStatus === 'SUSPENDED' ? <Unlock size={13} /> : <Lock size={13} />}
                            {u.accountStatus === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger-600)', padding: 4 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Projects Moderation */}
      {activeTab === 'projects' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Project Moderation & Governance</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 20px' }}>Project Title</th>
                  <th style={{ padding: '12px 20px' }}>Lead Creator</th>
                  <th style={{ padding: '12px 20px' }}>Capacity</th>
                  <th style={{ padding: '12px 20px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {adminProjects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{p.title}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.requiredSkills}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div>{p.creatorName || 'Student'}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.creatorEmail}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {p.memberCount || 1} / {p.maxMembers || 4}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${p.status === 'OPEN' ? 'badge-open' : p.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-completed'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '3px 8px', fontSize: 12 }}
                          value={p.status}
                          onChange={(e) => handleUpdateProjectStatus(p.id, e.target.value)}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger-600)', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Announcements */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {announcements.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Megaphone size={40} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
              <p>No announcements broadcasted yet.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="badge badge-admin">{ann.scope || 'ALL'}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{ann.title}</h3>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {ann.content}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger-600)', padding: 4 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Delayed Sprints Health Radar */}
      {activeTab === 'flagged' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {flaggedProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} color="var(--success-600)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--success-700)' }}>All Sprints On Track</h3>
              <p style={{ fontSize: 13 }}>No student teams are currently flagged as delayed or inactive.</p>
            </div>
          ) : (
            flaggedProjects.map((p) => (
              <div key={p.id} className="card" style={{ borderLeft: '4px solid var(--danger-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{p.title}</h3>
                    <div style={{ fontSize: 12.5, color: 'var(--danger-700)', fontWeight: 600, marginTop: 4 }}>
                      Flag: {p.flagReason || 'Deliverables overdue without progress'}
                    </div>
                  </div>
                  <span className="badge badge-closed">{p.healthStatus || 'DELAYED'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Peer Reviews */}
      {activeTab === 'reviews' && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Student Peer Reviews & Ratings</h3>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
              No peer reviews submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <strong>Reviewed by {r.reviewerName || 'Teammate'}</strong>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} fill={s <= (r.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.comments}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Post Announcement */}
      {showAnnModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Broadcast Announcement</h3>
              <button onClick={() => setShowAnnModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Capstone Sprint 2 Rubric Evaluation Deadline"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message Content *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide details for student creators, teammates, and faculty advisors..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience Scope</label>
                  <select
                    className="form-select"
                    value={newAnnScope}
                    onChange={(e) => setNewAnnScope(e.target.value)}
                  >
                    <option value="ALL">Entire Campus (All Users)</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="FACULTY">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAnnModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
