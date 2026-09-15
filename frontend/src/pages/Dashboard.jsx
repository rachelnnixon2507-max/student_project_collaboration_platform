import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users2,
  Kanban,
  Bell,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  Cpu,
  Activity,
  Terminal
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchMyCreatedProjects,
  fetchMyJoinedProjects,
  fetchUnreadNotificationCount,
  fetchProjects,
  fetchProjectJoinRequests
} from '../services/projectService';
import { fetchMyTasks, fetchMatchingProjectsForStudent } from '../services/collaborationService';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isAuthenticated();

  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myTasks, setMyTasks] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [totalCampusProjects, setTotalCampusProjects] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [loggedIn, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [created, joined, unreadRes, tasks, matchedRes, allProjectsRes] = await Promise.all([
        fetchMyCreatedProjects().catch(() => []),
        fetchMyJoinedProjects().catch(() => []),
        fetchUnreadNotificationCount().catch(() => ({ unreadCount: 0 })),
        fetchMyTasks().catch(() => []),
        fetchMatchingProjectsForStudent(user?.id || null, 3).catch(() => []),
        fetchProjects({ page: 0, size: 50 }).catch(() => ({ content: [], totalElements: 5 })),
      ]);

      setCreatedProjects(created || []);
      setJoinedProjects(joined || []);
      setUnreadCount(unreadRes?.unreadCount || 0);
      setMyTasks(tasks || []);

      if (allProjectsRes?.totalElements !== undefined && allProjectsRes.totalElements > 0) {
        setTotalCampusProjects(allProjectsRes.totalElements);
      } else if (allProjectsRes?.content && allProjectsRes.content.length > 0) {
        setTotalCampusProjects(allProjectsRes.content.length);
      } else {
        setTotalCampusProjects(5);
      }

      if (matchedRes && matchedRes.length > 0) {
        setRecommendedProjects(matchedRes);
      } else {
        const publicRes = await fetchProjects({ page: 0, size: 3 });
        setRecommendedProjects(publicRes?.content || []);
      }

      let pendingTotal = 0;
      if (created && created.length > 0) {
        const reqPromises = created.map((p) => fetchProjectJoinRequests(p.id).catch(() => []));
        const allReqs = await Promise.all(reqPromises);
        allReqs.forEach((list) => {
          if (Array.isArray(list)) {
            pendingTotal += list.filter((r) => r.status === 'PENDING').length;
          }
        });
      }
      setPendingRequestsCount(pendingTotal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const institutionalId = user?.institutionalId || 'STU10001';
  const allMyProjects = [...createdProjects, ...joinedProjects.filter(jp => !createdProjects.some(cp => cp.id === jp.id))];
  const totalInvolvedProjects = allMyProjects.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HUD Command Center Banner */}
      <div className="card card-hud" style={{
        background: 'linear-gradient(135deg, rgba(8, 16, 38, 0.9) 0%, rgba(18, 30, 68, 0.85) 100%)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '34px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 240, 255, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-cyan)',
              letterSpacing: '0.06em'
            }}>
              // STUDENT COMMAND NODE
            </span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              NODE_ID: <strong style={{ color: '#fff' }}>{institutionalId}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginBottom: 8, letterSpacing: '0.02em' }}>
            Welcome to the Matrix, {user?.name || 'Student Lead'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.6 }}>
            Manage your project sprints, monitor team velocity, review applicant pitches, and coordinate capstone deliverables.
          </p>

          {/* Project Allocation Status Telemetry */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <div style={{
              padding: '6px 14px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FolderGit2 size={14} />
              TOTAL INVOLVED PROJECTS: <strong style={{ color: '#fff', fontSize: 13 }}>{totalInvolvedProjects}</strong> ({createdProjects.length} Led • {joinedProjects.length} Joined)
            </div>

            <div style={{
              padding: '6px 14px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-violet)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }} onClick={() => navigate('/projects')}>
              <Sparkles size={14} />
              CAMPUS DIRECTORY: <strong style={{ color: '#fff', fontSize: 13 }}>{totalCampusProjects}</strong> TOTAL PROJECTS
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/projects?create=true')}
            className="btn btn-primary"
          >
            <Plus size={16} /> Pitch Project
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="btn btn-secondary"
          >
            Discover Projects
          </button>
        </div>
      </div>

      {/* Pending Join Requests Alert for Project Leaders */}
      {pendingRequestsCount > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 0 16px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--neon-amber)', display: 'grid', placeItems: 'center', border: '1px solid var(--neon-amber)' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--neon-amber)' }}>
                {pendingRequestsCount} Pending Team Join Request{pendingRequestsCount > 1 ? 's' : ''} Awaiting Review
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Students with matching skills have requested to join projects you lead.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/teams')}
            className="btn btn-sm"
            style={{ background: 'var(--neon-amber)', color: '#000', fontWeight: 800 }}
          >
            Review Requests in Teams <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--neon-cyan)' }} onClick={() => navigate('/projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// TOTAL INVOLVED</span>
            <FolderGit2 size={20} color="var(--neon-cyan)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-cyan)' }}>{totalInvolvedProjects}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{createdProjects.length} Led • {joinedProjects.length} Joined</div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--neon-emerald)' }} onClick={() => navigate('/projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// CAMPUS TOTAL</span>
            <Sparkles size={20} color="var(--neon-emerald)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-emerald)' }}>{totalCampusProjects}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>All Projects in Matrix</div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// PROJECTS LED</span>
            <FolderGit2 size={20} color="var(--neon-cyan)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-cyan)' }}>{createdProjects.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Leader Role</div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/teams')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// TEAMS JOINED</span>
            <Users2 size={20} color="var(--neon-violet)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-violet)' }}>{joinedProjects.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Member Role</div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// SPRINT TASKS</span>
            <Kanban size={20} color="var(--neon-amber)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-amber)' }}>{myTasks.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Assigned Work</div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// SYSTEM UPDATES</span>
            <Bell size={20} color={unreadCount > 0 ? 'var(--neon-crimson)' : 'var(--text-muted)'} />
          </div>
          <div className="stat-value" style={{ color: unreadCount > 0 ? 'var(--neon-crimson)' : '#fff' }}>
            {unreadCount}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Pending Alerts</div>
        </div>
      </div>

      {/* Two Column Layout: Workspace Sprints & Recommended Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Left Column: My Active Projects / Sprints */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
              Active Sprints & Workspaces ({totalInvolvedProjects} Projects)
            </h3>
            <button onClick={() => navigate('/tasks')} className="btn btn-ghost btn-sm" style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
              Open Kanban <ChevronRight size={14} />
            </button>
          </div>

          {createdProjects.length === 0 && joinedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(5, 11, 26, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', margin: 'auto 0' }}>
              <FolderGit2 size={36} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#fff' }}>No Active Sprints</h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Pitch an idea to lead a team or find an existing project looking for your skills.
              </p>
              <button onClick={() => navigate('/projects')} className="btn btn-primary btn-sm">
                Explore Projects
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...createdProjects, ...joinedProjects.filter(jp => !createdProjects.some(cp => cp.id === jp.id))].slice(0, 4).map((p, idx) => {
                const isLeader = p.createdBy === user?.id || p.isCurrentUserLeader;
                return (
                  <div
                    key={`sprint-${p.id || idx}`}
                    onClick={() => navigate('/tasks')}
                    style={{
                      padding: 16,
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(6, 12, 28, 0.75)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--neon-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 14.5, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </strong>
                        <span className={`badge ${isLeader ? 'badge-open' : 'badge-in-progress'}`} style={{ fontSize: 10 }}>
                          {isLeader ? 'LEADER' : 'MEMBER'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        SEATS: {p.memberCount || 1} / {p.maxMembers || 4} • STATUS: <span style={{ color: 'var(--neon-cyan)' }}>{p.status}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--neon-cyan)" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Smart Skill Matches / Discover Projects */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--neon-cyan)" />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Recommended Matrix</h3>
            </div>
            <button onClick={() => navigate('/projects')} className="btn btn-ghost btn-sm" style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {recommendedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(5, 11, 26, 0.6)', borderRadius: 'var(--radius-md)' }}>
              <Sparkles size={36} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Updating skill matches...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendedProjects.map((proj) => {
                const projId = proj.projectId || proj.id;
                const projTitle = proj.projectTitle || proj.title || 'Project';
                const leadName = proj.leaderName || proj.creatorName || 'Student Leader';
                const availableSeats = proj.availableSeats !== undefined ? proj.availableSeats : Math.max(0, (proj.maxMembers || 4) - (proj.memberCount || 1));
                return (
                  <div
                    key={projId}
                    style={{
                      padding: 16,
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(6, 12, 28, 0.75)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                      <strong style={{ fontSize: 14.5, color: '#fff' }}>{projTitle}</strong>
                      <span
                        className={`badge ${availableSeats > 0 ? 'badge-open' : 'badge-completed'}`}
                        style={availableSeats === 0 ? {
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: 'rgba(0, 255, 157, 0.15)',
                          color: 'var(--neon-emerald)',
                          border: '1px solid rgba(0, 255, 157, 0.45)'
                        } : { fontSize: 10.5 }}
                      >
                        {availableSeats > 0 ? `${availableSeats} SEAT${availableSeats > 1 ? 'S' : ''} LEFT` : '✓ 4/4 FULLY OCCUPIED'}
                      </span>
                    </div>

                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proj.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        LEAD: {leadName}
                      </span>
                      <button
                        onClick={() => projId && navigate(`/projects?id=${projId}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 12px', fontSize: 12 }}
                      >
                        View & Join
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
