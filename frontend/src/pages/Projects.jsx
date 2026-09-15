import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FolderGit2,
  Users2,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Send,
  UserCheck,
  Shield,
  Trash2,
  Edit3,
  ArrowRight,
  Sparkles,
  Kanban,
  MessageSquare
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  sendJoinRequest,
  respondToJoinRequest,
  cancelJoinRequest,
  removeProjectMember,
  fetchProjectJoinRequests
} from '../services/projectService';

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUser();
  const loggedIn = isAuthenticated();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Selected Project & Join Requests
  const [activeProject, setActiveProject] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview | members | requests
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formMaxMembers, setFormMaxMembers] = useState(4);
  const [formStatus, setFormStatus] = useState('OPEN');
  const [joinPitch, setJoinPitch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
    const paramId = searchParams.get('id');
    if (paramId && !isNaN(Number(paramId)) && Number(paramId) > 0) {
      openProjectDetails(Number(paramId));
    }
  }, [selectedStatus, location.search]);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProjects({
        keyword: searchKeyword,
        skill: selectedSkill,
        status: selectedStatus === 'ALL' ? '' : selectedStatus,
        page: 0,
        size: 30,
      });
      setProjects(data?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const openProjectDetails = async (projectId) => {
    if (!projectId || isNaN(Number(projectId)) || Number(projectId) <= 0) return;
    try {
      const detail = await fetchProjectById(projectId);
      if (detail && detail.id) {
        setActiveProject(detail);
        setDetailTab('overview');
        setShowDetailModal(true);

        if (detail.isCurrentUserLeader) {
          loadJoinRequests(projectId);
        }
      }
    } catch (err) {
      console.warn('Could not load project details:', err);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    if (location.search.includes('id=')) {
      navigate('/projects', { replace: true });
    }
  };

  const loadJoinRequests = async (projectId) => {
    setLoadingRequests(true);
    try {
      const reqs = await fetchProjectJoinRequests(projectId);
      setJoinRequests(Array.isArray(reqs) ? reqs : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    if (!formTitle.trim()) {
      setError('Project title is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createProject({
        title: formTitle,
        description: formDesc,
        requiredSkills: formSkills,
        status: formStatus,
        maxMembers: formMaxMembers,
      });
      setShowCreateModal(false);
      setFormTitle('');
      setFormDesc('');
      setFormSkills('');
      setFormMaxMembers(4);
      setSuccessMsg('Project created successfully! You are the Team Leader.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = () => {
    if (!activeProject) return;
    setFormTitle(activeProject.title);
    setFormDesc(activeProject.description || '');
    setFormSkills(activeProject.requiredSkills || '');
    setFormStatus(activeProject.status || 'OPEN');
    setFormMaxMembers(activeProject.maxMembers || 4);
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const updated = await updateProject(activeProject.id, {
        title: formTitle,
        description: formDesc,
        requiredSkills: formSkills,
        status: formStatus,
        maxMembers: formMaxMembers,
      });
      setActiveProject(updated);
      setShowEditModal(false);
      setSuccessMsg('Project details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will remove all team allocations and tasks.')) {
      return;
    }
    try {
      await deleteProject(projectId);
      setShowDetailModal(false);
      setActiveProject(null);
      setSuccessMsg('Project deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await sendJoinRequest(activeProject.id, joinPitch);
      setShowJoinModal(false);
      setJoinPitch('');
      setSuccessMsg('Join request sent to the Project Leader!');
      setTimeout(() => setSuccessMsg(''), 4000);
      // Reload project details
      openProjectDetails(activeProject.id);
    } catch (err) {
      setError(err.message || 'Failed to send join request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelJoinRequest(activeProject.id, requestId);
      setSuccessMsg('Join request withdrawn.');
      setTimeout(() => setSuccessMsg(''), 4000);
      openProjectDetails(activeProject.id);
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await respondToJoinRequest(activeProject.id, requestId, status);
      setSuccessMsg(`Request marked as ${status}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadJoinRequests(activeProject.id);
      openProjectDetails(activeProject.id);
    } catch (err) {
      setError(err.message || 'Failed to update request');
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      await removeProjectMember(activeProject.id, studentId);
      setSuccessMsg('Member removed from team.');
      setTimeout(() => setSuccessMsg(''), 4000);
      openProjectDetails(activeProject.id);
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  const totalProjectsCount = projects.length;
  const fullProjectsCount = projects.filter(p => (p.memberCount || 1) >= (p.maxMembers || 4)).length;
  const recruitingProjectsCount = projects.filter(p => (p.memberCount || 1) < (p.maxMembers || 4)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Pitch Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Campus Project Directory</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 8 }}>
            Discover open student projects seeking teammates with your skills, or pitch your own idea.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-cyan)'
            }}>
              TOTAL: <strong style={{ color: '#fff' }}>{totalProjectsCount}</strong> PROJECTS
            </span>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(0, 255, 157, 0.12)',
              border: '1px solid rgba(0, 255, 157, 0.35)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-emerald)'
            }}>
              <strong style={{ color: '#fff' }}>{fullProjectsCount}</strong> FULL (4/4) TEAMS
            </span>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-amber)'
            }}>
              <strong style={{ color: '#fff' }}>{recruitingProjectsCount}</strong> RECRUITING TEAMS
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (!loggedIn) navigate('/login');
            else setShowCreateModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Pitch New Project
        </button>
      </div>

      {/* Success / Error Alerts */}
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

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, flex: 1, minWidth: 280 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Search projects by title, keywords, or problem..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div style={{ width: 200 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Filter by skill (e.g. React)"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-subtle)', padding: 3, borderRadius: 'var(--radius-sm)' }}>
            {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedStatus === st ? 'var(--bg-surface)' : 'transparent',
                  color: selectedStatus === st ? 'var(--primary-700)' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: selectedStatus === st ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border-default)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12, fontSize: 13.5 }}>Loading campus projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FolderGit2 size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No projects found</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 20px' }}>
            No projects matched your search criteria. Try modifying your skill keywords or pitch a brand new project!
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Pitch Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((proj) => {
            const memberCount = proj.memberCount || proj.members?.length || 1;
            const maxMembers = proj.maxMembers || 4;
            const availableSeats = proj.availableSeats !== undefined ? proj.availableSeats : Math.max(0, maxMembers - memberCount);
            const isLeader = proj.createdBy === currentUser?.id || proj.isCurrentUserLeader;
            const isMember = proj.isCurrentUserMember;
            const skills = (proj.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean);

            return (
              <div
                key={proj.id}
                className="project-card"
                onClick={() => openProjectDetails(proj.id)}
              >
                <div>
                  <div className="project-card-header">
                    <span className={`badge ${
                      proj.status === 'OPEN' ? 'badge-open' : proj.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-completed'
                    }`}>
                      {proj.status?.replace('_', ' ')}
                    </span>

                    <span
                      className={`badge ${availableSeats > 0 ? 'badge-seats' : 'badge-seats-full'}`}
                      style={availableSeats === 0 ? {
                        background: 'rgba(0, 255, 157, 0.15)',
                        color: 'var(--neon-emerald)',
                        border: '1px solid rgba(0, 255, 157, 0.45)',
                        fontWeight: 700
                      } : {}}
                    >
                      {availableSeats > 0 ? `${memberCount}/${maxMembers} members (${availableSeats} seat${availableSeats > 1 ? 's' : ''} open)` : `✓ 4/4 FULLY OCCUPIED`}
                    </span>
                  </div>

                  <h3 className="project-card-title">{proj.title}</h3>
                  <p className="project-card-desc">{proj.description}</p>

                  {skills.length > 0 && (
                    <div className="skills-wrap">
                      {skills.slice(0, 4).map((sk) => (
                        <span key={sk} className="skill-tag">
                          {sk}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="skill-tag" style={{ color: 'var(--text-subtle)' }}>
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="project-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>
                      {proj.creatorName ? proj.creatorName.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                        {proj.creatorName || 'Student Leader'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-subtle)' }}>
                        Project Lead
                      </div>
                    </div>
                  </div>

                  <div>
                    {isLeader ? (
                      <span className="badge badge-leader">You Lead</span>
                    ) : isMember ? (
                      <span className="badge badge-member">Joined</span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProjectDetails(proj.id);
                        }}
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {showDetailModal && activeProject && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${
                  activeProject.status === 'OPEN' ? 'badge-open' : activeProject.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-completed'
                }`}>
                  {activeProject.status?.replace('_', ' ')}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{activeProject.title}</h3>
              </div>
              <button
                onClick={closeDetailModal}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: 8, padding: '12px 24px 0', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>
              <button
                onClick={() => setDetailTab('overview')}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  background: 'none',
                  borderBottom: detailTab === 'overview' ? '2px solid var(--primary-600)' : '2px solid transparent',
                  color: detailTab === 'overview' ? 'var(--primary-600)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailTab('members')}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  background: 'none',
                  borderBottom: detailTab === 'members' ? '2px solid var(--primary-600)' : '2px solid transparent',
                  color: detailTab === 'members' ? 'var(--primary-600)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Team Roster ({activeProject.members?.length || activeProject.memberCount || 1} / {activeProject.maxMembers || 4})
              </button>
              {activeProject.isCurrentUserLeader && (
                <button
                  onClick={() => setDetailTab('requests')}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: detailTab === 'requests' ? '2px solid var(--primary-600)' : '2px solid transparent',
                    color: detailTab === 'requests' ? 'var(--primary-600)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Join Requests
                  {joinRequests.filter((r) => r.status === 'PENDING').length > 0 && (
                    <span style={{ padding: '1px 6px', background: 'var(--warning-600)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
                      {joinRequests.filter((r) => r.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="modal-body">
              {detailTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Project Scope & Description
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {activeProject.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Required Technical Skills
                    </h4>
                    <div className="skills-wrap">
                      {(activeProject.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean).map((sk) => (
                        <span key={sk} className="skill-tag" style={{ padding: '4px 10px', fontSize: 12.5 }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, background: 'var(--bg-subtle)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Project Lead</span>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>{activeProject.creatorName || 'Student'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Lead Contact</span>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary-700)' }}>{activeProject.creatorEmail || '—'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Team Capacity</span>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                        {activeProject.memberCount || activeProject.members?.length || 1} / {activeProject.maxMembers || 4} Members
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'members' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(activeProject.members || []).map((m) => (
                    <div
                      key={m.id || m.studentId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                          {m.studentName ? m.studentName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                            {m.studentName}{m.studentId === currentUser?.id ? ' (You)' : ''}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {m.department || 'College Dept'} • {m.skills || 'General Contributor'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${m.role === 'LEADER' ? 'badge-leader' : 'badge-member'}`}>
                          {m.role}
                        </span>

                        {activeProject.isCurrentUserLeader && m.role !== 'LEADER' && (
                          <button
                            onClick={() => handleRemoveMember(m.studentId)}
                            title="Remove member"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger-600)', padding: 4 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === 'requests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loadingRequests ? (
                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading join requests...</div>
                  ) : joinRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                      No join requests received yet.
                    </div>
                  ) : (
                    joinRequests.map((req) => (
                      <div
                        key={req.id}
                        style={{
                          padding: 14,
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          background: req.status === 'PENDING' ? 'var(--bg-surface)' : 'var(--bg-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <strong style={{ fontSize: 14 }}>{req.studentName}</strong>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {req.department} • Skills: {req.skills || 'N/A'}
                            </div>
                          </div>
                          <span className={`badge ${req.status === 'PENDING' ? 'badge-in-progress' : req.status === 'ACCEPTED' ? 'badge-open' : 'badge-closed'}`}>
                            {req.status}
                          </span>
                        </div>

                        {req.message && (
                          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: 8, borderRadius: 6, margin: '8px 0' }}>
                            "{req.message}"
                          </p>
                        )}

                        {req.status === 'PENDING' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                            <button
                              onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                              className="btn btn-secondary btn-sm"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                              className="btn btn-primary btn-sm"
                            >
                              Accept to Team
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div>
                {activeProject.isCurrentUserLeader && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleOpenEdit} className="btn btn-secondary btn-sm">
                      <Edit3 size={14} /> Edit Project
                    </button>
                    <button onClick={() => handleDeleteProject(activeProject.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-600)' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {activeProject.isCurrentUserLeader || activeProject.isCurrentUserMember ? (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      navigate('/tasks');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Kanban size={14} /> Open Sprint Workspace
                  </button>
                ) : activeProject.currentUserJoinRequestStatus === 'PENDING' ? (
                  <button
                    onClick={() => handleCancelRequest(activeProject.currentUserJoinRequestId)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger-600)' }}
                  >
                    Withdraw Join Request
                  </button>
                ) : (
                  <button
                    disabled={(activeProject.availableSeats !== undefined && activeProject.availableSeats <= 0) || (activeProject.memberCount >= (activeProject.maxMembers || 4))}
                    onClick={() => {
                      if (!loggedIn) navigate('/login');
                      else setShowJoinModal(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    {(activeProject.availableSeats !== undefined && activeProject.availableSeats <= 0) || (activeProject.memberCount >= (activeProject.maxMembers || 4))
                      ? 'Team Capacity Reached (Fully Occupied - 4/4)'
                      : 'Request to Join Team'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Pitch New Student Project</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Smart Campus IoT Energy Dashboard"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Scope & Description *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the problem, project objectives, tech architecture, and what deliverables teammates will build..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Technical Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Spring Boot, MySQL, MQTT, Docker"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Team Capacity (Max Members)</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      className="form-input"
                      value={formMaxMembers}
                      onChange={(e) => setFormMaxMembers(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="OPEN">OPEN (Recruiting)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (Sprint Active)</option>
                    </select>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--primary-50)', borderRadius: 8, color: 'var(--primary-800)', fontSize: 12 }}>
                  <strong>Note:</strong> As the project creator, you will automatically be assigned as the <strong>Team Leader</strong>.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Pitch & Post Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && activeProject && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Edit Project Details</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleUpdateProject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Max Members</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      className="form-input"
                      value={formMaxMembers}
                      onChange={(e) => setFormMaxMembers(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Request Pitch Modal */}
      {showJoinModal && activeProject && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Request to Join Team</h3>
              <button onClick={() => setShowJoinModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleSendJoinRequest}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Joining Project:</div>
                  <strong style={{ fontSize: 15 }}>{activeProject.title}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Your Pitch to Project Leader ({activeProject.creatorName || 'Leader'})
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Introduce your relevant experience, technical skills, coursework, and what deliverables you can contribute to this project..."
                    value={joinPitch}
                    onChange={(e) => setJoinPitch(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Sending...' : 'Submit Pitch & Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
