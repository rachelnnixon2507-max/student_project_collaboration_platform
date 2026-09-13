import { authFetch } from './adminService';

/* =========================================================================
   1. STUDENT PROFILE APIs
   ========================================================================= */

export async function fetchMyProfile() {
  return authFetch('/api/students/me');
}

export async function updateMyProfile(profileData) {
  return authFetch('/api/students/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function fetchStudentProfile(userId) {
  return authFetch(`/api/students/${userId}`);
}

export async function searchStudents({ skill = '', department = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams();
  if (skill) params.append('skill', skill);
  if (department) params.append('department', department);
  params.append('page', page);
  params.append('size', size);
  return authFetch(`/api/students?${params.toString()}`);
}

/* =========================================================================
   2. PROJECTS APIs
   ========================================================================= */

export async function fetchProjects({ keyword = '', skill = '', status = '', page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (skill) params.append('skill', skill);
  if (status && status !== 'ALL') params.append('status', status);
  params.append('page', page);
  params.append('size', size);
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);
  return authFetch(`/api/projects?${params.toString()}`);
}

export async function fetchProjectById(id) {
  return authFetch(`/api/projects/${id}`);
}

export async function createProject({ title, description, requiredSkills, status = 'OPEN', maxMembers = 4 }) {
  return authFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      requiredSkills,
      status,
      maxMembers: Number(maxMembers) || 4,
    }),
  });
}

export async function updateProject(id, { title, description, requiredSkills, status, maxMembers }) {
  const body = { title, description, requiredSkills, status };
  if (maxMembers !== undefined) body.maxMembers = Number(maxMembers);
  return authFetch(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteProject(id) {
  return authFetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchMyCreatedProjects() {
  return authFetch('/api/projects/my/created');
}

export async function fetchMyJoinedProjects() {
  return authFetch('/api/projects/my/joined');
}

export async function fetchProjectMembers(projectId) {
  return authFetch(`/api/projects/${projectId}/members`);
}

export async function removeProjectMember(projectId, studentId) {
  return authFetch(`/api/projects/${projectId}/members/${studentId}`, {
    method: 'DELETE',
  });
}

/* =========================================================================
   3. TEAM JOIN REQUEST APIs
   ========================================================================= */

export async function sendJoinRequest(projectId, message = '') {
  return authFetch(`/api/projects/${projectId}/join-requests`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function fetchProjectJoinRequests(projectId) {
  return authFetch(`/api/projects/${projectId}/join-requests`);
}

export async function fetchMySentJoinRequests() {
  return authFetch('/api/projects/join-requests/me');
}

export async function respondToJoinRequest(projectId, requestId, status, note = '') {
  return authFetch(`/api/projects/${projectId}/join-requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

export async function cancelJoinRequest(projectId, requestId) {
  return authFetch(`/api/projects/${projectId}/join-requests/${requestId}`, {
    method: 'DELETE',
  });
}

/* =========================================================================
   4. NOTIFICATIONS APIs
   ========================================================================= */

export async function fetchNotifications(page = 0, size = 20) {
  return authFetch(`/api/notifications?page=${page}&size=${size}`);
}

export async function fetchUnreadNotificationCount() {
  return authFetch('/api/notifications/unread-count');
}

export async function markNotificationRead(id) {
  return authFetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead() {
  return authFetch('/api/notifications/read-all', {
    method: 'PATCH',
  });
}

export async function deleteNotification(id) {
  return authFetch(`/api/notifications/${id}`, {
    method: 'DELETE',
  });
}
