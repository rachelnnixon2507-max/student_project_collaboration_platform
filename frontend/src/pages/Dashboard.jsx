import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getUser, fetchAnnouncements, fetchProjects, fetchAnalyticsLive } from '../services/adminService';
import { fetchMyTasks, updateTaskStatus } from '../services/collaborationService';
import '../styles/collaboration.css';
import '../styles/admin.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    myProjectsCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    announcementsCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError('');
    try {
      // Fetch tasks, projects, announcements in parallel
      const [tasksRes, projectsRes, announcementsRes] = await Promise.allSettled([
        fetchMyTasks(),
        fetchProjects(),
        fetchAnnouncements(),
      ]);

      let loadedTasks = [];
      if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)) {
        loadedTasks = tasksRes.value;
        setTasks(loadedTasks);
      }

      let loadedProjects = [];
      if (projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value)) {
        loadedProjects = projectsRes.value;
        setProjects(loadedProjects);
      }

      let loadedAnnouncements = [];
      if (announcementsRes.status === 'fulfilled' && Array.isArray(announcementsRes.value)) {
        loadedAnnouncements = announcementsRes.value;
        setAnnouncements(loadedAnnouncements);
      }

      const activeTasks = loadedTasks.filter(t => t.status !== 'COMPLETED').length;
      const completedTasks = loadedTasks.filter(t => t.status === 'COMPLETED').length;

      setStats({
        myProjectsCount: loadedProjects.length || 4,
        activeTasksCount: activeTasks || loadedTasks.length,
        completedTasksCount: completedTasks,
        announcementsCount: loadedAnnouncements.length,
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Could not load live dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTaskStatus(taskId, currentStatus, currentProgress) {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const newProgress = newStatus === 'COMPLETED' ? 100 : 50;
      await updateTaskStatus(taskId, newStatus, newProgress);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update task status: ' + err.message);
    }
  }

  const welcomeName = currentUser?.name || 'Student / Collaborator';
  const roleName = currentUser?.role || 'STUDENT';

  return (
    <div className="collab-container">
      {/* Top Banner */}
      <div className="admin-hero" style={{ background: 'linear-gradient(135deg, #315bea 0%, #1e3a8a 100%)', borderRadius: '16px', padding: '32px', color: '#fff', boxShadow: '0 4px 20px rgba(49, 91, 234, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
              {roleName} DASHBOARD
            </span>
            <h2 style={{ margin: '6px 0 8px 0', fontSize: '28px', fontWeight: 800 }}>
              Welcome back, {welcomeName}! 👋
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', maxWidth: '600px' }}>
              Track active projects, manage team tasks, check announcements, and connect with faculty mentors in real time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="primary" style={{ background: '#ffffff', color: '#315bea', fontWeight: 700 }} onClick={() => navigate('/projects')}>
              Explore Projects
            </button>
            <button className="collab-tab-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => navigate('/teams')}>
              🤖 AI Team Matching
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '14px 18px', borderRadius: '12px', fontSize: '14px' }}>
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Quick Statistics Grid */}
      <div className="grid four">
        <div className="stat" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/projects')}>
          <span>My Projects</span>
          <b style={{ color: '#315bea' }}>{stats.myProjectsCount}</b>
          <span style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>Active collaborations</span>
        </div>
        <div className="stat" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/tasks')}>
          <span>Active Pending Tasks</span>
          <b style={{ color: '#f59e0b' }}>{stats.activeTasksCount}</b>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Needs action</span>
        </div>
        <div className="stat" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/tasks')}>
          <span>Completed Tasks</span>
          <b style={{ color: '#10b981' }}>{stats.completedTasksCount}</b>
          <span style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>Finished deliverables</span>
        </div>
        <div className="stat" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/notifications')}>
          <span>Announcements</span>
          <b style={{ color: '#6366f1' }}>{stats.announcementsCount}</b>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Platform updates</span>
        </div>
      </div>

      {/* Main Content Grid: Projects Progress & Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Active Projects Overview */}
        <div className="progress-card">
          <div className="progress-header">
            <div className="progress-title-area">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Active Projects Progress</h3>
            </div>
            <Link to="/projects" style={{ fontSize: '13px', color: '#315bea', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading project progress...</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No active projects found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {projects.slice(0, 4).map((p) => {
                const progressPct = p.overallProgress ?? p.progress ?? 50;
                return (
                  <div key={p.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{p.title}</strong>
                      <span className={`health-badge health-${(p.status || 'in_progress').toLowerCase()}`}>
                        {p.status || 'IN_PROGRESS'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {p.description ? (p.description.length > 70 ? p.description.slice(0, 70) + '...' : p.description) : 'No description.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      <span>Completion</span>
                      <span style={{ color: '#315bea' }}>{progressPct}%</span>
                    </div>
                    <div className="progress-bar-bg" style={{ margin: 0, height: '8px' }}>
                      <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Tasks Quicklist */}
        <div className="progress-card">
          <div className="progress-header">
            <div className="progress-title-area">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>My Assigned Tasks</h3>
            </div>
            <Link to="/tasks" style={{ fontSize: '13px', color: '#315bea', fontWeight: 600, textDecoration: 'none' }}>
              Task Board →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No pending tasks assigned to you.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.slice(0, 5).map((t) => {
                const isDone = t.status === 'COMPLETED';
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: isDone ? '#f1f5f9' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleTaskStatus(t.id, t.status, t.progress)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#315bea' }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: isDone ? '#94a3b8' : '#1e293b', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        background: isDone ? '#dcfce7' : t.status === 'IN_PROGRESS' ? '#dbeafe' : '#fef3c7',
                        color: isDone ? '#166534' : t.status === 'IN_PROGRESS' ? '#1e40af' : '#92400e',
                      }}
                    >
                      {t.status || 'TODO'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Announcements & Quick Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Platform Announcements */}
        <div className="progress-card">
          <div className="progress-header">
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>📢 Platform Announcements</h3>
          </div>
          {announcements.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '14px' }}>No announcements posted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #315bea' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{a.title}</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI & Quick Collaboration Tools */}
        <div className="progress-card" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
          <div className="progress-header">
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>⚡ Quick Actions</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => navigate('/teams')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: '#eef2ff',
                border: '1px solid #c7d2fe',
                borderRadius: '12px',
                color: '#315bea',
                fontWeight: 700,
                cursor: 'pointer',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '24px' }}>🤖</span>
              <span style={{ fontSize: '13px' }}>AI Match Teams</span>
            </button>

            <button
              onClick={() => navigate('/messages')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                color: '#166534',
                fontWeight: 700,
                cursor: 'pointer',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '24px' }}>💬</span>
              <span style={{ fontSize: '13px' }}>Team Chat</span>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                color: '#92400e',
                fontWeight: 700,
                cursor: 'pointer',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '24px' }}>📋</span>
              <span style={{ fontSize: '13px' }}>Manage Tasks</span>
            </button>

            <button
              onClick={() => navigate('/faculty')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: '#fcf4ff',
                border: '1px solid #f5d0fe',
                borderRadius: '12px',
                color: '#86198f',
                fontWeight: 700,
                cursor: 'pointer',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '24px' }}>🎓</span>
              <span style={{ fontSize: '13px' }}>Faculty Mentors</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
