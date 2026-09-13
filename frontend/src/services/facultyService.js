import { authFetch } from './adminService';

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

// 4. Give Mentorship Feedback
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

// 5. Academic Rubric Evaluation
export async function submitProjectEvaluation(projectId, evaluationData) {
  return authFetch(`/api/faculty/projects/${projectId}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(evaluationData),
  });
}

export async function fetchProjectEvaluations(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}/evaluations`);
}

// 6. Project Status Approval / Sign-off
export async function submitProjectApproval(projectId, approvalData) {
  return authFetch(`/api/faculty/projects/${projectId}/approval`, {
    method: 'POST',
    body: JSON.stringify(approvalData),
  });
}

export async function fetchProjectApprovals(projectId) {
  return authFetch(`/api/faculty/projects/${projectId}/approval`);
}
