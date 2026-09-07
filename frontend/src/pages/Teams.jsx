import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Shield, UserCheck, Inbox, Send, CheckCircle2, 
  XCircle, Clock, AlertCircle, Trash2, ArrowRight, Sparkles, Target, Search 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { getUser, isAuthenticated } from '../services/adminService';
import { 
  fetchMyCreatedProjects, fetchMyJoinedProjects, fetchMySentJoinRequests,
  fetchProjectJoinRequests, respondToJoinRequest, cancelJoinRequest, removeProjectMember,
  fetchProjects
} from '../services/projectService';
import {
  fetchMatchingCandidatesForProject,
  fetchMatchingProjectsForStudent,
  matchCustomSkills
} from '../services/collaborationService';
import '../styles/admin.css';
import '../styles/collaboration.css';
import '../styles/member1.css';

export default function Teams() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  // Active tab: 'leading' | 'incoming' | 'joined' | 'sent' | 'projectMatch' | 'studentMatch' | 'customMatch'
  const [activeTab, setActiveTab] = useState('leading');

  // --- Member 1 State: Teams & Join Requests ---
  const [leadingProjects, setLeadingProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Member 2 State: AI Smart Team Matching ---
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [candidates, setCandidates] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [customCandidates, setCustomCandidates] = useState([]);
  const [customSkillsInput, setCustomSkillsInput] = useState('Java, Spring Boot, React');
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      loadAllTeamData();
    } else {
      setLoading(false);
    }
    loadProjectsForMatching();
  }, [loggedIn]);

  useEffect(() => {
    if (activeTab === 'projectMatch' && selectedProjectId) {
      loadProjectCandidates(selectedProjectId);
    } else if (activeTab === 'studentMatch') {
      loadStudentProjects();
    }
  }, [activeTab, selectedProjectId]);

  // Load Member 1 data
  const loadAllTeamData = async () => {
    setLoading(true);
    setError('');
    try {
      const [leading, joined, sent] = await Promise.all([
        fetchMyCreatedProjects().catch(() => []),
        fetchMyJoinedProjects().catch(() => []),
        fetchMySentJoinRequests().catch(() => []),
      ]);

      setLeadingProjects(leading || []);
      setJoinedProjects(joined || []);
      setSentRequests(sent || []);

      // Fetch incoming requests across all leading projects
      if (leading && leading.length > 0) {
        const reqPromises = leading.map((p) => 
          fetchProjectJoinRequests(p.id).catch(() => [])
        );
        const allReqsNested = await Promise.all(reqPromises);
        setIncomingRequests(allReqsNested.flat());
      } else {
        setIncomingRequests([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // Load Member 2 matching projects
  const loadProjectsForMatching = async () => {
    try {
      const res = await fetchProjects({ page: 0, size: 20 });
      if (res && res.content && res.content.length > 0) {
        setProjectsList(res.content);
        setSelectedProjectId(res.content[0].id);
      } else {
        setProjectsList([
          { id: 1, title: 'Campus Smart Parking', requiredSkills: 'Java, Spring Boot, React' },
          { id: 2, title: 'AI Study Planner', requiredSkills: 'Python, React, FastApi' },
          { id: 3, title: 'IoT Lab Monitor', requiredSkills: 'C++, Microcontrollers, MQTT' },
          { id: 4, title: 'Student Event Hub', requiredSkills: 'Java, MySQL, React' },
        ]);
      }
    } catch (err) {
      setProjectsList([
        { id: 1, title: 'Campus Smart Parking', requiredSkills: 'Java, Spring Boot, React' },
        { id: 2, title: 'AI Study Planner', requiredSkills: 'Python, React, FastApi' },
        { id: 3, title: 'IoT Lab Monitor', requiredSkills: 'C++, Microcontrollers, MQTT' },
        { id: 4, title: 'Student Event Hub', requiredSkills: 'Java, MySQL, React' },
      ]);
    }
  };

  // Member 1 handlers
  const handleRespond = async (projectId, requestId, status) => {
    try {
      await respondToJoinRequest(projectId, requestId, status);
      setSuccessMsg(`Join request ${status.toLowerCase()} successfully!`);
      loadAllTeamData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update request');
    }
  };

  const handleCancelRequest = async (projectId, requestId) => {
    try {
      await cancelJoinRequest(projectId, requestId);
      setSuccessMsg('Join request cancelled.');
      loadAllTeamData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    }
  };

  const handleLeaveTeam = async (projectId) => {
    if (!window.confirm('Are you sure you want to leave this project team?')) return;
    try {
      await removeProjectMember(projectId, currentUser.id);
      setSuccessMsg('You have left the team.');
      loadAllTeamData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to leave team');
    }
  };

  // Member 2 matching handlers
  async function loadProjectCandidates(pid) {
    setAiLoading(true);
    setError('');
    try {
      const res = await fetchMatchingCandidatesForProject(pid, 10);
      setCandidates(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch AI candidate matches');
    } finally {
      setAiLoading(false);
    }
  }

  async function loadStudentProjects() {
    setAiLoading(true);
    setError('');
    try {
      const studentId = currentUser?.id || 1;
      const res = await fetchMatchingProjectsForStudent(studentId, 10);
      setRecommendedProjects(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommended projects');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCustomSearch(e) {
    e.preventDefault();
    if (!customSkillsInput.trim()) return;
    setAiLoading(true);
    setError('');
    try {
      const res = await matchCustomSkills(customSkillsInput, customDeptInput, 10);
      setCustomCandidates(res || []);
    } catch (err) {
      setError(err.message || 'Custom match search failed');
    } finally {
      setAiLoading(false);
    }
  }

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'PENDING').length;
  const selectedProj = projectsList.find(p => p.id === Number(selectedProjectId));

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h2>Teams & Collaboration Hub</h2>
          <p>Manage project teams, review candidate join requests, and discover teammates through AI skill matching.</p>
        </div>
        <button onClick={() => navigate('/projects')} className="primary">
          Browse All Projects
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

      {/* Tabs Navigation (Both Member 1 & Member 2) */}
      <div className="tabs-nav" style={{ background: '#fff', padding: '10px 18px', borderRadius: '14px', border: '1px solid #e8edf5', flexWrap: 'wrap', gap: '8px' }}>
        <button 
          className={`tab-btn ${activeTab === 'leading' ? 'active' : ''}`}
          onClick={() => setActiveTab('leading')}
        >
          <Shield size={16} /> Teams I Lead ({leadingProjects.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          <Inbox size={16} /> Incoming Requests 
          {pendingIncomingCount > 0 && (
            <span className="pill admin" style={{ marginLeft: '4px', fontSize: '11px' }}>
              {pendingIncomingCount} new
            </span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          <UserCheck size={16} /> Teams I've Joined ({joinedProjects.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <Send size={16} /> Sent Requests ({sentRequests.length})
        </button>

        {/* Member 2 AI Matching Tabs */}
        <button 
          className={`tab-btn ${activeTab === 'projectMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('projectMatch')}
        >
          <Target size={16} /> AI Candidates for Project
        </button>
        <button 
          className={`tab-btn ${activeTab === 'studentMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('studentMatch')}
        >
          <Sparkles size={16} /> AI Recommended Projects
        </button>
        <button 
          className={`tab-btn ${activeTab === 'customMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('customMatch')}
        >
          <Search size={16} /> Custom Skill Search
        </button>
      </div>

      {loading && (activeTab === 'leading' || activeTab === 'incoming' || activeTab === 'joined' || activeTab === 'sent') ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8791a5' }}>
          Loading team data...
        </div>
      ) : (
        <>
          {/* TAB 1: Teams I Lead */}
          {activeTab === 'leading' && (
            <div>
              {!loggedIn ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ color: '#64748b' }}>Please sign in to view and manage projects you lead.</p>
                  <button onClick={() => navigate('/login')} className="primary" style={{ marginTop: '10px' }}>Sign In</button>
                </div>
              ) : leadingProjects.length === 0 ? (
                <EmptyState
                  title="You haven't created any projects yet"
                  description="Post a new project to start building and leading your team!"
                />
              ) : (
                <div className="projects-grid">
                  {leadingProjects.map((proj) => (
                    <div key={proj.id} className="project-card">
                      <div>
                        <div className="project-card-header">
                          <span className="pill admin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Shield size={11} /> Project Leader
                          </span>
                          <span className="member-badge">
                            <Users size={13} />
                            {proj.memberCount} members
                          </span>
                        </div>
                        <h3 className="project-card-title">{proj.title}</h3>
                        <p className="project-card-desc">{proj.description || 'No description'}</p>
                      </div>

                      <div className="project-card-footer">
                        <span className="pill project-open">{proj.status}</span>
                        <button 
                          onClick={() => navigate('/projects')}
                          className="secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Manage Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Incoming Requests */}
          {activeTab === 'incoming' && (
            <div>
              {!loggedIn ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ color: '#64748b' }}>Please sign in to view candidate applications.</p>
                  <button onClick={() => navigate('/login')} className="primary" style={{ marginTop: '10px' }}>Sign In</button>
                </div>
              ) : incomingRequests.length === 0 ? (
                <EmptyState
                  title="No incoming join requests"
                  description="When students browse your projects and request to join, their applications will appear here for review."
                />
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {incomingRequests.map((req) => (
                    <div key={req.id} className="request-item" style={{ background: '#fff' }}>
                      <div className="request-item-header">
                        <div>
                          <span style={{ fontSize: '12px', color: '#8791a5', textTransform: 'uppercase', fontWeight: 600 }}>
                            Application for: <strong>{req.projectTitle}</strong>
                          </span>
                          <h4 style={{ margin: '4px 0 2px', fontSize: '16px', color: '#172033' }}>
                            {req.studentName}
                          </h4>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            {req.studentEmail} {req.studentDepartment || req.department ? `• ${req.studentDepartment || req.department}` : ''}
                          </span>
                          {(req.studentSkills || req.skills) && (
                            <div style={{ marginTop: '6px' }}>
                              <span className="skill-tag accent">{req.studentSkills || req.skills}</span>
                            </div>
                          )}
                        </div>

                        <span className={`pill ${req.status === 'ACCEPTED' ? 'faculty' : req.status === 'REJECTED' ? 'risk' : 'admin'}`}>
                          {req.status}
                        </span>
                      </div>

                      {req.message && (
                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #edf2f7', fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
                          "{req.message}"
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Submitted {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                        </span>

                        {req.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleRespond(req.projectId, req.id, 'ACCEPTED')}
                              className="primary"
                              style={{ padding: '7px 16px', fontSize: '13px', background: '#16844a' }}
                            >
                              Accept Candidate
                            </button>
                            <button
                              onClick={() => handleRespond(req.projectId, req.id, 'REJECTED')}
                              className="secondary"
                              style={{ padding: '7px 16px', fontSize: '13px', color: '#c94b3d' }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Teams I've Joined */}
          {activeTab === 'joined' && (
            <div>
              {!loggedIn ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ color: '#64748b' }}>Please sign in to view your team memberships.</p>
                  <button onClick={() => navigate('/login')} className="primary" style={{ marginTop: '10px' }}>Sign In</button>
                </div>
              ) : joinedProjects.length === 0 ? (
                <EmptyState
                  title="You haven't joined any project teams yet"
                  description="Explore open projects and request to collaborate with other students!"
                />
              ) : (
                <div className="projects-grid">
                  {joinedProjects.map((proj) => (
                    <div key={proj.id} className="project-card">
                      <div>
                        <div className="project-card-header">
                          <span className="pill student" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={11} /> Team Member
                          </span>
                          <span className="member-badge">
                            <Users size={13} /> {proj.memberCount} members
                          </span>
                        </div>
                        <h3 className="project-card-title">{proj.title}</h3>
                        <p className="project-card-desc">{proj.description || 'No description'}</p>
                      </div>

                      <div className="project-card-footer">
                        <span>Led by <strong>{proj.creatorName}</strong></span>
                        <button 
                          onClick={() => handleLeaveTeam(proj.id)}
                          className="secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', color: '#c94b3d' }}
                        >
                          Leave Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Sent Requests */}
          {activeTab === 'sent' && (
            <div>
              {!loggedIn ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ color: '#64748b' }}>Please sign in to view your sent join requests.</p>
                  <button onClick={() => navigate('/login')} className="primary" style={{ marginTop: '10px' }}>Sign In</button>
                </div>
              ) : sentRequests.length === 0 ? (
                <EmptyState
                  title="No outgoing requests"
                  description="You haven't submitted any requests to join other project teams yet."
                />
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {sentRequests.map((req) => (
                    <div key={req.id} className="request-item" style={{ background: '#fff' }}>
                      <div className="request-item-header">
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#172033' }}>
                            {req.projectTitle}
                          </h4>
                          <span style={{ fontSize: '12px', color: '#8791a5' }}>
                            Submitted {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <span className={`pill ${req.status === 'ACCEPTED' ? 'faculty' : req.status === 'REJECTED' ? 'risk' : 'admin'}`}>
                          {req.status}
                        </span>
                      </div>

                      {req.message && (
                        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                          Your Note: "{req.message}"
                        </p>
                      )}

                      {req.status === 'PENDING' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                          <button
                            onClick={() => handleCancelRequest(req.projectId, req.id)}
                            className="secondary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI Matching - Candidates for Project */}
          {activeTab === 'projectMatch' && (
            <div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                      Target Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                    >
                      {projectsList.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  {selectedProj && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Required Skills</span>
                      <div className="skills-wrap">
                        {(selectedProj.requiredSkills || '').split(',').map((s, idx) => (
                          <span key={idx} className="skill-tag skill-matched">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {aiLoading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#8791a5' }}>Analyzing candidate profiles with AI...</p>
              ) : candidates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No candidates found</h3>
                  <p>All available students are already team members, or no registered students match criteria.</p>
                </div>
              ) : (
                <div className="ai-match-grid">
                  {candidates.map(c => {
                    const scoreClass = c.matchScore >= 80 ? 'match-score-high' : c.matchScore >= 50 ? 'match-score-med' : 'match-score-low';
                    return (
                      <div key={c.studentId} className="ai-match-card">
                        <span className={`match-score-badge ${scoreClass}`}>
                          {c.matchScore}%
                        </span>

                        <div className="candidate-header">
                          <h4 className="candidate-name">{c.name}</h4>
                          <p className="candidate-sub">{c.department} Dept • {c.email}</p>
                        </div>

                        {c.bio && <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>"{c.bio}"</p>}

                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            MATCHED SKILLS
                          </span>
                          <div className="skills-wrap">
                            {c.matchedSkills && c.matchedSkills.length > 0 ? (
                              c.matchedSkills.map((s, idx) => (
                                <span key={idx} className="skill-tag skill-matched">✓ {s}</span>
                              ))
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                            )}
                            {c.missingSkills && c.missingSkills.map((s, idx) => (
                              <span key={idx} className="skill-tag skill-missing">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="ai-rationale-box">
                          <b>AI Recommendation:</b> {c.recommendationRationale}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                          <a
                            href={`/messages`}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '8px',
                              background: '#eef2ff',
                              color: '#315bea',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            Direct Message
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI Matching - Projects for Me */}
          {activeTab === 'studentMatch' && (
            <div>
              {aiLoading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#8791a5' }}>Finding matching open projects for your profile...</p>
              ) : recommendedProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚀</div>
                  <h3>No projects available to match</h3>
                  <p>You have already joined all active projects or no open projects are currently recruiting.</p>
                </div>
              ) : (
                <div className="ai-match-grid">
                  {recommendedProjects.map(p => {
                    const scoreClass = p.matchScore >= 80 ? 'match-score-high' : p.matchScore >= 50 ? 'match-score-med' : 'match-score-low';
                    return (
                      <div key={p.projectId} className="ai-match-card">
                        <span className={`match-score-badge ${scoreClass}`}>
                          {p.matchScore}%
                        </span>

                        <div className="candidate-header">
                          <h4 className="candidate-name">{p.projectTitle}</h4>
                          <p className="candidate-sub">Led by {p.leaderName} • Status: {p.projectStatus}</p>
                        </div>

                        <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>{p.description}</p>

                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            MATCHED SKILLS
                          </span>
                          <div className="skills-wrap">
                            {p.matchedSkills && p.matchedSkills.map((s, idx) => (
                              <span key={idx} className="skill-tag skill-matched">✓ {s}</span>
                            ))}
                            {p.missingSkills && p.missingSkills.map((s, idx) => (
                              <span key={idx} className="skill-tag skill-missing">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="ai-rationale-box">
                          <b>AI Match:</b> {p.recommendationRationale}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Custom Skill Search */}
          {activeTab === 'customMatch' && (
            <div>
              <form
                onSubmit={handleCustomSearch}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  alignItems: 'flex-end'
                }}
              >
                <div style={{ flex: 2, minWidth: '240px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Required Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customSkillsInput}
                    onChange={(e) => setCustomSkillsInput(e.target.value)}
                    placeholder="e.g. Python, Docker, PyTorch"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Department (optional)
                  </label>
                  <input
                    type="text"
                    value={customDeptInput}
                    onChange={(e) => setCustomDeptInput(e.target.value)}
                    placeholder="e.g. CSE, ECE, IT"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button type="submit" className="primary" style={{ padding: '10px 24px' }}>
                  Run AI Match
                </button>
              </form>

              {customCandidates.length > 0 && (
                <div className="ai-match-grid">
                  {customCandidates.map(c => (
                    <div key={c.studentId} className="ai-match-card">
                      <span className={`match-score-badge ${c.matchScore >= 80 ? 'match-score-high' : 'match-score-med'}`}>
                        {c.matchScore}%
                      </span>
                      <div className="candidate-header">
                        <h4 className="candidate-name">{c.name}</h4>
                        <p className="candidate-sub">{c.department} • {c.email}</p>
                      </div>
                      <div className="skills-wrap">
                        {c.matchedSkills && c.matchedSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag skill-matched">✓ {s}</span>
                        ))}
                      </div>
                      <div className="ai-rationale-box">
                        {c.recommendationRationale}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
