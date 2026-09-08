import { getToken, getUser } from './adminService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function authFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !token.startsWith('mock-')) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Access Denied (403): You must be logged in with a Faculty account (e.g. meera@college.edu / Faculty@123) to perform this action.");
    }
    if (response.status === 401) {
      throw new Error("Authentication Required (401): Please log in with a valid faculty account.");
    }
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data?.data !== undefined ? data.data : data;
}

// 1. Faculty Profile
export async function fetchMyFacultyProfile() {
  return authFetch('/api/faculty/me');
}

export async function updateFacultyProfile(profileData) {
  return authFetch('/api/faculty/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function fetchFacultyProfileByUserId(userId) {
  return authFetch(`/api/faculty/profile/${userId}`);
}

export async function fetchFacultyDirectory() {
  return authFetch('/api/faculty');
}

// 2. Browse Student Projects
export async function browseFacultyProjects({ keyword = '', skill = '', status = '', page = 0, size = 12 } = {}) {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (skill) params.append('skill', skill);
  if (status) params.append('status', status);
  params.append('page', page);
  params.append('size', size);

  return authFetch(`/api/faculty/projects?${params.toString()}`);
}

export async function fetchFacultyProjectDetails(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}`);
}

// 3. Monitor Project Progress
export async function fetchFacultyProjectProgress(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}/progress`);
}

// 4. Give Feedback
export async function submitFacultyFeedback(projectId, feedbackData) {
  return authFetch(`/api/faculty/projects/${projectId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
}

export async function fetchProjectFeedbacks(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}/feedback`);
}

export async function deleteFacultyFeedback(feedbackId) {
  return authFetch(`/api/faculty/feedback/${feedbackId}`, {
    method: 'DELETE',
  });
}

// 5. Evaluate / Approve Projects
export async function submitProjectEvaluation(projectId, evaluationData) {
  return authFetch(`/api/faculty/projects/${projectId}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(evaluationData),
  });
}

export async function fetchProjectEvaluations(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}/evaluations`);
}

export async function submitProjectApproval(projectId, approvalData) {
  return authFetch(`/api/faculty/projects/${projectId}/approval`, {
    method: 'POST',
    body: JSON.stringify(approvalData),
  });
}

export async function fetchProjectApprovals(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}/approval`);
}
