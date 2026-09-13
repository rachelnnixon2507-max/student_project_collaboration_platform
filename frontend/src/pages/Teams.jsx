import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users2,
  Shield,
  UserCheck,
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  ArrowRight,
  Sparkles,
  Target,
  Search,
  Kanban,
  MessageSquare
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchMyCreatedProjects,
  fetchMyJoinedProjects,
  fetchMySentJoinRequests,
  fetchProjectJoinRequests,
  respondToJoinRequest,
  cancelJoinRequest,
  removeProjectMember,
  fetchProjects
} from '../services/projectService';
import {
  fetchMatchingCandidatesForProject,
  fetchMatchingProjectsForStudent,
  matchCustomSkills,
  inviteCandidateToProject
} from '../services/collaborationService';

export default function Teams() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  // Active tab: 'leading' | 'joined' | 'sent' | 'aiMatch'
  const [activeTab, setActiveTab] = useState('leading');

  // State
  const [leadingProjects, setLeadingProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // AI Matching sub-tabs
  const [aiSubTab, setAiSubTab] = useState('projectCandidates'); // 'projectCandidates' | 'studentProjects' | 'customMatch'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [customCandidates, setCustomCandidates] = useState([]);
  const [customSkillsInput, setCustomSkillsInput] = useState('Java, Spring Boot, React, MySQL');
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Invitation State
  const [invitedMap, setInvitedMap] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCandidateToInvite, setSelectedCandidateToInvite] = useState(null);
  const [inviteTargetProjectId, setInviteTargetProjectId] = useState(null);
  const [inviteCustomNote, setInviteCustomNote] = useState('');
  const [invitingState, setInvitingState] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    loadAllTeamData();
  }, [loggedIn, navigate]);

  useEffect(() => {
    if (activeTab === 'aiMatch') {
      if (aiSubTab === 'projectCandidates' && selectedProjectId) {
        loadProjectCandidates(selectedProjectId);
      } else if (aiSubTab === 'studentProjects') {
        loadStudentProjects();
      }
    }
  }, [activeTab, aiSubTab, selectedProjectId]);

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

      if (leading && leading.length > 0) {
        setSelectedProjectId(leading[0].id);
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

  const loadProjectCandidates = async (projectId) => {
    if (!projectId) return;
    setAiLoading(true);
    try {
      const res = await fetchMatchingCandidatesForProject(projectId, 10);
      setCandidates(Array.isArray(res) ? res : []);
    } catch (err) {
      setCandidates([]);
    } finally {
      setAiLoading(false);
    }
  };

  const loadStudentProjects = async () => {
    setAiLoading(true);
    try {
      const res = await fetchMatchingProjectsForStudent(currentUser?.id, 10);
      setRecommendedProjects(Array.isArray(res) ? res : []);
    } catch (err) {
      setRecommendedProjects([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomSkillMatch = async (e) => {
    e.preventDefault();
    if (!customSkillsInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await matchCustomSkills(customSkillsInput, customDeptInput, 10);
      setCustomCandidates(Array.isArray(res) ? res : []);
    } catch (err) {
      setCustomCandidates([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRespondJoinRequest = async (projectId, requestId, status) => {
    try {
      await respondToJoinRequest(projectId, requestId, status);
      setSuccessMsg(`Join request marked as ${status}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAllTeamData();
    } catch (err) {
      setError(err.message || 'Failed to respond to request');
    }
  };

  const handleCancelSentRequest = async (projectId, requestId) => {
    try {
      await cancelJoinRequest(projectId, requestId);
      setSuccessMsg('Join request withdrawn.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAllTeamData();
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    }
  };

  const handleRemoveMember = async (projectId, studentId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      await removeProjectMember(projectId, studentId);
      setSuccessMsg('Member removed from team.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAllTeamData();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  const handleOpenInviteModal = (candidate, overrideProjectId = null) => {
    const targetProjId = overrideProjectId || selectedProjectId || (leadingProjects[0]?.id);
    setSelectedCandidateToInvite(candidate);
    setInviteTargetProjectId(targetProjId);
    const targetProj = leadingProjects.find(p => p.id === Number(targetProjId));
    const projName = targetProj ? `"${targetProj.title}"` : 'our project team';
    setInviteCustomNote(`Hi ${candidate.name || candidate.studentName}, your skills match our requirements for ${projName}. Would love to invite you to collaborate with us!`);
    setShowInviteModal(true);
  };

  const handleSendCandidateInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidateToInvite || !inviteTargetProjectId) return;
    const candId = selectedCandidateToInvite.studentId || selectedCandidateToInvite.userId;
    setInvitingState(true);
    setError('');
    try {
      await inviteCandidateToProject(inviteTargetProjectId, candId, inviteCustomNote);
      setInvitedMap((prev) => ({ ...prev, [`${inviteTargetProjectId}-${candId}`]: true }));
      setSuccessMsg(`Invitation dispatched to ${selectedCandidateToInvite.name || selectedCandidateToInvite.studentName}! Notification and direct message sent.`);
      setTimeout(() => setSuccessMsg(''), 5000);
      setShowInviteModal(false);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInvitingState(false);
    }
  };

  const pendingRequests = incomingRequests.filter((r) => r.status === 'PENDING');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Team Management & AI Matching</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Review candidate join requests, manage team rosters, and find skill matches.
          </p>
        </div>

        <button
          onClick={() => navigate('/projects?create=true')}
          className="btn btn-primary"
        >
          Pitch New Project
        </button>
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

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('leading')}
          className={`btn ${activeTab === 'leading' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Shield size={15} />
          Teams I Lead ({leadingProjects.length})
          {pendingRequests.length > 0 && (
            <span style={{ padding: '2px 7px', background: 'var(--danger-600)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          className={`btn ${activeTab === 'joined' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Users2 size={15} />
          Teams Joined ({joinedProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Send size={15} />
          My Sent Requests ({sentRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('aiMatch')}
          className={`btn ${activeTab === 'aiMatch' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Sparkles size={15} />
          Smart AI Matcher
        </button>
      </div>

      {/* Tab 1: Teams I Lead */}
      {activeTab === 'leading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Pending Review Queue for Leader */}
          {pendingRequests.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid var(--warning-600)', background: 'var(--warning-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Inbox size={20} color="var(--warning-700)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning-700)' }}>
                  Incoming Join Requests Requiring Your Decision ({pendingRequests.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: 16,
                      background: 'rgba(8, 16, 36, 0.85)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                          {req.studentName} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>({req.studentEmail})</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                          Department: <strong>{req.department || 'CSE'}</strong> • Skills: <span className="skill-tag">{req.skills || 'General'}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--primary-700)', fontWeight: 600, marginTop: 4 }}>
                          Applied to: "{req.projectTitle}"
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleRespondJoinRequest(req.projectId, req.id, 'REJECTED')}
                          className="btn btn-secondary btn-sm"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondJoinRequest(req.projectId, req.id, 'ACCEPTED')}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={14} /> Accept Teammate
                        </button>
                      </div>
                    </div>

                    {req.message && (
                      <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary-500)' }}>
                        <strong>Pitch:</strong> "{req.message}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leading Projects List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading your teams...</div>
          ) : leadingProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Shield size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>You haven't created any projects yet</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
                When you create a project, you become the default Team Leader and can recruit skilled peers.
              </p>
              <button onClick={() => navigate('/projects?create=true')} className="btn btn-primary btn-sm">
                Pitch Project Idea
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {leadingProjects.map((p) => {
                const memberCount = p.memberCount || p.members?.length || 1;
                const maxMembers = p.maxMembers || 4;
                const availableSeats = p.availableSeats !== undefined ? p.availableSeats : Math.max(0, maxMembers - memberCount);

                return (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</h3>
                          <span className="badge badge-leader">LEADER</span>
                          <span className={`badge ${p.status === 'OPEN' ? 'badge-open' : 'badge-in-progress'}`}>
                            {p.status}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 650 }}>{p.description}</p>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => navigate('/tasks')}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <Kanban size={14} /> Sprint Board
                        </button>
                        <button
                          onClick={() => navigate('/messages')}
                          className="btn btn-secondary btn-sm"
                        >
                          <MessageSquare size={14} /> Team Chat
                        </button>
                      </div>
                    </div>

                    {/* Capacity & Member Roster */}
                    <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Team Roster ({memberCount} / {maxMembers} Members)
                        </span>
                        <span className={`badge ${availableSeats > 0 ? 'badge-seats' : 'badge-seats-full'}`}>
                          {availableSeats > 0 ? `${availableSeats} seat${availableSeats > 1 ? 's' : ''} remaining` : 'Team Full'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {(p.members || [
                          { studentId: currentUser?.id, studentName: currentUser?.name || 'You', role: 'LEADER', department: currentUser?.department || 'CSE' }
                        ]).map((m) => (
                          <div
                            key={m.id || m.studentId}
                            style={{
                              padding: 12,
                              background: 'var(--bg-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11 }}>
                                {m.studentName ? m.studentName.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                  {m.studentName}{m.studentId === currentUser?.id ? ' (You)' : ''}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  {m.department || 'Department'}
                                </div>
                              </div>
                            </div>

                            <div>
                              {m.role === 'LEADER' ? (
                                <span className="badge badge-leader" style={{ fontSize: 10 }}>Lead</span>
                              ) : (
                                <button
                                  onClick={() => handleRemoveMember(p.id, m.studentId)}
                                  title="Remove from team"
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: 'var(--danger-600)', padding: 4 }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Teams Joined */}
      {activeTab === 'joined' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {joinedProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Users2 size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No joined teams yet</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
                Browse the project directory and send join requests to projects that match your skills.
              </p>
              <button onClick={() => navigate('/projects')} className="btn btn-primary btn-sm">
                Discover Projects
              </button>
            </div>
          ) : (
            joinedProjects.map((p) => (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</h3>
                      <span className="badge badge-member">MEMBER</span>
                      <span className={`badge ${p.status === 'OPEN' ? 'badge-open' : 'badge-in-progress'}`}>{p.status}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 650, marginBottom: 12 }}>
                      {p.description}
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Project Lead: <strong>{p.creatorName || 'Student Leader'}</strong> ({p.creatorEmail})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="btn btn-primary btn-sm"
                    >
                      <Kanban size={14} /> Open Sprint Workspace
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="btn btn-secondary btn-sm"
                    >
                      <MessageSquare size={14} /> Team Chat
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: My Sent Requests */}
      {activeTab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sentRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Send size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No sent join requests</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
                When you find an open project in the directory, pitch your skills to join their team.
              </p>
              <button onClick={() => navigate('/projects')} className="btn btn-primary btn-sm">
                Explore Projects
              </button>
            </div>
          ) : (
            sentRequests.map((req) => (
              <div key={req.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{req.projectTitle || 'Campus Project'}</h3>
                      <span className={`badge ${req.status === 'PENDING' ? 'badge-in-progress' : req.status === 'ACCEPTED' ? 'badge-open' : 'badge-closed'}`}>
                        {req.status}
                      </span>
                    </div>
                    {req.message && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: 10, borderRadius: 8, marginTop: 8 }}>
                        <strong>Your Pitch:</strong> "{req.message}"
                      </p>
                    )}
                  </div>

                  <div>
                    {req.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelSentRequest(req.projectId, req.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger-600)' }}
                      >
                        Withdraw Pitch
                      </button>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => navigate('/tasks')}
                        className="btn btn-primary btn-sm"
                      >
                        Go to Workspace
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Smart AI Matcher */}
      {activeTab === 'aiMatch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Sub tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAiSubTab('projectCandidates')}
              className={`btn btn-sm ${aiSubTab === 'projectCandidates' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Match Candidates for My Project
            </button>
            <button
              onClick={() => setAiSubTab('studentProjects')}
              className={`btn btn-sm ${aiSubTab === 'studentProjects' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Match Projects for My Profile
            </button>
            <button
              onClick={() => setAiSubTab('customMatch')}
              className={`btn btn-sm ${aiSubTab === 'customMatch' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Custom Skill Radar
            </button>
          </div>

          {/* SubTab A: Project Candidates */}
          {aiSubTab === 'projectCandidates' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Select Your Project:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', minWidth: 260 }}
                  value={selectedProjectId || ''}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    setSelectedProjectId(pid);
                    loadProjectCandidates(pid);
                  }}
                >
                  {leadingProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {aiLoading ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Calculating candidate skill match scores...</div>
              ) : candidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No matched student candidates found for this project's required skill set.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 14 }}>
                  {candidates.map((c) => {
                    const candId = c.studentId || c.userId;
                    const isInvited = invitedMap[`${selectedProjectId}-${candId}`];
                    return (
                      <div
                        key={candId}
                        style={{
                          border: '1px solid var(--border-default)',
                          padding: 16,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(6, 12, 28, 0.75)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 10
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <strong style={{ fontSize: 14.5, color: '#fff' }}>{c.name || c.studentName}</strong>
                            <span className="badge badge-open" style={{ fontWeight: 800 }}>
                              {c.matchScore !== undefined && c.matchScore !== null
                                ? `${Math.round(c.matchScore > 1 ? c.matchScore : c.matchScore * 100)}% Match`
                                : '95% Match'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                            DEPT: {c.department || 'CSE'}
                          </div>
                          {c.bio && (
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.35 }}>
                              {c.bio}
                            </p>
                          )}
                          <div className="skills-wrap" style={{ marginBottom: 12 }}>
                            {(c.skills || '').split(',').map((sk, idx) => (
                              <span key={`cand-skill-${candId}-${idx}`} className="skill-tag">{sk.trim()}</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                          <button
                            onClick={() => handleOpenInviteModal(c)}
                            disabled={isInvited}
                            className={`btn ${isInvited ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
                          >
                            {isInvited ? (
                              <>
                                <CheckCircle2 size={13} color="var(--accent-cyan)" /> Invited
                              </>
                            ) : (
                              <>
                                <Send size={13} /> Invite to Team
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => navigate('/messages')}
                            className="btn btn-secondary btn-sm"
                            title="Direct Message"
                            style={{ padding: '7px 10px', fontSize: 12 }}
                          >
                            <MessageSquare size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SubTab B: Student Projects */}
          {aiSubTab === 'studentProjects' && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Projects Recommended Based on Your Skills</h3>
              {aiLoading ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Analyzing campus project requirements...</div>
              ) : recommendedProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No recommended projects found. Add more skills to your profile!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {recommendedProjects.map((p) => {
                    const projId = p.projectId || p.id;
                    const projTitle = p.projectTitle || p.title || 'Untitled Project';
                    const lead = p.leaderName || p.creatorName;
                    const skillsList = (p.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean);

                    return (
                      <div key={projId} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                            <strong style={{ fontSize: 14.5, color: '#fff' }}>{projTitle}</strong>
                            <span className="badge badge-open" style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                              {p.matchScore !== undefined && p.matchScore !== null
                                ? `${Math.round(p.matchScore > 1 ? p.matchScore : p.matchScore * 100)}% Match`
                                : '90% Match'}
                            </span>
                          </div>
                          {lead && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                              LEAD: {lead}
                            </div>
                          )}
                          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
                            {p.description}
                          </p>
                          {skillsList.length > 0 && (
                            <div className="skills-wrap" style={{ marginBottom: 14 }}>
                              {skillsList.map((sk, idx) => (
                                <span key={`proj-rec-skill-${projId}-${idx}`} className="skill-tag">{sk}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => projId && navigate(`/projects?id=${projId}`)}
                          className="btn btn-outline-primary btn-sm"
                          style={{ width: '100%', marginTop: 'auto' }}
                        >
                          View & Join
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SubTab C: Custom Match Radar */}
          {aiSubTab === 'customMatch' && (
            <div className="card">
              <form onSubmit={handleCustomSkillMatch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ flex: 2, minWidth: 260 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter required skills (e.g. Python, Docker, PyTorch)"
                    value={customSkillsInput}
                    onChange={(e) => setCustomSkillsInput(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Department (Optional)"
                    value={customDeptInput}
                    onChange={(e) => setCustomDeptInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Search size={15} /> Find Matches
                </button>
              </form>

              {aiLoading ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Running skill similarity algorithms...</div>
              ) : customCandidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                  Enter skills above and click Find Matches to search students across campus.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {customCandidates.map((c) => {
                    const candId = c.studentId || c.userId;
                    const defaultProjId = selectedProjectId || leadingProjects[0]?.id;
                    const isInvited = invitedMap[`${defaultProjId}-${candId}`];

                    return (
                      <div
                        key={candId}
                        style={{
                          border: '1px solid var(--border-default)',
                          padding: 14,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(6, 12, 28, 0.75)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 10
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <strong style={{ fontSize: 13.5, color: '#fff' }}>{c.name || c.studentName}</strong>
                            <span className="badge badge-open">
                              {c.matchScore !== undefined && c.matchScore !== null
                                ? `${Math.round(c.matchScore > 1 ? c.matchScore : c.matchScore * 100)}% Match`
                                : 'Match'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{c.department}</div>
                          <div className="skills-wrap" style={{ marginBottom: 10 }}>
                            {(c.skills || '').split(',').map((sk, idx) => (
                              <span key={`custom-cand-skill-${candId}-${idx}`} className="skill-tag">{sk.trim()}</span>
                            ))}
                          </div>
                        </div>

                        {leadingProjects.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                            <button
                              onClick={() => handleOpenInviteModal(c, defaultProjId)}
                              disabled={isInvited}
                              className={`btn ${isInvited ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                              style={{ flex: 1, padding: '6px 10px', fontSize: 11.5 }}
                            >
                              {isInvited ? (
                                <>
                                  <CheckCircle2 size={12} color="var(--accent-cyan)" /> Invited
                                </>
                              ) : (
                                <>
                                  <Send size={12} /> Invite
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => navigate('/messages')}
                              className="btn btn-secondary btn-sm"
                              title="Direct Message"
                              style={{ padding: '6px 10px', fontSize: 11.5 }}
                            >
                              <MessageSquare size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Candidate Invitation Modal */}
      {showInviteModal && selectedCandidateToInvite && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 520, border: '1px solid var(--border-glow)' }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Send Team Invitation</h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Invite <strong style={{ color: 'var(--accent-cyan)' }}>{selectedCandidateToInvite.name || selectedCandidateToInvite.studentName}</strong> to join your project team.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCandidateInvite}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 12 }}>Target Project</label>
                  <select
                    className="form-input"
                    value={inviteTargetProjectId || ''}
                    onChange={(e) => {
                      const newId = Number(e.target.value);
                      setInviteTargetProjectId(newId);
                      const proj = leadingProjects.find((p) => p.id === newId);
                      if (proj) {
                        setInviteCustomNote(`Hi ${selectedCandidateToInvite.name || selectedCandidateToInvite.studentName}, your skills match our requirements for "${proj.title}". Would love to have you on our team!`);
                      }
                    }}
                    required
                  >
                    {leadingProjects.map((p) => (
                      <option key={`invite-proj-opt-${p.id}`} value={p.id}>
                        {p.title} ({p.availableSeats ?? ((p.maxMembers || 4) - (p.memberCount || 1))} seats open)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>
                      {selectedCandidateToInvite.name || selectedCandidateToInvite.studentName}
                    </span>
                    <span className="badge badge-open" style={{ fontSize: 11 }}>
                      {selectedCandidateToInvite.matchScore ? `${Math.round(selectedCandidateToInvite.matchScore > 1 ? selectedCandidateToInvite.matchScore : selectedCandidateToInvite.matchScore * 100)}% Match` : 'Skill Match'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Dept: {selectedCandidateToInvite.department || 'Engineering'}
                  </div>
                  <div className="skills-wrap">
                    {(selectedCandidateToInvite.skills || '').split(',').map((sk, idx) => (
                      <span key={`cand-inv-skill-${idx}`} className="skill-tag" style={{ fontSize: 10.5 }}>{sk.trim()}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12 }}>Personalized Invitation Note</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={inviteCustomNote}
                    onChange={(e) => setInviteCustomNote(e.target.value)}
                    placeholder="Add an optional note to the student candidate..."
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, display: 'block' }}>
                    Candidate will receive an in-app notification and a direct chat message thread.
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={invitingState}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={invitingState}
                >
                  {invitingState ? 'Sending...' : (
                    <>
                      <Send size={13} /> Dispatch Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
