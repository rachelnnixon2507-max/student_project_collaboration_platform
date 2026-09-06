# Member 4 Module — Admin & System

Student Project Collaboration Platform — Full-stack module (Spring Boot backend & React Vite frontend) implementing:

1. **Manage Students & Faculty**: View list, view details, suspend/activate accounts, delete user records.
2. **Manage Projects**: View all projects, inspect details, force update project status (e.g. IN_PROGRESS, COMPLETED, ARCHIVED), delete projects.
3. **Manage Roles & Permissions**: Dynamic permission matrix for roles (STUDENT, FACULTY, ADMIN), assign user roles, update role permissions.
4. **Platform Analytics**: Real-time metrics (active users, total projects, completed tasks, review averages) and snapshot history.
5. **Send Announcements**: System-wide notifications broadcasted by scope (ALL, STUDENTS, FACULTY, PROJECT) or target project.
6. **Detect Delayed/Inactive Projects**: Flag projects with overdue tasks or inactive periods to trigger admin interventions.
7. **Rate & Review Team Members**: Peer reviews and ratings for team collaboration with computed user score summaries.

> **IMPORTANT — read before merging into the shared repo:** this module was
> built **standalone**, without access to the team's actual shared codebase
> (no repo was provided to inspect). To keep it compilable and runnable on
> its own, it includes placeholder versions of entities/tables owned by
> other members (`User`, `StudentProfile`, `FacultyProfile`, `Project`,
> `ProjectMember`, `Task`, `ProjectProgress`). **Per team rule #8, these must
> NOT be merged in as-is if equivalents already exist.** See "Integration
> steps" below.

---

## 1. Prerequisites & Prerequisites Setup

- **Java JDK**: Version 17 (Required by Spring Boot 3.3.x)
- **Apache Maven**: Version 3.8+
- **Node.js**: Version 18+ & npm
- **Database**: MySQL 8.x (configured in `application.yml` or using H2/MySQL dev database)

### Java 17 Setup (macOS)
If your system defaults to Java 25 or Java 26, switch `JAVA_HOME` to Java 17 before building:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version  # Should display 17.x
```

---

## 2. Quick Start Guide

### Running Backend (Spring Boot)
```bash
cd backend
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
mvn clean spring-boot:run
```
Backend server will start at: `http://localhost:8080`

### Running Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will start at: `http://localhost:5173`

---

## 3. Directory & File Structure

```
.
├── pom.xml                                 # Root Maven parent POM
├── backend/
│   ├── pom.xml                             # Backend Maven configuration
│   └── src/main/java/com/project/platform/
│       ├── PlatformApplication.java        # Main Spring Boot entry point
│       ├── config/                         # SecurityConfig, CorsConfig
│       ├── controller/                     # REST API Controllers
│       │   ├── AdminUserController.java
│       │   ├── AdminProjectController.java
│       │   ├── AnalyticsController.java
│       │   ├── AnnouncementController.java
│       │   ├── AuthController.java
│       │   ├── ProjectHealthController.java
│       │   ├── RolePermissionController.java
│       │   └── TeamMemberReviewController.java
│       ├── dto/                            # Request & Response DTOs
│       ├── entity/                         # Domain Entities & Enums
│       ├── exception/                      # Exception Handling & Error responses
│       ├── repository/                     # Spring Data JPA Repositories
│       ├── security/                       # JWT Utils, UserDetailsService, Auth Filters
│       ├── service/                        # Business Logic Interfaces & Implementations
│       └── util/                           # Utilities & Seeders
└── frontend/                               # React + Vite UI
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/                     # Reusable UI components & layouts
        ├── pages/                          # Admin Dashboard, Login, Management Views
        └── services/                       # Axios API client setup & endpoint calls
```

---

## 4. Database Schema

### Module-Owned Tables (Safe to add directly)
- `announcements` — System and project announcements
- `platform_analytics` — Historical analytics snapshots
- `team_member_reviews` — Peer reviews and star ratings
- `role_permissions` — Dynamic permissions matrix for roles

### Placeholder Tables (Required for standalone execution)
- `users` (includes `account_status` column)
- `student_profiles`, `faculty_profiles`, `projects`, `project_members`, `tasks`, `project_progress`

---

## 5. API Endpoints Reference

### Authentication & Setup
| Method | Endpoint | Feature | Access |
|---|---|---|---|
| GET | `/api/auth/admin/status` | Check if initial admin account exists | Public |
| POST | `/api/auth/admin/setup` | Create initial admin account | Public (First time) |
| POST | `/api/auth/login` | General login | Public |
| POST | `/api/auth/admin/login` | Admin dedicated login | Public |
| POST | `/api/auth/student/login` | Student dedicated login | Public |
| POST | `/api/auth/faculty/login` | Faculty dedicated login | Public |
| POST | `/api/auth/register/student` | Register student profile | Public |
| POST | `/api/auth/register/faculty` | Register faculty profile | Public |

