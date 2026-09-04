export const initialAdminData = {
  users: [
    { id: 1, name: 'Ananya Menon', email: 'ananya@college.edu', role: 'STUDENT', department: 'CSE', status: 'ACTIVE' },
    { id: 2, name: 'Rahul Krishnan', email: 'rahul@college.edu', role: 'STUDENT', department: 'ECE', status: 'ACTIVE' },
    { id: 3, name: 'Dr. Meera Nair', email: 'meera@college.edu', role: 'FACULTY', department: 'CSE', status: 'ACTIVE' },
    { id: 4, name: 'Arjun Das', email: 'arjun@college.edu', role: 'STUDENT', department: 'IT', status: 'ACTIVE' },
    { id: 5, name: 'Dr. Joseph Mathew', email: 'joseph@college.edu', role: 'FACULTY', department: 'ECE', status: 'ACTIVE' },
  ],
  projects: [
    { id: 101, title: 'Campus Smart Parking', owner: 'Ananya Menon', status: 'IN_PROGRESS', members: 4, progress: 68, updatedAt: '2026-08-25T10:30:00' },
    { id: 102, title: 'AI Study Planner', owner: 'Rahul Krishnan', status: 'OPEN', members: 2, progress: 25, updatedAt: '2026-09-02T14:00:00' },
    { id: 103, title: 'IoT Lab Monitor', owner: 'Arjun Das', status: 'IN_PROGRESS', members: 3, progress: 42, updatedAt: '2026-08-10T09:00:00' },
    { id: 104, title: 'Student Event Hub', owner: 'Ananya Menon', status: 'COMPLETED', members: 5, progress: 100, updatedAt: '2026-08-29T16:30:00' },
  ],
  tasks: [
    { id: 1, projectId: 101, status: 'COMPLETED', dueDate: '2026-08-20' },
    { id: 2, projectId: 101, status: 'IN_PROGRESS', dueDate: '2026-09-08' },
    { id: 3, projectId: 103, status: 'TODO', dueDate: '2026-08-22' },
    { id: 4, projectId: 103, status: 'IN_PROGRESS', dueDate: '2026-08-30' },
    { id: 5, projectId: 104, status: 'COMPLETED', dueDate: '2026-08-28' },
  ],
  reviews: [
    { id: 1, projectId: 101, member: 'Rahul Krishnan', reviewer: 'Ananya Menon', rating: 4, comment: 'Strong technical contribution and consistent communication.', createdAt: '2026-08-30T11:20:00' },
    { id: 2, projectId: 104, member: 'Arjun Das', reviewer: 'Ananya Menon', rating: 5, comment: 'Excellent ownership of the backend integration.', createdAt: '2026-08-29T18:00:00' },
  ],
  announcements: [
    { id: 1, title: 'Project evaluation week', audience: 'ALL', message: 'Faculty evaluations will open next Monday.', createdAt: '2026-09-01T10:00:00' },
  ],
};
