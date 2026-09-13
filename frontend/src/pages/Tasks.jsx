import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Kanban,
  Plus,
  FileCode,
  Link2,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  User,
  Sliders
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchMyCreatedProjects,
  fetchMyJoinedProjects,
  fetchProjects,
  fetchProjectMembers
} from '../services/projectService';
import {
  fetchProjectTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  fetchProjectProgress,
  recalculateProjectProgress,
  updateProjectProgress,
  fetchProjectResources,
  uploadProjectFile,
  addResourceLink,
  getFileDownloadUrl,
  deleteProjectResource
} from '../services/collaborationService';

export default function Tasks() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'files'

  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  // Manual progress override state
  const [manualProgressVal, setManualProgressVal] = useState(0);

  // File upload state
  const [uploadMode, setUploadMode] = useState('link'); // 'link' | 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDesc, setFileDesc] = useState('');
  const [resourceLinkName, setResourceLinkName] = useState('');
  const [resourceLinkUrl, setResourceLinkUrl] = useState('');

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    loadProjects();
  }, [loggedIn, navigate]);

  const loadProjects = async () => {
    try {
      const [created, joined] = await Promise.all([
        fetchMyCreatedProjects().catch(() => []),
        fetchMyJoinedProjects().catch(() => []),
      ]);

      const merged = [...created, ...joined.filter(jp => !created.some(cp => cp.id === jp.id))];
      if (merged.length > 0) {
        setProjects(merged);
        setSelectedProjectId(merged[0].id);
      } else {
        const publicRes = await fetchProjects({ page: 0, size: 10 });
        if (publicRes && publicRes.content && publicRes.content.length > 0) {
          setProjects(publicRes.content);
          setSelectedProjectId(publicRes.content[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    loadProjectData(selectedProjectId);
  }, [selectedProjectId]);

  const loadProjectData = async (pid) => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, progressRes, filesRes, membersRes] = await Promise.all([
        fetchProjectTasks(pid).catch(() => []),
        fetchProjectProgress(pid).catch(() => null),
        fetchProjectResources(pid).catch(() => []),
        fetchProjectMembers(pid).catch(() => []),
      ]);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setProgress(progressRes);
      if (progressRes) setManualProgressVal(progressRes.overallProgress || 0);
      setResources(Array.isArray(filesRes) ? filesRes : []);
      setTeamMembers(Array.isArray(membersRes) ? membersRes : []);
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({
        projectId: Number(selectedProjectId),
        title: newTaskTitle,
        description: newTaskDesc,
        assignedTo: newTaskAssignee ? Number(newTaskAssignee) : null,
        dueDate: newTaskDueDate || null,
        status: newTaskStatus,
        priority: newTaskPriority,
      });
      setShowTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
      setSuccessMsg('Sprint deliverable created successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const progressPercent = newStatus === 'COMPLETED' ? 100 : newStatus === 'IN_PROGRESS' ? 50 : 0;
      await updateTaskStatus(taskId, newStatus, progressPercent);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this sprint task?')) return;
    try {
      await deleteTask(taskId);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleRecalculateProgress = async () => {
    try {
      await recalculateProjectProgress(selectedProjectId);
      setSuccessMsg('Sprint progress recalculated based on completed deliverables!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to recalculate progress');
    }
  };

  const handleManualProgressSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProjectProgress(selectedProjectId, Number(manualProgressVal));
      setShowProgressModal(false);
      setSuccessMsg('Project progress updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to update progress');
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      if (uploadMode === 'file') {
        if (!selectedFile) return;
        await uploadProjectFile(selectedProjectId, selectedFile, fileDesc);
      } else {
        if (!resourceLinkName.trim() || !resourceLinkUrl.trim()) return;
        await addResourceLink({
          projectId: Number(selectedProjectId),
          fileName: resourceLinkName,
          fileUrl: resourceLinkUrl,
          description: fileDesc,
          resourceType: 'LINK',
        });
      }
      setShowFileModal(false);
      setSelectedFile(null);
      setFileDesc('');
      setResourceLinkName('');
      setResourceLinkUrl('');
      setSuccessMsg('Resource added to project workspace!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Remove this resource from the project workspace?')) return;
    try {
      await deleteProjectResource(resourceId);
      loadProjectData(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to remove resource');
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  const overallProgress = progress ? progress.overallProgress : (tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0);
  const healthStatus = progress?.healthStatus || (overallProgress >= 70 ? 'ON_TRACK' : overallProgress >= 30 ? 'IN_PROGRESS' : 'ON_TRACK');

  const selectedProjObj = projects.find((p) => p.id === Number(selectedProjectId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Workspace Header & Project Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'grid', placeItems: 'center' }}>
            <Kanban size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Sprint Workspace & Kanban</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Project:</span>
              {projects.length > 0 ? (
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 10px', fontSize: 13, fontWeight: 700 }}
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 600 }}>No project selected</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowFileModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <Link2 size={15} /> Add Link / Resource
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> New Sprint Deliverable
          </button>
        </div>
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

      {/* Live Sprint Progress Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Sprint Velocity & Completion</h3>
            <span className={`badge ${
              healthStatus === 'ON_TRACK' ? 'badge-open' : healthStatus === 'DELAYED' ? 'badge-closed' : 'badge-in-progress'
            }`}>
              {healthStatus}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-700)' }}>
              {overallProgress}% Complete
            </span>
            <button
              onClick={handleRecalculateProgress}
              title="Recalculate from completed tasks"
              className="btn btn-ghost btn-sm"
              style={{ padding: 6 }}
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setShowProgressModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11.5, padding: '4px 8px' }}
            >
              <Sliders size={12} /> Adjust
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 10, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
          <div
            style={{
              width: `${overallProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--neon-cyan) 0%, var(--neon-violet) 100%)',
              borderRadius: 999,
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          <div>Total Deliverables: <strong>{tasks.length}</strong></div>
          <div>Pending (Todo): <strong>{todoTasks.length}</strong></div>
          <div>In Progress: <strong>{inProgressTasks.length}</strong></div>
          <div>Completed: <strong style={{ color: 'var(--success-700)' }}>{completedTasks.length}</strong></div>
        </div>
      </div>

      {/* Tabs Switcher: Kanban vs Resources */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`btn ${activeTab === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Kanban size={14} /> Kanban Sprint Columns
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`btn ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <FileCode size={14} /> Project Links & Repositories ({resources.length})
        </button>
      </div>

      {/* View 1: 3-Column Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="kanban-board">
          {/* Column 1: TODO */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8' }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>To Do ({todoTasks.length})</span>
              </div>
              <button
                onClick={() => {
                  setNewTaskStatus('TODO');
                  setShowTaskModal(true);
                }}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4 }}
              >
                <Plus size={16} />
              </button>
            </div>

            {todoTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 12.5 }}>
                No tasks in backlog.
              </div>
            ) : (
              todoTasks.map((task) => (
                <div key={task.id} className="kanban-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: 13.5, color: 'var(--text-main)' }}>{task.title}</strong>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-muted)', padding: 2 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {task.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="badge badge-member" style={{ fontSize: 10 }}>
                      {task.assignedToName || 'Unassigned'}
                    </span>
                    <button
                      onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                      className="btn btn-outline-primary btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                    >
                      Start <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: IN_PROGRESS */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>In Progress ({inProgressTasks.length})</span>
              </div>
              <button
                onClick={() => {
                  setNewTaskStatus('IN_PROGRESS');
                  setShowTaskModal(true);
                }}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4 }}
              >
                <Plus size={16} />
              </button>
            </div>

            {inProgressTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 12.5 }}>
                No tasks in progress.
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div key={task.id} className="kanban-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: 13.5, color: 'var(--text-main)' }}>{task.title}</strong>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-muted)', padding: 2 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {task.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="badge badge-member" style={{ fontSize: 10 }}>
                      {task.assignedToName || 'Unassigned'}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleStatusChange(task.id, 'TODO')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 6px', fontSize: 11 }}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 8px', fontSize: 11, background: 'var(--success-600)' }}
                      >
                        Done <CheckCircle2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: COMPLETED */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Completed ({completedTasks.length})</span>
              </div>
            </div>

            {completedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 12.5 }}>
                No completed deliverables yet.
              </div>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="kanban-card" style={{ borderLeft: '3px solid var(--success-600)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: 13.5, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{task.title}</strong>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-muted)', padding: 2 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="badge badge-open" style={{ fontSize: 10 }}>
                      <CheckCircle2 size={10} /> Verified
                    </span>
                    <button
                      onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', fontSize: 11 }}
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View 2: Project Files & Links */}
      {activeTab === 'files' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Shared Project Repositories & Artifacts</h3>
            <button onClick={() => setShowFileModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Resource
            </button>
          </div>

          {resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Link2 size={40} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13 }}>No links or files shared yet. Attach GitHub, Figma, or document links.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {resources.map((res) => (
                <div
                  key={res.id}
                  style={{
                    padding: 16,
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <FileCode size={16} color="var(--primary-600)" />
                      <strong style={{ fontSize: 14 }}>{res.fileName}</strong>
                    </div>
                    {res.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{res.description}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                    {res.fileUrl ? (
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        Open Link <ExternalLink size={12} />
                      </a>
                    ) : (
                      <a
                        href={getFileDownloadUrl(res.id)}
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                      >
                        Download File
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger-600)', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Sprint Task */}
      {showTaskModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Create Sprint Deliverable</h3>
              <button onClick={() => setShowTaskModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Deliverable Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Implement OAuth JWT Login with Institutional IDs"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Task Specifications / Acceptance Criteria</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide detailed implementation notes and deliverables..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-select"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((m) => (
                        <option key={m.studentId || m.id} value={m.studentId || m.id}>
                          {m.studentName} ({m.role || 'Member'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sprint Status</label>
                    <select
                      className="form-select"
                      value={newTaskStatus}
                      onChange={(e) => setNewTaskStatus(e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Resource / Link */}
      {showFileModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Add Project Link / Repository</h3>
              <button onClick={() => setShowFileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleAddResource}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setUploadMode('link')}
                    className={`btn btn-sm ${uploadMode === 'link' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Web Link / Repo URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`btn btn-sm ${uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Upload File
                  </button>
                </div>

                {uploadMode === 'link' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Resource Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. GitHub Repository, Figma Design System"
                        value={resourceLinkName}
                        onChange={(e) => setResourceLinkName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL *</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://github.com/..."
                        value={resourceLinkUrl}
                        onChange={(e) => setResourceLinkUrl(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Select Document / File</label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes / Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief description..."
                    value={fileDesc}
                    onChange={(e) => setFileDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowFileModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Attach Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manual Progress Adjust */}
      {showProgressModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Adjust Project Progress</h3>
              <button onClick={() => setShowProgressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleManualProgressSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Overall Completion: {manualProgressVal}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={manualProgressVal}
                    onChange={(e) => setManualProgressVal(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowProgressModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
