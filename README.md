# Member 4 Module — Admin & System

Student Project Collaboration Platform — backend module implementing:

1. Manage Students & Faculty
2. Manage Projects
3. Manage Roles & Permissions
4. Platform Analytics
5. Send Announcements
6. Detect Delayed/Inactive Projects
7. Rate & Review Team Members

> **IMPORTANT — read before merging into the shared repo:** this module was
> built **standalone**, without access to the team's actual shared codebase
> (no repo was provided to inspect). To keep it compilable and runnable on
> its own, it includes placeholder versions of entities/tables owned by
> other members (`User`, `StudentProfile`, `FacultyProfile`, `Project`,
> `ProjectMember`, `Task`, `ProjectProgress`). **Per team rule #8, these must
> NOT be merged in as-is if equivalents already exist.** See "Integration
> steps" below.

---

## 1. Files created

```
pom.xml
src/main/resources/application.yml
src/main/java/com/project/platform/PlatformApplication.java

entity/
  User.java                    (PLACEHOLDER — replace with real entity)
  StudentProfile.java          (PLACEHOLDER — replace with real entity)
  FacultyProfile.java          (PLACEHOLDER — replace with real entity)
  Project.java                 (PLACEHOLDER — replace with real entity)
  ProjectMember.java           (PLACEHOLDER — replace with real entity)
  Task.java                    (PLACEHOLDER — replace with real entity)
  ProjectProgress.java         (PLACEHOLDER — replace with real entity)
  Announcement.java            (OWNED by Member 4)
  PlatformAnalytics.java       (OWNED by Member 4)
  TeamMemberReview.java        (OWNED by Member 4)

entity/enums/
  Role.java, ProjectStatus.java, TaskStatus.java,
  ProjectMemberRole.java, AnnouncementScope.java, AccountStatus.java

repository/
  UserRepository, StudentProfileRepository, FacultyProfileRepository,
  ProjectRepository, ProjectMemberRepository, TaskRepository,
  ProjectProgressRepository, AnnouncementRepository,
  PlatformAnalyticsRepository, TeamMemberReviewRepository

dto/request/
  UpdateAccountStatusRequest, UpdateUserRoleRequest,
  AdminUpdateProjectStatusRequest, CreateAnnouncementRequest,
  CreateTeamMemberReviewRequest

dto/response/
  ApiResponse, UserAdminResponse, StudentAdminResponse,
  FacultyAdminResponse, ProjectAdminResponse, AnnouncementResponse,
  PlatformAnalyticsResponse, DelayedProjectResponse,
  TeamMemberReviewResponse, RevieweeRatingSummaryResponse

service/ + service/impl/
  AdminUserService(+Impl), AdminProjectService(+Impl),
  AnnouncementService(+Impl), PlatformAnalyticsService(+Impl),
  ProjectHealthService(+Impl), TeamMemberReviewService(+Impl)

controller/
  AdminUserController, AdminProjectController, AnnouncementController,
  AnalyticsController, ProjectHealthController, TeamMemberReviewController

exception/
  ResourceNotFoundException, BadRequestException, DuplicateResourceException,
  ErrorResponse, GlobalExceptionHandler

security/
  UserPrincipal, CustomUserDetailsService, JwtUtil, JwtAuthenticationFilter

config/
  SecurityConfig
```

## 2. Files modified

None — this module was built as a fresh standalone project (no shared repo
was available). When merging, the files below are the ones that touch
**shared** concerns and need review (see section 7).

## 3. Database tables added

Owned by this module (safe to add as-is):
- `announcements`
- `platform_analytics`
- `team_member_reviews`

Placeholder tables (only for standalone compilation — do **not** create
these if the equivalents already exist in the shared schema):
- `users` (adds a `account_status` column not in the original spec — needs
  team approval, see section 7)
- `student_profiles`, `faculty_profiles`, `projects`, `project_members`,
  `tasks`, `project_progress`

## 4. API endpoints added

| Method | Endpoint | Feature | Access |
|---|---|---|---|
| GET | `/api/admin/users` | 1/3 | ADMIN |
| GET | `/api/admin/users/students` | 1 | ADMIN |
| GET | `/api/admin/users/faculty` | 1 | ADMIN |
| GET | `/api/admin/users/{userId}` | 1 | ADMIN |
| PATCH | `/api/admin/users/{userId}/status` | 1 | ADMIN |
| PATCH | `/api/admin/users/{userId}/role` | 3 | ADMIN |
| DELETE | `/api/admin/users/{userId}` | 1 | ADMIN |
| GET | `/api/admin/projects` | 2 | ADMIN |
| GET | `/api/admin/projects/{projectId}` | 2 | ADMIN |
| PATCH | `/api/admin/projects/{projectId}/status` | 2 | ADMIN |
| DELETE | `/api/admin/projects/{projectId}` | 2 | ADMIN |
| GET | `/api/admin/projects/health/flagged` | 6 | ADMIN |
| GET | `/api/analytics/live` | 4 | ADMIN |
| POST | `/api/analytics/snapshot` | 4 | ADMIN |
| GET | `/api/analytics/snapshot/latest` | 4 | ADMIN |
| POST | `/api/announcements` | 5 | ADMIN |
| GET | `/api/announcements` | 5 | any authenticated user |
| GET | `/api/announcements/project/{projectId}` | 5 | any authenticated user |
| GET | `/api/announcements/{id}` | 5 | any authenticated user |
| DELETE | `/api/announcements/{id}` | 5 | ADMIN |
| POST | `/api/reviews` | 7 | STUDENT |
| GET | `/api/reviews/project/{projectId}` | 7 | STUDENT/FACULTY/ADMIN |
| GET | `/api/reviews/student/{studentUserId}/summary` | 7 | STUDENT/FACULTY/ADMIN |

