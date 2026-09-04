const TOKEN_KEY = 'admin_jwt_token';
const USER_KEY = 'admin_jwt_user';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  const token = getToken();
  const user = getUser();
  return Boolean(token && user && user.role === 'ADMIN');
}

async function authFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
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
    throw new Error('Cannot connect to Spring Boot backend at http://localhost:8080. Please ensure the backend is running.');
  }

  if (response.status === 401) {
    logoutAdmin();
    throw new Error('Session expired or unauthorized. Please log in again.');
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
    const errorMsg = body?.message || body?.error || `HTTP ${response.status} error`;
    throw new Error(errorMsg);
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }

  return body;
}

// 1. Real Admin Login using existing JWT auth
export async function loginAdmin(email, password) {
  const url = `${API_BASE}/api/auth/admin/login`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.message || body?.error || 'Login failed. Invalid credentials.');
    }

    const data = body.data || body;
    setAuth(data.token, data);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Load failed' || err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to Spring Boot backend at http://localhost:8080. Please start the backend process in terminal.');
    }
    throw err;
  }
}

// 4. Manage Students & Faculty
export async function fetchUsers(role) {
  const path = role ? `/api/admin/users?role=${role}` : `/api/admin/users`;
  return authFetch(path);
}

export async function updateUserStatus(userId, accountStatus) {
  return authFetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ accountStatus }),
  });
}

export async function updateUserRole(userId, role) {
  return authFetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId) {
  return authFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

// 5. Manage Projects
export async function fetchProjects(status) {
  const path = status ? `/api/admin/projects?status=${status}` : `/api/admin/projects`;
  return authFetch(path);
}

export async function updateProjectStatus(projectId, status, reason = '') {
  return authFetch(`/api/admin/projects/${projectId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}

export async function deleteProject(projectId) {
  return authFetch(`/api/admin/projects/${projectId}`, {
    method: 'DELETE',
  });
}

// 7. Platform Analytics
export async function fetchAnalyticsLive() {
  return authFetch('/api/analytics/live');
}

// 8. Announcements
export async function fetchAnnouncements() {
  return authFetch('/api/announcements');
}

export async function createAnnouncement({ title, content, scope = 'ALL', projectId = null }) {
  return authFetch('/api/announcements', {
    method: 'POST',
    body: JSON.stringify({ title, content, scope, projectId }),
  });
}

export async function deleteAnnouncement(announcementId) {
  return authFetch(`/api/announcements/${announcementId}`, {
    method: 'DELETE',
  });
}

// 9. Delayed / Inactive Projects
export async function fetchFlaggedProjects() {
  return authFetch('/api/admin/projects/health/flagged');
}

// 10. Rate & Review Team Members
export async function createTeamReview({ projectId, revieweeId, rating, comments }) {
  return authFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      projectId: Number(projectId),
      revieweeId: Number(revieweeId),
      rating: Number(rating),
      comments,
    }),
  });
}

export async function fetchReviewsForProject(projectId) {
  return authFetch(`/api/reviews/project/${projectId}`);
}

export async function fetchStudentRatingSummary(studentUserId) {
  return authFetch(`/api/reviews/student/${studentUserId}/summary`);
}
