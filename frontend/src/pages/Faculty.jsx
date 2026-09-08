import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import {
  getUser,
  isAuthenticated,
  loginFaculty,
} from '../services/adminService';
import {
  fetchMyFacultyProfile,
  updateFacultyProfile,
  browseFacultyProjects,
  fetchFacultyProjectDetails,
  submitFacultyFeedback,
  deleteFacultyFeedback,
  submitProjectEvaluation,
  submitProjectApproval,
} from '../services/facultyService';
import {
  GraduationCap,
  FolderKanban,
  Activity,
  MessageSquareQuote,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Star,
  User,
  Users,
  Calendar,
  Check,
  RefreshCw,
  Clock,
  Trash2,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function Faculty() {
  const currentUser = getUser();
  const isFacultyOrAdmin = currentUser?.role === 'FACULTY' || currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('browse');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Profile Form
  const [profile, setProfile] = useState({ department: '', designation: '', specialization: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Feedback Form
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Evaluation Form
  const [evalScores, setEvalScores] = useState({
    technical: 85,
    execution: 80,
    innovation: 75,
    presentation: 90,
    remarks: '',
  });
  const [submittingEval, setSubmittingEval] = useState(false);

  // Approval Form
  const [approvalDecision, setApprovalDecision] = useState('APPROVED');
  const [approvalComments, setApprovalComments] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Load Projects
  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await browseFacultyProjects({
        keyword: searchKeyword,
        skill: filterSkill,
        status: filterStatus,
        size: 30,
      });
      const list = res?.content || (Array.isArray(res) ? res : []);
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Single Project Details
  const loadProjectDetails = async (id) => {
    if (!id) return;
    try {
      const data = await fetchFacultyProjectDetails(id);
      setSelectedProject(data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    }
  };

  // Load Faculty Profile
  const loadProfile = async () => {
    try {
      const data = await fetchMyFacultyProfile();
      if (data) {
        setProfile({
          department: data.department || '',
          designation: data.designation || '',
          specialization: data.specialization || '',
        });
      }
    } catch (err) {
      console.warn('Could not load faculty profile:', err.message);
    }
  };

  useEffect(() => {
    // Clean up any stale mock tokens left from prior runs
    const tok = localStorage.getItem('platform_jwt_token');
    if (tok && tok.startsWith('mock-')) {
      localStorage.removeItem('platform_jwt_token');
      localStorage.removeItem('platform_jwt_user');
    }

    loadProjects();
    if (isAuthenticated() && (currentUser?.role === 'FACULTY' || currentUser?.role === 'ADMIN')) {
      loadProfile();
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    try {
      await updateFacultyProfile(profile);
      setSuccessMsg('Faculty profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmittingFeedback(true);
    setError('');
    try {
      await submitFacultyFeedback(selectedProjectId, {
        taskId: selectedTaskId ? Number(selectedTaskId) : null,
        feedbackText,
        rating: Number(feedbackRating),
      });
      setFeedbackText('');
      setSelectedTaskId('');
      setSuccessMsg('Feedback submitted to team.');
      setTimeout(() => setSuccessMsg(''), 3500);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Delete this feedback comment?')) return;
    try {
      await deleteFacultyFeedback(feedbackId);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  };

  const calculatePreviewScore = () => {
    const total =
      evalScores.technical * 0.35 +
      evalScores.execution * 0.3 +
      evalScores.innovation * 0.2 +
      evalScores.presentation * 0.15;
    const rounded = Math.round(total * 10) / 10;
    let grade = 'F';
    if (rounded >= 90) grade = 'A+';
    else if (rounded >= 80) grade = 'A';
    else if (rounded >= 70) grade = 'B';
    else if (rounded >= 60) grade = 'C';
    else if (rounded >= 50) grade = 'D';
    return { total: rounded, grade };
  };

  const handleSendEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmittingEval(true);
    setError('');
    try {
      await submitProjectEvaluation(selectedProjectId, {
        technicalScore: Number(evalScores.technical),
        executionScore: Number(evalScores.execution),
        innovationScore: Number(evalScores.innovation),
        presentationScore: Number(evalScores.presentation),
        remarks: evalScores.remarks,
      });
      setSuccessMsg('Academic evaluation and grade recorded.');
      setTimeout(() => setSuccessMsg(''), 3500);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleSendApproval = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmittingApproval(true);
    setError('');
    try {
      await submitProjectApproval(selectedProjectId, {
        decision: approvalDecision,
        comments: approvalComments,
      });
      setSuccessMsg(`Project status marked as ${approvalDecision}.`);
      setApprovalComments('');
      setTimeout(() => setSuccessMsg(''), 3500);
      loadProjects();
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleQuickFacultyLogin = async () => {
    setError('');
    try {
      await loginFaculty('meera@college.edu', 'Faculty@123');
      setSuccessMsg('Logged in as Dr. Meera Nair (Faculty). Refreshing...');
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      setError(err.message);
    }
  };

  const previewScore = calculatePreviewScore();

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 20px 60px' }}>
      <PageHeader
        title="Faculty Mentorship & Evaluation Hub"
        description="Member 3 Module: Browse student projects, monitor progress, provide feedback, grade rubric criteria, and approve final submissions."
      />

      {!isFacultyOrAdmin && (
        <div style={{ padding: '12px 16px', background: '#eff8ff', border: '1px solid #b2ddff', color: '#175cd3', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} />
            <span style={{ fontSize: '13px' }}>
              Viewing in <b>Guest / Student Mode</b>. To submit evaluations, feedback, or project approvals, please log in with a faculty account.
            </span>
          </div>
          <button
            onClick={handleQuickFacultyLogin}
            style={{ padding: '6px 14px', background: '#175cd3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Quick Sign In as Faculty (Dr. Meera Nair)
          </button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ecfdf3', border: '1px solid #6ce9a6', color: '#027a48', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef3f2', border: '1px solid #fecdca', color: '#b42318', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eaecf0', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'browse', label: '1. Browse Projects', icon: FolderKanban },
          { id: 'progress', label: '2. Monitor Progress', icon: Activity },
          { id: 'feedback', label: '3. Give Feedback', icon: MessageSquareQuote },
          { id: 'evaluation', label: '4. Rubric & Evaluation', icon: Award },
          { id: 'approval', label: '5. Approve / Reject', icon: CheckCircle2 },
          { id: 'profile', label: 'Faculty Profile', icon: GraduationCap },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: isActive ? '#f8f9fc' : 'transparent',
                borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                color: isActive ? '#4f46e5' : '#475467',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={18} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 1. BROWSE PROJECTS TAB */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#98a2b3' }} />
              <input
                type="text"
                placeholder="Search projects by title or keywords..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <input
              type="text"
              placeholder="Filter by skill (e.g. React, IoT, Python)"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              style={{ flex: '1 1 180px', padding: '10px 14px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px', background: '#fff' }}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button
              onClick={loadProjects}
              style={{ padding: '10px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={16} /> Filter
            </button>
          </div>

          {/* Projects Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {projects.map((p) => {
              const isSelected = selectedProjectId === p.id;
              const statusColors = {
                APPROVED: { bg: '#ecfdf3', color: '#027a48', border: '#a6f4c5' },
                REJECTED: { bg: '#fef3f2', color: '#b42318', border: '#fecdca' },
                IN_PROGRESS: { bg: '#eff8ff', color: '#175cd3', border: '#b2ddff' },
                COMPLETED: { bg: '#fdf2fa', color: '#c11574', border: '#fcceee' },
                OPEN: { bg: '#f4f3ff', color: '#5925dc', border: '#d9d6fe' },
              }[p.status] || { bg: '#f8f9fc', color: '#344054', border: '#eaecf0' };

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                  }}
                  style={{
                    background: '#fff',
                    border: isSelected ? '2px solid #4f46e5' : '1px solid #eaecf0',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.12)' : '0 1px 3px rgba(16, 24, 40, 0.04)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#667085' }}>#{p.id}</span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: statusColors.bg,
                        color: statusColors.color,
                        border: `1px solid ${statusColors.border}`,
                      }}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#101828', marginBottom: '8px', lineHeight: '1.3' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475467', lineHeight: '1.5', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '14px' }}>
                    {p.description}
                  </p>

                  <div style={{ marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {p.requiredSkills?.split(',').map((s, idx) => (
                      <span key={idx} style={{ background: '#f2f4f7', color: '#344054', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '500' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f2f4f7', fontSize: '12px', color: '#667085' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} /> {p.creatorName || 'Student'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> {p.memberCount || 1} members
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(p.id);
                        setActiveTab('progress');
                      }}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '12px', fontWeight: '600', background: '#f8f9fc', border: '1px solid #d0d5dd', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Monitor
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(p.id);
                        setActiveTab('feedback');
                      }}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '12px', fontWeight: '600', background: '#f8f9fc', border: '1px solid #d0d5dd', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Feedback
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(p.id);
                        setActiveTab('evaluation');
                      }}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '12px', fontWeight: '600', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Evaluate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Project Banner (for Progress, Feedback, Evaluation, Approval tabs) */}
      {activeTab !== 'browse' && activeTab !== 'profile' && (
        <div style={{ background: '#f8f9fc', border: '1px solid #eaecf0', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5' }}>SELECTED PROJECT:</span>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d0d5dd', fontWeight: '600', fontSize: '14px', background: '#fff' }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.title} ({p.status})
                  </option>
                ))}
              </select>
            </div>
            {selectedProject && (
              <p style={{ fontSize: '13px', color: '#475467', marginTop: '6px' }}>
                Lead: <b>{selectedProject.creatorName}</b> &nbsp;|&nbsp; Progress: <b>{selectedProject.overallProgress}%</b> &nbsp;|&nbsp; Tasks: <b>{selectedProject.completedTasks}/{selectedProject.totalTasks} completed</b>
              </p>
            )}
          </div>
          <button
            onClick={() => loadProjectDetails(selectedProjectId)}
            style={{ padding: '8px 14px', background: '#fff', border: '1px solid #d0d5dd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Refresh Project
          </button>
        </div>
      )}

      {/* 2. MONITOR PROJECT PROGRESS TAB */}
      {activeTab === 'progress' && selectedProject && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div>
            {/* Progress Metrics Card */}
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#4f46e5" /> Overall Progress & Milestones
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '14px', background: '#eaecf0', borderRadius: '7px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${selectedProject.overallProgress || 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                      borderRadius: '7px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#101828' }}>
                  {selectedProject.overallProgress || 0}%
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                <div style={{ background: '#f8f9fc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#101828' }}>{selectedProject.totalTasks}</div>
                  <div style={{ fontSize: '12px', color: '#667085' }}>Total Tasks</div>
                </div>
                <div style={{ background: '#ecfdf3', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#027a48' }}>{selectedProject.completedTasks}</div>
                  <div style={{ fontSize: '12px', color: '#027a48' }}>Completed</div>
                </div>
                <div style={{ background: '#eff8ff', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#175cd3' }}>{selectedProject.inProgressTasks}</div>
                  <div style={{ fontSize: '12px', color: '#175cd3' }}>In Progress</div>
                </div>
                <div style={{ background: '#fff4ed', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#b54708' }}>{selectedProject.todoTasks}</div>
                  <div style={{ fontSize: '12px', color: '#b54708' }}>To-Do</div>
                </div>
              </div>
            </div>

            {/* Task Deliverables Table */}
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderKanban size={18} color="#4f46e5" /> Team Tasks Breakdown
              </h3>
              {selectedProject.tasks?.length === 0 ? (
                <p style={{ color: '#667085', fontSize: '14px' }}>No tasks assigned to this project yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eaecf0', textAlign: 'left', color: '#667085' }}>
                        <th style={{ padding: '8px 12px' }}>Task</th>
                        <th style={{ padding: '8px 12px' }}>Assignee</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                        <th style={{ padding: '8px 12px' }}>Progress</th>
                        <th style={{ padding: '8px 12px' }}>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.tasks?.map((t) => (
                        <tr key={t.taskId} style={{ borderBottom: '1px solid #f2f4f7' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '500', color: '#101828' }}>{t.title}</td>
                          <td style={{ padding: '10px 12px', color: '#475467' }}>{t.assigneeName}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: t.status === 'COMPLETED' ? '#ecfdf3' : t.status === 'IN_PROGRESS' ? '#eff8ff' : '#f2f4f7',
                                color: t.status === 'COMPLETED' ? '#027a48' : t.status === 'IN_PROGRESS' ? '#175cd3' : '#475467',
                              }}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>{t.progress}%</td>
                          <td style={{ padding: '10px 12px', color: '#667085' }}>
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info: Members & Recent Decisions */}
          <div>
            {/* Team Members */}
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#4f46e5" /> Team Members ({selectedProject.members?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedProject.members?.map((m) => (
                  <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#f8f9fc', borderRadius: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '12px' }}>
                      {m.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#101828', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#667085' }}>
                        {m.department} • <b style={{ color: m.role === 'LEADER' ? '#4f46e5' : '#475467' }}>{m.role}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Status & Latest Evaluation */}
            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#4f46e5" /> Latest Evaluation
              </h3>
              {selectedProject.latestEvaluation ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5' }}>
                      {selectedProject.latestEvaluation.grade}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#101828' }}>
                      {selectedProject.latestEvaluation.totalScore} / 100
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475467', lineHeight: '1.4', background: '#f8f9fc', padding: '10px', borderRadius: '6px' }}>
                    "{selectedProject.latestEvaluation.remarks || 'No remarks provided.'}"
                  </p>
                  <div style={{ fontSize: '11px', color: '#98a2b3', marginTop: '6px' }}>
                    Evaluated by {selectedProject.latestEvaluation.evaluatorName}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#667085' }}>This project has not been evaluated yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GIVE FEEDBACK TAB */}
      {activeTab === 'feedback' && selectedProject && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          {/* Feedback Form */}
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquareQuote size={18} color="#4f46e5" /> Leave Mentorship Feedback
            </h3>
            <form onSubmit={handleSendFeedback}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                Target Task (Optional)
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '13px' }}
                >
                  <option value="">General Project Feedback</option>
                  {selectedProject.tasks?.map((t) => (
                    <option key={t.taskId} value={t.taskId}>
                      Task #{t.taskId}: {t.title}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                Star Rating
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: star <= feedbackRating ? '#eaaa08' : '#d0d5dd',
                      }}
                    >
                      <Star size={22} fill={star <= feedbackRating ? '#eaaa08' : 'none'} />
                    </button>
                  ))}
                </div>
              </label>

              <label style={{ display: 'block', marginBottom: '16px', fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                Detailed Feedback & Guidance
                <textarea
                  required
                  rows={4}
                  placeholder="Provide constructive feedback, suggestions for architectural improvement, or test criteria..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                />
              </label>

              <button
                type="submit"
                disabled={submittingFeedback}
                style={{ width: '100%', padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                {submittingFeedback ? 'Submitting...' : 'Post Feedback'}
              </button>
            </form>
          </div>

          {/* Feedback Feed */}
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#4f46e5" /> Feedback History for #{selectedProject.projectId}
            </h3>
            {selectedProject.recentFeedback?.length === 0 ? (
              <p style={{ color: '#667085', fontSize: '14px' }}>No faculty feedback posted yet for this project.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedProject.recentFeedback?.map((fb) => (
                  <div key={fb.id} style={{ background: '#f8f9fc', border: '1px solid #eaecf0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#101828', fontSize: '14px' }}>{fb.facultyName}</span>
                        {fb.taskTitle && (
                          <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                            Task: {fb.taskTitle}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', color: '#eaaa08' }}>
                          {[...Array(fb.rating || 5)].map((_, i) => (
                            <Star key={i} size={14} fill="#eaaa08" />
                          ))}
                        </div>
                        {isFacultyOrAdmin && (
                          <button
                            onClick={() => handleDeleteFeedback(fb.id)}
                            style={{ background: 'none', border: 'none', color: '#98a2b3', cursor: 'pointer', padding: '2px' }}
                            title="Delete Feedback"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#344054', lineHeight: '1.5', margin: '6px 0 10px' }}>
                      {fb.feedbackText}
                    </p>
                    <div style={{ fontSize: '11px', color: '#667085', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(fb.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. RUBRIC & EVALUATION TAB */}
      {activeTab === 'evaluation' && selectedProject && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
          {/* Evaluation Form */}
          <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#4f46e5" /> Academic Grading & Rubric Scoring
            </h3>
            <p style={{ fontSize: '13px', color: '#667085', marginBottom: '20px' }}>
              Grade the project across the four department-standard criteria. The composite grade and total score will be automatically computed.
            </p>

            <form onSubmit={handleSendEvaluation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                  Technical Architecture (Weight: 35%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalScores.technical}
                    onChange={(e) => setEvalScores({ ...evalScores, technical: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
                  />
                </label>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                  Implementation & Code (Weight: 30%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalScores.execution}
                    onChange={(e) => setEvalScores({ ...evalScores, execution: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                  Innovation & Novelty (Weight: 20%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalScores.innovation}
                    onChange={(e) => setEvalScores({ ...evalScores, innovation: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
                  />
                </label>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                  Documentation & Presentation (Weight: 15%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalScores.presentation}
                    onChange={(e) => setEvalScores({ ...evalScores, presentation: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
                  />
                </label>
              </div>

              <label style={{ display: 'block', marginBottom: '20px', fontSize: '13px', fontWeight: '500', color: '#344054' }}>
                Evaluator Remarks & Recommendations
                <textarea
                  rows={4}
                  placeholder="Summarize strengths, security recommendations, and viva notes..."
                  value={evalScores.remarks}
                  onChange={(e) => setEvalScores({ ...evalScores, remarks: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                />
              </label>

              <button
                type="submit"
                disabled={submittingEval}
                style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                {submittingEval ? 'Submitting Evaluation...' : 'Submit Official Evaluation'}
              </button>
            </form>
          </div>

          {/* Live Rubric Preview */}
          <div>
            <div style={{ background: '#f8f9fc', border: '1px solid #eaecf0', borderRadius: '12px', padding: '20px', position: 'sticky', top: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#344054', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#4f46e5" /> Computed Score Preview
              </h4>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid #e0e7ff', marginBottom: '16px' }}>
                <div style={{ fontSize: '42px', fontWeight: '800', color: '#4f46e5', lineHeight: '1' }}>
                  {previewScore.grade}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#101828', marginTop: '6px' }}>
                  {previewScore.total} / 100
                </div>
                <div style={{ fontSize: '12px', color: '#667085', marginTop: '2px' }}>Overall Composite Grade</div>
              </div>

              <div style={{ fontSize: '12px', color: '#475467', lineHeight: '1.6' }}>
                <div>• Technical: {evalScores.technical} × 35% = {(evalScores.technical * 0.35).toFixed(1)}</div>
                <div>• Execution: {evalScores.execution} × 30% = {(evalScores.execution * 0.3).toFixed(1)}</div>
                <div>• Innovation: {evalScores.innovation} × 20% = {(evalScores.innovation * 0.2).toFixed(1)}</div>
                <div>• Presentation: {evalScores.presentation} × 15% = {(evalScores.presentation * 0.15).toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. APPROVE / REJECT TAB */}
      {activeTab === 'approval' && selectedProject && (
        <div style={{ maxWidth: '680px', margin: '0 auto', background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#4f46e5" /> Project Approval Decision
          </h3>
          <p style={{ fontSize: '13px', color: '#667085', marginBottom: '20px' }}>
            Cast your faculty verdict for <b>{selectedProject.title}</b> (#{selectedProject.projectId}). This decision updates the canonical project status across the entire platform.
          </p>

          <form onSubmit={handleSendApproval}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#344054', display: 'block', marginBottom: '8px' }}>
                Select Decision
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { val: 'APPROVED', label: 'APPROVE', color: '#027a48', bg: '#ecfdf3', border: '#a6f4c5', icon: CheckCircle2 },
                  { val: 'NEEDS_REVISION', label: 'NEEDS REVISION', color: '#b54708', bg: '#fff4ed', border: '#fedf89', icon: AlertCircle },
                  { val: 'REJECTED', label: 'REJECT', color: '#b42318', bg: '#fef3f2', border: '#fecdca', icon: XCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = approvalDecision === item.val;
                  return (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setApprovalDecision(item.val)}
                      style={{
                        padding: '14px 10px',
                        borderRadius: '8px',
                        border: isSel ? `2px solid ${item.color}` : '1px solid #d0d5dd',
                        background: isSel ? item.bg : '#fff',
                        color: isSel ? item.color : '#475467',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '20px', fontSize: '13px', fontWeight: '500', color: '#344054' }}>
              Decision Rationale & Next Steps
              <textarea
                rows={4}
                required
                placeholder="Explain the reason for this decision (e.g., criteria met for university exhibition, missing tests, etc.)..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', marginTop: '6px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
              />
            </label>

            <button
              type="submit"
              disabled={submittingApproval}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              {submittingApproval ? 'Submitting Decision...' : `Submit ${approvalDecision} Verdict`}
            </button>
          </form>

          {/* Past Approval Audit */}
          {selectedProject.latestApproval && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #eaecf0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '8px' }}>
                Previous Faculty Action
              </h4>
              <div style={{ background: '#f8f9fc', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <b style={{ color: '#101828' }}>Decision: {selectedProject.latestApproval.decision}</b>
                  <span style={{ color: '#667085', fontSize: '12px' }}>
                    {new Date(selectedProject.latestApproval.decidedAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: '#475467', margin: '4px 0' }}>"{selectedProject.latestApproval.comments}"</p>
                <span style={{ color: '#98a2b3', fontSize: '11px' }}>
                  Recorded by {selectedProject.latestApproval.facultyName}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. FACULTY PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', border: '1px solid #eaecf0', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={22} color="#4f46e5" /> Manage Faculty Profile
          </h3>
          <p style={{ fontSize: '13px', color: '#667085', marginBottom: '20px' }}>
            Update your academic credentials, department affiliation, and areas of research specialization.
          </p>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#344054', marginBottom: '6px' }}>
                Academic Department
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Engineering (CSE)"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#344054', marginBottom: '6px' }}>
                Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Professor, Associate Professor, Project Mentor"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#344054', marginBottom: '6px' }}>
                Research & Specialization Areas
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Distributed Systems, Machine Learning, Cloud Architecture, Embedded IoT"
                value={profile.specialization}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d5dd', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
