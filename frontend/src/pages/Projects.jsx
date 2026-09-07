import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, FolderKanban, Users, Clock, CheckCircle2, 
  X, AlertCircle, Send, UserCheck, Shield, Trash2, Edit3, ArrowRight 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { getUser, isAuthenticated } from '../services/adminService';
import { 
  fetchProjects, fetchProjectById, createProject, updateProject, 
  deleteProject, sendJoinRequest, respondToJoinRequest, cancelJoinRequest,
  removeProjectMember, fetchProjectJoinRequests
} from '../services/projectService';
import '../styles/admin.css';
import '../styles/member1.css';

export default function Projects() {
  const navigate = useNavigate();
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
  const [formStatus, setFormStatus] = useState('OPEN');
  const [joinPitch, setJoinPitch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [selectedStatus]);

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
    setError('');
    try {
      const detail = await fetchProjectById(projectId);
      setActiveProject(detail);
      setDetailTab('overview');
      setShowDetailModal(true);

      // If leader, load join requests
      if (detail.isCurrentUserLeader) {
        loadJoinRequests(projectId);
      }
    } catch (err) {
      setError(err.message || 'Could not load project details');
    }
  };

  const loadJoinRequests = async (projectId) => {
    setLoadingRequests(true);
    try {
      const reqs = await fetchProjectJoinRequests(projectId);
      setJoinRequests(reqs || []);
    } catch (err) {
      console.error(err);
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
    setSubmitting(true);
    setError('');
    try {
      await createProject({
        title: formTitle,
        description: formDesc,
        requiredSkills: formSkills,
        status: formStatus,
      });
      setSuccessMsg('Project posted successfully!');
      setShowCreateModal(false);
      setFormTitle('');
      setFormDesc('');
      setFormSkills('');
      loadProjects();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    setSubmitting(true);
    setError('');
    try {
      await updateProject(activeProject.id, {
        title: formTitle,
        description: formDesc,
        requiredSkills: formSkills,
        status: formStatus,
      });
      setSuccessMsg('Project updated successfully!');
      setShowEditModal(false);
      openProjectDetails(activeProject.id);
      loadProjects();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? All memberships and requests will be removed.')) {
      return;
    }
    try {
      await deleteProject(projectId);
      setSuccessMsg('Project deleted successfully.');
      setShowDetailModal(false);
      loadProjects();
      setTimeout(() => setSuccessMsg(''), 4000);
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
      setSuccessMsg('Join request submitted to the project leader!');
      setShowJoinModal(false);
      setJoinPitch('');
      openProjectDetails(activeProject.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to send join request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelJoinRequest = async () => {
    if (!activeProject || !activeProject.currentUserJoinRequestId) return;
    try {
      await cancelJoinRequest(activeProject.id, activeProject.currentUserJoinRequestId);
      setSuccessMsg('Join request cancelled.');
      openProjectDetails(activeProject.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await respondToJoinRequest(activeProject.id, requestId, status);
      setSuccessMsg(`Join request ${status.toLowerCase()}!`);
      loadJoinRequests(activeProject.id);
      openProjectDetails(activeProject.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update join request');
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeProjectMember(activeProject.id, studentId);
      setSuccessMsg('Member removed from project.');
      openProjectDetails(activeProject.id);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  const openEditModal = () => {
    if (!activeProject) return;
    setFormTitle(activeProject.title);
    setFormDesc(activeProject.description || '');
    setFormSkills(activeProject.requiredSkills || '');
    setFormStatus(activeProject.status);
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="pill project-open">OPEN FOR MEMBERS</span>;
      case 'IN_PROGRESS':
        return <span className="pill project-in_progress">IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="pill project-completed">COMPLETED</span>;
      case 'DRAFT':
        return <span className="pill">DRAFT</span>;
      default:
        return <span className="pill">{status}</span>;
    }
  };

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h2>Explore & Create Projects</h2>
          <p>Discover student initiatives, match required skills, and assemble high-performing teams.</p>
        </div>
        <button 
          onClick={() => {
            if (!loggedIn) {
              navigate('/login');
            } else {
              setFormTitle('');
              setFormDesc('');
              setFormSkills('');
              setFormStatus('OPEN');
              setShowCreateModal(true);
            }
          }}
          className="primary"
        >
          <Plus size={18} />
          Post New Project
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf3', border: '1px solid #a6f4c5', color: '#16844a', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#fff0ef', border: '1px solid #fecdd3', color: '#c94b3d', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="filters-bar">
        <form onSubmit={handleSearchSubmit} className="search" style={{ flex: '1 1 320px' }}>
          <Search size={16} color="#8791a5" />
          <input
            type="text"
            placeholder="Search projects by title, description, or keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="text"
            placeholder="Filter by skill (e.g. React, Python)"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); loadProjects(); } }}
            style={{ padding: '9px 12px', border: '1px solid #dfe5ef', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff' }}
          />
          <button type="button" onClick={loadProjects} className="secondary" style={{ padding: '9px 14px', fontSize: '13px' }}>
            Filter
          </button>
        </div>

        <div className="filter-group">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-chip ${selectedStatus === st ? 'active' : ''}`}
              onClick={() => setSelectedStatus(st)}
            >
              {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8791a5' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try broadening your search keywords or skill filter, or be the first to post a new project!"
        />
      ) : (
        <div className="projects-grid">
          {projects.map((proj) => {
            const skillList = proj.requiredSkills
              ? proj.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <div 
                key={proj.id} 
                className="project-card"
                onClick={() => openProjectDetails(proj.id)}
              >
                <div>
                  <div className="project-card-header">
                    {getStatusBadge(proj.status)}
                    <span className="member-badge">
                      <Users size={13} />
                      {proj.memberCount} {proj.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <h3 className="project-card-title">{proj.title}</h3>
                  <p className="project-card-desc">{proj.description || 'No description provided.'}</p>

                  {skillList.length > 0 && (
                    <div className="skills-wrap">
                      {skillList.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="skill-tag accent">{sk}</span>
                      ))}
                      {skillList.length > 4 && (
                        <span className="skill-tag">+{skillList.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="project-card-footer">
                  <div className="project-author">
                    <div className="mini-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                      {proj.creatorName ? proj.creatorName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{proj.creatorName || 'Student'}</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#315bea', fontWeight: 600 }}>
                    Details <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details Modal */}
      {showDetailModal && activeProject && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getStatusBadge(activeProject.status)}
                {activeProject.isCurrentUserLeader && (
                  <span className="pill admin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={11} /> Project Leader
                  </span>
                )}
                {activeProject.isCurrentUserMember && !activeProject.isCurrentUserLeader && (
                  <span className="pill student" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={11} /> Team Member
                  </span>
                )}
              </div>
              <button className="icon-btn" onClick={() => setShowDetailModal(false)}>
                <X size={18} />
              </button>
            </div>

            <h2 style={{ margin: '0 0 10px', fontSize: '22px', color: '#172033' }}>
              {activeProject.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#8791a5', marginBottom: '18px' }}>
              <span>Created by <strong>{activeProject.creatorName}</strong></span>
              <span>•</span>
              <span>{activeProject.createdAt ? new Date(activeProject.createdAt).toLocaleDateString() : ''}</span>
              <span>•</span>
              <span>{activeProject.memberCount} Team Members</span>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-nav">
              <button 
                className={`tab-btn ${detailTab === 'overview' ? 'active' : ''}`}
                onClick={() => setDetailTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-btn ${detailTab === 'members' ? 'active' : ''}`}
                onClick={() => setDetailTab('members')}
              >
                Team Members ({activeProject.members?.length || 0})
              </button>
              {activeProject.isCurrentUserLeader && (
                <button 
                  className={`tab-btn ${detailTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setDetailTab('requests')}
                >
                  Join Requests ({joinRequests.filter(r => r.status === 'PENDING').length})
                </button>
              )}
            </div>

            {/* Tab: Overview */}
            {detailTab === 'overview' && (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Description</h4>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.65', color: '#334155', whiteSpace: 'pre-line' }}>
                    {activeProject.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Required Skills</h4>
                  <div className="skills-wrap">
                    {activeProject.requiredSkills
                      ? activeProject.requiredSkills.split(',').map((sk, idx) => (
                          <span key={idx} className="skill-tag accent" style={{ fontSize: '12px', padding: '5px 12px' }}>
                            {sk.trim()}
                          </span>
                        ))
                      : <span style={{ color: '#8791a5', fontSize: '13px' }}>None specified</span>}
                  </div>
                </div>

                {/* Project Actions */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '18px', flexWrap: 'wrap' }}>
                  {activeProject.isCurrentUserLeader ? (
                    <>
                      <button onClick={openEditModal} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Edit3 size={15} /> Edit Project
                      </button>
                      <button onClick={() => handleDeleteProject(activeProject.id)} className="secondary" style={{ color: '#c94b3d', borderColor: '#fecdd3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </>
                  ) : activeProject.isCurrentUserMember ? (
                    <button 
                      onClick={() => handleRemoveMember(currentUser?.id)} 
                      className="secondary" 
                      style={{ color: '#c94b3d', borderColor: '#fecdd3' }}
                    >
                      Leave Project Team
                    </button>
                  ) : activeProject.currentUserJoinRequestStatus === 'PENDING' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="pill" style={{ background: '#fff4df', color: '#a86c00', padding: '6px 12px', fontSize: '12px' }}>
                        Join Request Pending Review
                      </span>
                      <button onClick={handleCancelJoinRequest} className="secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        Cancel Request
                      </button>
                    </div>
                  ) : activeProject.status === 'OPEN' ? (
                    <button 
                      onClick={() => {
                        if (!loggedIn) navigate('/login');
                        else setShowJoinModal(true);
                      }}
                      className="primary"
                    >
                      <Send size={15} /> Request to Join Team
                    </button>
                  ) : (
                    <span style={{ color: '#8791a5', fontSize: '13px' }}>This project is currently not accepting new members.</span>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Team Members */}
            {detailTab === 'members' && (
              <div className="member-list-grid">
                {activeProject.members?.map((mem) => (
                  <div key={mem.id} className="member-row">
                    <div className="member-info">
                      <div className="mini-avatar">
                        {mem.studentName ? mem.studentName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#172033', display: 'block' }}>
                          {mem.studentName}
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {mem.studentEmail} {mem.department ? `• ${mem.department}` : ''}
                        </span>
                        {mem.skills && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: '#315bea' }}>
                            {mem.skills}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`pill ${mem.role === 'LEADER' ? 'admin' : 'student'}`}>
                        {mem.role}
                      </span>
                      {activeProject.isCurrentUserLeader && mem.role !== 'LEADER' && (
                        <button 
                          onClick={() => handleRemoveMember(mem.studentId)}
                          className="icon-btn"
                          title="Remove member"
                          style={{ color: '#c94b3d' }}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Join Requests (Leader Only) */}
            {detailTab === 'requests' && activeProject.isCurrentUserLeader && (
              <div>
                {loadingRequests ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#8791a5' }}>Loading requests...</div>
                ) : joinRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#8791a5' }}>
                    No join requests for this project yet.
                  </div>
                ) : (
                  joinRequests.map((req) => (
                    <div key={req.id} className="request-item">
                      <div className="request-item-header">
                        <div>
                          <strong style={{ fontSize: '14px', color: '#172033' }}>{req.studentName}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                            {req.studentEmail} {req.studentDepartment ? `• ${req.studentDepartment}` : ''}
                          </span>
                          {req.studentSkills && (
                            <span style={{ fontSize: '11px', color: '#315bea', display: 'block', marginTop: '3px' }}>
                              Skills: {req.studentSkills}
                            </span>
                          )}
                        </div>
                        <span className={`pill ${req.status === 'ACCEPTED' ? 'faculty' : req.status === 'REJECTED' ? 'risk' : 'admin'}`}>
                          {req.status}
                        </span>
                      </div>

                      {req.message && (
                        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #edf2f7' }}>
                          "{req.message}"
                        </p>
                      )}

                      {req.status === 'PENDING' && (
                        <div className="request-item-actions">
                          <button 
                            onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                            className="primary" 
                            style={{ padding: '6px 14px', fontSize: '12px', background: '#16844a' }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                            className="secondary" 
                            style={{ padding: '6px 14px', fontSize: '12px', color: '#c94b3d' }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Project Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Post New Project</h3>
              <button className="icon-btn" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="form-grid">
              <label className="full">
                Project Title *
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Smart Campus Navigation"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </label>

              <label className="full">
                Description
                <textarea
                  rows={4}
                  placeholder="Describe the problem, project goals, architecture, and what teammates will work on..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </label>

              <label className="full">
                Required Skills (comma separated)
                <input
                  type="text"
                  placeholder="e.g. React, Spring Boot, MySQL, Docker"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                />
              </label>

              <label>
                Project Status
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                  <option value="OPEN">OPEN (Looking for team members)</option>
                  <option value="DRAFT">DRAFT (Not visible to applicants)</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                </select>
              </label>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="primary">
                  {submitting ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Project</h3>
              <button className="icon-btn" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="form-grid">
              <label className="full">
                Project Title *
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </label>

              <label className="full">
                Description
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </label>

              <label className="full">
                Required Skills (comma separated)
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                />
              </label>

              <label>
                Status
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </label>

              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Join Request Pitch Modal */}
      {showJoinModal && activeProject && (
        <div className="modal-backdrop" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Request to Join Team</h3>
              <button className="icon-btn" onClick={() => setShowJoinModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
              Send a note to <strong>{activeProject.creatorName}</strong> explaining why you would be a great addition to <em>{activeProject.title}</em>.
            </p>
            <form onSubmit={handleSendJoinRequest}>
              <label style={{ display: 'grid', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#566277', marginBottom: '14px' }}>
                Pitch Note (Optional)
                <textarea
                  rows={4}
                  placeholder="Mention your key skills, relevant coursework, or projects you have built..."
                  value={joinPitch}
                  onChange={(e) => setJoinPitch(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #dfe5ef', borderRadius: '9px', font: 'inherit', outline: 'none' }}
                />
              </label>
              <div className="form-actions">
                <button type="button" onClick={() => setShowJoinModal(false)} className="secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="primary">
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
