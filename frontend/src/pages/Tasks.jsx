import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import '../styles/collaboration.css';
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
import { fetchProjects } from '../services/adminService';

export default function Tasks() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'files'

  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Manual progress override state
  const [manualProgressVal, setManualProgressVal] = useState(0);

  // File upload state
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDesc, setFileDesc] = useState('');
  const [resourceLinkName, setResourceLinkName] = useState('');
  const [resourceLinkUrl, setResourceLinkUrl] = useState('');

  // Initial load: fetch projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetchProjects();
        if (res && res.content) {
          setProjects(res.content);
          if (res.content.length > 0) {
            setSelectedProjectId(res.content[0].id);
          }
        }
      } catch (err) {
        // Fallback default sample projects if not accessible
        setProjects([
          { id: 1, title: 'Campus Smart Parking' },
          { id: 2, title: 'AI Study Planner' },
          { id: 3, title: 'IoT Lab Monitor' },
          { id: 4, title: 'Student Event Hub' },
        ]);
      }
    }
    loadProjects();
  }, []);

  // Reload project data whenever selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) return;
    loadProjectData(selectedProjectId);
  }, [selectedProjectId]);

  async function loadProjectData(pid) {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, progressRes, filesRes] = await Promise.all([
        fetchProjectTasks(pid).catch(() => []),
        fetchProjectProgress(pid).catch(() => null),
        fetchProjectResources(pid).catch(() => []),
      ]);
      setTasks(tasksRes || []);
      setProgress(progressRes);
      if (progressRes) setManualProgressVal(progressRes.overallProgress || 0);
      setResources(filesRes || []);
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({
        projectId: Number(selectedProjectId),
        title: newTaskTitle.trim(),
        description: newTaskDesc,
        assignedTo: newTaskAssignee ? Number(newTaskAssignee) : null,
        dueDate: newTaskDueDate ? `${newTaskDueDate}T23:59:59` : null,
        status: newTaskStatus,
      });
      setShowTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleQuickStatusChange(taskId, newStatus) {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteTask(taskId, e) {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRecalculateProgress() {
    try {
      await recalculateProjectProgress(selectedProjectId);
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleManualProgressSubmit(e) {
    e.preventDefault();
    try {
      await updateProjectProgress(selectedProjectId, Number(manualProgressVal), 'Manual team leader override');
      setShowProgressModal(false);
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleFileUploadSubmit(e) {
    e.preventDefault();
    try {
      if (uploadMode === 'file') {
        if (!selectedFile) {
          alert('Please select a file to upload');
          return;
        }
        await uploadProjectFile(selectedProjectId, selectedFile, fileDesc);
      } else {
        if (!resourceLinkName || !resourceLinkUrl) {
          alert('Please provide link title and URL');
          return;
        }
        await addResourceLink({
          projectId: Number(selectedProjectId),
          fileName: resourceLinkName,
          fileUrl: resourceLinkUrl,
          description: fileDesc,
          resourceType: 'LINK'
        });
      }
      setShowFileModal(false);
      setSelectedFile(null);
      setFileDesc('');
      setResourceLinkName('');
      setResourceLinkUrl('');
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteResource(resId) {
    if (!window.confirm('Delete this file/resource?')) return;
    try {
      await deleteProjectResource(resId);
      loadProjectData(selectedProjectId);
    } catch (err) {
      alert(err.message);
    }
  }

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="collab-container">
      <div className="page-header">
        <div>
          <h2>Tasks & Project Progress</h2>
          <p>Assign tasks, track team velocity, and share project resources.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            style={{
              padding: '10px 16px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '14px',
              background: '#fff'
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button className="primary" onClick={() => setShowTaskModal(true)}>
            + Add Task
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Project Progress Overview */}
      {progress && (
        <div className="progress-card">
          <div className="progress-header">
            <div className="progress-title-area">
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{progress.projectTitle}</h3>
              <span className={`health-badge health-${(progress.healthStatus || 'on_track').toLowerCase()}`}>
                {progress.healthStatus}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRecalculateProgress}
                style={{
                  padding: '6px 12px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ↻ Sync Progress
              </button>
              <button
                onClick={() => setShowProgressModal(true)}
                style={{
                  padding: '6px 12px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ✏ Adjust %
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
            <span>Overall Completion</span>
            <span style={{ fontWeight: 700, color: '#315bea' }}>{progress.overallProgress}%</span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress.overallProgress || 0}%` }} />
          </div>

          <div className="progress-stats-grid">
            <div className="stat-item">
              <span>Total Tasks</span>
              <b>{progress.totalTasks}</b>
            </div>
            <div className="stat-item">
              <span>Completed</span>
              <b style={{ color: '#16a34a' }}>{progress.completedTasks}</b>
            </div>
            <div className="stat-item">
              <span>In Progress</span>
              <b style={{ color: '#ca8a04' }}>{progress.inProgressTasks}</b>
            </div>
            <div className="stat-item">
              <span>To Do</span>
              <b>{progress.todoTasks}</b>
            </div>
            <div className="stat-item">
              <span>Delayed / Overdue</span>
              <b style={{ color: progress.delayedTasks > 0 ? '#dc2626' : '#64748b' }}>{progress.delayedTasks}</b>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="collab-tabs">
        <button
          className={`collab-tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          📋 Task Kanban Board
        </button>
        <button
          className={`collab-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 Files & Shared Resources ({resources.length})
        </button>
      </div>

      {/* Kanban View */}
      {activeTab === 'kanban' && (
        <div className="kanban-board">
          {/* TODO Column */}
          <div className="kanban-column">
            <div className="column-header">
              <h4>To Do</h4>
              <span className="column-badge">{todoTasks.length}</span>
            </div>
            {todoTasks.map(t => (
              <div key={t.id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 className="task-card-title">{t.title}</h5>
                  <button
                    onClick={(e) => handleDeleteTask(t.id, e)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
                {t.description && <p className="task-card-desc">{t.description}</p>}
                <div className="task-card-footer">
                  <span className="task-assignee">{t.assigneeName || 'Unassigned'}</span>
                  {t.isOverdue && <span className="task-overdue">Overdue</span>}
                </div>
                <button
                  onClick={() => handleQuickStatusChange(t.id, 'IN_PROGRESS')}
                  style={{
                    marginTop: '6px',
                    padding: '6px',
                    background: '#eef2ff',
                    color: '#315bea',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Start Task →
                </button>
              </div>
            ))}
          </div>

          {/* IN PROGRESS Column */}
          <div className="kanban-column">
            <div className="column-header">
              <h4>In Progress</h4>
              <span className="column-badge">{inProgressTasks.length}</span>
            </div>
            {inProgressTasks.map(t => (
              <div key={t.id} className="task-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 className="task-card-title">{t.title}</h5>
                  <button
                    onClick={(e) => handleDeleteTask(t.id, e)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ✕
                  </button>
                </div>
                {t.description && <p className="task-card-desc">{t.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: 700 }}>{t.progress || 50}%</span>
                </div>
                <div className="task-card-footer">
                  <span className="task-assignee">{t.assigneeName || 'Unassigned'}</span>
                  {t.isOverdue && <span className="task-overdue">Overdue</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    onClick={() => handleQuickStatusChange(t.id, 'TODO')}
                    style={{ flex: 1, padding: '6px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ← To Do
                  </button>
                  <button
                    onClick={() => handleQuickStatusChange(t.id, 'COMPLETED')}
                    style={{ flex: 1, padding: '6px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Complete ✓
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COMPLETED Column */}
          <div className="kanban-column">
            <div className="column-header">
              <h4>Completed</h4>
              <span className="column-badge">{completedTasks.length}</span>
            </div>
            {completedTasks.map(t => (
              <div key={t.id} className="task-card" style={{ opacity: 0.9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 className="task-card-title" style={{ textDecoration: 'line-through', color: '#64748b' }}>{t.title}</h5>
                  <button
                    onClick={(e) => handleDeleteTask(t.id, e)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ✕
                  </button>
                </div>
                {t.description && <p className="task-card-desc">{t.description}</p>}
                <div className="task-card-footer">
                  <span className="task-assignee">{t.assigneeName || 'Team'}</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>100% Done</span>
                </div>
                <button
                  onClick={() => handleQuickStatusChange(t.id, 'IN_PROGRESS')}
                  style={{
                    marginTop: '6px',
                    padding: '6px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  ↩ Reopen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files & Resources View */}
      {activeTab === 'files' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Project Artifacts & Shared Files</h3>
            <button className="primary" onClick={() => setShowFileModal(true)}>
              + Upload / Share Resource
            </button>
          </div>

          {resources.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No resources shared yet</h3>
              <p>Upload architecture diagrams, code repos, documentation, or links for your team.</p>
            </div>
          ) : (
            <div className="file-card-list">
              {resources.map(r => (
                <div key={r.id} className="file-item-card">
                  <div className="file-info">
                    <div className="file-type-icon">
                      {r.resourceType === 'CODE' ? '</>' : r.resourceType === 'LINK' ? '🔗' : r.resourceType === 'DIAGRAM' ? '📐' : '📄'}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a' }}>{r.fileName}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Shared by {r.uploaderName} • {r.resourceType}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {r.downloadUrl && (
                      <a
                        href={r.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '6px 12px',
                          background: '#eef2ff',
                          color: '#315bea',
                          borderRadius: '6px',
                          fontSize: '12px',
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        {r.resourceType === 'LINK' ? 'Open ↗' : 'Download ↓'}
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteResource(r.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="collab-modal-overlay">
          <div className="collab-modal-content">
            <h3 style={{ margin: 0 }}>Create New Project Task</h3>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement OAuth login flow"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows="3"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detailed task specifications and requirements..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Assignee User ID</label>
                  <input
                    type="number"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="e.g. 1, 2, 3"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Override Modal */}
      {showProgressModal && (
        <div className="collab-modal-overlay">
          <div className="collab-modal-content">
            <h3 style={{ margin: 0 }}>Adjust Overall Project Progress</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Override current calculated progress with custom milestone completion percentage.
            </p>
            <form onSubmit={handleManualProgressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Completion</span>
                  <b>{manualProgressVal}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={manualProgressVal}
                  onChange={(e) => setManualProgressVal(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File / Resource Modal */}
      {showFileModal && (
        <div className="collab-modal-overlay">
          <div className="collab-modal-content">
            <h3 style={{ margin: 0 }}>Share Project Resource</h3>
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <button
                type="button"
                className={`collab-tab-btn ${uploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMode('file')}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`collab-tab-btn ${uploadMode === 'link' ? 'active' : ''}`}
                onClick={() => setUploadMode('link')}
              >
                External Link (GitHub/Figma)
              </button>
            </div>

            <form onSubmit={handleFileUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {uploadMode === 'file' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Select File *</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ width: '100%' }}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Link Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GitHub Repository, Figma Mockup"
                      value={resourceLinkName}
                      onChange={(e) => setResourceLinkName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/..."
                      value={resourceLinkUrl}
                      onChange={(e) => setResourceLinkUrl(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Description / Notes</label>
                <input
                  type="text"
                  placeholder="Optional brief notes..."
                  value={fileDesc}
                  onChange={(e) => setFileDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Share Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
