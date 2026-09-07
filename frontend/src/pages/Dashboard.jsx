import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Users, Bell, User, Plus, Search, 
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getUser, isAuthenticated } from '../services/adminService';
import { 
  fetchMyCreatedProjects, fetchMyJoinedProjects, 
  fetchUnreadNotificationCount, fetchProjects 
} from '../services/projectService';
import '../styles/admin.css';
import '../styles/member1.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isAuthenticated();

  const [createdCount, setCreatedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [loggedIn]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const publicProjects = await fetchProjects({ page: 0, size: 4 });
      setRecentProjects(publicProjects?.content || []);

      if (loggedIn) {
        const [myCreated, myJoined, unreadRes] = await Promise.all([
          fetchMyCreatedProjects().catch(() => []),
          fetchMyJoinedProjects().catch(() => []),
          fetchUnreadNotificationCount().catch(() => ({ unreadCount: 0 })),
        ]);
        setCreatedCount(myCreated.length);
        setJoinedCount(myJoined.length);
        setUnreadCount(unreadRes.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h2>Workspace Dashboard</h2>
          <p>Welcome{user ? `, ${user.name}` : ''}! Track your projects, team collaborations, and updates.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/projects')} className="primary">
            <Plus size={16} /> Post Project
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid four">
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/projects')}>
          <span>My Projects</span>
          <b style={{ color: '#315bea' }}>{loggedIn ? createdCount : '—'}</b>
        </div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/teams')}>
          <span>Active Teams</span>
          <b style={{ color: '#16844a' }}>{loggedIn ? joinedCount : '—'}</b>
        </div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <span>Unread Notifications</span>
          <b style={{ color: unreadCount > 0 ? '#c94b3d' : '#8791a5' }}>
            {loggedIn ? unreadCount : '—'}
          </b>
        </div>
        <div className="stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <span>Student Profile</span>
          <b style={{ fontSize: '18px', color: '#526076', marginTop: '18px' }}>
            {loggedIn ? 'Active' : 'Sign In'}
          </b>
        </div>
      </div>

      {/* Quick Discovery Section */}
      <div className="panel" style={{ marginTop: '10px' }}>
        <div className="panel-title">
          <div>
            <h3>Recent Projects Open for Collaboration</h3>
            <p>Discover student projects seeking teammates with your skills.</p>
          </div>
          <button onClick={() => navigate('/projects')} className="secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Explore All <ArrowRight size={14} />
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <p style={{ color: '#8791a5', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
            No open projects found. Be the first to post a new project!
          </p>
        ) : (
          <div className="projects-grid">
            {recentProjects.map((p) => (
              <div 
                key={p.id} 
                className="project-card" 
                onClick={() => navigate('/projects')}
                style={{ padding: '18px' }}
              >
                <div>
                  <div className="project-card-header">
                    <span className="pill project-open">{p.status}</span>
                    <span className="member-badge">
                      <Users size={12} /> {p.memberCount}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#172033' }}>{p.title}</h4>
                  <p className="project-card-desc" style={{ WebkitLineClamp: 2, marginBottom: '12px' }}>
                    {p.description || 'No description'}
                  </p>
                  {p.requiredSkills && (
                    <div className="skills-wrap" style={{ marginBottom: '8px' }}>
                      {p.requiredSkills.split(',').slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="skill-tag accent">{sk.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="project-card-footer" style={{ paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px' }}>By {p.creatorName}</span>
                  <span style={{ color: '#315bea', fontSize: '12px', fontWeight: 600 }}>View Project →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