## 5. Existing APIs affected

None directly. If another member's `/api/auth/**` login endpoint issues
JWTs, it must call `JwtUtil.generateToken(email, userId, role)` from this
module (see section 9) so tokens are compatible with this security config.

## 6. Dependencies added (pom.xml)

- `spring-boot-starter-web`, `spring-boot-starter-data-jpa`,
  `spring-boot-starter-security`, `spring-boot-starter-validation`
- `mysql-connector-j`
- `io.jsonwebtoken:jjwt-api/impl/jackson:0.11.5` (JWT)
- `lombok`

## 7. Shared files that need team approval

- **`entity/User.java`** — added `accountStatus` (enum `AccountStatus`:
  ACTIVE/SUSPENDED/DEACTIVATED) to support enable/suspend from
  "Manage Students & Faculty". **Needs approval** before adding to the real
  shared `User` entity (Team Rule #22).
- **`config/SecurityConfig.java`** — if another member already has a
  security config, the route rules here (`/api/admin/**` → ADMIN,
  `/api/announcements/**`, `/api/analytics/**`, `/api/reviews/**`) must be
  merged into it rather than duplicated.
- **`exception/GlobalExceptionHandler.java`** — same merge note if one
  already exists.

## 8. Database migration required

Yes — run/generate a migration (Flyway/Liquibase, or `ddl-auto: update` in
dev) to create:
- `announcements`, `platform_analytics`, `team_member_reviews`
- `ALTER TABLE users ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'`
  (pending approval per section 7)

## 9. How another developer integrates this module

1. Copy `entity/enums/*`, `entity/Announcement.java`,
   `entity/PlatformAnalytics.java`, `entity/TeamMemberReview.java`, their
   repositories, services, and controllers into the shared repo unchanged.
2. **Delete** the placeholder entities/repositories in this module
   (`User`, `StudentProfile`, `FacultyProfile`, `Project`, `ProjectMember`,
   `Task`, `ProjectProgress`) and repoint all imports in this module's
   services/controllers to the team's real classes in the same packages
   (`com.project.platform.entity` / `com.project.platform.repository`) —
   no code changes needed elsewhere since package/class names match the
   team's naming convention.
3. If the real `User` entity has no `accountStatus`-equivalent field, get
   approval and add it (see section 7), or adapt
   `AdminUserServiceImpl`/`UserPrincipal` to whatever field the team already
   uses for enable/disable.
4. Any module (login/auth) that issues JWTs should call
   `JwtUtil.generateToken(email, userId, role)` from `security/JwtUtil.java`
   so tokens work with `JwtAuthenticationFilter`. Merge `SecurityConfig`
   route rules into the team's existing config if one exists.
5. Set the `JWT_SECRET` environment variable (never hard-code it — Team
   Rule #20).
6. Other modules can reference `Announcement`, `PlatformAnalytics`, and
   `TeamMemberReview` by ID/FK exactly as with any other entity — no
   special coupling.

## 10. Example API requests/responses

**Suspend a student account**
```
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

**Send an announcement to all students**
```
POST /api/announcements
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "title": "Midterm project checkpoint",
  "content": "All teams must submit a progress report by Friday.",
  "scope": "STUDENTS"
}
```
```json
{
  "success": true,
  "message": "Announcement sent",
  "data": {
    "id": 7,
    "title": "Midterm project checkpoint",
    "content": "All teams must submit a progress report by Friday.",
    "scope": "STUDENTS",
    "projectId": null,
    "createdBy": 1,
    "createdAt": "2026-09-02T10:00:00"
  }
}
```

**Get flagged (delayed/inactive) projects**
```
GET /api/admin/projects/health/flagged
Authorization: Bearer <admin-jwt>
```
```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "projectId": 5,
      "projectTitle": "Campus Ride Sharing App",
      "delayed": true,
      "inactive": false,
      "delayedTaskCount": 2,
      "lastActivityAt": "2026-08-30T14:00:00",
      "delayedTaskIds": [21, 23]
    }
  ]
}
```

**Submit a team member review**
```
POST /api/reviews
Authorization: Bearer <student-jwt>
Content-Type: application/json

{
  "projectId": 5,
  "revieweeId": 17,
  "rating": 4,
  "comments": "Delivered the API work on time, good communicator."
}
```
```json
{
  "success": true,
  "message": "Review submitted",
  "data": {
    "id": 3,
    "projectId": 5,
    "reviewerId": 12,
    "revieweeId": 17,
    "rating": 4,
    "comments": "Delivered the API work on time, good communicator.",
    "createdAt": "2026-09-02T10:05:00"
  }
}
```

## 11. First-Time Admin Setup & Authentication

This module includes a secure authentication flow:

- `GET /api/auth/admin/status` checks if an administrator account has been configured.
- `POST /api/auth/admin/setup` creates the initial administrator account during first-time setup (disabled once an admin exists).
- `POST /api/auth/login` and `POST /api/auth/admin/login` authenticate email + password with Spring Security and BCrypt.
- `POST /api/auth/register/student` and `POST /api/auth/register/faculty` provide public student/faculty registration.
- Only users whose role is `ADMIN` can access `/api/admin/**` endpoints.
- JWT contains email, userId, and role.

## 12. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173/admin/login`.

The frontend stores the JWT in `localStorage`, automatically sends it as a Bearer token, protects all `/admin/*` routes, and redirects to the admin login page when the API returns 401/403.
