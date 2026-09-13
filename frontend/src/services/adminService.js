const TOKEN_KEY = 'collabnexus_jwt_token';
const USER_KEY = 'collabnexus_jwt_user';
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

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logoutAdmin() {
  clearAuth();
}

export function isAuthenticated() {
  const token = getToken();
  const user = getUser();
  return Boolean(token && user);
}

export function isAdminAuthenticated() {
  const token = getToken();
  const user = getUser();
  return Boolean(token && user && user.role === 'ADMIN');
}

export function isFacultyAuthenticated() {
  const token = getToken();
  const user = getUser();
  return Boolean(token && user && user.role === 'FACULTY');
}

export function isStudentAuthenticated() {
  const token = getToken();
  const user = getUser();
  return Boolean(token && user && user.role === 'STUDENT');
}

export async function authFetch(path, options = {}) {
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
    throw new Error('Unable to connect to CollabNexus server at http://localhost:8080. Please ensure the backend is running.');
  }

  if (response.status === 401) {
    clearAuth();
    throw new Error('Session expired or invalid credentials. Please sign in again.');
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

// 1. Admin Status Check
export async function fetchAdminStatus() {
  const url = `${API_BASE}/api/auth/admin/status`;
  const res = await fetch(url);
  const body = await res.json();
  return body.data || body;
}

// 2. First-Time Admin Setup
export async function setupAdmin({ name, email, password, confirmPassword }) {
  const url = `${API_BASE}/api/auth/admin/setup`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Admin setup failed.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

// 3. Login (Dual ID/Email Support)
export async function loginUser(emailOrId, password) {
  const url = `${API_BASE}/api/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailOrId, password }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Invalid credentials. Please check your Institutional ID or Email and Password.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

export async function loginStudent(emailOrId, password) {
  const url = `${API_BASE}/api/auth/student/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailOrId, password }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Student login failed. Invalid Institutional ID / Email or Password.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

export async function loginFaculty(emailOrId, password) {
  const url = `${API_BASE}/api/auth/faculty/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailOrId, password }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Faculty login failed. Invalid Institutional ID / Email or Password.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

export async function loginAdmin(emailOrId, password) {
  const url = `${API_BASE}/api/auth/admin/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailOrId, password }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Admin login failed. Invalid credentials or insufficient permissions.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

// 4. Student Registration
export async function registerStudent(studentData) {
  const url = `${API_BASE}/api/auth/register/student`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Student registration failed.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

// 5. Faculty Registration
export async function registerFaculty(facultyData) {
  const url = `${API_BASE}/api/auth/register/faculty`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(facultyData),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error || 'Faculty registration failed.');
  }
  const data = body.data || body;
  setAuth(data.token, data);
  return data;
}

// 6. User Management (Admin)
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

// 7. Roles & Permissions
export async function fetchRolePermissions() {
  return authFetch('/api/admin/roles/permissions');
}

export async function updateRolePermissions(role, permissions) {
  return authFetch(`/api/admin/roles/${role}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
}

// 8. Manage Projects (Admin)
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

// 9. Platform Live Analytics
export async function fetchAnalyticsLive() {
  return authFetch('/api/analytics/live');
}

// 10. Announcements
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

// 11. Delayed / Flagged Projects
export async function fetchFlaggedProjects() {
  return authFetch('/api/admin/projects/health/flagged');
}

// 12. Peer Reviews
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
