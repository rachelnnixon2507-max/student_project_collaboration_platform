import { getToken, getUser } from './adminService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const MOCK_STORAGE_KEY = 'platform_member1_mock_data_v1';

function getInitialMockState() {
  const user = getUser();
  const currentUserId = user?.id || 1;
  const currentUserName = user?.name || 'Alex Chen';
  const currentUserEmail = user?.email || 'alex@college.edu';

  return {
    projects: [
      {
        id: 1,
        title: 'Smart Campus IoT Energy Monitor',
        description: 'Building an embedded sensor network and real-time dashboard to monitor building energy consumption, solar panel yields, and peak load distributions across campus.',
        requiredSkills: 'React, Spring Boot, MQTT, Embedded C',
        status: 'OPEN',
        createdBy: currentUserId,
        creatorName: currentUserName,
        creatorEmail: currentUserEmail,
        createdAt: '2026-09-01T10:00:00',
        updatedAt: '2026-09-01T10:00:00',
        memberCount: 2,
        members: [
          {
            id: 101,
            projectId: 1,
            studentId: currentUserId,
            studentName: currentUserName,
            studentEmail: currentUserEmail,
            department: 'CSE',
            skills: 'React, Spring Boot',
            role: 'LEADER',
            joinedAt: '2026-09-01T10:00:00',
          },
          {
            id: 102,
            projectId: 1,
            studentId: 2,
            studentName: 'Rahul Krishnan',
            studentEmail: 'rahul@college.edu',
            department: 'ECE',
            skills: 'Embedded C, Arduino, MQTT',
            role: 'MEMBER',
            joinedAt: '2026-09-02T14:30:00',
          },
        ],
      },
      {
        id: 2,
        title: 'AI Study Planner & Notes Synthesizer',
        description: 'Generative AI web platform that breaks down lecture recordings and syllabus PDFs into personalized daily revision sprints with quiz generation.',
        requiredSkills: 'Python, FastAPI, PyTorch, React, Tailwind',
        status: 'OPEN',
        createdBy: 3,
        creatorName: 'Priya Sharma',
        creatorEmail: 'priya@college.edu',
        createdAt: '2026-09-03T11:15:00',
        updatedAt: '2026-09-03T11:15:00',
        memberCount: 2,
        members: [
          {
            id: 201,
            projectId: 2,
            studentId: 3,
            studentName: 'Priya Sharma',
            studentEmail: 'priya@college.edu',
            department: 'IT',
            skills: 'Python, PyTorch, LLMs',
            role: 'LEADER',
            joinedAt: '2026-09-03T11:15:00',
          },
          {
            id: 202,
            projectId: 2,
            studentId: currentUserId,
            studentName: currentUserName,
            studentEmail: currentUserEmail,
            department: 'CSE',
            skills: 'React, Vite',
            role: 'MEMBER',
            joinedAt: '2026-09-04T09:20:00',
          },
        ],
      },
      {
        id: 3,
        title: 'Autonomous Delivery Drone Navigation',
        description: 'Obstacle avoidance, visual SLAM, and path planning algorithms for small autonomous delivery drones across university campus paths.',
        requiredSkills: 'ROS2, C++, OpenCV, Gazebo, Python',
        status: 'IN_PROGRESS',
        createdBy: 4,
        creatorName: 'Arjun Das',
        creatorEmail: 'arjun@college.edu',
        createdAt: '2026-08-25T16:00:00',
        updatedAt: '2026-08-25T16:00:00',
        memberCount: 3,
        members: [
          {
            id: 301,
            projectId: 3,
            studentId: 4,
            studentName: 'Arjun Das',
            studentEmail: 'arjun@college.edu',
            department: 'Robotics',
            skills: 'ROS2, C++, SLAM',
            role: 'LEADER',
            joinedAt: '2026-08-25T16:00:00',
          },
        ],
      },
      {
        id: 4,
        title: 'Decentralized Academic Credential Verification',
        description: 'Tamper-proof verifiable diplomas and project achievement micro-credentials using smart contracts with zero-knowledge proof verification.',
        requiredSkills: 'Solidity, Web3.js, Node.js, Cryptography',
        status: 'COMPLETED',
        createdBy: 5,
        creatorName: 'Dr. Meera Nair',
        creatorEmail: 'meera@college.edu',
        createdAt: '2026-08-10T09:30:00',
        updatedAt: '2026-08-28T17:00:00',
        memberCount: 4,
        members: [
          {
            id: 401,
            projectId: 4,
            studentId: 5,
            studentName: 'Dr. Meera Nair',
            studentEmail: 'meera@college.edu',
            department: 'CSE',
            skills: 'Blockchain, Cryptography',
            role: 'LEADER',
            joinedAt: '2026-08-10T09:30:00',
          },
        ],
      },
    ],
    joinRequests: [
      {
        id: 1,
        projectId: 1,
        projectTitle: 'Smart Campus IoT Energy Monitor',
        studentId: 6,
        studentName: 'Sneha Patel',
        studentEmail: 'sneha@college.edu',
        department: 'ECE',
        skills: 'PCB Design, C, LoRaWAN',
        message: 'Hi Alex! I have experience deploying LoRaWAN node sensors and would love to help calibrate the energy sensors.',
        status: 'PENDING',
        createdAt: '2026-09-06T14:10:00',
        respondedAt: null,
      },
    ],
    notifications: [
      {
        id: 1,
        userId: currentUserId,
        title: 'New Team Join Request',
        message: 'Sneha Patel has requested to join your project "Smart Campus IoT Energy Monitor".',
        type: 'JOIN_REQUEST',
        isRead: false,
        referenceId: 1,
        referenceType: 'PROJECT',
        createdAt: '2026-09-06T14:10:00',
      },
      {
        id: 2,
        userId: currentUserId,
        title: 'Join Request Accepted!',
        message: 'Congratulations! You were accepted into the team for "AI Study Planner & Notes Synthesizer".',
        type: 'JOIN_ACCEPTED',
        isRead: false,
        referenceId: 2,
        referenceType: 'PROJECT',
        createdAt: '2026-09-04T09:20:00',
      },
      {
        id: 3,
        userId: currentUserId,
        title: 'Platform Notification',
        message: 'Welcome to the Student Project Collaboration Platform! Start by setting up your profile.',
        type: 'SYSTEM',
        isRead: true,
        referenceId: null,
        referenceType: null,
        createdAt: '2026-09-01T08:00:00',
      },
    ],
    profile: {
      id: 1,
      userId: currentUserId,
      name: currentUserName,
      email: currentUserEmail,
      department: 'Computer Science & Engineering',
      skills: 'React, Java, Spring Boot, MySQL, REST API, Git',
      bio: 'Third year Computer Science undergraduate passionate about building scalable web applications, real-time collaboration tools, and embedded IoT solutions.',
      githubUrl: 'https://github.com/alexchen-dev',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
      createdAt: '2026-09-01T08:00:00',
      updatedAt: '2026-09-06T19:00:00',
    },
  };
}

