# Walkthrough — CollabNexus Recovery & Production Transformation

CollabNexus has been fully recovered, harmonized, and elevated to a production-grade Student Project Collaboration & Academic Mentorship Platform.

---

## 1. Backend Architecture & Verification

- **Institutional Identity Model**:
  - `User.java` contains `institutionalId` (e.g. `STU10001`, `FAC10001`, `ADM10001`).
  - Dual login support via `UserRepository.findByEmailOrInstitutionalId` and `CustomUserDetailsService`.
  - Automatic institutional ID generation on student registration, faculty onboarding, and initial admin setup in `AuthServiceImpl`.
- **Project Capacity & Seat Availability**:
  - Added `maxMembers` capacity field (default 4, range 2–10) across `Project`, `CreateProjectRequest`, `UpdateProjectRequest`, `ProjectDetailResponse`, and `ProjectSummaryResponse`.
  - Computed `availableSeats = Math.max(0, maxMembers - memberCount)`.
  - Backend enforcement in `TeamJoinRequestServiceImpl` rejecting join requests if `memberCount >= maxMembers`.
  - Fixed constructor and mapper in `FacultyServiceImpl`.
- **Default Leadership & Seed Integrity**:
  - `AdminSeeder.java` seeds institutional identities (`ADM10001`, `STU10001`, `STU10002`, `STU10003`, `FAC10001`, `FAC10002`) and project capacities.
  - Project creator is permanently bound as default `LEADER`.

---

## 2. Frontend Unified Design System & Experience

- **Design System (`src/styles/global.css`)**:
  - Consolidated all fragmented stylesheets (`member1.css`, `collaboration.css`, `admin.css`) into a single design system using modern tokens (Plus Jakarta Sans, Inter, indigo/slate surfaces, soft elevation, responsive drawer).
  - Deleted obsolete mock files (`adminMockData.js`, `Placeholder.jsx`).
- **Public Landing Page (`src/pages/LandingPage.jsx`)**:
  - Showcases both core workflows: **"I Have an Idea"** (Creator / Leader) and **"I Have Skills"** (Contributor / Teammate).
  - Highlights real-time Kanban workspaces, AI smart matching, and faculty rubric evaluations.
- **Role-Based Navigation & Identity (`src/layouts/AppLayout.jsx`)**:
  - Dynamic navigation tailored strictly to authenticated backend identity (`STUDENT`, `FACULTY`, `ADMIN`).
  - Active Institutional ID tag (e.g. `ID: STU10001 • CSE`) in topbar and user profile card.
- **Authentication & Registration (`src/pages/Login.jsx`)**:
  - Tabbed login (Student, Faculty, Admin) accepting Institutional ID or Email.
  - Student & Faculty registration modals displaying a copyable Institutional ID banner upon generation.
- **Feature Pages**:
  - **`Dashboard.jsx`**: State-aware overview with live metrics, Leader review alert banner for pending requests, and skill match recommendations.
  - **`Projects.jsx`**: Campus directory with search, skill filter, capacity counters (`X/Y seats`), pitch project modal with capacity setting, and custom pitch join dialog.
  - **`Teams.jsx`**: Leading teams with full roster management, incoming join requests review queue, joined teams, sent requests, and AI skill matcher.
  - **`Tasks.jsx`**: 3-column Kanban sprint board (`TODO`, `IN_PROGRESS`, `COMPLETED`), sprint velocity progress bar, task assignment, and file/repo repository.
  - **`Messages.jsx`**: Real-time project channel discussions and 1-on-1 direct messages.
  - **`Faculty.jsx`**: Project directory, sprint health monitor, mentorship feedback, interactive rubric grading form (0-100 score -> automated `A+`, `A`, `B+`, `B`, `C` grade), and sign-off approvals.
  - **`Admin.jsx`**: User directory with institutional IDs and status toggles, project moderation, announcement broadcaster, delayed sprint radar, and peer reviews.
  - **`Profile.jsx`**: Student portfolio with institutional ID, verified skill radar, and project history.
  - **`Notifications.jsx`**: Actionable notifications stream with direct navigation.

---

## 3. Build & Test Results

- **Backend Compilation (`mvn compile`)**: `BUILD SUCCESS` (175 source files compiled).
- **Frontend Build (`npm run build`)**: `✓ built in 678ms` with zero errors.

---

## 4. Verification & Credentials

| Role | Institutional ID | Email | Password | Access Area |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `STU10001` | `alex@college.edu` | `Student@123` | Overview, Projects, Teams, Sprint Workspace, Messages, Profile |
| **Faculty** | `FAC10001` | `meera@college.edu` | `Faculty@123` | Faculty Dashboard, Projects Directory, Rubrics, Feedback, Approvals |
| **Administrator** | `ADM10001` | `admin@college.edu` | `Admin@123` | Live Analytics, User Directory, Project Moderation, Announcements |
