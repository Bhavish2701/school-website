# Sri Vidya E.M. High School - Comprehensive School ERP Platform

Official website and unified enterprise ERP portal ecosystem for **Sri Vidya E.M. High School**, established with the guiding motto:
> *"Vidyathe Vijayam" — Knowledge Brings Victory*

---

## 🏗️ School ERP Architecture

```text
school-erp/
├── frontend/
│   ├── public-website/
│   ├── platform-admin/
│   ├── administration-portal/
│   ├── faculty-portal/
│   └── future-portals/
│       ├── student-portal/
│       └── parent-portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   │   ├── authentication.js
│   │   │   ├── authorization.js
│   │   │   └── error-handler.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── institutions/
│   │   │   ├── users/
│   │   │   ├── roles-permissions/
│   │   │   ├── students/
│   │   │   ├── staff/
│   │   │   ├── academics/
│   │   │   ├── attendance/
│   │   │   ├── timetable/
│   │   │   ├── examinations/
│   │   │   ├── fees/
│   │   │   ├── appointments/
│   │   │   ├── communication/
│   │   │   ├── reports/
│   │   │   ├── files/
│   │   │   └── audit-logs/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🌟 Portals & Access Endpoints

| Portal | URL / Clean Route | Target Architecture Path | Description |
| :--- | :--- | :--- | :--- |
| **Public Website** | [http://localhost:8080/](http://localhost:8080/) | `frontend/public-website/` | Public admissions, campus tour, academics, notice board, and gallery |
| **Platform Admin** | [http://localhost:8080/platform-admin](http://localhost:8080/platform-admin) | `frontend/platform-admin/` | System-wide platform governance, server health, multi-campus management, security |
| **Administration Portal** | [http://localhost:8080/management](http://localhost:8080/management) | `frontend/administration-portal/` | Executive dashboard for Principal & Management: full Attendance with 5 submenus, Academics, Timetable, Exams, Fees |
| **Faculty Portal** | [http://localhost:8080/teacher](http://localhost:8080/teacher) | `frontend/faculty-portal/` | Teacher workspace: roster roll call, marks entry, class schedule, leave approvals |
| **Student Portal** | [http://localhost:8080/student](http://localhost:8080/student) | `frontend/future-portals/student-portal/` | Student self-service: attendance summary, homework, report cards, fee status |
| **Parent Portal** | [http://localhost:8080/parent](http://localhost:8080/parent) | `frontend/future-portals/parent-portal/` | Guardian dashboard: real-time ward tracking, exam results, fee payments, PTM requests |

---

## ⚙️ Backend ERP Domain Modules (`backend/src/modules/`)

The backend REST API is hosted on port `5000` (`/api/v1/modules/*`) with 16 domain subsystems:

1. **`auth`**: JWT authentication, refresh tokens, role assertions, password management.
2. **`institutions`**: Affiliation details (State Board AP), campus branches, institutional profile.
3. **`users`**: Administrative user registry, account status, user profiles.
4. **`roles-permissions`**: Granular RBAC matrix for super-admin, management, faculty, students, and parents.
5. **`students`**: Student admissions, biodata records, enrollment directories, academic summaries.
6. **`staff`**: Faculty directory, department designations, timetable allotments, leave workflows.
7. **`academics`**: Academic years, class divisions, subject curricula, syllabus progress.
8. **`attendance`**: 
   - Student & Staff Attendance Roll Call
   - Late Arrivals Tracking
   - Absences Verification
   - Attendance Corrections Ledger
   - Daily & Monthly Summaries
9. **`timetable`**: Class schedules, teacher allocations, substitutions, room bookings, lab allocations.
10. **`examinations`**: Exam schedules, invigilation rosters, marks entry, moderation, grading, report cards, result publications.
11. **`fees`**: Fee structures, collections, pending dues ledger, concessions, refunds, receipts, financial reports.
12. **`appointments`**: Parent-Teacher Meeting (PTM) booking, counselor scheduling, visitor gate passes.
13. **`communication`**: Institutional circulars, SMS/WhatsApp broadcast notifications, official notices.
14. **`reports`**: Academic analytics, attendance statistics, revenue and collection reports, statutory compliance audits.
15. **`files`**: Secure document repository, Transfer Certificate (TC) generator, Bonafide certificates.
16. **`audit-logs`**: Immutable security audit trail, administrative action logs, access records.

---

## 🚀 Running Locally

### 1. Frontend Development Server
```bash
node server.js
```
Listens on `http://localhost:8080` and routes to all modular frontend portals.

### 2. Backend REST API Server
```bash
cd backend
npm install
npm start
```
Listens on `http://localhost:5000` with health check at `http://localhost:5000/api/v1/health`.