function getMockStore() {
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // fallback
    }
  }
  const initial = getInitialMockState();
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveMockStore(state) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

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
  } catch (err) {
    // If backend is unreachable, gracefully route through the local client store
    return handleOfflineMock(path, options);
  }
}

function handleOfflineMock(path, options) {
  const store = getMockStore();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const user = getUser();
  const currentUserId = user?.id || 1;
  const currentUserName = user?.name || 'Alex Chen';
  const currentUserEmail = user?.email || 'alex@college.edu';

  // 1. Projects
  if (path.startsWith('/api/projects?')) {
    const urlObj = new URL(`http://localhost${path}`);
    const keyword = (urlObj.searchParams.get('keyword') || '').toLowerCase();
    const skill = (urlObj.searchParams.get('skill') || '').toLowerCase();
    const status = urlObj.searchParams.get('status');

    let filtered = store.projects.filter((p) => {
      if (status && p.status !== status) return false;
      if (keyword && !p.title.toLowerCase().includes(keyword) && !p.description.toLowerCase().includes(keyword)) return false;
      if (skill && (!p.requiredSkills || !p.requiredSkills.toLowerCase().includes(skill))) return false;
      return true;
    });

    return {
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      size: filtered.length,
      number: 0,
    };
  }

  if (path === '/api/projects' && method === 'POST') {
    const newProj = {
      id: Date.now(),
      title: body.title,
      description: body.description || '',
      requiredSkills: body.requiredSkills || '',
      status: body.status || 'OPEN',
      createdBy: currentUserId,
      creatorName: currentUserName,
      creatorEmail: currentUserEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1,
      members: [
        {
          id: Date.now() + 1,
          projectId: Date.now(),
          studentId: currentUserId,
          studentName: currentUserName,
          studentEmail: currentUserEmail,
          department: store.profile?.department || 'CSE',
          skills: store.profile?.skills || '',
          role: 'LEADER',
          joinedAt: new Date().toISOString(),
        },
      ],
      isCurrentUserLeader: true,
      isCurrentUserMember: true,
      currentUserJoinRequestStatus: null,
      currentUserJoinRequestId: null,
    };
    store.projects.unshift(newProj);
    saveMockStore(store);
    return newProj;
  }

  if (path.match(/^\/api\/projects\/\d+$/) && method === 'GET') {
    const id = Number(path.split('/')[3]);
    const proj = store.projects.find((p) => p.id === id);
    if (!proj) throw new Error('Project not found with id: ' + id);

    const isLeader = proj.createdBy === currentUserId || proj.members?.some(m => m.studentId === currentUserId && m.role === 'LEADER');
    const isMember = proj.members?.some(m => m.studentId === currentUserId);
    const activeReq = store.joinRequests.find(r => r.projectId === id && r.studentId === currentUserId && r.status === 'PENDING');

    return {
      ...proj,
      isCurrentUserLeader: Boolean(isLeader),
      isCurrentUserMember: Boolean(isMember),
      currentUserJoinRequestStatus: activeReq ? 'PENDING' : null,
      currentUserJoinRequestId: activeReq ? activeReq.id : null,
    };
  }

  if (path.match(/^\/api\/projects\/\d+$/) && method === 'PUT') {
    const id = Number(path.split('/')[3]);
    const proj = store.projects.find((p) => p.id === id);
    if (!proj) throw new Error('Project not found');
    if (body.title) proj.title = body.title;
    if (body.description !== undefined) proj.description = body.description;
    if (body.requiredSkills !== undefined) proj.requiredSkills = body.requiredSkills;
    if (body.status) proj.status = body.status;
    proj.updatedAt = new Date().toISOString();
    saveMockStore(store);
    return proj;
  }

  if (path.match(/^\/api\/projects\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/')[3]);
    store.projects = store.projects.filter((p) => p.id !== id);
    store.joinRequests = store.joinRequests.filter((r) => r.projectId !== id);
    saveMockStore(store);
    return null;
  }

  if (path === '/api/projects/my/created') {
    return store.projects.filter((p) => p.createdBy === currentUserId);
  }

  if (path === '/api/projects/my/joined') {
    return store.projects.filter((p) => p.members?.some((m) => m.studentId === currentUserId));
  }

  // 2. Join Requests
  if (path.match(/^\/api\/projects\/\d+\/join-requests$/) && method === 'POST') {
    const projectId = Number(path.split('/')[3]);
    const proj = store.projects.find((p) => p.id === projectId);
    const newReq = {
      id: Date.now(),
      projectId,
      projectTitle: proj?.title || 'Project',
      studentId: currentUserId,
      studentName: currentUserName,
      studentEmail: currentUserEmail,
      department: store.profile?.department || 'CSE',
      skills: store.profile?.skills || '',
      message: body.message || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };
    store.joinRequests.push(newReq);
    if (proj && proj.createdBy !== currentUserId) {
      store.notifications.unshift({
        id: Date.now() + 1,
        userId: proj.createdBy,
        title: 'New Team Join Request',
        message: `${currentUserName} requested to join project "${proj.title}".`,
        type: 'JOIN_REQUEST',
        isRead: false,
        referenceId: projectId,
        referenceType: 'PROJECT',
        createdAt: new Date().toISOString(),
      });
    }
    saveMockStore(store);
    return newReq;
  }

  if (path.match(/^\/api\/projects\/\d+\/join-requests$/) && method === 'GET') {
    const projectId = Number(path.split('/')[3]);
    return store.joinRequests.filter((r) => r.projectId === projectId);
  }

  if (path === '/api/projects/join-requests/me') {
    return store.joinRequests.filter((r) => r.studentId === currentUserId);
  }

  if (path.match(/^\/api\/projects\/\d+\/join-requests\/\d+$/) && method === 'PATCH') {
    const projectId = Number(path.split('/')[3]);
    const requestId = Number(path.split('/')[5]);
    const req = store.joinRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    req.status = body.status;
    req.respondedAt = new Date().toISOString();

    if (body.status === 'ACCEPTED') {
      const proj = store.projects.find((p) => p.id === projectId);
      if (proj && !proj.members.some(m => m.studentId === req.studentId)) {
        proj.members.push({
          id: Date.now(),
          projectId,
          studentId: req.studentId,
          studentName: req.studentName,
          studentEmail: req.studentEmail,
          department: req.department,
          skills: req.skills,
          role: 'MEMBER',
          joinedAt: new Date().toISOString(),
        });
        proj.memberCount = proj.members.length;
      }
      store.notifications.unshift({
        id: Date.now() + 1,
        userId: req.studentId,
        title: 'Join Request Accepted!',
        message: `Congratulations! Your request to join "${req.projectTitle}" was accepted.`,
        type: 'JOIN_ACCEPTED',
        isRead: false,
        referenceId: projectId,
        referenceType: 'PROJECT',
        createdAt: new Date().toISOString(),
      });
    }
    saveMockStore(store);
    return req;
  }

  if (path.match(/^\/api\/projects\/\d+\/join-requests\/\d+$/) && method === 'DELETE') {
    const requestId = Number(path.split('/')[5]);
    store.joinRequests = store.joinRequests.filter((r) => r.id !== requestId);
    saveMockStore(store);
    return null;
  }

  if (path.match(/^\/api\/projects\/\d+\/members\/\d+$/) && method === 'DELETE') {
    const projectId = Number(path.split('/')[3]);
    const studentId = Number(path.split('/')[5]);
    const proj = store.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.members = proj.members.filter((m) => m.studentId !== studentId);
      proj.memberCount = proj.members.length;
    }
    saveMockStore(store);
    return null;
  }

  // 3. Profile
  if (path === '/api/students/me' && method === 'GET') {
    return store.profile;
  }

  if (path === '/api/students/me' && method === 'PUT') {
    store.profile = {
      ...store.profile,
      department: body.department !== undefined ? body.department : store.profile.department,
      skills: body.skills !== undefined ? body.skills : store.profile.skills,
      bio: body.bio !== undefined ? body.bio : store.profile.bio,
      githubUrl: body.githubUrl !== undefined ? body.githubUrl : store.profile.githubUrl,
      linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : store.profile.linkedinUrl,
      updatedAt: new Date().toISOString(),
    };
    saveMockStore(store);
    return store.profile;
  }

  // 4. Notifications
  if (path.startsWith('/api/notifications?')) {
    return {
      content: store.notifications,
      totalElements: store.notifications.length,
      totalPages: 1,
      size: 20,
      number: 0,
    };
  }

  if (path === '/api/notifications/unread-count') {
    const count = store.notifications.filter((n) => !n.isRead).length;
    return { unreadCount: count };
  }

  if (path.match(/^\/api\/notifications\/\d+\/read$/) && method === 'PATCH') {
    const id = Number(path.split('/')[3]);
    const n = store.notifications.find((notif) => notif.id === id);
    if (n) n.isRead = true;
    saveMockStore(store);
    return n;
  }

  if (path === '/api/notifications/read-all') {
    store.notifications.forEach((n) => (n.isRead = true));
    saveMockStore(store);
    return null;
  }

  if (path.match(/^\/api\/notifications\/\d+$/) && method === 'DELETE') {
    const id = Number(path.split('/')[3]);
    store.notifications = store.notifications.filter((n) => n.id !== id);
    saveMockStore(store);
    return null;
  }

  return {};
}

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

export async function createProject({ title, description, requiredSkills, status = 'OPEN' }) {
  return authFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ title, description, requiredSkills, status }),
  });
}

export async function updateProject(id, { title, description, requiredSkills, status }) {
  return authFetch(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, requiredSkills, status }),
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
