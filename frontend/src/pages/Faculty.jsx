import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  FolderGit2,
  Activity,
  MessageSquare,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Star,
  Users2,
  Clock,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Check,
  Plus
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchMyFacultyProfile,
  updateFacultyProfile,
  browseFacultyProjects,
  fetchFacultyProjectDetails,
  fetchFacultyProjectProgress,
  submitFacultyFeedback,
  deleteFacultyFeedback,
  submitProjectEvaluation,
  fetchProjectEvaluations,
  submitProjectApproval,
  fetchProjectApprovals
} from '../services/facultyService';

export default function Faculty() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUser();
  const isFaculty = currentUser?.role === 'FACULTY' || currentUser?.role === 'ADMIN';

  // Tabs: 'projects' | 'progress' | 'feedback' | 'evaluations' | 'approvals' | 'profile'
  const [activeTab, setActiveTab] = useState('projects');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectProgress, setProjectProgress] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [approvals, setApprovals] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Faculty Profile
  const [facultyProfile, setFacultyProfile] = useState({
    department: '',
    designation: '',
    specialization: '',
  });

  // Mentorship Feedback Form
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Rubric Evaluation Form
  const [rubricScores, setRubricScores] = useState({
    codeQuality: 23,     // max 25
    architecture: 22,    // max 25
    velocity: 24,        // max 25
    collaboration: 25,   // max 25
    remarks: '',
  });
  const [submittingEval, setSubmittingEval] = useState(false);

  // Approval Form
  const [approvalDecision, setApprovalDecision] = useState('APPROVED');
  const [approvalComments, setApprovalComments] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadProjects();
    loadFacultyProfile();

    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['projects', 'progress', 'feedback', 'feedbacks', 'evaluations', 'approvals', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam === 'feedbacks' ? 'feedback' : tabParam);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadFacultyProfile = async () => {
    try {
      const prof = await fetchMyFacultyProfile();
      if (prof) {
        setFacultyProfile({
          department: prof.department || '',
          designation: prof.designation || '',
          specialization: prof.specialization || '',
        });
      }
    } catch (e) {}
  };

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
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (pid) => {
    try {
      const [detail, prog, evalList, appList] = await Promise.all([
        fetchFacultyProjectDetails(pid).catch(() => null),
        fetchFacultyProjectProgress(pid).catch(() => null),
        fetchProjectEvaluations(pid).catch(() => []),
        fetchProjectApprovals(pid).catch(() => []),
      ]);
      setSelectedProject(detail);
      setProjectProgress(prog);
      setEvaluations(Array.isArray(evalList) ? evalList : []);
      setApprovals(Array.isArray(appList) ? appList : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    try {
      await submitFacultyFeedback(selectedProjectId, {
        comments: feedbackText,
        rating: feedbackRating,
      });
      setFeedbackText('');
      setSuccessMsg('Mentorship feedback submitted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRubricSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEval(true);
    try {
      const total = Number(rubricScores.codeQuality) + Number(rubricScores.architecture) + Number(rubricScores.velocity) + Number(rubricScores.collaboration);
      await submitProjectEvaluation(selectedProjectId, {
        technicalScore: rubricScores.codeQuality,
        executionScore: rubricScores.velocity,
        innovationScore: rubricScores.architecture,
        presentationScore: rubricScores.collaboration,
        totalScore: total,
        remarks: rubricScores.remarks,
      });
      setSuccessMsg('Academic rubric evaluation recorded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to record evaluation');
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setSubmittingApproval(true);
    setError('');
    try {
      await submitProjectApproval(selectedProjectId, {
        decision: approvalDecision,
        comments: approvalComments,
      });
      setApprovalComments('');
      setSuccessMsg(`Project sign-off status recorded as ${approvalDecision}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to record approval');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const totalRubricScore = Number(rubricScores.codeQuality) + Number(rubricScores.architecture) + Number(rubricScores.velocity) + Number(rubricScores.collaboration);
  const letterGrade = totalRubricScore >= 90 ? 'A+' : totalRubricScore >= 80 ? 'A' : totalRubricScore >= 70 ? 'B+' : totalRubricScore >= 60 ? 'B' : totalRubricScore >= 50 ? 'C' : 'F';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--success-50)', color: 'var(--success-700)', display: 'grid', placeItems: 'center' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Faculty Mentorship & Evaluation Portal</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              Guide student teams, review sprint velocity, submit feedback, and score academic rubrics.
            </p>
          </div>
        </div>

        {/* Project Selector for Quick Action */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Active Project:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '4px 8px', fontSize: 12.5, fontWeight: 700 }}
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
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

      {/* Faculty Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 2, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('projects')}
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <FolderGit2 size={15} /> Projects Directory ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`btn ${activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Activity size={15} /> Sprint Health Monitor
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <MessageSquare size={15} /> Mentorship Feedback
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`btn ${activeTab === 'evaluations' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Award size={15} /> Rubric Evaluations
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <ShieldCheck size={15} /> Project Approvals
        </button>
      </div>

      {/* Tab 1: Projects Directory */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Search Toolbar */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search projects by title, description, or leader..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div style={{ width: 180 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by skill..."
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                />
              </div>
              <button onClick={loadProjects} className="btn btn-secondary">
                <Search size={15} /> Filter
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading student projects...</div>
          ) : projects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No student projects found matching filters.
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                const memberCount = p.memberCount || p.members?.length || 1;
                const maxMembers = p.maxMembers || 4;

                return (
                  <div
                    key={p.id}
                    className="project-card"
                    style={{ borderColor: isSelected ? 'var(--primary-600)' : 'var(--border-default)' }}
                    onClick={() => setSelectedProjectId(p.id)}
                  >
                    <div>
                      <div className="project-card-header">
                        <span className={`badge ${p.status === 'OPEN' ? 'badge-open' : 'badge-in-progress'}`}>
                          {p.status}
                        </span>
                        <span className="badge badge-member">
                          {memberCount} / {maxMembers} Members
                        </span>
                      </div>

                      <h3 className="project-card-title">{p.title}</h3>
                      <p className="project-card-desc">{p.description}</p>

                      <div className="skills-wrap">
                        {(p.requiredSkills || '').split(',').map((s) => (
                          <span key={s} className="skill-tag">{s.trim()}</span>
                        ))}
                      </div>
                    </div>

                    <div className="project-card-footer">
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Lead: <strong>{p.creatorName || 'Student'}</strong>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(p.id);
                          setActiveTab('evaluations');
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 11.5 }}
                      >
                        Grade Rubric <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sprint Health Monitor */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedProject ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedProject.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lead: {selectedProject.creatorName} ({selectedProject.creatorEmail})</p>
                </div>
                <span className={`badge ${projectProgress?.healthStatus === 'ON_TRACK' ? 'badge-open' : 'badge-in-progress'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                  {projectProgress?.healthStatus || 'ON_TRACK'}
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700 }}>
                  <span>Sprint Completion Velocity</span>
                  <span style={{ color: 'var(--primary-700)' }}>{projectProgress?.overallProgress || 0}% Complete</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'var(--border-default)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${projectProgress?.overallProgress || 0}%`, height: '100%', background: 'var(--primary-600)', borderRadius: 999 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Sprint Tasks</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{projectProgress?.totalTasks || selectedProject.tasks?.length || 0}</div>
                </div>
                <div style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed Deliverables</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success-700)' }}>{projectProgress?.completedTasks || 0}</div>
                </div>
                <div style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending Tasks</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning-700)' }}>
                    {(projectProgress?.totalTasks || 0) - (projectProgress?.completedTasks || 0)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Select a project from the directory to view sprint health metrics.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Mentorship Feedback */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Form */}
          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              Submit Mentorship Feedback for "{selectedProject?.title || 'Selected Project'}"
            </h3>

            <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Mentorship Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Star size={24} fill={star <= feedbackRating ? '#f59e0b' : 'none'} color={star <= feedbackRating ? '#f59e0b' : 'var(--border-strong)'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Constructive Feedback & Architecture Recommendations</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide guidance on technical stack choices, sprint milestone pacing, or test coverage..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={submittingFeedback || !selectedProjectId} className="btn btn-primary">
                {submittingFeedback ? 'Submitting...' : 'Post Mentorship Feedback'}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Project Mentorship History</h3>
            {selectedProject?.feedbacks?.length === 0 || !selectedProject?.feedbacks ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No prior feedback submitted for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedProject.feedbacks.map((fb) => (
                  <div key={fb.id} style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong>{fb.facultyName || 'Faculty Advisor'}</strong>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= (fb.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fb.comments}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Rubric Evaluations */}
      {activeTab === 'evaluations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Rubric Evaluation Scoring Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Academic Rubric Scoring</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Project: {selectedProject?.title}</span>
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: 16,
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)'
              }}>
                TOTAL: {totalRubricScore}% (GRADE: {letterGrade})
              </div>
            </div>

            <form onSubmit={handleRubricSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <label>1. Code Quality & Technical Rigor (0-25)</label>
                  <span>{rubricScores.codeQuality} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={rubricScores.codeQuality}
                  onChange={(e) => setRubricScores({ ...rubricScores, codeQuality: e.target.value })}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <label>2. Architecture, Problem Scope & Innovation (0-25)</label>
                  <span>{rubricScores.architecture} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={rubricScores.architecture}
                  onChange={(e) => setRubricScores({ ...rubricScores, architecture: e.target.value })}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <label>3. Sprint Velocity & Milestone Deliverables (0-25)</label>
                  <span>{rubricScores.velocity} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={rubricScores.velocity}
                  onChange={(e) => setRubricScores({ ...rubricScores, velocity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <label>4. Team Collaboration & Git Hygiene (0-25)</label>
                  <span>{rubricScores.collaboration} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={rubricScores.collaboration}
                  onChange={(e) => setRubricScores({ ...rubricScores, collaboration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Evaluator Remarks</label>
                <textarea
                  className="form-textarea"
                  placeholder="Official evaluation remarks and rubric notes..."
                  value={rubricScores.remarks}
                  onChange={(e) => setRubricScores({ ...rubricScores, remarks: e.target.value })}
                />
              </div>

              <button type="submit" disabled={submittingEval || !selectedProjectId} className="btn btn-primary">
                {submittingEval ? 'Recording...' : 'Submit Academic Evaluation'}
              </button>
            </form>
          </div>

          {/* Past Rubric Evaluations */}
          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Recorded Rubrics History</h3>
            {evaluations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No prior evaluations recorded for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {evaluations.map((ev) => (
                  <div key={ev.id} style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong>Score: {ev.totalScore !== undefined && ev.totalScore !== null ? `${ev.totalScore}%` : 'N/A'}</strong>
                      <span className="badge badge-open" style={{ fontSize: 13, fontWeight: 800 }}>
                        Grade: {ev.grade || (ev.totalScore >= 90 ? 'A+' : ev.totalScore >= 80 ? 'A' : ev.totalScore >= 70 ? 'B+' : ev.totalScore >= 60 ? 'B' : ev.totalScore >= 50 ? 'C' : 'F')}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Evaluated by {ev.evaluatorName || ev.facultyName || 'Faculty Advisor'} on {ev.evaluatedAt || ev.createdAt ? new Date(ev.evaluatedAt || ev.createdAt).toLocaleDateString() : 'Recent'}
                    </div>
                    {ev.remarks && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: 8, borderRadius: 6 }}>
                        {ev.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Project Approvals */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Formal Project Sign-off & Approval
            </h3>

            <form onSubmit={handleApprovalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Decision</label>
                <select
                  className="form-select"
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                >
                  <option value="APPROVED">APPROVED (Authorized for Academic Credit)</option>
                  <option value="REJECTED">REJECTED (Requires Revision)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sign-off Comments / Revisions Needed</label>
                <textarea
                  className="form-textarea"
                  placeholder="State the rationale for sign-off or required amendments..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={submittingApproval || !selectedProjectId} className="btn btn-primary">
                {submittingApproval ? 'Saving Decision...' : 'Record Sign-off Decision'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Approval History</h3>
            {approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No formal approvals recorded yet for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {approvals.map((app) => (
                  <div key={app.id} style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 12, 28, 0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className={`badge ${app.decision === 'APPROVED' ? 'badge-open' : 'badge-closed'}`}>
                        {app.decision || app.status}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {app.facultyName ? `by ${app.facultyName} • ` : ''}{app.decidedAt || app.createdAt ? new Date(app.decidedAt || app.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    {app.comments && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
