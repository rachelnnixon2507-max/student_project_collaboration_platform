import { getToken, getUser } from './adminService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error('Cannot connect to backend API at http://localhost:8080. Please ensure backend is running.');
  }

  if (response.status === 204) {
    return true;
  }

  const contentType = response.headers.get('content-type');
  let body = null;
  if (contentType && contentType.includes('application/json')) {
    body = await response.json();
  }

  if (!response.ok) {
    const errorMsg = body?.message || body?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }

  return body;
}

// ----------------------------------------------------------------------
// 1. Task Creation & Assignment
// ----------------------------------------------------------------------

export async function fetchProjectTasks(projectId) {
  return request(`/api/tasks/project/${projectId}`);
}

export async function fetchMyTasks() {
  return request('/api/tasks/my-tasks');
}

export async function fetchTaskById(taskId) {
  return request(`/api/tasks/${taskId}`);
}

export async function createTask(taskData) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(taskId, updateData) {
  return request(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

export async function updateTaskStatus(taskId, status, progress) {
  return request(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, progress }),
  });
}

export async function assignTask(taskId, assignedTo) {
  return request(`/api/tasks/${taskId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedTo }),
  });
}

export async function deleteTask(taskId) {
  return request(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------------------
// 2. Project Progress Tracking
// ----------------------------------------------------------------------

export async function fetchProjectProgress(projectId) {
  return request(`/api/projects/${projectId}/progress`);
}

export async function updateProjectProgress(projectId, overallProgress, reason = '') {
  return request(`/api/projects/${projectId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ overallProgress, reason }),
  });
}

export async function recalculateProjectProgress(projectId) {
  return request(`/api/projects/${projectId}/progress/recalculate`, {
    method: 'POST',
  });
}

// ----------------------------------------------------------------------
// 3. AI Smart Team Matching
// ----------------------------------------------------------------------

export async function fetchMatchingCandidatesForProject(projectId, limit = 10) {
  return request(`/api/teams/match-candidates/${projectId}?limit=${limit}`);
}

export async function fetchMatchingProjectsForStudent(studentId = null, limit = 10) {
  const path = studentId ? `/api/teams/match-projects?studentId=${studentId}&limit=${limit}` : `/api/teams/match-projects?limit=${limit}`;
  return request(path);
}

export async function matchCustomSkills(requiredSkills, department = '', maxResults = 10) {
  return request('/api/teams/ai-match/custom', {
    method: 'POST',
    body: JSON.stringify({ requiredSkills, department, maxResults }),
  });
}

// ----------------------------------------------------------------------
// 4. Team Chat & Direct Messaging
// ----------------------------------------------------------------------

export async function sendMessage({ projectId, receiverId, content, messageType = 'TEXT' }) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ projectId, receiverId, content, messageType }),
  });
}

export async function fetchProjectMessages(projectId) {
  return request(`/api/messages/project/${projectId}`);
}

export async function fetchDirectMessages(userId) {
  return request(`/api/messages/direct/${userId}`);
}

export async function fetchActiveConversations() {
  return request('/api/messages/conversations');
}

export async function markMessageAsRead(messageId) {
  return request(`/api/messages/${messageId}/read`, {
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

  return request('/api/files/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function addResourceLink({ projectId, fileName, fileUrl, description, resourceType = 'LINK' }) {
  return request('/api/files/resource', {
    method: 'POST',
    body: JSON.stringify({ projectId, fileName, fileUrl, description, resourceType }),
  });
}

export async function fetchProjectResources(projectId) {
  return request(`/api/files/project/${projectId}`);
}

export async function deleteProjectResource(resourceId) {
  return request(`/api/files/${resourceId}`, {
    method: 'DELETE',
  });
}

export function getFileDownloadUrl(resourceId) {
  return `${API_BASE}/api/files/download/${resourceId}`;
}
