import { authFetch } from './adminService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ----------------------------------------------------------------------
// 1. Task Creation & Assignment (Workspace Kanban)
// ----------------------------------------------------------------------

export async function fetchProjectTasks(projectId) {
  return authFetch(`/api/tasks/project/${projectId}`);
}

export async function fetchMyTasks() {
  return authFetch('/api/tasks/my-tasks');
}

export async function fetchTaskById(taskId) {
  return authFetch(`/api/tasks/${taskId}`);
}

export async function createTask(taskData) {
  return authFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(taskId, updateData) {
  return authFetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function updateTaskStatus(taskId, status, progress) {
  return authFetch(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, progress }),
  });
}

export async function assignTask(taskId, assignedTo) {
  return authFetch(`/api/tasks/${taskId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedTo }),
  });
}

export async function deleteTask(taskId) {
  return authFetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------------------
// 2. Project Progress Tracking
// ----------------------------------------------------------------------

export async function fetchProjectProgress(projectId) {
  return authFetch(`/api/projects/${projectId}/progress`);
}

export async function updateProjectProgress(projectId, overallProgress, reason = '') {
  return authFetch(`/api/projects/${projectId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ overallProgress, reason }),
  });
}

export async function recalculateProjectProgress(projectId) {
  return authFetch(`/api/projects/${projectId}/progress/recalculate`, {
    method: 'POST',
  });
}

// ----------------------------------------------------------------------
// 3. AI Smart Team Matching
// ----------------------------------------------------------------------

export async function fetchMatchingCandidatesForProject(projectId, limit = 10) {
  return authFetch(`/api/teams/match-candidates/${projectId}?limit=${limit}`);
}

export async function fetchMatchingProjectsForStudent(studentId = null, limit = 10) {
  const path = studentId ? `/api/teams/match-projects?studentId=${studentId}&limit=${limit}` : `/api/teams/match-projects?limit=${limit}`;
  return authFetch(path);
}

export async function matchCustomSkills(requiredSkills, department = '', maxResults = 10) {
  return authFetch('/api/teams/ai-match/custom', {
    method: 'POST',
    body: JSON.stringify({ requiredSkills, department, maxResults }),
  });
}

export async function inviteCandidateToProject(projectId, candidateStudentId, message = '') {
  return authFetch('/api/teams/invite-candidate', {
    method: 'POST',
    body: JSON.stringify({ projectId, candidateStudentId, message }),
  });
}

export async function respondToInvitation(projectId, notificationId, accept = true, message = '') {
  return authFetch('/api/teams/respond-invitation', {
    method: 'POST',
    body: JSON.stringify({ projectId, notificationId, accept, message }),
  });
}

// ----------------------------------------------------------------------
// 4. Team Chat & Direct Messaging
// ----------------------------------------------------------------------

export async function sendMessage({ projectId, receiverId, content, messageType = 'TEXT' }) {
  return authFetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ projectId, receiverId, content, messageType }),
  });
}

export async function fetchProjectMessages(projectId) {
  return authFetch(`/api/messages/project/${projectId}`);
}

export async function fetchDirectMessages(userId) {
  return authFetch(`/api/messages/direct/${userId}`);
}

export async function fetchActiveConversations() {
  return authFetch('/api/messages/conversations');
}

export async function markMessageAsRead(messageId) {
  return authFetch(`/api/messages/${messageId}/read`, {
    method: 'PATCH',
  });
}

// ----------------------------------------------------------------------
// 5. File & Resource Sharing
// ----------------------------------------------------------------------

export async function uploadProjectFile(projectId, file, description = '', resourceType = null) {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('file', file);
  if (description) formData.append('description', description);
  if (resourceType) formData.append('resourceType', resourceType);

  return authFetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function addResourceLink({ projectId, fileName, fileUrl, description, resourceType = 'LINK' }) {
  return authFetch('/api/files/resource', {
    method: 'POST',
    body: JSON.stringify({ projectId, fileName, fileUrl, description, resourceType }),
  });
}

export async function fetchProjectResources(projectId) {
  return authFetch(`/api/files/project/${projectId}`);
}

export async function deleteProjectResource(resourceId) {
  return authFetch(`/api/files/${resourceId}`, {
    method: 'DELETE',
  });
}

export function getFileDownloadUrl(resourceId) {
  return `${API_BASE}/api/files/download/${resourceId}`;
}