### User Management & Roles (Features 1 & 3)
| Method | Endpoint | Feature | Access |
|---|---|---|---|
| GET | `/api/admin/users` | List all users (paginated) | ADMIN |
| GET | `/api/admin/users/students` | List student profiles | ADMIN |
| GET | `/api/admin/users/faculty` | List faculty profiles | ADMIN |
| GET | `/api/admin/users/{userId}` | Get single user details | ADMIN |
| PATCH | `/api/admin/users/{userId}/status` | Update account status (ACTIVE/SUSPENDED) | ADMIN |
| PATCH | `/api/admin/users/{userId}/role` | Update user role | ADMIN |
| DELETE | `/api/admin/users/{userId}` | Delete user record | ADMIN |
| GET | `/api/admin/roles/permissions` | Get all role permission mappings | ADMIN |
| GET | `/api/admin/roles/{role}/permissions` | Get permissions for specific role | ADMIN |
| PUT | `/api/admin/roles/{role}/permissions` | Update permission list for a role | ADMIN |

### Project Management & Health (Features 2 & 6)
| Method | Endpoint | Feature | Access |
|---|---|---|---|
| GET | `/api/admin/projects` | List all projects | ADMIN |
| GET | `/api/admin/projects/{projectId}` | Get project details | ADMIN |
| PATCH | `/api/admin/projects/{projectId}/status` | Force update project status | ADMIN |
| DELETE | `/api/admin/projects/{projectId}` | Delete project | ADMIN |
| GET | `/api/admin/projects/health/flagged` | Get delayed or inactive projects | ADMIN |

### Platform Analytics (Feature 4)
| Method | Endpoint | Feature | Access |
|---|---|---|---|
| GET | `/api/analytics/live` | Get live real-time platform metrics | ADMIN |
| POST | `/api/analytics/snapshot` | Trigger historical analytics snapshot | ADMIN |
| GET | `/api/analytics/snapshot/latest` | Retrieve latest analytics snapshot | ADMIN |

### System Announcements (Feature 5)
| Method | Endpoint | Feature | Access |
|---|---|---|---|
| POST | `/api/announcements` | Create/broadcast announcement | ADMIN |
| GET | `/api/announcements` | Get all broadcast announcements | Authenticated |
| GET | `/api/announcements/project/{projectId}` | Get project-specific announcements | Authenticated |
| GET | `/api/announcements/{id}` | Get announcement by ID | Authenticated |
| DELETE | `/api/announcements/{id}` | Delete announcement | ADMIN |

### Peer Reviews & Ratings (Feature 7)
| Method | Endpoint | Feature | Access |
|---|---|---|---|
| POST | `/api/reviews` | Submit peer review for team member | STUDENT |
| GET | `/api/reviews/project/{projectId}` | Get reviews for a project | STUDENT/FACULTY/ADMIN |
| GET | `/api/reviews/student/{studentUserId}/summary` | Get rating summary for a student | STUDENT/FACULTY/ADMIN |

---

## 6. Shared Files & Merge Guidelines

When integrating into the main project repo:
1. **`entity/User.java`**: Ensure `accountStatus` (ACTIVE / SUSPENDED / DEACTIVATED) is supported in the team's shared user entity.
2. **`config/SecurityConfig.java`**: Merge route permissions into the existing team security configuration.
3. **`exception/GlobalExceptionHandler.java`**: Combine exception handlers into the common exception handling infrastructure.
4. **JWT Configuration**: Set `JWT_SECRET` in application properties/environment variables for JWT signing and verification.

---

## 7. Example API Requests & Responses

### Suspend a Student Account
```http
PATCH /api/admin/users/42/status
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{ "accountStatus": "SUSPENDED" }
```
```json
{
  "success": true,
  "message": "Account status updated",
  "data": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.edu",
    "role": "STUDENT",
    "accountStatus": "SUSPENDED",
    "createdAt": "2026-01-10T09:15:00"
  }
}
```

### Post System Announcement
```http
POST /api/announcements
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "title": "Midterm Checkpoint",
  "content": "All teams must complete project milestones by Friday.",
  "scope": "STUDENTS"
}
```
```json
{
  "success": true,
  "message": "Announcement sent",
  "data": {
    "id": 7,
    "title": "Midterm Checkpoint",
    "content": "All teams must complete project milestones by Friday.",
    "scope": "STUDENTS",
    "projectId": null,
    "createdBy": 1,
    "createdAt": "2026-09-02T10:00:00"
  }
}
```

---

## 8. Frontend Administration Application

The React frontend provides a comprehensive UI dashboard for administrators:
- **Authentication**: Setup wizard & login with auto JWT persistence.
- **User & Role Management**: Interactive data tables to enable/suspend accounts and adjust role permissions.
- **Project Oversight**: Filterable table of active, completed, delayed, and inactive projects.
- **Broadcast System**: Easy-to-use form to broadcast announcements to targeted groups.
- **Real-Time Analytics**: Visual cards displaying platform metrics and project health checks.
